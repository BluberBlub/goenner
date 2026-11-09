// GENERATE-IMAGE v2 – kostenlose Bildgenerierung via Pollinations.ai (Flux)
// KEIN API-Key, KEIN Billing nötig. Fallback: Gemini (falls gemini-config.json + Key).
// NUR als Bild-Fallback wenn echte + lizenzfreie Bilder unpassend (siehe phase1-research.md).
// Aufruf: node generate-image.js "<prompt>" <output-pfad> [breite] [hoehe]

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Jedes erzeugte Bild protokollieren – vor Go-Live durch echte Fotos ersetzen
function protokolliere(datei, prompt) {
  try {
    const kopf = '# KI-GENERIERTE BILDER (vor Go-Live ersetzen)\n\n' +
      'Diese Bilder sind PLATZHALTER. Echte Fotos vom Kunden anfordern oder\n' +
      'lizenzfreie Alternativen (Unsplash, Pexels) suchen. Haken setzen wenn ersetzt.\n\n';
    let alt = existsSync('KI-BILDER.md') ? readFileSync('KI-BILDER.md','utf-8') : kopf;
    if (!alt.includes(datei)) alt += `- [ ] ${datei} — Prompt: ${String(prompt).slice(0,120)}\n`;
    writeFileSync('KI-BILDER.md', alt);
  } catch {}
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const [,, prompt, outPath, w = 1600, h = 1000] = process.argv;

if (!prompt || !outPath) {
  console.error('Aufruf: node generate-image.js "<prompt>" <output-pfad> [breite] [hoehe]');
  process.exit(1);
}

// Maße validieren: zu kleine Werte (z.B. versehentlich "16 9" als Seitenverhältnis) korrigieren
let W = parseInt(w), H = parseInt(h);
if (!W || W < 256 || !H || H < 256) {
  // Falls jemand ein Verhältnis wie 16:9 übergibt -> auf sinnvolle Hero-Größe skalieren
  const ratio = (W && H) ? W / H : 16 / 10;
  if (ratio >= 1.6) { W = 1920; H = Math.round(1920 / ratio); }
  else { W = 1600; H = Math.round(1600 / ratio); }
  console.log(`  ⚠  Maße zu klein/ungültig – korrigiert auf ${W}x${H}`);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Prompt-Guardrails: web-tauglich, keine echten Personen als Hauptmotiv
const fullPrompt = `${prompt}. Documentary photography style, shot on DSLR, `
  + `natural imperfect lighting, realistic, not oversaturated, subtle film grain, `
  + `candid, authentic, high quality, no text, no watermark`;

const dir = dirname(outPath);
if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });

// ─── Quelle 1: Pollinations.ai (kostenlos, kein Key) ───
async function viaPollinations() {
  const seed = Math.floor(Math.random() * 1e9); // Variation erzwingen
  const enc = encodeURIComponent(fullPrompt);
  const url = `https://image.pollinations.ai/prompt/${enc}`
    + `?width=${W}&height=${H}&seed=${seed}&model=flux&nologo=true&enhance=true`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'niko-autopilot/2' } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 3000) { // Plausibilität: echtes Bild, kein Fehlertext
          writeFileSync(outPath, buf);
          protokolliere(outPath, prompt);
          return true;
        }
      }
      if (res.status === 429 || res.status >= 500) {
        console.log(`  ⏳ Pollinations ausgelastet (${res.status}), warte 15s... (${attempt+1}/3)`);
        await sleep(15000); continue;
      }
    } catch (e) {
      console.log(`  ⏳ Netzwerkfehler (${e.message.split('\n')[0]}), warte 8s...`);
      await sleep(8000);
    }
  }
  return false;
}

// ─── Quelle 2: Gemini (nur falls Key vorhanden) ───
async function viaGemini() {
  const cfgPath = join(__dirname, '..', '..', 'gemini-config.json');
  let apiKey = process.env.GEMINI_API_KEY, model = 'gemini-2.5-flash-image';
  if (existsSync(cfgPath)) {
    const c = JSON.parse(readFileSync(cfgPath, 'utf-8'));
    apiKey = apiKey || c.apiKey; if (c.model) model = c.model;
  }
  if (!apiKey || apiKey.includes('HIER_')) return false;

  const ALLOWED = [['1:1',1],['4:3',4/3],['3:4',3/4],['3:2',3/2],['2:3',2/3]];
  const target = W / H;
  const aspectRatio = ALLOWED.reduce((b,c) => Math.abs(c[1]-target)<Math.abs(b[1]-target)?c:b)[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{parts:[{text: fullPrompt}]}],
        generationConfig:{ responseModalities:['IMAGE'], imageConfig:{ aspectRatio } } }) });
    if (!res.ok) { console.log(`  (Gemini-Fallback nicht verfügbar: ${res.status})`); return false; }
    const data = await res.json();
    const p = (data?.candidates?.[0]?.content?.parts||[]).find(x=>x.inlineData?.data);
    if (!p) return false;
    writeFileSync(outPath, Buffer.from(p.inlineData.data, 'base64'));
    protokolliere(outPath, prompt);
    return true;
  } catch { return false; }
}

console.log(`\n  Generiere Bild (Pollinations.ai / Flux)...`);
console.log(`  Prompt: ${prompt.slice(0, 80)}...`);
console.log(`  Größe: ${W}x${H}`);

let ok = await viaPollinations();
if (!ok) {
  console.log('  Pollinations fehlgeschlagen – versuche Gemini-Fallback...');
  ok = await viaGemini();
}

if (ok) {
  console.log(`  ✔  Gespeichert: ${outPath}`);
  console.log(`  ⚠  KI-generiert – im PROJEKTBERICHT.md vermerken!\n`);
  process.exit(0);
} else {
  console.error('\n[FEHLER] Bildgenerierung fehlgeschlagen (Pollinations + Gemini).');
  console.error('  → Später erneut oder lizenzfrei (Unsplash/Pexels) verwenden.\n');
  process.exit(1);
}
