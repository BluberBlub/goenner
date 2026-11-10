// QA-OVERFLOW v1 – Playwright: horizontaler Overflow auf allen Seiten & Breiten
// Aufruf: node qa-overflow.js [baseUrl=http://localhost:4321]
import { chromium } from 'playwright';
import { readdirSync, existsSync, readFileSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:4321';
const WIDTHS = [320, 360, 390, 768, 1024, 1440, 1920];

// Seiten aus dist ermitteln (nach Build vorhanden)
function scanPages(dir, prefix) {
  const pages = [];
  if (!existsSync(dir)) return pages;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name === 'images' || e.name === 'fonts') continue;
    if (e.isDirectory()) pages.push(...scanPages(`${dir}/${e.name}`, `${prefix}/${e.name}`));
    else if (e.name === 'index.html') pages.push(prefix === '' ? '/' : prefix + '/');
  }
  return pages;
}
function findPages() {
  const p = [...new Set(scanPages('dist', ''))];   // dedupliziert
  return p.length ? p : ['/'];
}


// ── STICHPROBE bei großen Projekten: Seiten aus demselben Template teilen
//    dieselben Fehler. 1 Vertreter je Gruppe genügt; --alle erzwingt Vollprüfung.
function stichprobe(alle, limit = 12) {
  const la = process.argv.find(a => a.startsWith('--limit='));
  if (la) limit = parseInt(la.split('=')[1]) || limit;
  if (process.argv.includes('--alle') || alle.length <= limit) return alle;
  const gruppe = (p) => {
    const teile = p.split('/').filter(Boolean);
    if (!teile.length) return 'start';
    return teile.length === 1 ? `top:${teile[0]}` : `tpl:${teile[0]}`;
  };
  const gesehen = new Map();
  for (const p of alle) { const g = gruppe(p); if (!gesehen.has(g)) gesehen.set(g, p); }
  let auswahl = [...gesehen.values()];
  const rest = alle.filter(p => !auswahl.includes(p));
  while (auswahl.length < limit && rest.length) auswahl.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  console.log(`  Stichprobe: ${auswahl.length} von ${alle.length} Seiten (je Template 1 Vertreter; --alle für Vollprüfung)`);
  return auswahl;
}
// qa-alle v4: nur geänderte Seiten (CSS/JS/Bilder unverändert), sonst alle bzw. Stichprobe
const nurSeiten = (process.env.QA_SEITEN || '').split(',').filter(Boolean);
const pages = stichprobe(nurSeiten.length ? findPages().filter(p => nurSeiten.includes(p)) : findPages());
if (nurSeiten.length) console.log(`  Nur geänderte Seiten: ${pages.join(', ')}`);
try { (await import('fs')).writeFileSync('.qa-berichte/qa-overflow-seiten.json', JSON.stringify(pages)); } catch {}
console.log(`\n══════ QA-OVERFLOW ══════`);
console.log(`  ${pages.length} Seiten × ${WIDTHS.length} Breiten\n`);


// ── SICHERUNG: prüfen ob der Server WIRKLICH dieses Projekt ausliefert ──
async function pruefeProjekt(page, base) {
  let firma = '';
  try {
    const sd = JSON.parse(readFileSync('src/content/site-data.json', 'utf-8'));
    firma = sd.meta?.firmenname || sd.firmenname || '';
  } catch { return; }
  if (!firma) return;
  const token = firma.split(/[\s\-]+/).filter(w => w.length > 3)[0] || firma;
  try {
    await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const html = (await page.content()).toLowerCase();
    if (!html.includes(token.toLowerCase())) {
      console.log(`\n  ✖  FALSCHER SERVER: ${base} liefert nicht "${firma}" aus.`);
      console.log(`     Auf diesem Port läuft ein anderes Projekt.`);
      console.log(`     Lösung: alle node-Prozesse beenden, dann in DIESEM Ordner`);
      console.log(`     "npm run preview" starten und den angezeigten Port verwenden:`);
      console.log(`     node ${process.argv[1].split(/[\\/]/).pop()} http://localhost:PORT\n`);
      process.exit(2);
    }
  } catch (e) {
    console.log(`\n  ✖  Server ${base} nicht erreichbar – läuft "npm run preview"?\n`);
    process.exit(2);
  }
}

const browser = await chromium.launch();
const _g = await browser.newPage();
await pruefeProjekt(_g, BASE);
await _g.close();
const errors = [];

for (const path of pages) {
  const page = await browser.newPage();
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 15000 });
      const overflow = await page.evaluate(() =>
        document.body.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) {
        errors.push(`${path} @ ${width}px: +${overflow}px Overflow`);
        console.log(`  ✖  ${path} @ ${width}px: +${overflow}px`);
      }
    } catch (e) {
      errors.push(`${path} @ ${width}px: ${e.message.split('\n')[0]}`);
    }
  }
  await page.close();
}
await browser.close();

console.log(`\n  ${errors.length} Overflow-Fehler\n`);
process.exit(errors.length ? 1 : 0);
