// QA-IMAGES v1 – Maschinelles Bild-Gate (Gemini Vision)
// Schaut JEDES Bild wirklich an und gleicht gegen Branche + Verwendungszweck ab.
// Aufruf: node qa-images.js   (liest site-data.json + public/images/)
// Key aus ../../gemini-config.json oder GEMINI_API_KEY.

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Key + Modell
let apiKey = process.env.GEMINI_API_KEY;
let visionModel = 'gemini-3.5-flash';
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
const cfg = join(__dirname, '..', '..', 'gemini-config.json');
if (existsSync(cfg)) {
  const c = JSON.parse(readFileSync(cfg, 'utf-8'));
  apiKey = apiKey || c.apiKey;
  if (c.visionModel) visionModel = c.visionModel;
}
if (!apiKey || apiKey.includes('HIER_')) {
  console.log('\n  ⚠  qa-images übersprungen: kein Gemini-Key (gemini-config.json).');
  console.log('     Bild-Gate inaktiv – Bilder NICHT maschinell geprüft.\n');
  process.exit(0); // nicht blockieren wenn kein Key – aber warnen
}

// Kontext aus site-data.json
let site = {};
try { site = JSON.parse(readFileSync('src/content/site-data.json', 'utf-8')); }
catch { console.error('  ✖ site-data.json nicht lesbar'); process.exit(1); }

const branche = site.meta?.branche || site.branche || 'unbekannt';
const firma = site.meta?.firmenname || site.firmenname || '';
const ort = site.meta?.ort || '';
// bildZuordnung: {key: pfad} – Zweck steckt im key
const zuordnung = site.bildZuordnung || {};

// Bilder sammeln
function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) out.push(...walk(f));
    else if (/\.(jpe?g|png|webp)$/i.test(e) && !/og-image|logo/i.test(e)) out.push(f);
  }
  return out;
}
// Ein Motiv nur einmal prüfen (Joos): x.jpg, x.webp, x-800.avif, x-hero.webp sind dasselbe Bild in anderen
// Formaten/Größen (bild-formate.js, optimize-build). Geprüft wird jeweils die größte Datei.
const motive = new Map();
for (const f of walk('public/images')) {
  const key = f.replace(/\.(jpe?g|png|webp|avif)$/i, '').replace(/-(800|hero)$/i, '');
  const alt = motive.get(key);
  if (!alt || statSync(f).size > statSync(alt).size) motive.set(key, f);
}
const images = [...motive.values()];
if (!images.length) { console.log('  Keine Bilder gefunden.'); process.exit(0); }

// Pfad -> geplanter Zweck (aus bildZuordnung rückwärts)
const zweckVon = (imgPath) => {
  const rel = '/' + imgPath.replace(/\\/g, '/').replace(/^public\//, '');
  for (const [key, p] of Object.entries(zuordnung)) {
    if (typeof p === 'string' && p.replace(/^\//, '') === rel.replace(/^\//, '')) return key;
  }
  return basename(imgPath, extname(imgPath)); // Fallback: Dateiname
};

const mime = (f) => extname(f).toLowerCase() === '.png' ? 'image/png'
  : extname(f).toLowerCase() === '.webp' ? 'image/webp' : 'image/jpeg';

const buildUrl = (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;

console.log(`\n══════ QA-IMAGES (Bild-Gate) ══════`);
console.log(`  Branche: ${branche} | ${images.length} Bilder | Modell: ${visionModel}\n`);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let activeModel = visionModel;
const errors = [], warnings = [];

// Ergebnis-Cache je Bild (Schwabenpflege: 25 Bilder sprengten das Gemini-Tageslimit; unveränderte Bilder
// werden nicht erneut geprüft). Schlüssel = Inhalt der Datei + Zweck + Branche.
const { createHash } = await import('crypto');
const { mkdirSync, writeFileSync: schreibe } = await import('fs');
const CACHE_DATEI = '.qa-cache/qa-images.json';
let cache = {};
try { cache = JSON.parse(readFileSync(CACHE_DATEI, 'utf-8')); } catch {}
const cacheSpeichern = () => { try { mkdirSync('.qa-cache', { recursive: true }); schreibe(CACHE_DATEI, JSON.stringify(cache, null, 1)); } catch {} };
let tageslimit = false, geprueft = 0;
// Schneider: Gemini überlastet (429/503 im Minutentakt), jedes Bild wartete seine Retries ab, bis qa-alle
// nach 25 Minuten abbrach und alles rot war. Jetzt: drei Bilder hintereinander ohne Antwort oder mehr als
// 15 Minuten Laufzeit -> sauber "übersprungen (Gemini überlastet)". Geprüfte Bilder bleiben im Cache,
// der nächste Lauf macht dort weiter. Echte Funde (unpassend, Wasserzeichen) bleiben Fehler.
let ueberlastet = false, fehlschlaegeInFolge = 0;
const START = Date.now(), BUDGET_MS = 15 * 60 * 1000;

for (const img of images) {
  if (tageslimit || ueberlastet) break;
  if (Date.now() - START > BUDGET_MS) { ueberlastet = true; break; }
  const zweck = zweckVon(img);
  const roh = readFileSync(img);
  const schluessel = createHash('sha1').update(roh).update(`|${zweck}|${branche}|${ort}`).digest('hex');
  const b64 = roh.toString('base64');
  const frage = `Du bist Bild-QA für eine Website. Firma: "${firma}", Branche: "${branche}"${ort ? `, Ort: ${ort}` : ''}.`
    + ` Dieses Bild soll verwendet werden für: "${zweck}".`
    + ` Beschreibe in max 12 Wörtern was WIRKLICH auf dem Bild zu sehen ist.`
    + ` Dann bewerte streng anhand dieser fünf Kriterien:`
    + ` (1) MASSSTAB – passt die Projektgröße zur Firma? (Einfamilienhaus für Hochbau-Spezialist = falsch, Hochhaus für Dorf-Zimmerei = falsch)`
    + ` (2) REGION – passt die Landschaft/Bauweise zur Gegend?${ort ? ` Der Betrieb sitzt in ${ort}.` : ''} (mediterrane Dächer, Alpenpanorama oder US-Vorstadt in Oberschwaben = falsch)`
    + ` (3) HANDWERK – passt die gezeigte Arbeitsweise? (Industriemontage für traditionelle Handwerksbetriebe = falsch)`
    + ` (4) MENSCHEN – bei Handwerk/Dienstleistung: sind arbeitende Menschen zu sehen, oder nur Gebäude/Objekte? Reine Objektbilder wirken unbelebt (kein Fehler, aber "grund" vermerken).`
    + ` (5) WASSERZEICHEN – sichtbares Wasserzeichen, Stock-Agentur-Logo, KI-Signet oder nachträglich eingeblendeter Text im Bild = IMMER passt:false und wasserzeichen:true (echte Schilder/Beschriftungen im Motiv zählen NICHT).`
    + ` Antworte NUR als JSON: {"inhalt":"...","passt":true/false,"wasserzeichen":true/false,"grund":"kurz"}`;

  const body = JSON.stringify({ contents: [{ parts: [
    { text: frage },
    { inlineData: { mimeType: mime(img), data: b64 } }
  ] }] });

  const callWithFallback = async () => {
    for (let mi = 0; mi < FALLBACK_MODELS.length; mi++) {
      const model = mi === 0 ? visionModel : FALLBACK_MODELS[mi];
      for (let attempt = 0; attempt < 3; attempt++) {
        if (Date.now() - START > BUDGET_MS) return null;   // Zeitbudget auch mitten in den Retries
        // 60 s pro Anfrage: ein hängender Gemini-Aufruf darf den QA-Lauf nicht blockieren (Joos)
        let res;
        try {
          res = await fetch(buildUrl(model), {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(60000) });
        } catch { await sleep(3000); continue; }
        if (res.ok) { activeModel = model; return res; }
        if (res.status === 429) {
          // Tageslimit: Warten hilft nicht (Schwabenpflege: 25 Minuten Retries bis zur Zeitüberschreitung)
          const t = await res.text().catch(() => '');
          if (/PerDay/i.test(t)) { tageslimit = true; return 'LIMIT'; }
          await sleep(6000 * (attempt + 1)); continue;   // Minutenlimit: kurz warten
        }
        if (res.status === 404) break; // Modell gibt's nicht -> nächstes Modell
        return res; // anderer Fehler -> zurückgeben
      }
    }
    return null;
  };

  try {
    let r = cache[schluessel];
    const label = `${basename(img)} [${zweck}]`;
    if (r) {
      if (r.passt === false) { errors.push(`${label}: zeigt "${r.inhalt}" – ${r.grund}`); console.log(`  ✖  ${label} (Cache)\n     zeigt: ${r.inhalt}\n     ${r.grund}`); }
      else console.log(`  ✔  ${label}: ${r.inhalt} (Cache)`);
      continue;
    }
    const res = await callWithFallback();
    if (res === 'LIMIT') break;
    if (!res || !res.ok) {
      warnings.push(`${basename(img)}: ${res ? `API ${res.status}` : 'kein Modell erreichbar (404/429)'}`);
      if (++fehlschlaegeInFolge >= 3) { ueberlastet = true; break; }
      continue;
    }
    fehlschlaegeInFolge = 0;
    const data = await res.json();
    const txt = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) { warnings.push(`${basename(img)}: keine JSON-Antwort`); continue; }
    r = JSON.parse(m[0]);
    if (r.wasserzeichen === true) { r.passt = false; r.grund = `Wasserzeichen/Text im Bild: ${r.grund || ''}`.trim(); }
    cache[schluessel] = { inhalt: r.inhalt, passt: r.passt, grund: r.grund }; geprueft++; cacheSpeichern();
    if (r.passt === false) {
      errors.push(`${label}: zeigt "${r.inhalt}" – ${r.grund}`);
      console.log(`  ✖  ${label}\n     zeigt: ${r.inhalt}\n     ${r.grund}`);
    } else {
      console.log(`  ✔  ${label}: ${r.inhalt}`);
    }
  } catch (e) {
    warnings.push(`${basename(img)}: ${e.message}`);
  }
  await sleep(1200); // Drossel gegen Rate-Limit (Free-Tier ~10/min)
}

console.log(`\n  ${errors.length} unpassende Bilder, ${warnings.length} Warnungen`);
if (ueberlastet && !tageslimit && !errors.length) {
  console.log(`\n  ⚠  qa-images übersprungen: Gemini überlastet oder Zeitbudget erreicht (${geprueft} neu geprüft, Ergebnisse im Cache).`);
  console.log('     Kein Fehler der Website. Der nächste Lauf prüft nur noch die fehlenden Bilder.\n');
  process.exit(0);
}
if (tageslimit && !errors.length) {
  console.log(`\n  ⚠  qa-images übersprungen: Gemini-Tageskontingent erschöpft (${geprueft} neu geprüft, Ergebnisse im Cache).`);
  console.log('     Der nächste Lauf prüft nur noch die fehlenden Bilder. Dauerhaft: bezahlter Key in ../../gemini-config.json.\n');
  process.exit(0);
}
if (warnings.length) warnings.forEach(w => console.log('  ⚠  ' + w));

// Maschinenlesbaren Reparatur-Report schreiben (fuer Autopilot Phase 3)
if (errors.length) {
  const { writeFileSync } = await import('fs');
  const report = errors.map(e => {
    const m = e.match(/^(.+?) \[(.+?)\]: zeigt "(.+?)" – (.+)$/);
    return m ? { datei: m[1], zweck: m[2], istInhalt: m[3], grund: m[4] } : { roh: e };
  });
  writeFileSync('qa-images-report.json', JSON.stringify({
    branche, firma, ort, unpassend: report,
    hinweis: 'Diese Bilder ersetzen. Reihenfolge: echte Kundenbilder > lizenzfrei > generate-image.js. Danach npm run qa:images erneut bis 0 unpassende.'
  }, null, 2));
  console.log(`\n  → qa-images-report.json geschrieben. Bilder ersetzen, dann erneut prüfen.\n`);
}
process.exit(errors.length ? 1 : 0);
