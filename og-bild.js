// OG-BILD v1 – erzeugt public/images/og-image.jpg (1200×630, echtes JPG, < 300 KB)
// Standard nach Regel "OG-IMAGE: SCHLICHT HALTEN": Logo mittig auf der Markenfarbe,
// kein Text, keine Bildmontage (WhatsApp schneidet kleine Vorschauen mittig quadratisch zu).
// Ersetzt KI-generierte OG-Bilder und liefert immer ein echtes JPG (Alge-Learning).
// Aufruf: node og-bild.js              Logo mittig auf Markenfarbe (Standard)
//         node og-bild.js --mit-bild   Hero-Foto abgedunkelt dahinter, Logo mittig
//         node og-bild.js --mit-name   Firmenname unter dem Logo (auch automatisch ohne Logo)
//         node og-bild.js --bild=/images/x.jpg   anderes Hintergrundbild für --mit-bild
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { chromium } from 'playwright';

const arg = (n) => (process.argv.find(a => a.startsWith(`--${n}=`)) || '').split('=').slice(1).join('=');
let sd;
try { sd = JSON.parse(readFileSync('src/content/site-data.json', 'utf-8')); }
catch { console.log('\n  ✖  src/content/site-data.json fehlt oder ist ungültig\n'); process.exit(1); }
const m = sd.meta || {}, f = sd.design?.farben || {}, fonts = sd.design?.fonts || {};

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const dataUrl = (webPfad) => {
  if (!webPfad) return null;
  const datei = join('public', webPfad.replace(/^\//, ''));
  if (!existsSync(datei)) return null;
  return `data:${MIME[extname(datei).toLowerCase()] || 'application/octet-stream'};base64,${readFileSync(datei).toString('base64')}`;
};

const mitBild = process.argv.includes('--mit-bild') || !!arg('bild');
let bildPfad = arg('bild') || sd.bildZuordnung?.['hero-startseite'] || '';
if (mitBild && !bildPfad && existsSync('public/images')) {
  const h = readdirSync('public/images').find(n => /^hero\.(jpe?g|png|webp)$/i.test(n));
  if (h) bildPfad = `/images/${h}`;
}
const bild = mitBild ? dataUrl(bildPfad) : null;
const logo = dataUrl(m.logoFooter || m.logo);
const logoStil = m.logoFooter ? 'original' : (m.logoFooterStil || (/\.jpe?g$/i.test(m.logo || '') ? 'platte' : 'weiss'));
const mitName = process.argv.includes('--mit-name') || !logo;

// Projekt-Schriften einbetten (fonts.css mit url(/fonts/...)), falls der Name gezeigt wird
let fontCss = '';
if (mitName && existsSync('src/styles/fonts.css')) {
  fontCss = readFileSync('src/styles/fonts.css', 'utf-8').replace(/url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g, (t, p) => {
    const d = dataUrl(p);
    return d ? `url('${d}')` : t;
  });
}
const esc = (t) => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const primary = f.primary || '#1A5C4A', accent = f.accent || '#D4A853';

const logoHtml = !logo ? '' : logoStil === 'platte'
  ? `<div style="display:inline-flex;background:#fff;border-radius:28px;padding:34px 46px"><img src="${logo}" style="height:150px;max-width:620px;object-fit:contain"></div>`
  : `<img src="${logo}" style="height:230px;max-width:760px;object-fit:contain;${logoStil === 'weiss' ? 'filter:brightness(0) invert(1);' : ''}">`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:${primary};color:#fff;font-family:${fonts.body || 'system-ui, sans-serif'}}
.bg{position:absolute;inset:0;background:${bild ? `url('${bild}') center/cover` : `radial-gradient(ellipse at 50% 40%, ${primary} 0%, ${primary} 55%, color-mix(in srgb, ${primary} 78%, #000) 100%)`}}
.dunkel{position:absolute;inset:0;background:${bild ? `color-mix(in srgb, ${primary} 78%, transparent)` : 'transparent'}}
.mitte{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;text-align:center;padding:0 120px}
h1{font-family:${fonts.display || 'Georgia, serif'};font-size:${logo ? 46 : 72}px;line-height:1.1;font-weight:700;text-wrap:balance}
.linie{position:absolute;left:0;right:0;bottom:0;height:12px;background:${accent}}
</style></head><body>
<div class="bg"></div><div class="dunkel"></div>
<div class="mitte">${logoHtml}${mitName ? `<h1>${esc(m.firmenname)}</h1>` : ''}</div>
<div class="linie"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
let buf, q = 86;
do {
  buf = await page.screenshot({ type: 'jpeg', quality: q, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  q -= 8;
} while (buf.length > 280 * 1024 && q >= 54);
await browser.close();
writeFileSync('public/images/og-image.jpg', buf);
console.log(`\n  ✔  public/images/og-image.jpg erzeugt (1200×630, ${Math.round(buf.length / 1024)} KB, Qualität ${q + 8})`);
if (mitBild && !bild) console.log('     Hinweis: kein Hero-Bild gefunden – Markenfarbe als Fläche.');
if (!logo) console.log('     Hinweis: kein Logo gefunden (meta.logo) – Firmenname als Text.');

// KI-BILDER.md: ein KI-generiertes OG-Bild gilt damit als ersetzt
if (existsSync('KI-BILDER.md')) {
  const alt = readFileSync('KI-BILDER.md', 'utf-8');
  const neu = alt.split('\n').map(z => /^- \[ \].*og-image/i.test(z) ? z.replace('- [ ]', '- [x]') + ' (ersetzt durch og-bild.js)' : z).join('\n');
  if (neu !== alt) { writeFileSync('KI-BILDER.md', neu); console.log('     KI-BILDER.md: OG-Bild als ersetzt markiert.'); }
}
console.log('');
