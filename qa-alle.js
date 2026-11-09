// QA-ALLE v3 – EIN Befehl für die komplette Phase 3:  npm run qa
//  1. Build (rimraf dist && astro build)
//  2. eigener Preview-Server auf einem FREIEN Port (kein Konflikt mit anderen Projekten/IDE)
//  3. alle Gates nacheinander, Ergebnis je Gate
//  4. Zusammenfassung + .qa-status.json (Nachweis für deploy.js und abschluss.js --marke)
// Opitz-Learning: Phase 3 wurde übersprungen. Ohne grünen Lauf verweigern Deploy
// (während des Autopiloten) und Marker den Dienst.
// Optionen: --nur=craft,copy   einzelne Gates (schneller Nachtest, zählt nicht als Komplettlauf)
//           --ohne-build       dist/ wie vorhanden verwenden
//           --ohne-ki          Gemini-Gates (qa-images, qa-visual) auslassen (zählt nicht als Komplettlauf)
//           --seite=/pfad      qa-visual nur für diese Seite (z. B. Phase 1b: --nur=visual --seite=/stil-muster)
// v2: Zeitlimit je Gate (Joos: hängender Gemini-Aufruf blockierte über 60 Min), qa-seo als Gate,
//     Lauf ungültig, wenn während des Laufs Dateien geändert wurden (Spöri), Pfad-Fix für Git Bash.
//     WICHTIG: Während npm run qa läuft, nichts ändern und nicht deployen.
// v3 (Schwabenpflege): Reste abgebrochener Läufe werden beim Start beendet (unter Windows liefen
//     Kindprozesse weiter und machten Folgeläufe ungültig), Fortschritt je Gate mit Laufzeit,
//     KI-Gates mit erschöpftem Gemini-Tageskontingent zählen als übersprungen.
import { spawn, spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, basename, relative } from 'path';
import { createHash } from 'crypto';
import net from 'net';

// ── Projektstand als Fingerabdruck (auch von deploy.js / abschluss.js genutzt) ──
export function projektStand(wurzel = '.') {
  const h = createHash('sha1');
  const dateien = [];
  const lauf = (dir) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', 'dist', '.git', '.astro'].includes(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) lauf(p); else dateien.push(p);
    }
  };
  lauf(join(wurzel, 'src')); lauf(join(wurzel, 'public'));
  for (const f of ['astro.config.mjs', 'tailwind.config.mjs', 'package.json']) if (existsSync(join(wurzel, f))) dateien.push(join(wurzel, f));
  for (const p of dateien.sort()) {
    const st = statSync(p);
    h.update(relative(wurzel, p).replace(/\\/g, '/'));
    if (st.size < 512 * 1024 && /\.(astro|tsx?|jsx?|mjs|json|css|md|html|svg|php|txt|xml)$/i.test(p)) h.update(readFileSync(p));
    else h.update(`${st.size}`);
  }
  return h.digest('hex').slice(0, 16);
}

const direkt = process.argv[1] && basename(process.argv[1]) === 'qa-alle.js';
if (direkt) await hauptlauf();

async function hauptlauf() {
  const argNur = (process.argv.find(a => a.startsWith('--nur=')) || '').split('=')[1];
  const nur = argNur ? argNur.split(',').map(s => s.trim().replace(/^qa-/, '').replace(/\.js$/, '')) : null;
  const ohneKi = process.argv.includes('--ohne-ki');
  const ohneBuild = process.argv.includes('--ohne-build');
  // Git Bash (MSYS) macht aus "/stil-muster" einen Windows-Pfad ("C:/Program Files/Git/stil-muster")
  let seite = (process.argv.find(a => a.startsWith('--seite=')) || '').split('=')[1];
  if (seite && /^[a-z]:[\\/]/i.test(seite)) seite = '/' + seite.replace(/\\/g, '/').replace(/^[a-z]:\/(program files\/git\/)?/i, '');

  // Reihenfolge: statisch zuerst (schnell), dann Browser, dann Gemini
  const GATES = [
    { name: 'checks',       url: false },
    { name: 'copy',         url: false },
    { name: 'relaunch',     url: false },
    { name: 'seo',          url: false },
    { name: 'overflow',     url: true },
    { name: 'contact-form', url: true },
    { name: 'craft',        url: true },
    { name: 'wow',          url: true },
    { name: 'speed',        url: true },
    { name: 'images',       url: false, ki: true },
    { name: 'visual',       url: true,  ki: true },
    { name: 'slop',         url: false, info: true },
  ].filter(g => existsSync(`qa-${g.name}.js`))
   .filter(g => !nur || nur.includes(g.name))
   .filter(g => !(ohneKi && g.ki));
  const komplett = !nur && !ohneKi && !seite;

  // Reste eines abgebrochenen Laufs beenden (Server, Gates), dann eigene Prozesse merken
  const LAUF = '.qa-lauf.json';
  // Nur echte Node-Prozesse beenden (PIDs werden vom System wiederverwendet)
  const istNode = (pid) => {
    try {
      if (process.platform === 'win32') return /node/i.test(spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'utf-8' }).stdout || '');
      return /node/.test(readFileSync(`/proc/${pid}/cmdline`, 'utf-8'));
    } catch { return false; }
  };
  const beende = (pid, pruefen = false) => {
    if (!pid || pid === process.pid) return;
    if (pruefen && !istNode(pid)) return;
    try {
      if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
      else process.kill(pid, 'SIGTERM');
    } catch {}
  };
  try {
    const alt = JSON.parse(readFileSync(LAUF, 'utf-8'));
    if (Date.now() - new Date(alt.zeit).getTime() < 6 * 3600 * 1000) {
      console.log('  Reste eines abgebrochenen QA-Laufs gefunden: werden beendet.');
      (alt.pids || []).forEach((pid) => beende(pid, true));
    }
  } catch {}
  const pids = [process.pid];
  const merke = (pid) => { if (pid) { pids.push(pid); try { writeFileSync(LAUF, JSON.stringify({ zeit: new Date().toISOString(), pids })); } catch {} } };
  merke();
  process.on('exit', () => { pids.slice(1).forEach(beende); try { unlinkSync(LAUF); } catch {} });
  const lauf0 = Date.now();
  const dauer = (ms) => { const s = Math.round(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min` : `${s} s`; };

  console.log('\n══════════════ QA-GESAMTLAUF ══════════════');
  console.log(`  ${GATES.length} Gates${nur ? ` (nur: ${nur.join(', ')})` : ''}${ohneKi ? ' · ohne KI-Gates' : ''}\n`);

  // 1. Build
  if (!ohneBuild) {
    console.log('  [1/3] Build …');
    const b = spawnSync('npm run build', { shell: true, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
    if (b.status !== 0) {
      console.log((b.stdout || '').split('\n').slice(-25).join('\n'));
      console.log((b.stderr || '').split('\n').slice(-25).join('\n'));
      console.log('\n  ✖  BUILD FEHLGESCHLAGEN – erst den Build reparieren, dann erneut: npm run qa\n');
      schreibeStatus({ bestanden: false, komplett, build: false, gates: {} });
      process.exit(1);
    }
    const warnungen = ((b.stdout || '') + (b.stderr || '')).split('\n').filter(z => /\[WARN\]|warning/i.test(z) && !/deprecat/i.test(z));
    console.log(`        ok${warnungen.length ? ` (${warnungen.length} Build-Warnungen, z. B. ${warnungen[0].trim().slice(0, 100)})` : ''}`);
  }
  if (!existsSync('dist')) { console.log('\n  ✖  dist/ fehlt – Build prüfen\n'); process.exit(1); }
  const standVorher = projektStand();   // nach dem Build: ab hier darf sich nichts mehr ändern

  // 2. Eigener Preview-Server
  let preview = null, url = null;
  if (GATES.some(g => g.url)) {
    const port = await freierPort(4600);
    url = `http://127.0.0.1:${port}`;
    const astroBin = join('node_modules', 'astro', 'astro.js');
    const args = ['preview', '--port', String(port), '--host', '127.0.0.1'];
    preview = existsSync(astroBin)
      ? spawn(process.execPath, [astroBin, ...args], { stdio: ['ignore', 'pipe', 'pipe'] })
      : spawn('npx astro ' + args.join(' '), { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const aufraeumen = () => { try { preview?.kill(); } catch {} };
    process.on('exit', aufraeumen);
    process.on('SIGINT', () => { aufraeumen(); process.exit(130); });
    merke(preview.pid);
    console.log(`  [2/3] Preview-Server auf ${url} …`);
    if (!(await warteAufServer(url, 40000))) {
      console.log('\n  ✖  Preview-Server startet nicht (npm install ausgeführt?)\n');
      aufraeumen(); process.exit(1);
    }
    console.log('        ok');
  }

  // 3. Gates
  console.log('  [3/3] Gates …');
  const ergebnisse = {};
  for (const [i, g] of GATES.entries()) {
    const t0 = Date.now();
    console.log(`\n  ── Gate ${i + 1}/${GATES.length}: qa-${g.name} (bisher ${dauer(t0 - lauf0)}) ──`);
    const args = [`qa-${g.name}.js`, ...(g.url ? [url] : []), ...(g.name === 'visual' && seite ? [seite] : [])];
    const code = await new Promise((fertig) => {
      const p = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      merke(p.pid);
      let puffer = '';
      p.stdout.on('data', d => { process.stdout.write(d); puffer += d; });
      p.stderr.on('data', d => { process.stderr.write(d); puffer += d; });
      // Zeitlimit pro Gate: ein hängender Dienst (z. B. Gemini) darf den Gesamtlauf nicht endlos blockieren
      const limitMin = g.ki || g.name === 'craft' ? 25 : 12;
      const wecker = setTimeout(() => {
        const m = `\n  ✖  qa-${g.name}: nach ${limitMin} Min abgebrochen (Zeitüberschreitung). Einzeln wiederholen: node qa-${g.name}.js\n`;
        process.stdout.write(m); puffer += m; try { p.kill(); } catch {}
      }, limitMin * 60000);
      p.on('close', (c) => {
        clearTimeout(wecker);
        if (c === null) c = 1;
        ergebnisse[g.name] = { exit: c, fehler: (puffer.match(/✖/g) || []).length };
        if (c === 0 && /übersprungen/i.test(puffer) && g.ki) ergebnisse[g.name].uebersprungen = true;
        fertig(c);
      });
    });
    ergebnisse[g.name].sekunden = Math.round((Date.now() - t0) / 1000);
    if (g.info) ergebnisse[g.name].info = true;
  }
  try { preview?.kill(); } catch {}

  // Wurde während des Laufs etwas geändert, prüft das Ergebnis einen Stand, den es nicht mehr gibt (Spöri)
  const standNachher = projektStand();
  if (standNachher !== standVorher) {
    console.log('\n  ✖  LAUF UNGÜLTIG: Während des QA-Laufs wurden Dateien in src/, public/ oder der Konfiguration geändert.');
    console.log('     Während npm run qa nichts ändern. Erneut starten: npm run qa\n');
    schreibeStatus({ bestanden: false, komplett, build: true, gates: ergebnisse, ungueltig: true });
    process.exit(1);
  }

  // Zusammenfassung
  const rot = Object.entries(ergebnisse).filter(([n, e]) => e.exit !== 0 && !GATES.find(g => g.name === n)?.info);
  console.log('\n══════════════ QA-ERGEBNIS ══════════════');
  for (const [n, e] of Object.entries(ergebnisse)) {
    const zeichen = e.uebersprungen ? '·' : e.exit === 0 ? '✔' : e.info ? '·' : '✖';
    const text = e.uebersprungen ? 'übersprungen (Key/Kontingent/Überlast)' : e.exit === 0 ? 'bestanden' : e.exit === 2 ? 'Abbruch (Server/Setup)' : `${e.fehler || '?'} Fehler`;
    console.log(`  ${zeichen}  qa-${n.padEnd(14)} ${text.padEnd(24)} ${String(e.sekunden).padStart(4)} s`);
  }
  const bestanden = rot.length === 0;
  schreibeStatus({ bestanden, komplett, build: true, gates: ergebnisse });
  if (bestanden) {
    console.log(`\n  ✔  ALLE GATES GRÜN${komplett ? '' : ' (Teillauf – für Deploy/Marker zählt nur der Komplettlauf: npm run qa)'}\n`);
    process.exit(0);
  }
  console.log(`\n  ✖  ${rot.length} Gate(s) rot: ${rot.map(([n]) => 'qa-' + n).join(', ')}`);
  console.log('     Fehler beheben, dann erneut: npm run qa');
  console.log(`     Schneller Nachtest einzelner Gates: npm run qa -- --nur=${rot.map(([n]) => n).join(',')}\n`);
  process.exit(1);
}

function schreibeStatus(daten) {
  try {
    writeFileSync('.qa-status.json', JSON.stringify({ zeit: new Date().toISOString(), stand: projektStand(), ...daten }, null, 2));
  } catch {}
}

function freierPort(start) {
  return new Promise((fertig) => {
    const versuch = (p) => {
      const s = net.createServer();
      s.once('error', () => versuch(p + 1));
      s.once('listening', () => s.close(() => fertig(p)));
      s.listen(p, '127.0.0.1');
    };
    versuch(start);
  });
}

async function warteAufServer(url, maxMs) {
  const ende = Date.now() + maxMs;
  while (Date.now() < ende) {
    try { const r = await fetch(url + '/'); if (r.status < 500) return true; } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}
