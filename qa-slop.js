// QA-SLOP v1 – Anti-Slop-Check via Impeccable detect (github.com/pbakaus/impeccable)
// Deterministisch, kein LLM, kein Key. NICHT-BLOCKIEREND: warnt nur, Exit immer 0.
// Findet KI-Design-Klischees (Gradient-Text, nested Cards, graue Schrift auf Farbe, ...).
// Aufruf: node qa-slop.js   (scannt ./src)
import { execSync } from 'child_process';
import { existsSync } from 'fs';

if (!existsSync('src')) { console.log('  (qa-slop: kein src/ – übersprungen)'); process.exit(0); }

console.log('\n══════ QA-SLOP (Impeccable Anti-Slop) ══════');
console.log('  Scanne src/ auf KI-Design-Klischees (nicht-blockierend)...\n');

// ─── EIGENE SLOP-MUSTER (deterministisch, ohne Impeccable) ───
import { readdirSync, readFileSync } from 'fs';
function alleQuellen(dir = 'src') {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...alleQuellen(p));
    else if (/\.(astro|jsx?|tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
const SLOP = [
  [/bg-gradient-to-\w+[^"']*bg-clip-text|text-transparent[^"']*bg-clip/, 'Gradient-Text auf Headline'],
  [/zufriedene\s+Kunden|glückliche\s+Kunden|\d+\+\s*(Kunden|Projekte)\b/i, 'Avatar-Cluster-Floskel ("127+ zufriedene Kunden")'],
  [/innovativ und individuell|hochwertige Lösungen für|maßgeschneiderte Lösungen/i, 'inhaltsleere Füll-Adjektive'],
  [/[\u{1F300}-\u{1FAFF}]/u, 'Emoji im Quelltext (statt Icon)'],
];
let slopTreffer = 0;
const eyebrowDateien = [];
for (const f of alleQuellen()) {
  const src = readFileSync(f, 'utf-8');
  for (const [re, name] of SLOP) {
    if (re.test(src)) { console.log(`  ⚠  ${name} – ${f}`); slopTreffer++; }
  }
  // Eyebrow über H2: kleines Label direkt vor einer h2
  const eyebrows = (src.match(/tracking-(wider|widest)[^>]*>[^<]{2,28}<\/(p|span|div)>\s*<h2/g) || []).length;
  if (eyebrows >= 2) { eyebrowDateien.push(`${f} (${eyebrows}×)`); }
}
if (eyebrowDateien.length) {
  console.log(`  ⚠  Eyebrow wiederholt nur die Überschrift (inhaltsleer): ${eyebrowDateien.join(' · ')}`);
  slopTreffer++;
}
if (!slopTreffer) console.log('  ✔  Keine eigenen Slop-Muster gefunden.');
console.log('');



try {
  // --fast = regex-only (kein Puppeteer, schnell). JSON für maschinelle Auswertung.
  const out = execSync('npx --yes impeccable@latest detect src/ --fast --json', {
    encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000
  });
  let report;
  try { report = JSON.parse(out); } catch { console.log(out.slice(0, 2000)); process.exit(0); }

  const issues = report.issues || report.findings || [];
  if (!issues.length) {
    console.log('  ✔  Keine Slop-Muster gefunden.\n');
  } else {
    // Nach Regel gruppieren
    const byRule = {};
    for (const i of issues) {
      const rule = i.rule || i.id || 'unbekannt';
      (byRule[rule] = byRule[rule] || []).push(i.file || i.location || '');
    }
    console.log(`  ⚠  ${issues.length} mögliche Slop-Muster (Hinweis, kein Blocker):\n`);
    for (const [rule, files] of Object.entries(byRule)) {
      console.log(`     • ${rule} (${files.length}x)`);
    }
    console.log('\n  → Prüfen ob berechtigt. Bewusste Design-Entscheidungen dürfen bleiben.');
    console.log('    Klare KI-Klischees (Gradient-Text, nested Cards) beheben.\n');
  }
} catch (e) {
  // Tool nicht installierbar / offline / Fehler -> nur Hinweis, niemals blockieren
  const msg = (e.stdout || e.stderr || e.message || '').toString().slice(0, 300);
  console.log('  (qa-slop übersprungen – Impeccable nicht ausführbar:');
  console.log('   ' + msg.replace(/\n/g, ' ') + ')\n');
}
process.exit(0); // IMMER 0 – dieses Gate blockiert nie
