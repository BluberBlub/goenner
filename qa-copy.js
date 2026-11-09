// QA-COPY v3 – Text-Gate: fängt generische Floskeln, schwache Headlines und
// Gedankenstriche (Nikos feste Stilregel: Doppelpunkt, Komma, Klammer oder zwei Sätze).
// Bis-Striche bleiben erlaubt: "Mo–Fr", "8–12 Uhr", "Mo – Fr", "1998 – 2024".
// Läuft auf dist/ (nach Build). Exit 1 = Phase 3 nicht bestanden.
// v3: Uhrzeiten mit Doppelpunkt (Joos), Eyebrows beginnen groß (Joos), kein Link zur
//     eingestellten EU-OS-Plattform (Spöri), weiche Trennstellen der Middleware werden ignoriert.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const errors = [], hints = [];
const bad  = (m) => { errors.push(m); console.log('  ✖  ' + m); };
const hint = (m) => { hints.push(m); console.log('  ·  ' + m); };
const ok   = (m) => console.log('  ✔  ' + m);

const FLOSKELN = [
  'willkommen bei', 'willkommen auf', 'herzlich willkommen',
  'ihr partner für', 'ihr spezialist für', 'ihr zuverlässiger partner',
  'ihr kompetenter partner', 'wir sind ihr', 'qualität die überzeugt',
  'qualität, die überzeugt', 'kompetenz und erfahrung',
  'tradition und innovation', 'alles aus einer hand', 'rundum-service',
  'individuelle lösungen', 'maßgeschneiderte lösungen', 'wir bieten ihnen',
  'ihre zufriedenheit steht an erster stelle', 'aus leidenschaft zum',
  'mit herz und verstand', 'wir freuen uns auf ihre anfrage',
  'auf uns können sie zählen', 'seit vielen jahren', 'in guten händen'
];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk('dist');
if (!files.length) { console.log('  (kein dist/ – erst npm run build)'); process.exit(0); }

console.log('\n══════ QA-COPY (Text-Gate) ══════');
console.log(`  ${files.length} Seiten\n`);

const strip = (h) => h.replace(/<div id="demo-bar"[\s\S]*?<\/div>/i, '').replace(/&shy;|\u00ad/g, '')
                      .replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
                      .replace(/\s+/g, ' ').trim();

let h1Startseite = null;

// Gedankenstrich = Strich mit Leerzeichen zwischen WÖRTERN. Zwischen Zahlen, Uhrzeiten,
// Wochentagen oder Monaten ist es ein Bis-Strich und erlaubt.
const BIS = /^(\d[\d.:,]*|mo|di|mi|do|fr|sa|so|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|jan|feb|mär|apr|mai|jun|jul|aug|sep|okt|nov|dez|januar|februar|märz|april|juni|juli|august|september|oktober|november|dezember|uhr)$/i;
function gedankenstriche(text) {
  const treffer = [];
  const re = /(\S+)\s+(–|—|-)\s+(\S+)/g;
  let m;
  while ((m = re.exec(text))) {
    const links = m[1].replace(/[^\p{L}\d.:,]/gu, ''), rechts = m[3].replace(/[^\p{L}\d.:,]/gu, '');
    if (BIS.test(links) && BIS.test(rechts)) continue;
    if (/^\d/.test(links) && /^\d/.test(rechts)) continue;
    if (m[2] === '-' && !/\p{L}$/u.test(m[1])) continue;   // "Stand -" o. ä. ist kein Satzstrich
    treffer.push(text.slice(Math.max(0, m.index - 25), m.index + m[0].length + 25).trim());
    re.lastIndex = m.index + m[1].length + 1;
  }
  return treffer;
}
let strichSeiten = 0;

// Perspektive (Alge: René ist eine One-Man-Show -> Ich-Form statt Wir-Form)
let perspektive = '';
try { perspektive = String(JSON.parse(readFileSync('src/content/site-data.json', 'utf-8')).tonalitaet?.perspektive || '').toLowerCase(); } catch {}
const wirFunde = [];

for (const f of files) {
  const html = readFileSync(f, 'utf-8');
  const text = strip(html).toLowerCase();

  // 1. Floskeln
  for (const fl of FLOSKELN) {
    if (text.includes(fl)) bad(`Floskel "${fl}" in ${f} – ersetzen durch konkrete Aussage (siehe phase1-research.md)`);
  }

  // 1b. Gedankenstriche (nicht im Stil-Muster, das ist ein Arbeitsblatt)
  if (!/stil-muster/.test(f)) {
    const striche = gedankenstriche(strip(html));
    if (striche.length) {
      strichSeiten++;
      bad(`Gedankenstrich in ${f} (${striche.length}x), z. B. "${striche[0]}" – Doppelpunkt, Komma, Klammer oder zwei Sätze`);
    }
  }

  // 1c. Ich-Form-Projekt, aber Wir-Form im Text
  if (perspektive === 'ich' && !/stil-muster/.test(f)) {
    const t = strip(html);
    const n = (t.match(/\b(wir|uns|unser\w*)\b/gi) || []).length;
    if (n) wirFunde.push([f, n, (t.match(/.{0,30}\b(wir|uns|unser\w*)\b.{0,30}/i) || [''])[0]]);
  }

  if (!/stil-muster/.test(f)) {
    const t = strip(html);
    // 1d. Uhrzeiten immer mit Doppelpunkt: 11:30 Uhr, nicht 11.30 Uhr
    const punktZeit = t.match(/\b([01]?\d|2[0-3])\.[0-5]\d\s?(–\s?([01]?\d|2[0-3])[.:][0-5]\d\s?)?Uhr\b/);
    if (punktZeit) bad(`Uhrzeit mit Punkt in ${f}: "${punktZeit[0]}" – immer mit Doppelpunkt (11:30 Uhr)`);
    // 1e. Eyebrows beginnen mit Großbuchstaben
    for (const m of html.matchAll(/<(p|div|span)\b[^>]*\bdata-eyebrow\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
      const e = strip(m[2]);
      if (e && /^\p{Ll}/u.test(e)) bad(`Eyebrow beginnt klein in ${f}: "${e.slice(0, 40)}" – immer mit Großbuchstaben`);
    }
    // 1f. EU-OS-Plattform wurde am 20.07.2025 eingestellt: Link und Hinweis gehören nicht mehr ins Impressum
    if (/ec\.europa\.eu\/consumers\/odr/i.test(html)) bad(`Link zur EU-OS-Plattform in ${f} – die Plattform ist seit 20.07.2025 eingestellt, Hinweis entfernen`);
  }

  // 2. H1 einsammeln (Startseite)
  if (f.endsWith('dist\\index.html') || f.endsWith('dist/index.html')) {
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (m) h1Startseite = strip(m[1]);
  }
}

// Pflege, Betreuung, Hospiz: Formulierungen, die nach Tod oder Abschied klingen (Schwabenpflege: "bis zum
// Ende begleitet"). Nur Hinweis: manchmal ist es genau gemeint, dann bewusst so lassen.
{
  let branche = '';
  try { branche = String(JSON.parse(readFileSync('src/content/site-data.json', 'utf-8')).meta?.branche || ''); } catch {}
  if (/pflege|betreu|hospiz|senior|palliativ|alten/i.test(branche)) {
    const SENSIBEL = /\b(bis zum (letzten )?ende|bis zuletzt|letzten weg|letzte reise|lebensabend|abschied nehmen|am ende des lebens)\b/i;
    for (const f of files) {
      if (/stil-muster|datenschutz|impressum/.test(f)) continue;
      const m = strip(readFileSync(f, 'utf-8')).match(new RegExp(`.{0,30}${SENSIBEL.source}.{0,20}`, 'i'));
      if (m) hint(`Sensible Formulierung im Pflegekontext in ${f}: "${m[0].trim()}" – klingt nach Tod/Abschied, bewusst prüfen`);
    }
  }
}

if (wirFunde.reduce((s, [, n]) => s + n, 0) >= 3)
  bad(`Ich-Form-Projekt (tonalitaet.perspektive = "ich"), aber ${wirFunde.reduce((s, [, n]) => s + n, 0)}x Wir-Form, z. B. "${wirFunde[0][2].trim()}" in ${wirFunde[0][0]}`);

// 3. Headline-Qualität der Startseite
if (!h1Startseite) bad('Keine <h1> auf der Startseite gefunden');
else {
  const worte = h1Startseite.split(/\s+/).length;
  const hatZahl = /\d/.test(h1Startseite);
  const nurName = h1Startseite.split(/\s+/).length <= 4 && !hatZahl;
  console.log(`  H1: "${h1Startseite}"`);
  if (worte < 4) bad(`H1 zu kurz (${worte} Wörter) – wirkt wie ein Firmenschild, nicht wie eine Botschaft`);
  else if (nurName) hint('H1 nennt fast nur den Firmennamen – eine Behauptung/Spannung wirkt stärker');
  else if (!hatZahl && worte < 7) hint('H1 knapp – konkretes Detail (Zahl, Ort, Jahr) macht sie unverwechselbar');
  else ok('H1 hat Substanz');
}

// 4. Konkretheit: Zahlen/Jahreszahlen im Fließtext der Startseite?
const start = files.find(f => /dist[\\/]index\.html$/.test(f));
if (start) {
  const t = strip(readFileSync(start, 'utf-8'));
  const zahlen = (t.match(/\b(19|20)\d{2}\b|\b\d{2,}\s?(km|m²|jahre|mitglieder|projekte|kunden)\b/gi) || []).length;
  if (zahlen === 0) hint('Startseite ohne konkrete Zahlen/Jahreszahlen – Details schaffen Glaubwürdigkeit');
  else ok(`${zahlen} konkrete Angaben auf der Startseite`);
}

console.log(`\n  ${errors.length} Fehler, ${hints.length} Hinweise\n`);
process.exit(errors.length ? 1 : 0);
