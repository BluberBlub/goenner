// ABSCHLUSS v2 – Was hat Niko nach dem Autopilot manuell geändert?
// Vergleicht den Stand bei Autopilot-Abschluss mit dem heutigen Stand und
// erzeugt ABSCHLUSS-ANALYSE.md als Faktenbasis für VERBESSERUNGEN.md.
// v2: Marker nur nach grünem QA-Gesamtlauf (Opitz: Phase 3 wurde übersprungen),
//     Herkunft geänderter Kit-Komponenten aus der Git-Historie (Autopilot oder extern),
//     Nikos Komponenten-Versionen + Diffs landen im Root-Archiv _learnings/<projekt>/.
// Aufruf:  node abschluss.js --marke              Marker setzen (Ende Autopilot, nach grünem npm run qa)
//          node abschluss.js --marke --trotzdem   Marker ohne grüne QA (nur wenn Niko es so will)
//          node abschluss.js                      Analyse (wenn Niko "fertig" sagt)

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const MARKER = '.autopilot-stand';
const sh = (cmd) => { try { return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe','pipe','ignore'] }).trim(); } catch { return ''; } };
// git diff --no-index endet bei Unterschieden mit Exit 1 – die Ausgabe ist trotzdem das Ergebnis
const shDiff = (cmd) => { try { return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe','pipe','ignore'] }); } catch (e) { return e.stdout || ''; } };
const hatGit = !!sh('git rev-parse --is-inside-work-tree');
const lies = (p) => { try { return readFileSync(p, 'utf-8'); } catch { return null; } };
const projekt = process.cwd().split(/[\\/]/).pop();

async function aktuellerStand() {
  try { const { projektStand } = await import('./qa-alle.js'); return projektStand(); } catch { return null; }
}

// ── Marker setzen (Ende der Autopilot-Arbeit) ──
if (process.argv.includes('--marke')) {
  let qa = null;
  try { qa = JSON.parse(lies('.qa-status.json')); } catch {}
  const stand = await aktuellerStand();
  const probleme = [];
  if (!qa) probleme.push('Es gibt keinen QA-Lauf (.qa-status.json fehlt).');
  else {
    if (!qa.bestanden) probleme.push(`Der letzte QA-Lauf war ROT (${Object.entries(qa.gates || {}).filter(([, e]) => e.exit !== 0 && !e.info).map(([n]) => 'qa-' + n).join(', ') || 'Build'}).`);
    if (qa.komplett === false) probleme.push('Der letzte QA-Lauf war nur ein Teillauf (--nur / --ohne-ki).');
    if (stand && qa.stand && stand !== qa.stand) probleme.push('Seit dem letzten QA-Lauf wurden Dateien geändert.');
  }
  if (probleme.length && !process.argv.includes('--trotzdem')) {
    console.log('\n  ✖  MARKER NICHT GESETZT – Phase 3 ist nicht abgeschlossen:');
    probleme.forEach(p => console.log(`     · ${p}`));
    console.log('     Erst "npm run qa" bis alles grün ist, dann erneut: node abschluss.js --marke');
    console.log('     (Nur wenn Niko es ausdrücklich will: node abschluss.js --marke --trotzdem)\n');
    process.exit(1);
  }
  const hash = hatGit ? sh('git rev-parse HEAD') : '';
  writeFileSync(MARKER, JSON.stringify({ commit: hash, zeit: new Date().toISOString(),
    qa: qa ? { zeit: qa.zeit, bestanden: qa.bestanden, komplett: qa.komplett !== false } : null,
    ohneGrueneQa: probleme.length > 0 }, null, 2));
  console.log(`\n  Marker gesetzt${hash ? ` (Commit ${hash.slice(0,8)})` : ''}${probleme.length ? ' – OHNE grüne QA (--trotzdem)' : ' – QA grün'}.`);
  console.log('  Ab hier zählt alles als manuelle Nacharbeit.\n');
  process.exit(0);
}

if (!existsSync(MARKER)) {
  console.log('\n  Kein Marker gefunden. Der Autopilot hat "node abschluss.js --marke" am Ende von Phase 3 nicht gesetzt.');
  console.log('  Analyse läuft mit eingeschränkter Genauigkeit (nur Komponenten-Abgleich).\n');
}
const marker = existsSync(MARKER) ? JSON.parse(readFileSync(MARKER, 'utf-8')) : {};
const archiv = join('..', '..', '_learnings', projekt);
const archivDa = existsSync(join('..', '..', '_komponenten'));
if (archivDa) mkdirSync(join(archiv, 'komponenten'), { recursive: true });

let md = `# ABSCHLUSS-ANALYSE\n\nProjekt: ${projekt}\n`;
md += `Erstellt: ${new Date().toLocaleString('de-DE')}\n`;
if (marker.zeit) md += `Autopilot fertig: ${new Date(marker.zeit).toLocaleString('de-DE')}${marker.ohneGrueneQa ? ' (Marker OHNE grüne QA gesetzt)' : ''}\n`;
md += `\nDiese Datei listet, WAS nach dem Autopilot noch von Hand geändert wurde.\n`;
md += `Sie ist die Faktenbasis für VERBESSERUNGEN.md – nicht das Gedächtnis.\n\n`;

// ── 0. QA-Nachweis ──
{
  let qa = null;
  try { qa = JSON.parse(lies('.qa-status.json')); } catch {}
  md += `## QA-Gesamtlauf\n\n`;
  if (!qa) md += `Kein QA-Gesamtlauf dokumentiert (npm run qa wurde nie ausgeführt). Das ist selbst ein Befund.\n\n`;
  else {
    md += `Letzter Lauf: ${new Date(qa.zeit).toLocaleString('de-DE')} · ${qa.bestanden ? 'GRÜN' : 'ROT'}${qa.komplett === false ? ' (Teillauf)' : ''}\n\n`;
    for (const [n, e] of Object.entries(qa.gates || {})) md += `- qa-${n}: ${e.uebersprungen ? 'übersprungen' : e.exit === 0 ? 'bestanden' : `${e.fehler || '?'} Fehler`}\n`;
    md += `\n`;
  }
}

// ── 1. Git-Diff seit dem Marker ──
const WERKZEUG = /node_modules|dist\/|\.qa-screenshots|package-lock|^abschluss\.js|^qa-[a-z-]+\.js|^og-bild\.js|^stand\.js|^\.autopilot|^\.claude\/|^_regeln\/|^_referenzen\/|^CLAUDE\.md|^weiter\.bat|^deploy\.js|^generate-image\.js|^\.qa-status\.json|report\.json$/;
if (hatGit && marker.commit) {
  const stat = sh(`git diff --numstat ${marker.commit} HEAD`);
  const zeilen = stat.split('\n').filter(Boolean).map(z => {
    const [plus, minus, datei] = z.split('\t');
    return { plus: +plus || 0, minus: +minus || 0, datei };
  }).filter(z => z.datei && !WERKZEUG.test(z.datei))
    .sort((a,b) => (b.plus + b.minus) - (a.plus + a.minus));

  md += `## Geänderte Dateien seit Autopilot-Abschluss (${zeilen.length})\n\n`;
  md += `| Datei | + | - | Bewertung |\n|---|---|---|---|\n`;
  for (const z of zeilen.slice(0, 40)) {
    const gross = z.plus + z.minus;
    const bew = gross > 200 ? 'KOMPLETT ÜBERARBEITET' : gross > 60 ? 'stark geändert' : gross > 10 ? 'angepasst' : 'Feinschliff';
    md += `| ${z.datei} | ${z.plus} | ${z.minus} | ${bew} |\n`;
  }
  const gesamt = zeilen.reduce((s,z) => s + z.plus + z.minus, 0);
  md += `\n**Gesamt: ${gesamt} geänderte Zeilen in ${zeilen.length} Dateien.**\n\n`;

  const neu = sh(`git diff --diff-filter=A --name-only ${marker.commit} HEAD`).split('\n').filter(f => f && !WERKZEUG.test(f));
  if (neu.length) {
    md += `### Neu angelegt (${neu.length}) – hat der Autopilot vergessen\n`;
    neu.forEach(f => md += `- ${f}\n`);
    md += `\n`;
  }
  const weg = sh(`git diff --diff-filter=D --name-only ${marker.commit} HEAD`).split('\n').filter(f => f && !WERKZEUG.test(f));
  if (weg.length) {
    md += `### Gelöscht (${weg.length}) – war überflüssig oder falsch\n`;
    weg.forEach(f => md += `- ${f}\n`);
    md += `\n`;
  }

  // Konkrete Diffs der drei am stärksten geänderten Quelldateien
  const top = zeilen.filter(z => /^src\//.test(z.datei)).slice(0, 3);
  if (top.length) {
    md += `## Konkrete Änderungen (Auszug)\n\n`;
    for (const z of top) {
      const d = sh(`git diff -U2 ${marker.commit} HEAD -- "${z.datei}"`);
      const fence = '`'.repeat(3);
      md += `### ${z.datei}\n` + fence + `diff\n${d.split('\n').slice(0, 60).join('\n')}\n` + fence + `\n\n`;
    }
  }
} else {
  md += `## Kein Git-Vergleich möglich\n(Marker oder Git fehlt – bitte Änderungen manuell beschreiben.)\n\n`;
}

// ── 2. Welche gesperrten Komponenten wurden überarbeitet – und von wem? ──
const cache = '.autopilot-sync';
if (existsSync(cache)) {
  const geaendert = [];
  for (const f of readdirSync(cache)) {
    for (const vz of ['src/components', 'src/layouts', 'src/pages', '.']) {
      const p = join(vz, f);
      if (existsSync(p)) {
        if (readFileSync(p, 'utf-8') !== readFileSync(join(cache, f), 'utf-8')) geaendert.push({ pfad: p.replace(/\\/g, '/'), name: f });
        break;
      }
    }
  }
  md += `## Gesperrte Komponenten, die überarbeitet wurden (${geaendert.length})\n\n`;
  if (geaendert.length) {
    md += `Das wertvollste Signal: Wenn dieselbe Komponente in mehreren Projekten überarbeitet\n`;
    md += `wird, gehört die Änderung ins Kit (_komponenten/) statt in jedes Projekt einzeln.\n`;
    md += `Herkunft aus der Git-Historie: "Autopilot" = Commit mit Claude als Co-Autor.\n\n`;
    for (const g of geaendert) {
      let herkunft = 'unbekannt (kein Git)';
      if (hatGit) {
        const wurzel = new Set(sh('git rev-list --max-parents=0 HEAD').split('\n').map(x => x.slice(0, 7)));
        const log = sh(`git log --format=%h%x1f%an%x1f%s%x1f%b%x1e -- "${g.pfad}"`).split('\x1e').map(s => s.trim()).filter(Boolean);
        const commits = log.map(e => { const [h, an, s, b] = e.split('\x1f'); return { h, an, s, auto: /co-authored-by:\s*claude|claude code|anthropic/i.test(`${an} ${b}`) }; })
          .filter(c => !wurzel.has((c.h || '').slice(0, 7)));   // Projektanlage zählt nicht
        const offen = sh(`git status --porcelain -- "${g.pfad}"`) ? ' + nicht committete Änderungen' : '';
        const auto = commits.filter(c => c.auto).length, ext = commits.length - auto;
        herkunft = `${commits.length} Commits (${auto} Autopilot, ${ext} extern)${offen}`;
        if (commits.length) herkunft += `: ${commits.slice(0, 4).map(c => `${c.auto ? '[AP]' : '[extern]'} ${c.s}`).join(' | ')}`;
      }
      md += `- **${g.pfad}** – ${herkunft}\n`;
      if (archivDa) {
        try {
          copyFileSync(g.pfad, join(archiv, 'komponenten', g.name));
          const diff = hatGit ? shDiff(`git diff --no-index -U3 "${join(cache, g.name)}" "${g.pfad}"`) : '';
          if (diff) writeFileSync(join(archiv, 'komponenten', `${g.name}.diff`), diff + '\n');
        } catch {}
      }
    }
    if (archivDa) md += `\nNikos Versionen + Diffs gesichert in: _learnings/${projekt}/komponenten/\n`;
  } else md += `Keine – die gelieferten Bausteine haben getragen.\n`;
  md += `\n`;
}
// Kit-Dateien im Root, die Niko von Hand geändert hat (das Setup hat sie behalten, neue Fassung daneben)
const konfliktDir = join('..', '..', '_kit-konflikte');
if (existsSync(konfliktDir)) {
  const k = readdirSync(konfliktDir).filter(f => f !== 'KIT-AENDERUNGEN.md' && f !== 'KIT-KONFLIKTE.md');
  if (k.length) md += `## Kit-Dateien im Root von Hand geändert (${k.length})\n\nVom Setup behalten, neue Kit-Fassung liegt in _kit-konflikte/: ${k.join(', ')}.\nBeide Fassungen (Root-_komponenten und _kit-konflikte) beim nächsten Kit-Update mitschicken.\n\n`;
}
if (existsSync('KIT-AENDERUNGEN.md')) {
  md += `## Vom Autopiloten mit Freigabe geänderte Kit-Dateien\n\n${lies('KIT-AENDERUNGEN.md')}\n`;
}

// ── 3. Vorhandene Berichte einsammeln ──
md += `## Vorhandene Berichte\n\n`;
for (const f of ['PROJEKTBERICHT.md', 'VERBESSERUNGEN.md', 'AUFGABEN.md', 'KI-BILDER.md', 'OFFENE-FRAGEN.md']) {
  if (existsSync(f)) {
    const z = readFileSync(f, 'utf-8').split('\n').length;
    md += `- **${f}** (${z} Zeilen) – VOLLSTÄNDIG LESEN und einarbeiten\n`;
  }
}
md += `\n## Auftrag für die Auswertung\n\n`;
md += `1. Alle oben genannten Berichte lesen (besonders PROJEKTBERICHT.md aus der externen IDE).\n`;
md += `2. Die Diffs oben durchgehen: Jede größere Änderung ist ein Autopilot-Mangel.\n`;
md += `3. VERBESSERUNGEN.md schreiben – pro Punkt: Problem, was Niko tat, Regel/Mechanik-Vorschlag.\n`;
md += `4. Keine Punkte erfinden und keine aus dem Gedächtnis – nur was hier belegt ist.\n`;
md += `5. Herkunft beachten: Komponenten-Änderungen mit [AP] hat der Autopilot gemacht (Regelverstoß),\n`;
md += `   [extern] ist Nikos Nacharbeit (Kit-Kandidat).\n`;

writeFileSync('ABSCHLUSS-ANALYSE.md', md);
if (archivDa) {
  try {
    writeFileSync(join(archiv, 'ABSCHLUSS-ANALYSE.md'), md);
    for (const f of ['PROJEKTBERICHT.md', 'VERBESSERUNGEN.md', 'KI-BILDER.md', 'AUFGABEN.md', 'DESIGN-BRIEF.md', '.qa-status.json'])
      if (existsSync(f)) copyFileSync(f, join(archiv, f));
  } catch {}
}
console.log(`\n  ABSCHLUSS-ANALYSE.md geschrieben${archivDa ? ` (Kopie + Komponenten in _learnings/${projekt}/)` : ''}.`);
console.log(`  -> Diese Datei ist die Faktenbasis für VERBESSERUNGEN.md\n`);
