// QA-WOW v1 – Mut-Gate: prüft messbare Indizien für Selbstbewusstsein im Design
// Kein Geschmacksurteil – nur Proxys, die zaghaftes Design zuverlässig entlarven.
// Aufruf: node qa-wow.js [baseUrl=http://localhost:4321]
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:4321';
const errors = [], hints = [];
const bad = (m) => { errors.push(m); console.log('  ✖  ' + m); };
const ok  = (m) => console.log('  ✔  ' + m);
const hint= (m) => { hints.push(m); console.log('  ·  ' + m); };

console.log('\n══════ QA-WOW (Mut-Gate) ══════\n');

// ── 1. SIGNATURE MOMENT dokumentiert? ──
if (existsSync('DESIGN-BRIEF.md')) {
  const brief = readFileSync('DESIGN-BRIEF.md', 'utf-8');
  const hasSig = /SIGNATURE[- ]MOMENT/i.test(brief);
  const sigText = hasSig ? brief.split(/SIGNATURE[- ]MOMENT/i)[1].slice(0, 400) : '';
  const konkret = sigText.replace(/[#*\-\s]/g, '').length > 60;
  if (!hasSig) bad('Kein SIGNATURE MOMENT in DESIGN-BRIEF.md – Seite hat nichts Erinnerbares');
  else if (!konkret) bad('SIGNATURE MOMENT zu vage beschrieben (unter 60 Zeichen) – konkret werden');
  else ok('Signature Moment dokumentiert');
  if (!/LEITIDEE/i.test(brief)) bad('Keine LEITIDEE in DESIGN-BRIEF.md');
} else {
  bad('DESIGN-BRIEF.md fehlt – Leitidee und Signature Moment nicht dokumentiert');
}


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
const page = await browser.newPage();
await pruefeProjekt(page, BASE);
await page.setViewportSize({ width: 1440, height: 900 });

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 20000 });

  // ── 2. TYPO-MUT: größte Headline vs. Body ──
  const typo = await page.evaluate(() => {
    const px = (el) => parseFloat(getComputedStyle(el).fontSize);
    const body = px(document.body) || 16;
    let max = 0, maxTag = '', lh = 0, ls = 0;
    document.querySelectorAll('h1,h2,.mega,[class*="text-"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || !el.textContent.trim()) return;
      const s = px(el);
      if (s > max) { max = s; maxTag = el.tagName;
        const cs = getComputedStyle(el);
        lh = parseFloat(cs.lineHeight) / s;
        ls = parseFloat(cs.letterSpacing) || 0; }
    });
    return { body, max, maxTag, lh, ls };
  });
  const ratio = typo.max / typo.body;
  if (ratio < 3.0) hint(`Typo eher zurückhaltend: größte Headline ${Math.round(typo.max)}px (${ratio.toFixed(1)}× Body). Bei mutigen Marken wirkt 3.5-5× stärker – bei zurückhaltenden Branchen kann klein richtig sein.`);
  else if (ratio < 3.8) hint(`Typo solide (${ratio.toFixed(1)}× Body) – mit clamp(3.5rem,10vw,8rem) wird daraus ein Statement`);
  else ok(`Typo selbstbewusst: ${Math.round(typo.max)}px (${ratio.toFixed(1)}× Body)`);
  if (typo.max > 60 && typo.lh > 1.15) hint(`Große Headline mit line-height ${typo.lh.toFixed(2)} – unter 1.0 wirkt deutlich kraftvoller`);

  // ── 3. BEWEGUNG vorhanden? ──
  const motion = await page.evaluate(() => {
    let anim = 0, trans = 0, scrollDriven = 0;
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of rules || []) {
        const t = r.cssText || '';
        if (/@keyframes/.test(t)) anim++;
        if (/animation-timeline|view\(\)|scroll\(\)/.test(t)) scrollDriven++;
        if (/transition\s*:/.test(t)) trans++;
      }
    }
    const observed = /IntersectionObserver/.test(
      [...document.querySelectorAll('script')].map(s => s.textContent).join(''))
      || document.querySelectorAll('[data-reveal], [data-counter], [data-scroll]').length > 0;
    return { anim, trans, scrollDriven, observed };
  });
  if (motion.anim === 0 && !motion.observed && motion.scrollDriven === 0)
    hint('Keine Bewegung gefunden – prüfen ob das zur Leitidee passt (Ruhe kann gewollt sein) oder ob die Seite nur statisch geraten ist');
  else {
    ok(`Bewegung vorhanden (${motion.anim} Keyframes, ${motion.scrollDriven} scroll-driven)`);
    if (motion.scrollDriven === 0) hint('Kein scroll-driven CSS (animation-timeline: view()) – stärkster moderner Wow-Hebel, siehe MUT-KATALOG');
  }

  // ── 4. SEKTIONS-VARIANZ: sehen alle Abschnitte gleich aus? ──
  const variance = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('main > section, body > section')];
    const sig = sections.map(s => {
      const cs = getComputedStyle(s);
      const kids = [...s.children];
      const grid = kids.some(k => /grid|flex/.test(getComputedStyle(k).display));
      const cols = kids.length ? getComputedStyle(kids[0]).gridTemplateColumns : '';
      return `${cs.backgroundColor}|${grid}|${(cols||'').split(' ').length}`;
    });
    return { total: sections.length, distinct: new Set(sig).size };
  });
  if (variance.total >= 4) {
    const q = variance.distinct / variance.total;
    if (q < 0.4) hint(`Sektions-Monotonie: ${variance.total} Abschnitte, nur ${variance.distinct} verschiedene Muster – Layout variieren (Full-Bleed, Sticky-Story, Overlap)`);
    else ok(`Sektions-Varianz ok (${variance.distinct}/${variance.total} Muster)`);
  }

  // ── 5. FULL-BLEED / Kante brechen? ──
  const bleed = await page.evaluate(() => {
    const vw = window.innerWidth;
    return [...document.querySelectorAll('section, div, img')]
      .some(el => { const r = el.getBoundingClientRect();
        return r.width >= vw - 2 && r.height > 240; });
  });
  if (!bleed) hint('Kein einziges randloses Element – alles im Container wirkt brav. Ein Full-Bleed-Moment gibt Kraft.');


  // ── 6. KOMPOSITION: baut es Sektionen oder gestaltet es? ──
  const komp = await page.evaluate(() => {
    const vw = window.innerWidth;
    const sections = [...document.querySelectorAll('main > section, body > section')];

    // a) Überlappung: negative margins oder Element das Sektionsgrenze kreuzt
    let overlap = 0;
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      const mt = parseFloat(cs.marginTop);
      if (mt < -20) overlap++;
    });

    // b) Asymmetrie: Grids mit ungleichen Spalten
    let asym = 0, symm = 0;
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display !== 'grid') return;
      const cols = cs.gridTemplateColumns.split(' ').filter(Boolean);
      if (cols.length < 2) return;
      const px = cols.map(parseFloat).filter(n => !isNaN(n));
      if (px.length < 2) return;
      const gleich = px.every(v => Math.abs(v - px[0]) < 4);
      gleich ? symm++ : asym++;
    });

    // c) Zentrierte Überschriften
    let zentriert = 0, gesamt = 0;
    document.querySelectorAll('h2').forEach(h => {
      const r = h.getBoundingClientRect(); if (r.width === 0) return;
      gesamt++;
      const cs = getComputedStyle(h);
      if (cs.textAlign === 'center') zentriert++;
      else {
        const p = h.parentElement;
        if (p && /mx-auto|text-center/.test(p.className)) zentriert++;
      }
    });

    // d) Vollflächige Farbsektion (nicht weiß/creme)
    let farbflaeche = 0;
    sections.forEach(s => {
      const bg = getComputedStyle(s).backgroundColor;
      const m = bg.match(/\d+/g);
      if (!m) return;
      const [r,g,b] = m.map(Number);
      const hell = (r+g+b)/3 > 225;
      const grau = Math.max(r,g,b) - Math.min(r,g,b) < 12;
      const rect = s.getBoundingClientRect();
      if (!hell && !grau && rect.height > 250) farbflaeche++;
    });

    // e) Gleichförmige vertikale Abstände?
    const paddings = sections.map(s => parseFloat(getComputedStyle(s).paddingTop));
    const uniquePad = new Set(paddings.map(p => Math.round(p/8))).size;

    return { overlap, asym, symm, zentriert, gesamt, farbflaeche,
             sections: sections.length, uniquePad };
  });

  const punkte = [];
  if (komp.overlap === 0) punkte.push('keine Überlappung über Sektionsgrenzen');
  if (komp.asym === 0 && komp.symm > 0) punkte.push('nur symmetrische Raster (alles 50/50 oder 3× gleich)');
  if (komp.gesamt >= 3 && komp.zentriert / komp.gesamt > 0.6) punkte.push(`${komp.zentriert}/${komp.gesamt} Überschriften zentriert (Template-Signal)`);
  if (komp.farbflaeche === 0) punkte.push('keine vollflächige Farbsektion');
  if (komp.sections >= 4 && komp.uniquePad <= 2) punkte.push('alle Sektionen mit gleichem vertikalen Abstand (kein Rhythmus)');

  // HINWEIS, nicht blockierend: Komposition ist Urteilsvermögen, kein Messwert.
  // Wird das erzwungen, entstehen negative Margins ohne Sinn und kaputte Abstände.
  if (punkte.length) {
    punkte.forEach(p => hint('Komposition (nur Hinweis, bewusst entscheiden): ' + p));
    console.log('     ⚠ NICHT blind beheben – nur ändern wenn es das Design wirklich besser macht.');
  } else ok('Komposition: überlappt, asymmetrisch, rhythmisch');

} catch (e) {
  bad('Prüflauf: ' + e.message.split('\n')[0]);
}
await browser.close();

console.log(`\n  ${errors.length} Mut-Mängel, ${hints.length} Hinweise`);
if (errors.length) console.log('  → Siehe MUT-KATALOG in _regeln/phase2-design.md\n');
else console.log('');
process.exit(errors.length ? 1 : 0);
