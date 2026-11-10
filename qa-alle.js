// QA-ALLE v4 – EIN Befehl für die komplette Phase 3:  npm run qa
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
// v4 (Niko 05.11.2026: "QA frisst zu viele Tokens und dauert zu lange"):
//  1. Kompakte Ausgabe: je Gate eine Zeile + nur die Fehler (✖). Volle Ausgabe in .qa-berichte/qa-<gate>.log.
//     --laut zeigt alles wie früher.
//  2. Unverändertes überspringen: Ein Gate, dessen Eingaben (Skript, Quellen, gebaute Seiten) seit seinem
//     letzten grünen Lauf gleich sind, läuft nicht erneut. craft und overflow prüfen nur geänderte Seiten,
//     solange CSS/JS/Bilder gleich sind. --alles-neu prüft alles.
//  3. KI-Gates (images, visual) nur im Schlusslauf: npm run qa -- --schluss (vor Marker, Ende Phase 3,
//     oder wenn Niko es sagt). Normale Läufe zählen als komplett für Deploy, aber nicht für den Marker.
//  4. Statische Gates laufen parallel, Browser-Gates nacheinander (Lighthouse braucht Ruhe).
import { spawn, spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, mkdirSync } from 'fs';
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
  const schluss = process.argv.includes('--schluss') || process.argv.includes('--mit-ki');
  const ohneKi = process.argv.includes('--ohne-ki') || (!schluss && !(argNur && /images|visual/.test(argNur)));
  const laut = process.argv.includes('--laut');
  const allesNeu = process.argv.includes('--alles-neu');
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
  const komplett = !nur && !seite;          // alle Nicht-KI-Gates (zählt für Deploy)
  const kiGelaufen = !nur && !seite && !ohneKi;   // Schlusslauf (zählt für den Marker)

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
  console.log(`  ${GATES.length} Gates${nur ? ` (nur: ${nur.join(', ')})` : ''}${ohneKi ? ' · ohne KI-Gates (Schlusslauf: --schluss)' : ' · mit KI-Gates'}\n`);

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
  mkdirSync('.qa-berichte', { recursive: true });
  mkdirSync('.qa-cache', { recursive: true });
  const CACHE = '.qa-cache/gates.json';
  let cache = {};
  try { cache = JSON.parse(readFileSync(CACHE, 'utf-8')); } catch {}
  const distStand = distFingerabdruck();
  const srcStand = projektStand();
  const SEITEN_GATES = ['craft', 'overflow'];
  // Projektdateien außerhalb von src, die Gates lesen (Inventar, Brief, Aufgaben)
  const extra = ['CONTENT-INVENTAR.md', 'ORIGINAL-INHALTE.json', 'BILDER-INVENTAR.md', 'DESIGN-BRIEF.md', '../../gemini-config.json'].map(dateiHash).join('');
  // Quellen zählen nur für Gates, die src/ lesen; alle anderen hängen an den gebauten Seiten
  const LIEST_SRC = ['checks', 'slop'];
  const schluessel = (g) => ({ skript: dateiHash(`qa-${g.name}.js`), src: (LIEST_SRC.includes(g.name) ? srcStand : '') + extra, geteilt: distStand.geteilt });
  const seitenVon = (g) => g.name === 'speed' ? { '/': distStand.seiten['/'] } : distStand.seiten;

  const fuehreAus = (g, env = {}) => new Promise((fertig) => {
    try { unlinkSync(`.qa-berichte/qa-${g.name}-seiten.json`); } catch {}
    const t0 = Date.now();
    const args = [`qa-${g.name}.js`, ...(g.url ? [url] : []), ...(g.name === 'visual' && seite ? [seite] : [])];
    const p = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
    merke(p.pid);
    let puffer = '';
    p.stdout.on('data', d => { if (laut) process.stdout.write(d); puffer += d; });
    p.stderr.on('data', d => { if (laut) process.stderr.write(d); puffer += d; });
    const limitMin = g.ki || g.name === 'craft' ? 25 : 12;
    const wecker = setTimeout(() => {
      puffer += `\n  ✖  qa-${g.name}: nach ${limitMin} Min abgebrochen (Zeitüberschreitung). Einzeln wiederholen: node qa-${g.name}.js\n`;
      try { p.kill(); } catch {}
    }, limitMin * 60000);
    p.on('close', (c) => {
      clearTimeout(wecker);
      if (c === null) c = 1;
      try { writeFileSync(`.qa-berichte/qa-${g.name}.log`, puffer); } catch {}
      const e = { exit: c, fehler: (puffer.match(/✖/g) || []).length, hinweise: (puffer.match(/^\s*[·⚠]\s/gm) || []).length, sekunden: Math.round((Date.now() - t0) / 1000) };
      if (c === 0 && /übersprungen/i.test(puffer) && g.ki) e.uebersprungen = true;
      if (g.info) e.info = true;
      // Fehlerzeilen plus ihre eingerückten Unterpunkte (z. B. die fehlenden Themen bei qa-relaunch)
      const alle = puffer.split('\n'), zeilen = [];
      alle.forEach((z, i) => { if (/✖/.test(z)) { zeilen.push(z.trim()); for (let j = i + 1; j < alle.length && j <= i + 5 && /^\s+[·•-]\s/.test(alle[j]); j++) zeilen.push('  ' + alle[j].trim()); } });
      e.mehr = Math.max(0, zeilen.length - 15);
      e.zeilen = zeilen.slice(0, 15);
      e.log = puffer;
      fertig(e);
    });
  });

  const melde = (g, e) => {
    const z = e.uebersprungen ? '·' : e.unveraendert ? '✔' : e.exit === 0 ? '✔' : e.info ? '·' : '✖';
    const t = e.unveraendert ? 'unverändert grün (übersprungen)' : e.uebersprungen ? 'übersprungen (Key/Kontingent/Überlast)'
      : e.exit === 0 ? `bestanden${e.seitenTeil ? ` (${e.seitenTeil})` : ''}${e.hinweise ? `, ${e.hinweise} Hinweise` : ''}` : e.exit === 2 ? 'Abbruch (Server/Setup)' : `${e.fehler || '?'} Fehler`;
    console.log(`  ${z}  qa-${g.name.padEnd(13)} ${t}${e.sekunden !== undefined ? `  ${e.sekunden} s` : ''}`);
    if (!laut && e.exit !== 0 && !e.info) { e.zeilen.forEach(l => console.log(`       ${l.slice(0, 220)}`)); console.log(`       ${e.mehr ? `… ${e.mehr} weitere, ` : ''}Details: .qa-berichte/qa-${g.name}.log`); }
  };

  const vorbereiten = (g) => {
    const k = schluessel(g), alt = cache[g.name];
    if (allesNeu || !alt || alt.skript !== k.skript || alt.src !== k.src || alt.geteilt !== k.geteilt) return { env: {} };
    if (SEITEN_GATES.includes(g.name)) {
      // nur Seiten, die seit dem letzten Lauf geändert wurden oder dort rot waren (Stichprobe bleibt Stichprobe)
      const offen = Object.keys(distStand.seiten).filter(s => (alt.gesehen || {})[s] !== distStand.seiten[s] || (alt.rot || []).includes(s));
      if (!offen.length) return { skip: true };
      return { env: { QA_SEITEN: offen.join(',') }, teil: `${offen.length} von ${Object.keys(distStand.seiten).length} Seiten`, offen };
    }
    if (alt.gruen && JSON.stringify(alt.gruen) === JSON.stringify(seitenVon(g))) return { skip: true };
    return { env: {} };
  };
  const nachher = (g, e, v) => {
    if (e.uebersprungen || e.info) return;
    if (SEITEN_GATES.includes(g.name)) {
      // grüne Seiten merken, rote (im Bericht genannt) nicht
      const k = schluessel(g);
      let geprueft = v.offen || Object.keys(distStand.seiten);
      try { geprueft = JSON.parse(readFileSync(`.qa-berichte/qa-${g.name}-seiten.json`, 'utf-8')); } catch {}   // Stichprobe: nur wirklich Geprüftes
      const PFAD = /(?:^|[\s(,:"])(\/(?:[\w\-äöüß.%]+\/)*)(?=[\s,:)@"…]|$)/g;
      const fehlerZeilen = (e.log || '').split('\n').filter(z => /✖/.test(z) && !/Gate\(s\) rot/.test(z));
      const rot = new Set(), ohnePfad = [];
      for (const z of fehlerZeilen) { const m = [...z.matchAll(PFAD)].map(x => x[1]); m.forEach(x => rot.add(x)); if (!m.length) ohnePfad.push(z); }
      if (e.exit !== 0 && (!rot.size || ohnePfad.length)) { delete cache[g.name]; return; }   // Fehler ohne Seitenangabe: nächstes Mal alles
      const altRot = (v.offen && cache[g.name]?.rot) || [];
      const neuRot = [...new Set([...altRot.filter(s => !geprueft.includes(s)), ...rot])];
      cache[g.name] = { ...k, gesehen: distStand.seiten, rot: neuRot };
      return;
    }
    if (e.exit === 0) cache[g.name] = { ...schluessel(g), gruen: seitenVon(g) };
    else delete cache[g.name];
  };
  const lauf = async (g) => {
    const v = vorbereiten(g);
    if (v.skip) return { exit: 0, fehler: 0, unveraendert: true, zeilen: [] };
    const e = await fuehreAus(g, v.env);
    if (v.teil) e.seitenTeil = v.teil;
    nachher(g, e, v);
    delete e.log;
    return e;
  };

  // statisch parallel, Browser nacheinander, KI nacheinander
  const statisch = GATES.filter(g => !g.url && !g.ki), browser = GATES.filter(g => g.url && !g.ki), ki = GATES.filter(g => g.ki);
  const st = await Promise.all(statisch.map(lauf));
  statisch.forEach((g, i) => { ergebnisse[g.name] = st[i]; melde(g, st[i]); });
  for (const g of [...browser, ...ki]) { ergebnisse[g.name] = await lauf(g); melde(g, ergebnisse[g.name]); }
  try { writeFileSync(CACHE, JSON.stringify(cache)); } catch {}
  for (const e of Object.values(ergebnisse)) { delete e.zeilen; delete e.mehr; delete e.log; }
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
  console.log(`\n══════════════ QA-ERGEBNIS (${dauer(Date.now() - lauf0)}) ══════════════`);
  const bestanden = rot.length === 0;
  schreibeStatus({ bestanden, komplett, ki: kiGelaufen, build: true, gates: ergebnisse });
  if (bestanden) {
    console.log(`  ✔  ALLE GATES GRÜN${!komplett ? ' (Teillauf – für Deploy zählt nur npm run qa)' : kiGelaufen ? ' (Schlusslauf)' : ' (ohne KI-Gates – für den Marker: npm run qa -- --schluss)'}\n`);
    process.exit(0);
  }
  console.log(`  ✖  ${rot.length} Gate(s) rot: ${rot.map(([n]) => 'qa-' + n).join(', ')}`);
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

function dateiHash(p) { try { return createHash('sha1').update(readFileSync(p)).digest('hex').slice(0, 16); } catch { return ''; } }

// Gebaute Seiten einzeln, alles Geteilte (CSS, JS, Bilder, Schriften, Konfiguration) zusammen
function distFingerabdruck() {
  const seiten = {}, geteilt = createHash('sha1');
  const lauf = (dir, prefix) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { lauf(p, `${prefix}/${e.name}`); continue; }
      if (e.name === 'index.html') { seiten[prefix === '' ? '/' : prefix + '/'] = dateiHash(p); continue; }
      if (prefix === '' && /^(llms\.txt|robots\.txt|sitemap.*\.xml|mailer-daten\.json)$/.test(e.name)) continue;   // ändern sich mit jedem Titel, ohne Wirkung auf die Darstellung
      const st = statSync(p);
      geteilt.update(`${prefix}/${e.name}`);
      geteilt.update(st.size < 2 * 1024 * 1024 ? readFileSync(p) : String(st.size));
    }
  };
  lauf('dist', '');
  return { seiten, geteilt: geteilt.digest('hex').slice(0, 16) };
}
