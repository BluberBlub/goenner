#!/usr/bin/env node
// SCHAU v1 (10.11.2026) – ein Befehl, ein Bild: Desktop (1440) und Handy (390) nebeneinander.
// Warum: Der Autopilot schrieb für jeden Blick ein eigenes Playwright-Skript (Opitz 12x, Waldsee 30 Wegwerf-
// Skripte) und las dann zwei Bilder einzeln. Jeder Tool-Schritt liest den ganzen Kontext neu, das war teuer,
// und Korrekturen wurden oft ungesehen als "erledigt" gemeldet (Schneider: Ablauf, FAQ je zwei Runden).
// Jetzt: nach jeder sichtbaren Änderung EIN Aufruf, EIN Bild ansehen, dann erst melden.
//
//   node schau.js /kontakt/                     oberer Bildschirm der Seite
//   node schau.js / --sel "#leistungen"         Ausschnitt ab diesem Element
//   node schau.js / --schirm 2                  dritter Bildschirm (0 = oben)
//   node schau.js / /kontakt/ /ueber-uns/       mehrere Seiten, je ein Bild
//   node schau.js / --ganz                      ganze Seite (lang = klein, nur für den Überblick)
//   node schau.js / --hover "nav >> text=Leistungen"   Zustand nach Überfahren (Menüs)
//   node schau.js / --breit 2000                Desktop in 2000 px Breite (große Monitore)
//   node schau.js / --url http://localhost:4321 laufenden Server nutzen (sonst wird dist/ direkt gezeigt)
// Ergebnis: .qa-screenshots/schau-<seite>.jpg (Pfad wird ausgegeben). Vorher bauen: npm run build.
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const hat = (n) => args.includes(n);
const MIT_WERT = ['--sel', '--schirm', '--url', '--hover', '--breit'];
const pfade = args.filter((a, i) => !a.startsWith('--') && !MIT_WERT.includes(args[i - 1]));
if (!pfade.length) pfade.push('/');
const sel = opt('--sel'), schirm = Number(opt('--schirm') || 0), hover = opt('--hover'), ganz = hat('--ganz');

const TYP = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
let basis = opt('--url'), server = null;
if (!basis) {
  if (!existsSync('dist/index.html')) { console.error('  dist/ fehlt: erst npm run build (oder --url http://localhost:4321)'); process.exit(2); }
  server = createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let f = join('dist', p);
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
    if (!existsSync(f) && existsSync(f + '.html')) f += '.html';
    if (!existsSync(f)) { f = 'dist/404.html'; res.statusCode = 404; if (!existsSync(f)) return res.end('404'); }
    res.setHeader('Content-Type', TYP[extname(f).toLowerCase()] || 'application/octet-stream');
    res.end(readFileSync(f));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  basis = `http://127.0.0.1:${server.address().port}`;
}

mkdirSync('.qa-screenshots', { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const breit = Number(opt('--breit') || 1440);   // z. B. --breit 2000 für große Monitore
const ANSICHTEN = [{ n: 'desktop', w: breit, h: Math.round(breit * 0.625) }, { n: 'handy', w: 390, h: 844 }];
let fehler = 0;

for (const pfad of pfade) {
  const bilder = [];
  for (const a of ANSICHTEN) {
    const ctx = await browser.newContext({ viewport: { width: a.w, height: a.h }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'essential'); } catch {} });
    const page = await ctx.newPage();
    try {
      await page.goto(basis + pfad, { waitUntil: 'networkidle', timeout: 25000 });
      // alles sichtbar, nichts in Bewegung: sonst zeigt das Bild halbe Einblendungen
      await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:.001s!important;animation-delay:0s!important;transition-duration:.001s!important;transition-delay:0s!important;scroll-behavior:auto!important}[data-reveal]{opacity:1!important;transform:none!important}' });
      await page.evaluate(() => { document.querySelectorAll('.rv-warten').forEach(e => e.classList.remove('rv-warten')); return document.fonts?.ready; });
      if (sel) {
        const el = page.locator(sel).first();
        if (!(await el.count())) { console.log(`  ⚠  ${pfad} (${a.n}): "${sel}" nicht gefunden, zeige Seitenanfang`); }
        else await el.evaluate((e) => { const y = e.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80) - 16; scrollTo(0, Math.max(0, y)); });
      } else if (schirm) await page.evaluate((n) => scrollTo(0, n * innerHeight * 0.92), schirm);
      if (hover) { try { await page.locator(hover).first().hover({ timeout: 3000 }); } catch { console.log(`  ⚠  ${pfad} (${a.n}): Hover-Ziel "${hover}" nicht gefunden`); } }
      await page.waitForTimeout(350);
      const hoehe = ganz ? await page.evaluate(() => document.documentElement.scrollHeight) : a.h;
      const buf = await page.screenshot({ fullPage: ganz, type: 'jpeg', quality: 80 });
      bilder.push({ ...a, hoehe, b64: buf.toString('base64') });
    } catch (e) { console.log(`  ✖  ${pfad} (${a.n}): ${e.message.split('\n')[0]}`); fehler++; }
    await ctx.close();
  }
  if (bilder.length < 2) continue;
  // ein Blatt: Desktop auf 960 px Breite, Handy in voller Schärfe daneben (bei --ganz beide auf gleiche Höhe begrenzt)
  const H = ganz ? 1400 : 600;
  const d = bilder[0], m = bilder[1];
  const dB = ganz ? Math.min(960, Math.round(breit * H / d.hoehe)) : 960;
  const mH = ganz ? H : 844, mB = ganz ? Math.max(60, Math.round(390 * H / m.hoehe)) : 390;
  const blattH = ganz ? H : 844, blattB = dB + mB + 36;
  const blatt = await browser.newPage({ viewport: { width: blattB, height: blattH } });
  await blatt.setContent(`<body style="margin:0;background:#888;display:flex;gap:12px;padding:12px;box-sizing:border-box;align-items:flex-start">
    <img src="data:image/jpeg;base64,${d.b64}" style="width:${dB}px;${ganz ? `max-height:${H - 24}px;object-fit:contain;object-position:top` : ''}">
    <img src="data:image/jpeg;base64,${m.b64}" style="width:${mB}px;height:${ganz ? 'auto' : (mH - 24) + 'px'};object-fit:cover;object-position:top;${ganz ? `max-height:${H - 24}px` : ''}"></body>`);
  await blatt.waitForTimeout(100);
  const name = `schau-${(pfad.replace(/^\/|\/$/g, '').replace(/[^\w-]+/g, '_') || 'start')}${sel ? '-' + sel.replace(/[^\w-]+/g, '') : schirm ? '-s' + schirm : ganz ? '-ganz' : ''}.jpg`;
  const ziel = join('.qa-screenshots', name);
  writeFileSync(ziel, await blatt.screenshot({ type: 'jpeg', quality: 78 }));
  await blatt.close();
  console.log(`  ${ziel.replace(/\\/g, '/')}   (links Desktop ${breit}, rechts Handy 390)`);
}
await browser.close();
server?.close();
process.exit(fehler ? 1 : 0);
