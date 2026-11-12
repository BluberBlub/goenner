// STAND v3 – Ist dieses Projekt auf dem aktuellen Autopilot-Stand?
// Aufruf:  node stand.js                 nur prüfen (ändert nichts)
//          node stand.js --uebernehmen   veraltete Dateien aktualisieren (+ --einrichten)
//          node stand.js --einrichten    nur Projekt-Einrichtung: Schutz-Hook für gesperrte Dateien,
//                                        npm-Skripte (npm run qa = Gesamtlauf), .gitignore-Einträge,
//                                        CSS-inline in astro.config. Läuft bei jedem Start (weiter.bat).
// v3: Build ruft optimize-build.js auf (WebP, Lazyload, Schema, llms.txt, Mailer-Daten; Weber, Joos),
//     Abhängigkeit "motion" für Scroll-Effekte wird ergänzt UND installiert (sonst bricht der Build
//     mit dem neuen BaseLayout ab), Skripte "bilder" und "qa:seo".
// Eigene Überarbeitungen werden NUR mit --alles überschrieben. deploy.js behält seinen Zielpfad.
// v3.1 (Niko, 18.10.2026: "manuell geänderte Kit-Dateien nie automatisch zurücksetzen"):
//     Fehlt der Snapshot einer Komponente, gilt sie als EIGEN, außer sie ist byte-gleich mit einer
//     früher ausgelieferten Kit-Version (_komponenten/kit-hashes.json). Der Snapshot wird dann mit
//     der Marke AUTOPILOT-EIGEN angelegt statt mit der Projektdatei: sonst sähe der nächste Abgleich
//     "unverändert" und würde Nikos Version überschreiben (das war das Loch).

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, copyFileSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';

// ════════ SITZUNG FORTSETZEN ODER FRISCH (weiter.bat, Tokens sparen, 09.11.2026) ════════
// Opitz: weiter.bat setzte mit --continue immer dieselbe Sitzung fort, die auf 404k Kontext wuchs.
// Jeder Schritt liest das ganze Gespräch: 41 Mio. Tokens. Jetzt: nur kleine, frische Sitzungen fortsetzen
// (unter 120k Kontext und jünger als 12 Stunden), sonst frisch starten. Der Stand liegt in den Dateien.
// Exit 0 = fortsetzen, 1 = frisch.
// ════════ SITZUNGSSTART (10.11.2026): alles Nötige in EINER Ausgabe ════════
// Vorher brauchte der Autopilot 4 bis 5 Einzelschritte (cat, grep, git, ls), bis er wusste, wo er steht.
// Jeder Schritt liest den ganzen Kontext neu. Der SessionStart-Hook ruft dies auf, die Ausgabe steht dann
// ohne einen einzigen Schritt im Gespräch.
if (process.argv.includes('--start')) {
  try { process.chdir(dirname(fileURLToPath(import.meta.url))); } catch {}   // Hooks starten nicht immer im Projektordner
  const l = (p) => { try { return readFileSync(p, 'utf-8'); } catch { return null; } };
  let pr = {}; try { pr = JSON.parse(l('progress.json') || '{}'); } catch {}
  const phase = String(pr.phase ?? '?');
  const aus = [`STAND ${pr.projekt || process.cwd().split(/[\\/]/).pop()}: Phase ${phase} (${pr.status || '?'})${pr.urlLive ? ' · Demo ' + pr.urlLive : ''}${pr.eskalation ? ' · ESKALATION: ' + pr.eskalation : ''}`];
  const auf = l('AUFGABEN.md') || '';
  const offen = auf.split('\n').filter(z => /^\s*- \[ \]/.test(z));
  aus.push(offen.length ? `OFFENE PUNKTE (${offen.length}):\n${offen.slice(0, 25).map(z => z.trim().slice(0, 300)).join('\n')}${offen.length > 25 ? `\n… ${offen.length - 25} weitere in AUFGABEN.md` : ''}` : 'OFFENE PUNKTE: keine. Auf Nikos nächste Anweisung warten, nichts von selbst umbauen, keinen QA-Lauf ohne Anlass.');
  const erledigt = auf.split('\n').filter(z => /^\s*- \[x\]/i.test(z)).slice(-3).map(z => z.trim().slice(0, 160));
  if (erledigt.length) aus.push(`ZULETZT ERLEDIGT:\n${erledigt.join('\n')}`);
  if (existsSync('KIT-ZUSAMMENFUEHREN.md')) aus.push('ZUERST: KIT-ZUSAMMENFUEHREN.md erledigen.');
  try { const q = JSON.parse(l('.qa-status.json')); const rot = Object.entries(q.gates || {}).filter(([, g]) => g.exit !== 0 && !g.info).map(([n]) => n); aus.push(`LETZTE QA: ${q.bestanden ? 'grün' : 'rot (' + rot.join(', ') + ')'}${q.komplett ? '' : ', Teillauf'}${q.ki ? ', mit KI-Gates' : ''}`); } catch {}
  try { const g = spawnSync('git', ['status', '--short'], { encoding: 'utf-8' }).stdout.split('\n').filter(Boolean); if (g.length) aus.push(`GIT: ${g.length} uncommittete Datei(en)`); } catch {}
  const REGEL = { '1': 'phase1-research.md', '1b': 'phase1b-stilmuster.md', '2': 'phase2-design.md + phase2-technik.md' + (pr.katalogeGelesen ? '' : ' + phase2-kataloge.md'), '2c': 'phase2c-designreview.md', '5': 'phase5-deploy.md', '6': 'phase6-abschluss.md' };
  aus.push(/^3/.test(phase)
    ? 'REGELN: _regeln/phase3-feedback.md jetzt lesen (kurz). phase3-qa.md nur vor einem QA-Komplettlauf oder bei rotem Gate, phase2-design.md nur bei neuen Sektionen/Seiten.'
    : `REGELN: _regeln/${REGEL[phase] || 'Datei der aktuellen Phase'} jetzt lesen.`);
  aus.push('ANSEHEN: node schau.js <pfad> [--sel "<css>"] liefert EIN Bild (Desktop + Handy). Keine eigenen Playwright-Skripte.');
  console.log(aus.join('\n'));
  process.exit(0);
}

if (process.argv.includes('--sitzung')) {
  try {
    const home = process.env.USERPROFILE || process.env.HOME || '';
    const dir = join(home, '.claude', 'projects', process.cwd().replace(/[^A-Za-z0-9]/g, '-'));
    const dateien = readdirSync(dir).filter(f => f.endsWith('.jsonl')).map(f => ({ f: join(dir, f), t: statSync(join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
    if (!dateien.length) process.exit(1);
    const { f, t } = dateien[0];
    if (Date.now() - t > 12 * 3600 * 1000) { console.log('  Letzte Sitzung aelter als 12 Stunden: starte frisch (Stand aus den Dateien).'); process.exit(1); }
    const text = readFileSync(f, 'utf-8'); const zeilen = text.slice(-400000).split('\n').reverse();
    let kontext = 0;
    for (const z of zeilen) { if (!z.includes('"usage"')) continue; try { const u = JSON.parse(z).message?.usage; if (u) { kontext = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); break; } } catch {} }
    if (kontext > 120000) { console.log(`  Letzte Sitzung schon gross (${Math.round(kontext / 1000)}k): starte frisch, spart Tokens (Stand aus den Dateien).`); process.exit(1); }
    console.log(`  Setze kleine Sitzung fort (${Math.round(kontext / 1000)}k).`);
    process.exit(0);
  } catch { process.exit(1); }
}


const ROOT = join('..', '..');
const CACHE = '.autopilot-sync';
const einrichtenNur = process.argv.includes('--einrichten');
const uebernehmen = process.argv.includes('--uebernehmen') || process.argv.includes('--alles');
const alles = process.argv.includes('--alles');

if (!existsSync(join(ROOT, '_komponenten'))) {
  console.log('\n  Kein _komponenten/ im Root gefunden – läuft dieses Skript im Projektordner?\n');
  process.exit(1);
}
const lies = (p) => { try { return readFileSync(p, 'utf-8'); } catch { return null; } };
const EIGEN_MARKE = 'AUTOPILOT-EIGEN';
const norm = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const hash = (s) => createHash('sha256').update(norm(s), 'utf8').digest('hex');
const BEKANNT = new Set((() => { try { return JSON.parse(lies(join(ROOT, '_komponenten', 'kit-hashes.json'))).hashes || []; } catch { return []; } })());
// Ist diese Datei eine unveränderte Kit-Version (aktuell oder früher ausgeliefert)?
const istKitStand = (inhalt, kit) => inhalt !== null && (norm(inhalt) === norm(kit ?? '') || BEKANNT.has(hash(inhalt)));

// ════════ EINRICHTUNG (idempotent, ändert nur Fehlendes) ════════
function einrichten() {
  const meldungen = [];

  // 1. Schutz-Hook: der Autopilot kann gesperrte Kit-Dateien nicht mehr verändern
  const hookQuelle = join(ROOT, '_projektdateien', 'claude-hooks', 'locked-guard.js');
  if (existsSync(hookQuelle)) {
    mkdirSync(join('.claude', 'hooks'), { recursive: true });
    const ziel = join('.claude', 'hooks', 'locked-guard.js');
    if (lies(ziel) !== lies(hookQuelle)) { copyFileSync(hookQuelle, ziel); meldungen.push('Schutz-Hook installiert/aktualisiert (.claude/hooks/locked-guard.js)'); }
    const settingsPfad = join('.claude', 'settings.json');
    let settings = {};
    try { settings = JSON.parse(lies(settingsPfad) || '{}'); } catch { meldungen.push('.claude/settings.json war ungültig – neu angelegt'); settings = {}; }
    const befehl = `node "${resolve('.claude/hooks/locked-guard.js').replace(/\\/g, '/')}"`;
    const eintrag = { matcher: 'Edit|MultiEdit|Write|NotebookEdit|Bash|PowerShell', hooks: [{ type: 'command', command: befehl, timeout: 15 }] };
    settings.hooks ??= {};
    settings.hooks.PreToolUse ??= [];
    const liste = settings.hooks.PreToolUse;
    const i = liste.findIndex(e => (e.hooks || []).some(h => /locked-guard\.js/.test(h.command || '')));
    if (i < 0) { liste.push(eintrag); meldungen.push('Hook in .claude/settings.json eingetragen'); }
    else if (JSON.stringify(liste[i]) !== JSON.stringify(eintrag)) { liste[i] = eintrag; meldungen.push('Hook-Pfad in .claude/settings.json aktualisiert'); }
    // Kontext-Wächter (Tokens sparen: rechtzeitig neu starten, Stand bleibt in AUFGABEN.md)
    const wQuelle = join(ROOT, '_projektdateien', 'claude-hooks', 'kontext-waechter.js');
    if (existsSync(wQuelle)) {
      const wZiel = join('.claude', 'hooks', 'kontext-waechter.js');
      if (lies(wZiel) !== lies(wQuelle)) { copyFileSync(wQuelle, wZiel); meldungen.push('Kontext-Wächter installiert/aktualisiert'); }
      const wBefehl = `node "${resolve(wZiel).replace(/\\/g, '/')}"`;
      // Sitzungsstart: Stand und offene Punkte ohne einen einzigen Tool-Schritt ins Gespräch
      settings.hooks.SessionStart ??= [];
      {
        const l = settings.hooks.SessionStart, bef = `node "${resolve('stand.js').replace(/\\/g, '/')}" --start`;
        const e = { hooks: [{ type: 'command', command: bef, timeout: 15 }] };
        const j = l.findIndex(x => (x.hooks || []).some(h => /stand\.js" --start/.test(h.command || '')));
        if (j < 0) l.push(e); else l[j] = e;
      }
      // UserPromptSubmit wird nicht mehr gebraucht (Wächter ist dort still): alten Eintrag entfernen
      if (settings.hooks.UserPromptSubmit) { settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(x => !(x.hooks || []).some(h => /kontext-waechter\.js/.test(h.command || ''))); if (!settings.hooks.UserPromptSubmit.length) delete settings.hooks.UserPromptSubmit; }
      for (const ereignis of ['PostToolUse', 'PreToolUse']) {
        settings.hooks[ereignis] ??= [];
        const l = settings.hooks[ereignis];
        const e = { ...(ereignis === 'PostToolUse' ? { matcher: '.*' } : ereignis === 'PreToolUse' ? { matcher: 'Read' } : {}), hooks: [{ type: 'command', command: wBefehl, timeout: 10 }] };
        const j = l.findIndex(x => (x.hooks || []).some(h => /kontext-waechter\.js/.test(h.command || '')));
        if (j < 0) l.push(e); else l[j] = e;
      }
    }
    writeFileSync(settingsPfad, JSON.stringify(settings, null, 2) + '\n');
  }

  // 2. npm-Skripte: "npm run qa" = kompletter Lauf mit eigenem Server (qa-alle.js)
  if (existsSync('package.json')) {
    try {
      const alt = lies('package.json');
      const p = JSON.parse(alt);
      p.scripts ??= {};
      if (!p.scripts.qa || /^node qa-checks\.js &&/.test(p.scripts.qa)) p.scripts.qa = 'node qa-alle.js';
      p.scripts['qa:speed'] ??= 'node qa-speed.js';
      p.scripts['og-bild'] ??= 'node og-bild.js';
      p.scripts.stand ??= 'node stand.js';
      p.scripts.abschluss ??= 'node abschluss.js';
      p.scripts.bilder ??= 'node bild-formate.js';
      p.scripts['qa:seo'] ??= 'node qa-seo.js';
      // Build mit Nachbearbeitung (WebP, Lazyload, Schema, llms.txt, Mailer-Daten)
      if (existsSync('optimize-build.js') && p.scripts.build && !/optimize-build/.test(p.scripts.build)) {
        p.scripts.build = p.scripts.build.replace(/\s*$/, '') + ' && node optimize-build.js';
        meldungen.push('package.json: Build ruft jetzt optimize-build.js auf (WebP, Lazyload, Schema, llms.txt)');
      }
      p.devDependencies ??= {};
      p.dependencies ??= {};
      let npmNoetig = false;
      if (!p.devDependencies.lighthouse && !p.dependencies?.lighthouse) { p.devDependencies.lighthouse = '^12.0.0'; npmNoetig = true; }
      if (!p.dependencies.motion && !p.devDependencies.motion) { p.dependencies.motion = '^14.0.0'; npmNoetig = true; }
      if (!p.dependencies.sharp && !p.devDependencies.sharp) { p.devDependencies.sharp = '^0.34.0'; npmNoetig = true; }
      const neu = JSON.stringify(p, null, 2) + '\n';
      if (neu.trim() !== alt.trim()) {
        writeFileSync('package.json', neu);
        meldungen.push('package.json: npm run qa startet jetzt den Gesamtlauf (qa-alle.js)');
      }
      // Fehlende Pakete gleich installieren: das BaseLayout lädt "motion", ohne Paket bricht der Build ab
      const fehlend = ['motion', 'sharp', 'lighthouse'].filter(n => (p.dependencies[n] || p.devDependencies[n]) && !existsSync(join('node_modules', n)));
      if (fehlend.length && existsSync('node_modules')) {
        console.log(`  Installiere fehlende Pakete: ${fehlend.join(', ')} …`);
        const r = spawnSync('npm install --no-audit --no-fund', { shell: true, stdio: 'inherit' });
        meldungen.push(r.status === 0 ? `Pakete installiert: ${fehlend.join(', ')}` : `ACHTUNG: npm install fehlgeschlagen (${fehlend.join(', ')}). Bitte von Hand "npm install" ausführen, sonst bricht der Build ab.`);
      } else if (npmNoetig) meldungen.push('Neue Pakete eingetragen -> einmal "npm install" ausführen');
    } catch (e) { meldungen.push(`package.json nicht lesbar: ${e.message}`); }
  }

  // 3. .gitignore: Berichte, Status und Secrets gehören nicht ins Kunden-Repo
  const PFLICHT = ['KIT-ZUSAMMENFUEHREN.md', 'node_modules', 'dist', '.env', 'public/.env.php', 'CLAUDE.md', 'progress.json',
    '.qa-status.json', 'qa-*-report.json', '.qa-screenshots/', '.claude/', '.kit-freigabe', 'KIT-AENDERUNGEN.md', 'deploy.js.alt', '.qa-cache/', '.qa-lauf.json', '.qa-berichte/', '.claude/.kontext-gemeldet'];
  const gi = lies('.gitignore') ?? '';
  const zeilen = gi.split(/\r?\n/).map(z => z.trim());
  const fehlt = PFLICHT.filter(e => !zeilen.includes(e));
  if (fehlt.length) {
    writeFileSync('.gitignore', gi.replace(/\s*$/, '') + (gi ? '\n' : '') + '# Autopilot (automatisch ergänzt)\n' + fehlt.join('\n') + '\n');
    meldungen.push(`.gitignore ergänzt: ${fehlt.join(', ')}`);
  }

  // 4. astro.config: CSS direkt ins HTML (PageSpeed, Alge)
  const ac = lies('astro.config.mjs');
  if (ac && !/inlineStylesheets/.test(ac)) {
    const neu = ac.replace(/build:\s*\{\s*format:\s*'directory'\s*\}/, "build: { format: 'directory', inlineStylesheets: 'always' }");
    if (neu !== ac) { writeFileSync('astro.config.mjs', neu); meldungen.push("astro.config.mjs: inlineStylesheets 'always' (kein blockierendes CSS)"); }
  }
  return meldungen;
}

if (einrichtenNur) {
  const m = einrichten();
  if (m.length) { console.log('\n  Projekt-Einrichtung:'); m.forEach(x => console.log(`    + ${x}`)); console.log(''); }
  process.exit(0);
}

// ════════ STAND-PRÜFUNG ════════
const KOMPONENTEN = [
  ['BaseLayout.astro', 'src/layouts'],
  ...['Header','Footer','Section','PageHero','StickyContact','CookieBanner','DemoBar','Cta','KontaktKarte','SektionsKopf','Fragen','Oeffnungszeiten','KarteLaden']
      .map(n => [`${n}.astro`, 'src/components']),
  ['stil-muster.astro', 'src/pages'],
  ['tailwind.config.mjs', '.'],
  ['middleware.ts', 'src'],
];
const GATES = readdirSync(ROOT).filter(f => /^(qa-.*|abschluss|deploy|generate-image|optimize-images|optimize-build|bild-formate|validate-sitedata|test-mailer|og-bild)\.js$/.test(f));

// ════════ KOMPONENTEN-ABGLEICH (weiter.bat, v4, Opitz 05.11.2026) ════════
// Vorher: Eine im Projekt geänderte Kit-Datei blieb für immer auf ihrem alten Stand ("BEHALTEN") und
// bekam keine Kit-Verbesserung mehr (Opitz: BaseLayout v4 statt v7, ohne Demo-Statistik und Lesefluss).
// Jetzt: Nie zurücksetzen, aber zusammenführen.
//  - unverändert: Kit-Fassung übernehmen
//  - eigene Änderungen + Kit neuer: 3-Wege-Zusammenführung (git merge-file, Basis = Snapshot).
//    Klappt das sauber, hat die Datei danach den neuen Kit-Stand UND die eigenen Änderungen.
//  - Überschneidungen oder keine Basis: Datei bleibt unangetastet, Auftrag in KIT-ZUSAMMENFUEHREN.md,
//    den Claude als Erstes erledigt (Kit-Fassung liegt in .autopilot-sync/neu/).
if (process.argv.includes('--abgleich')) {
  const neuDir = join(CACHE, 'neu');
  mkdirSync(neuDir, { recursive: true });
  const offen = [];
  const rel = (p) => p.replace(/\\/g, '/');
  const gitDa = spawnSync('git', ['--version'], { encoding: 'utf-8', shell: true }).status === 0;
  for (const [name, vz] of KOMPONENTEN) {
    if (vz !== '.' && !existsSync(vz)) continue;
    const quelle = join(ROOT, '_komponenten', name), ziel = join(vz, name), snapPfad = join(CACHE, name);
    const q = lies(quelle); if (q === null) continue;
    const z = lies(ziel), snap = lies(snapPfad);
    if (name === 'stil-muster.astro' && z !== null) { if (norm(z) !== norm(q)) { copyFileSync(quelle, ziel); copyFileSync(quelle, snapPfad); } continue; }
    if (z === null) { copyFileSync(quelle, ziel); copyFileSync(quelle, snapPfad); console.log(`    + ${name} neu angelegt`); continue; }
    if (norm(z) === norm(q)) { if (snap === null || norm(snap) !== norm(q)) copyFileSync(quelle, snapPfad); continue; }
    const ohneBasis = snap === null || snap.trim() === EIGEN_MARKE;
    if (ohneBasis && istKitStand(z, q)) { copyFileSync(quelle, ziel); copyFileSync(quelle, snapPfad); console.log(`    > ${name} aktualisiert`); continue; }
    if (!ohneBasis && norm(z) === norm(snap)) { copyFileSync(quelle, ziel); copyFileSync(quelle, snapPfad); console.log(`    > ${name} aktualisiert`); continue; }
    if (!ohneBasis && norm(q) === norm(snap)) { console.log(`    = ${name} eigene Fassung, Kit unverändert`); continue; }
    // eigene Änderungen und Kit neuer
    if (!ohneBasis && gitDa) {
      const r = spawnSync('git', ['merge-file', '-p', ziel, snapPfad, quelle], { encoding: 'utf-8', shell: false });
      if (r.status === 0 && r.stdout) {
        writeFileSync(ziel, r.stdout); copyFileSync(quelle, snapPfad);
        console.log(`    > ${name} zusammengeführt: neuer Kit-Stand + deine Änderungen`);
        continue;
      }
    }
    copyFileSync(quelle, join(neuDir, name));
    offen.push({ name, ziel: rel(ziel), basis: ohneBasis ? null : rel(snapPfad) });
    console.log(`    ! ${name} eigene Fassung, Kit ist neuer: Claude führt zusammen (KIT-ZUSAMMENFUEHREN.md)`);
  }
  if (offen.length) {
    let md = `# Kit zusammenführen (zuerst erledigen)\n\nErstellt von weiter.bat am ${new Date().toLocaleString('de-DE')}.\n`;
    md += `Diese Kit-Dateien wurden im Projekt geändert UND im Kit verbessert. Nikos Regel: eigene Änderungen nie zurücksetzen,\n`;
    md += `Kit-Verbesserungen trotzdem übernehmen. Für jede Datei:\n\n`;
    md += `1. Eigene Änderungen ermitteln: Unterschied Basis -> Projektdatei (ohne Basis: Projektdatei gegen Kit-Fassung lesen und die projektspezifischen Teile erkennen).\n`;
    md += `2. Kit-Fassung (.autopilot-sync/neu/<Datei>) als Grundlage nehmen und die eigenen Änderungen darin nachbauen. Ist eine eigene Änderung im Kit inzwischen gelöst, die Kit-Lösung nehmen.\n`;
    md += `3. Ergebnis in die Projektdatei schreiben, Kit-Fassung als neuen Snapshot nach .autopilot-sync/<Datei> kopieren, Build + npm run qa -- --nur=checks,craft.\n`;
    md += `4. Danach diese Datei löschen und .kit-freigabe löschen. Im Zweifel Niko fragen, nie still eine eigene Änderung weglassen.\n\n`;
    for (const o of offen) md += `- ${o.name}: Projekt ${o.ziel} · Kit .autopilot-sync/neu/${o.name} · Basis ${o.basis || 'keine (AUTOPILOT-EIGEN)'}\n`;
    writeFileSync('KIT-ZUSAMMENFUEHREN.md', md);
    writeFileSync('.kit-freigabe', offen.map(o => o.name).join('\n') + '\n');   // gilt 2 h, nur für diese Dateien
  }
  process.exit(0);
}

console.log('\n══════ AUTOPILOT-STAND ══════\n');

// Warnung: Root-Dateien versehentlich ins Projekt entpackt?
const nurRoot = ['SETUP_KOMPLETT.ps1','START-SETUP.cmd','_komponenten','_design-referenzen',
                 '_projektdateien','_learnings','projekte','_template','Neue Website starten.bat'];
const eingeschleppt = nurRoot.filter(f => existsSync(f));
if (eingeschleppt.length) {
  console.log('  ACHTUNG: Diese Dateien gehoeren ins Root, nicht ins Projekt:');
  eingeschleppt.forEach(f => console.log(`    ${f}`));
  console.log('  Vermutlich wurde die ZIP hier statt im Root entpackt. Entfernen.');
  console.log('  Pruefe ausserdem mit "git status", ob package.json/PROJEKT.md ueberschrieben wurden.\n');
}
let aktuell = 0, veraltet = 0, eigen = 0, fehlt = 0;
const zuAktualisieren = [];

function pruefe(name, quellPfad, zielPfad, kitDatei = false) {
  const q = lies(quellPfad);
  if (q === null) return;
  const z = lies(zielPfad);
  const snap = lies(join(CACHE, name));
  if (z === null) { console.log(`  FEHLT      ${zielPfad}`); fehlt++; zuAktualisieren.push([quellPfad, zielPfad, name]); return; }
  if (norm(z) === norm(q)) { aktuell++; return; }
  // abweichend: eigene Überarbeitung oder nur veraltet?
  // Kit-Komponenten ohne verlässlichen Snapshot: im Zweifel EIGEN (nie still zurücksetzen)
  const ohneBasis = snap === null || snap.trim() === EIGEN_MARKE;
  const selbstGeaendert = kitDatei && ohneBasis ? !istKitStand(z, q) : snap !== null && norm(snap) !== norm(z);
  if (selbstGeaendert) { console.log(`  EIGEN      ${zielPfad}  (von dir überarbeitet – bleibt)`); eigen++; if (alles) zuAktualisieren.push([quellPfad, zielPfad, name]); }
  else { console.log(`  VERALTET   ${zielPfad}`); veraltet++; zuAktualisieren.push([quellPfad, zielPfad, name]); }
}

// deploy.js ist pro Projekt EINGERICHTET (Zielpfad + URL statt Platzhalter).
// Nie blind überschreiben: neue Version nehmen, eingetragene Werte übernehmen.
const DEPLOY_WERTE = /const (REMOTE_PATH|LIVE_URL)(\s*)= '([^']*)';/g;
let deployNeu = null;
function deployAbgleich() {
  const q = lies(join(ROOT, 'deploy.js'));
  const z = lies('deploy.js');
  if (q === null) return;
  if (z === null) { pruefe('deploy.js', join(ROOT, 'deploy.js'), 'deploy.js'); return; }
  const werte = {};
  for (const m of z.matchAll(DEPLOY_WERTE)) werte[m[1]] = m[3];
  if (!werte.REMOTE_PATH || werte.REMOTE_PATH.startsWith('__')) { pruefe('deploy.js', join(ROOT, 'deploy.js'), 'deploy.js'); return; }
  const neu = q.replace(DEPLOY_WERTE, (_, k, ws) => `const ${k}${ws}= '${werte[k] ?? ''}';`);
  if (neu === z) { aktuell++; return; }
  console.log(`  VERALTET   deploy.js  (Ziel ${werte.REMOTE_PATH} bleibt beim Aktualisieren erhalten)`);
  veraltet++;
  deployNeu = neu;
}

console.log('Komponenten:');
for (const [name, vz] of KOMPONENTEN) {
  if (!existsSync(vz) && vz !== '.') continue;
  pruefe(name, join(ROOT, '_komponenten', name), join(vz, name), true);
}
console.log('\nPrüf-Skripte und Regeln:');
for (const g of GATES) { if (g === 'deploy.js') deployAbgleich(); else pruefe(g, join(ROOT, g), g); }
// CLAUDE.md: im Projekt nur ein Verweis, die Regeln lädt Claude Code aus dem Ordner Websites (kein Abgleich)
if (existsSync(join(ROOT, '_regeln'))) {
  for (const r of readdirSync(join(ROOT, '_regeln'))) pruefe(r, join(ROOT, '_regeln', r), join('_regeln', r));
}
const hookDa = existsSync(join('.claude', 'hooks', 'locked-guard.js'));
const qaStatus = (() => { try { return JSON.parse(lies('.qa-status.json')); } catch { return null; } })();

console.log(`\n  ${aktuell} aktuell · ${veraltet} veraltet · ${eigen} eigene Überarbeitung · ${fehlt} fehlen`);
console.log(`  Schutz-Hook: ${hookDa ? 'aktiv' : 'FEHLT (node stand.js --einrichten)'}`);
console.log(`  Letzter QA-Gesamtlauf: ${qaStatus ? `${new Date(qaStatus.zeit).toLocaleString('de-DE')} · ${qaStatus.bestanden ? 'GRÜN' : 'ROT'}${qaStatus.komplett === false ? ' (Teillauf)' : ''}` : 'noch keiner (npm run qa)'}\n`);

if (!uebernehmen) {
  if (veraltet + fehlt > 0 || !hookDa) {
    console.log('  Zum Aktualisieren (eigene Überarbeitungen bleiben unangetastet):');
    console.log('      node stand.js --uebernehmen\n');
  } else if (eigen > 0) {
    console.log('  Alles aktuell. Die als EIGEN markierten Dateien bleiben bewusst so.\n');
  } else {
    console.log('  Alles auf dem aktuellen Stand.\n');
  }
  process.exit(0);
}

if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });
let n = 0;
for (const [quelle, ziel, name] of zuAktualisieren) {
  try {
    const vz = ziel.split(/[\\/]/).slice(0, -1).join('/');
    if (vz && !existsSync(vz)) mkdirSync(vz, { recursive: true });
    copyFileSync(quelle, ziel);
    copyFileSync(quelle, join(CACHE, name));
    console.log(`  aktualisiert: ${ziel}`);
    n++;
  } catch (e) { console.log(`  FEHLER bei ${ziel}: ${e.message}`); }
}
if (deployNeu) {
  try {
    copyFileSync('deploy.js', 'deploy.js.alt');
    writeFileSync('deploy.js', deployNeu);
    console.log('  aktualisiert: deploy.js (Zielpfad übernommen, alte Version: deploy.js.alt)');
    n++;
  } catch (e) { console.log(`  FEHLER bei deploy.js: ${e.message}`); }
}
// Snapshots auch für unveränderte Dateien anlegen, damit der Schutz künftig greift
for (const [name, vz] of KOMPONENTEN) {
  const ziel = join(vz, name);
  if (existsSync(ziel) && !existsSync(join(CACHE, name))) {
    // Nur eine echte Kit-Version wird Basis; eine eigene Fassung bekommt die EIGEN-Marke
    try {
      if (istKitStand(lies(ziel), lies(join(ROOT, '_komponenten', name)))) copyFileSync(ziel, join(CACHE, name));
      else writeFileSync(join(CACHE, name), EIGEN_MARKE + '\n');
    } catch {}
  }
}
const m = einrichten();
m.forEach(x => console.log(`  eingerichtet: ${x}`));
console.log(`\n  ${n} Dateien aktualisiert. Snapshots gesetzt – ab jetzt greift der Überschreibschutz.`);
console.log(`  Danach: npm install (falls gemeldet), dann npm run qa\n`);
