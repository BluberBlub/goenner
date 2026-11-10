// QA-VISUAL v1 – Das Auge: Screenshots + Gemini Vision als Art Director
// Beurteilt was SICHTBAR ist – Textränder, Kollisionen, kaputte Abstände,
// unlesbare Stellen. Kein Metrik-Gate, sondern ein Urteil.
// Aufruf: node qa-visual.js [baseUrl=http://localhost:4321]
// Screenshots landen in .qa-screenshots/ – dort selbst reinschauen lohnt sich.

import { chromium } from 'playwright';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:4321';
const SHOTS = '.qa-screenshots';

// Key
let apiKey = process.env.GEMINI_API_KEY;
let modelle = ['gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash'];
const cfg = join(__dirname, '..', '..', 'gemini-config.json');
if (existsSync(cfg)) {
  const c = JSON.parse(readFileSync(cfg, 'utf-8'));
  apiKey = apiKey || c.apiKey;
  if (c.visionModel) modelle = [c.visionModel, ...modelle.filter(m => m !== c.visionModel)];
}
let visionModel = modelle[0];
if (!apiKey || apiKey.includes('HIER_')) {
  console.log('\n  ⚠  qa-visual übersprungen: kein Gemini-Key.');
  console.log('     Ohne Key kann niemand beurteilen, wie die Seite AUSSIEHT.');
  console.log('     Key eintragen: ../../gemini-config.json "apiKey" (aus aistudio.google.com/apikey) oder Umgebungsvariable GEMINI_API_KEY.\n');
  process.exit(0);
}

// Kontext
let site = {};
try { site = JSON.parse(readFileSync('src/content/site-data.json', 'utf-8')); } catch {}
const firma = site.meta?.firmenname || site.firmenname || 'diese Firma';
const branche = site.meta?.branche || site.branche || '';
let leitidee = '';
if (existsSync('DESIGN-BRIEF.md')) {
  const b = readFileSync('DESIGN-BRIEF.md', 'utf-8');
  const m = b.match(/LEITIDEE[:\s"]*([^\n"]{10,160})/i);
  if (m) leitidee = m[1].trim();
}

// Seiten (Startseite + bis zu 3 weitere)
function scan(dir, prefix) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || ['images','fonts'].includes(e.name)) continue;
    if (e.isDirectory()) out.push(...scan(join(dir, e.name), `${prefix}/${e.name}`));
    else if (e.name === 'index.html') out.push(prefix === '' ? '/' : prefix + '/');
  }
  return out;
}
const nurPfad = process.argv[3];
let pages;
if (nurPfad && nurPfad.startsWith('/')) {
  pages = [nurPfad.endsWith('/') ? nurPfad : nurPfad + '/'];
} else {
  const alle = [...new Set(scan('dist', ''))];
  const rechtlich = /impressum|datenschutz|404|stil-muster/i;
  pages = ['/', ...alle.filter(p => p !== '/' && !rechtlich.test(p)).slice(0, 3)];
}

const BREAKPOINTS = [{ name: 'mobile', w: 390, h: 844 }, { name: 'desktop', w: 1440, h: 900 }];
const sleep = ms => new Promise(r => setTimeout(r, ms));
if (!existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });

const fehler = [], hinweise = [];
console.log(`\n══════ QA-VISUAL (Art-Director-Blick) ══════`);
console.log(`  ${pages.length} Seiten × ${BREAKPOINTS.length} Breiten · Modell: ${visionModel}\n`);

const browser = await chromium.launch();

let tageslimit = false;
// Schneider: Gemini überlastet -> jede Seite wartete 5 Versuche ab, bis die Zeit ablief. Jetzt: zwei
// Ansichten hintereinander ohne Antwort oder mehr als 15 Minuten -> sauber "übersprungen (überlastet)".
let ueberlastet = false, fehlInFolge = 0;
const START = Date.now(), BUDGET_MS = 15 * 60 * 1000;
seiten: for (const path of pages) {
  for (const bp of BREAKPOINTS) {
    if (Date.now() - START > BUDGET_MS) { ueberlastet = true; break seiten; }
    const page = await browser.newPage();
    await page.setViewportSize({ width: bp.w, height: bp.h });
    let shot;
    const datei = join(SHOTS, `${path.replace(/\//g, '_') || 'start'}_${bp.name}.png`);
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 20000 });
      // Einblend-Animationen (Kit data-reveal UND eigene Reveal-Skripte) sofort im Endzustand,
      // sonst zeigt der Ganzseiten-Screenshot leere Flächen und das Urteil wird falsch.
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}.rv-warten{opacity:1!important;transform:none!important}*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important}' });
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(window.innerHeight * 0.7)) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 140));
        }
      });
      await page.waitForTimeout(1800);   // Zähler (data-counter) laufen 1,6 s
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      shot = await page.screenshot({ fullPage: true });
      writeFileSync(datei, shot);
    } catch (e) {
      console.log(`  ⚠  ${path} @${bp.name}: ${e.message.split('\n')[0]}`);
      await page.close(); continue;
    }
    await page.close();

    const frage = `Du bist Art Director und prüfst diesen Screenshot einer Website.
Firma: "${firma}"${branche ? `, Branche: ${branche}` : ''}. Ansicht: ${bp.name} (${bp.w}px breit).
${leitidee ? `Gestalterische Leitidee: "${leitidee}".` : ''}

${path.includes('stil-muster') ? `Das ist ein STIL-MUSTER (Style Tile) – die visuelle Sprache vor dem Seitenbau.
Beurteile: Wirkt diese Anmutung hochwertig und zur Leitidee passend? Stimmen
Farbkontraste, Typo-Größenverhältnisse, Weißraum, Schrift-Charakter? Wäre das
das Fundament für eine Website im Wert von 250.000 Euro (Spitzenagentur) – oder wirkt
es nach Standard-Template? Sei streng, hier ist Nachbessern noch billig.
Die kleinen grauen Beschriftungen und Erklärtexte (Abschnittsnamen, Kontrastwerte, Hinweise wie
"Variante A") gehören zum Arbeitsblatt, NICHT zur Website: nicht bewerten.` : ''}

Beurteile AUSSCHLIESSLICH das, was du im Bild tatsächlich SIEHST.
Keine allgemeinen Ratschläge, keine Vermutungen über Code.

Achte besonders auf:
- Text der am Rand klebt, abgeschnitten ist oder aus seinem Container läuft
- Elemente die unschön kollidieren oder sich zufällig überlappen
- Inkonsistente Abstände oder Farben zwischen ähnlichen Elementen
- Schlecht lesbaren Text (zu wenig Kontrast, Text auf unruhigem Bild)
- Leere, kaputte oder halbfertig wirkende Bereiche
- Bilder deren Motiv falsch beschnitten ist (Kopf ab, Hauptmotiv außerhalb)
- Ob das Ganze wie eine gestaltete Seite wirkt oder wie gestapelte Standard-Blöcke
  (Maßstab: Arbeit einer Spitzenagentur im Wert von 250.000 Euro, nicht ein solides Baukastenprojekt)

Klassifiziere jeden Befund:
"fehler"  = sichtbar kaputt oder unprofessionell, muss behoben werden
"hinweis" = Geschmacksfrage oder Verbesserungsidee

Antworte NUR mit JSON, ohne Markdown:
{"befunde":[{"schwere":"fehler","wo":"z.B. Hero, zweite Sektion links","was":"konkrete Beschreibung","fix":"konkreter Lösungsvorschlag"}]}
Wenn nichts zu beanstanden ist: {"befunde":[]}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${visionModel}:generateContent?key=${apiKey}`;
    const body = JSON.stringify({ contents: [{ parts: [
      { text: frage },
      { inlineData: { mimeType: 'image/png', data: shot.toString('base64') } }
    ] }] });

    let res = null;
    for (let a = 0; a < 5 && !res?.ok; a++) {
      const url2 = `https://generativelanguage.googleapis.com/v1beta/models/${visionModel}:generateContent?key=${apiKey}`;
      try {
        res = await fetch(url2, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(60000) });
      } catch { res = null; await sleep(3000); continue; }
      if (res.ok) break;
      if (res.status === 429) {
        // Tageslimit (Schwabenpflege: Free-Tier): Warten hilft nicht, sofort aufhören
        const t = await res.clone().text().catch(() => '');
        if (/PerDay/i.test(t)) { tageslimit = true; break; }
      }
      if (res.status === 503 || res.status === 429 || res.status === 500) {
        const warte = 6000 * (a + 1);
        console.log(`  …  ${path} @${bp.name}: API ${res.status} (überlastet) – Versuch ${a + 2}/5 in ${warte / 1000}s`);
        await sleep(warte); continue;
      }
      if ((res.status === 404 || res.status === 400) && modelle.indexOf(visionModel) < modelle.length - 1) {
        visionModel = modelle[modelle.indexOf(visionModel) + 1];
        console.log(`  …  Modell nicht verfügbar – wechsle auf ${visionModel}`);
        continue;
      }
      break;
    }
    if (tageslimit) break seiten;
    if (!res || !res.ok) {
      console.log(`  ⚠  ${path} @${bp.name}: API ${res?.status ?? 'keine Antwort'} – Seite übersprungen`);
      if (++fehlInFolge >= 2) { ueberlastet = true; break seiten; }
      continue;
    }
    fehlInFolge = 0;

    try {
      const data = await res.json();
      const txt = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
      const m = txt.match(/\{[\s\S]*\}/);
      if (!m) { console.log(`  ⚠  ${path} @${bp.name}: keine JSON-Antwort`); continue; }
      const { befunde = [] } = JSON.parse(m[0]);
      if (!befunde.length) { console.log(`  ✔  ${path} @${bp.name}: nichts zu beanstanden`); }
      for (const b of befunde) {
        const zeile = `${path} @${bp.name} – ${b.wo}: ${b.was}${b.fix ? ` → ${b.fix}` : ''}`;
        if (b.schwere === 'fehler') { fehler.push(zeile); console.log(`  ✖  ${zeile}`); }
        else { hinweise.push(zeile); console.log(`  ·  ${zeile}`); }
      }
    } catch (e) { console.log(`  ⚠  ${path} @${bp.name}: ${e.message}`); }

    await sleep(1500); // Drossel
  }
}
await browser.close();

writeFileSync('qa-visual-report.json', JSON.stringify({ fehler, hinweise,
  screenshots: SHOTS,
  hinweisText: 'fehler = beheben. hinweise = bewusst entscheiden, nicht blind umsetzen.' }, null, 2));

console.log(`\n  ${fehler.length} sichtbare Fehler, ${hinweise.length} Hinweise`);
console.log(`  Screenshots: ${SHOTS}/  ·  Report: qa-visual-report.json\n`);
// Ende über exitCode statt process.exit(): unter Windows/Node 24 bricht process.exit() mit
// "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" ab, solange Netzverbindungen schließen,
// und das zählte als rotes Gate (Waldsee Golf, 27.10.2026).
if (ueberlastet && !tageslimit && !fehler.length) {
  console.log('  ⚠  qa-visual übersprungen: Gemini überlastet oder Zeitbudget erreicht. Kein Fehler der Website, Screenshots liegen vor.\n');
  process.exitCode = 0; global.__fertig = true;
}
if (!global.__fertig && tageslimit && !fehler.length) {
  console.log('  ⚠  qa-visual übersprungen: Gemini-Tageskontingent erschöpft. Screenshots liegen trotzdem vor (selbst ansehen).');
  console.log('     Dauerhaft: bezahlter Key in ../../gemini-config.json.\n');
  process.exitCode = 0; global.__fertig = true;
}
if (!global.__fertig) process.exitCode = fehler.length ? 1 : 0;
