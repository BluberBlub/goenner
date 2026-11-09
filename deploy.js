// NIKO ENDRES - DEPLOY v3.2 (QA-Nachweis vor dem Upload; Live-Check Ã¼ber Ã¶ffentliches DNS, kein Rollback bei lokalem DNS-Fehler)
// LÃ¶scht Remote-Ordner komplett vor Upload (verhindert alte Hash-Asset-Dateien)
// Liest Credentials aus deploy-config.json (2 Ebenen hoch)

import SftpClient from 'ssh2-sftp-client';
import { readFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';

// Live-Check unabhÃ¤ngig vom lokalen DNS (Joos: VPN/Router cachten die neue Subdomain als "existiert nicht",
// der fertige Upload wurde zurÃ¼ckgerollt). Adresse Ã¼ber Google-DNS (DNS-over-HTTPS) auflÃ¶sen und die
// Seite direkt unter dieser IP abrufen.
async function liveCheck(url) {
  const { hostname, pathname } = new URL(url);
  const dns = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`, { signal: AbortSignal.timeout(15000) }).then(r => r.json());
  const ip = dns.Answer?.find(a => a.type === 1)?.data;
  if (!ip) throw new Error(`${hostname} ist im Ã¶ffentlichen DNS nicht auflÃ¶sbar (Status ${dns.Status})`);
  const status = await new Promise((ok, fail) => {
    const req = https.get({ host: ip, servername: hostname, path: pathname || '/', headers: { Host: hostname }, timeout: 20000 }, res => { res.resume(); ok(res.statusCode); });
    req.on('timeout', () => req.destroy(new Error('ZeitÃ¼berschreitung')));
    req.on('error', fail);
  });
  return { ok: status >= 200 && status < 400, status, ip };
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const REMOTE_PATH = '/demo/goenner';
const LIVE_URL    = 'https://goenner.niko-endres.de';
const LOCAL_DIST  = join(__dirname, 'dist');

const configPath = join(__dirname, '..', '..', 'deploy-config.json');
if (!existsSync(configPath)) {
  console.error(`\n[FEHLER] deploy-config.json nicht gefunden: ${configPath}\n`);
  process.exit(1);
}
const config = JSON.parse(readFileSync(configPath, 'utf-8'));
if (!config.password || config.password.includes('HIER_')) {
  console.error('\n[FEHLER] Deploy-Passwort in deploy-config.json fehlt.\n');
  process.exit(1);
}


// â”€â”€ SICHERUNG: niemals einen Sammelordner (/, /demo, /kunden) als Ziel akzeptieren â”€â”€
{
  const p = REMOTE_PATH.replace(/\/+$/, '');
  const verboten = ['', '/', '/demo', '/kunden', '/htdocs', '/www'];
  if (verboten.includes(p) || p.split('/').filter(Boolean).length === 0) {
    console.error(`\n[ABBRUCH] REMOTE_PATH "${REMOTE_PATH}" ist ein Sammel- oder Wurzelordner.`);
    console.error(`          Das Deployment wÃ¼rde fremde Projekte lÃ¶schen. Pfad in deploy.js korrigieren.\n`);
    process.exit(1);
  }
}

// â”€â”€ QA-NACHWEIS (Opitz: Phase 3 Ã¼bersprungen und trotzdem deployt) â”€â”€
// WÃ¤hrend der Autopilot lÃ¤uft (noch kein .autopilot-stand): Deploy nur nach grÃ¼nem
// Komplettlauf von "npm run qa". Danach (Nikos Nacharbeit) nur ein Hinweis.
// Bewusst ohne QA: node deploy.js --ohne-qa
{
  const autopilotLaeuft = !existsSync(join(__dirname, '.autopilot-stand'));
  let qa = null;
  try { qa = JSON.parse(readFileSync(join(__dirname, '.qa-status.json'), 'utf-8')); } catch {}
  let stand = null;
  try { stand = (await import('./qa-alle.js')).projektStand(__dirname); } catch {}
  const probleme = [];
  if (!qa) probleme.push('Es gibt keinen QA-Gesamtlauf (npm run qa wurde nie ausgefÃ¼hrt).');
  else {
    if (!qa.bestanden) probleme.push('Der letzte QA-Lauf war ROT.');
    if (qa.komplett === false) probleme.push('Der letzte QA-Lauf war nur ein Teillauf.');
    if (stand && qa.stand && stand !== qa.stand) probleme.push('Seit dem letzten QA-Lauf wurden Dateien geÃ¤ndert.');
  }
  if (probleme.length && !process.argv.includes('--ohne-qa')) {
    if (autopilotLaeuft) {
      console.error('\n[ABBRUCH] Deploy ohne bestandene QA:');
      probleme.forEach(p => console.error(`          Â· ${p}`));
      console.error('          Erst "npm run qa" bis alles grÃ¼n ist. Bewusst trotzdem: node deploy.js --ohne-qa\n');
      process.exit(1);
    }
    console.log('\n  Hinweis QA: ' + probleme.join(' ') + ' (Deploy lÃ¤uft trotzdem, Autopilot ist abgeschlossen.)');
  }
}

const sftpConfig = { host: config.host, port: 22, username: config.user, password: config.password };

async function deploy() {
  console.log(`\n  DEPLOYMENT -> ${LIVE_URL}\n`);

  // dist sÃ¤ubern bevor neu gebaut wird (verhindert akkumulierte alte Asset-Dateien)
  if (existsSync(LOCAL_DIST)) {
    console.log('  dist saeubern...');
    rmSync(LOCAL_DIST, { recursive: true, force: true });
  }

  console.log('  Build starten...');
  try {
    execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
  } catch {
    console.error('\n[FEHLER] Build fehlgeschlagen.\n');
    process.exit(1);
  }

  if (!existsSync(LOCAL_DIST)) {
    console.error('\n[FEHLER] dist fehlt nach Build.\n');
    process.exit(1);
  }

  const sftp = new SftpClient();
  let backupCreated = false;
  const backupPath = `${REMOTE_PATH}-backup`;

  try {
    console.log('  Verbinde mit Server...');
    await sftp.connect(sftpConfig);

    // Backup: alte Version umbenennen falls vorhanden
    if (await sftp.exists(REMOTE_PATH)) {
      console.log('  Backup der Live-Version...');
      if (await sftp.exists(backupPath)) await sftp.rmdir(backupPath, true);
      await sftp.rename(REMOTE_PATH, backupPath);
      backupCreated = true;
    }

    // Frisches Verzeichnis - KEINE alten Hash-Dateien mehr
    console.log('  Remote-Ordner frisch anlegen...');
    await sftp.mkdir(REMOTE_PATH, true);

    console.log('  Upload laeuft...');
    await sftp.uploadDir(LOCAL_DIST, REMOTE_PATH);
    console.log('  Upload abgeschlossen.');
    await sftp.end();

    // Ab hier ist der Upload vollstÃ¤ndig. Ein Fehler beim Live-Check darf KEIN Rollback auslÃ¶sen.
    console.log('  Live-Check...');
    let res = null;
    try { res = await liveCheck(LIVE_URL); }
    catch (e) { console.log(`  Live-Check nicht mÃ¶glich (${e.message}). Upload ist vollstÃ¤ndig, Backup bleibt auf dem Server. Bitte prÃ¼fen: node qa-live.js ${LIVE_URL}`); }
    if (res?.ok) {
      console.log(`  HTTP ${res.status} - Seite erreichbar.`);
      // Erfolg: Backup loeschen
      if (backupCreated) {
        const s2 = new SftpClient();
        await s2.connect(sftpConfig);
        await s2.rmdir(backupPath, true);
        await s2.end();
        console.log('  Backup aufgeraeumt.');
      }
    } else if (res) {
      console.log(`  HTTP ${res.status} - Backup bleibt erhalten zur Sicherheit.`);
    }

    console.log(`\n  DEPLOYMENT ERFOLGREICH`);
    console.log(`  Live: ${LIVE_URL}\n`);
    // Demo: endgÃ¼ltige Adresse fÃ¼r das Akquise-Tool ("Demo-URL" beim Lead). Nach dem Versand nie mehr Ã¤ndern.
    try {
      const sd = JSON.parse(readFileSync(join(__dirname, 'src', 'content', 'site-data.json'), 'utf-8'));
      if (sd.meta?.demo === true) console.log(`  DEMO-URL fÃ¼rs Akquise-Tool: ${LIVE_URL.replace(/\/?$/, '/')}\n  (feste Adresse, nach dem Versand nicht mehr Ã¤ndern)\n`);
    } catch {}
  } catch (err) {
    console.error(`\n[FEHLER] Deploy: ${err.message}\n`);

    // Rollback: Backup zurueck
    if (backupCreated) {
      try {
        console.log('  Rollback - stelle alte Version wieder her...');
        const s3 = new SftpClient();
        await s3.connect(sftpConfig);
        if (await s3.exists(REMOTE_PATH)) await s3.rmdir(REMOTE_PATH, true);
        await s3.rename(backupPath, REMOTE_PATH);
        await s3.end();
        console.log('  Rollback erfolgreich.');
      } catch (rbErr) {
        console.error(`  Rollback fehlgeschlagen: ${rbErr.message}`);
      }
    }

    await sftp.end().catch(() => {});
    process.exit(1);
  }
}

deploy();
