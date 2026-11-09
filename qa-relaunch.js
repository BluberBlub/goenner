// QA-RELAUNCH v1 – Inhalts-Vollständigkeit beim Relaunch
// MODUS 1 (Phase 1):  node qa-relaunch.js --inventar https://alte-seite.de
//   Crawlt die Originalseite, schreibt ORIGINAL-INHALTE.json + CONTENT-INVENTAR.md
// MODUS 2 (Phase 3):  node qa-relaunch.js
//   Vergleicht dist/ gegen das Inventar. Exit 1 wenn Inhalte fehlen.

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const INVENTAR_MODUS = args.includes('--inventar');
// Standard großzügig; per --max=N überschreibbar, --max=0 = unbegrenzt
const maxArg = args.find(a => a.startsWith('--max='));
const MAX_SEITEN = maxArg ? (parseInt(maxArg.split('=')[1]) || Infinity) : 150;

// ── Original-URL bestimmen ──
function originalUrl() {
  const arg = args.find(a => a.startsWith('http'));
  if (arg) return arg.replace(/\/$/, '');
  try {
    const sd = JSON.parse(readFileSync('src/content/site-data.json', 'utf-8'));
    const u = sd.meta?.originalUrl || sd.meta?.relaunchVon || sd.originalUrl;
    if (u) return u.replace(/\/$/, '');
  } catch {}
  for (const f of ['PROJEKT.md', 'CLAUDE.md']) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, 'utf-8').match(/(?:Original|Alte Seite|Relaunch von)[^\n]*?(https?:\/\/[^\s)\]]+)/i);
    if (m) return m[1].replace(/\/$/, '');
  }
  return null;
}

const norm = (s) => (s || '').toLowerCase().replace(/[^\wäöüß0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set('der die das und oder für mit von zu im in den dem des ein eine einen ist sind wir sie ihr ihre auf als auch an bei aus nach über unter durch'.split(' '));
const marken = (t) => norm(t).split(' ').filter(w => w.length > 3 && !STOP.has(w));

// ── Fakten extrahieren (was Kunden sofort vermissen) ──
function fakten(text) {
  const out = new Set();
  const push = (arr) => (arr || []).forEach(x => out.add(x.trim()));
  push(text.match(/\+?\d[\d\s\/().-]{7,}\d/g));                       // Telefon
  push(text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi));                   // E-Mail
  push(text.match(/\b\d{1,2}[:.]\d{2}\s*(?:-|–|bis)\s*\d{1,2}[:.]\d{2}\b/g)); // Öffnungszeiten
  push(text.match(/\b\d+(?:[,.]\d{2})?\s*(?:€|EUR|Euro)\b/g));        // Preise
  push(text.match(/\b(?:18|19|20)\d{2}\b/g));                          // Jahreszahlen
  push(text.match(/\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+/g));                   // PLZ + Ort
  return [...out];
}

// ═══ MODUS 1: INVENTAR ═══
if (INVENTAR_MODUS) {
  const base = originalUrl();
  if (!base) { console.error('\n  Original-URL fehlt: node qa-relaunch.js --inventar https://alte-seite.de\n'); process.exit(1); }
  const host = new URL(base).host;
  console.log(`\n══════ ORIGINAL-INVENTAR ══════\n  ${base}\n`);

  // Sitemap zuerst auslesen – zuverlässigste Quelle für ALLE Seiten
  async function sitemapUrls(startUrl, tiefe = 0) {
    if (tiefe > 2) return [];
    try {
      const r = await fetch(startUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Autopilot Inventar)' } });
      if (!r.ok) return [];
      const xml = await r.text();
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1]);
      if (/<sitemapindex/i.test(xml)) {
        const out = [];
        for (const sm of locs) out.push(...await sitemapUrls(sm, tiefe + 1));
        return out;
      }
      return locs;
    } catch { return []; }
  }

  let ausSitemap = [];
  for (const pfad of ['/sitemap.xml', '/sitemap_index.xml', '/wp-sitemap.xml', '/sitemap-index.xml']) {
    ausSitemap = await sitemapUrls(base + pfad);
    if (ausSitemap.length) { console.log(`  Sitemap gefunden (${pfad}): ${ausSitemap.length} URLs\n`); break; }
  }
  // IMMER auch alle Sitemaps aus robots.txt lesen (Schwabenpflege: 450 Ortsseiten einer SEO-Kampagne
  // standen nur in /regio/sitemaps.xml und wären beim Relaunch verloren gegangen)
  try {
    const rt = await fetch(base + '/robots.txt');
    if (rt.ok) {
      const sm = [...(await rt.text()).matchAll(/Sitemap:\s*(\S+)/gi)].map(m => m[1]);
      const vorher = ausSitemap.length;
      for (const s of sm) for (const u of await sitemapUrls(s)) if (!ausSitemap.includes(u)) ausSitemap.push(u);
      if (ausSitemap.length > vorher) console.log(`  Weitere Sitemaps aus robots.txt: +${ausSitemap.length - vorher} URLs\n`);
    }
  } catch {}
  // Bereiche mit vielen gleichartigen Seiten (Orts-/Kampagnenseiten) eigens melden
  const bereiche = {};
  for (const u of ausSitemap) { try { const seg = new URL(u).pathname.split('/').filter(Boolean)[0]; if (seg) bereiche[seg] = (bereiche[seg] || 0) + 1; } catch {} }
  const grosseBereiche = Object.entries(bereiche).filter(([, n]) => n > 20).map(([seg, n]) => ({ pfad: `/${seg}/`, n }));
  for (const b of grosseBereiche) console.log(`  ⚠  BEREICH ${b.pfad} mit ${b.n} Seiten (Orts-/Kampagnenseiten?): übernehmen (gleiche URLs) oder per 301 umleiten, NIE stillschweigend weglassen\n`);
  if (!ausSitemap.length) console.log('  Keine Sitemap gefunden – reiner Link-Crawl\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // ── MARKE: Logo und Hausfarben von der Originalseite (VOR dem Bilder-Filter!) ──
  async function markeErfassen(seitenUrl) {
    try {
      await page.goto(seitenUrl, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(500);
    } catch { return null; }
    // Fehler in der Erfassung dürfen das Inventar nie abbrechen (dann fehlt alles, nicht nur das Logo)
    try {
    return await page.evaluate(() => {
      const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
      const kandidaten = [];

      // a) Bilder im Kopfbereich, nach Logo-Signalen bewertet
      document.querySelectorAll('header img, nav img, .logo img, a[href="/"] img, img').forEach(img => {
        const src = img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (!src) return;
        const txt = `${src} ${img.alt || ''} ${img.className || ''} ${img.id || ''}`.toLowerCase();
        let score = 0;
        if (/logo|marke|brand|signet|wortmarke/.test(txt)) score += 60;
        if (img.closest('header, nav, .header, #header, .navbar')) score += 40;
        if (img.closest(`a[href="/"], a[href="${location.origin}/"], a[href="${location.origin}"]`)) score += 15;
        const r = img.getBoundingClientRect();
        if (r.top < 250) score += 25;
        if (r.width > 40 && r.width < 500 && r.height > 20 && r.height < 220) score += 15;
        if (/sprite|icon-|favicon|placeholder|1x1|pixel/.test(txt)) score -= 50;
        // Spöri: ein Button-Bild ("Kontaktieren Sie uns gleich") wurde als Logo erkannt
        const ziel = img.closest('a')?.getAttribute('href') || '';
        if (/kontakt|anfrage|termin|jetzt|button|btn|anrufen|call/.test(txt) || /kontakt|mailto:|tel:/i.test(ziel)) score -= 60;
        if (score > 0) kandidaten.push({ url: abs(src), score, w: Math.round(r.width), h: Math.round(r.height), quelle: 'img' });
      });

      // a2) Logo als CSS-Hintergrund im Kopfbereich (Spöri: _Design/Logo lag als background-image im Header)
      document.querySelectorAll('header *, nav *, .header *, #header *, .logo, #logo, a[href="/"]').forEach(el => {
        const bg = getComputedStyle(el).backgroundImage || '';
        const m = /url\(["']?([^"')]+)["']?\)/.exec(bg);
        if (!m || m[1].startsWith('data:')) return;
        const r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 16 || r.top > 300) return;
        const txt = `${m[1]} ${el.className || ''} ${el.id || ''}`.toLowerCase();
        let score = 40;
        if (/logo|marke|brand|signet/.test(txt)) score += 60;
        if (el.closest('a[href="/"]') || el.matches('a[href="/"]')) score += 15;
        if (r.width > 40 && r.width < 500 && r.height < 220) score += 15;
        if (/titel|hero|slider|banner|header-?bild|bg-?image/.test(txt) || r.width > 700) score -= 70;
        if (score > 0) kandidaten.push({ url: abs(m[1]), score, w: Math.round(r.width), h: Math.round(r.height), quelle: 'css-hintergrund' });
      });

      // b) SVG-Logo inline im Header -> als Hinweis (nicht ladbar)
      const inlineSvg = !!document.querySelector('header svg, nav svg, .logo svg');

      // c) Fallbacks aus dem <head>
      const linkIcon = document.querySelector('link[rel*="apple-touch-icon"], link[rel*="icon"]');
      if (linkIcon?.href) kandidaten.push({ url: abs(linkIcon.getAttribute('href')), score: 20, quelle: 'favicon' });
      const schema = document.querySelector('script[type="application/ld+json"]');
      if (schema) { try { const j = JSON.parse(schema.textContent); const l = j.logo || j.publisher?.logo?.url;
        if (l) kandidaten.push({ url: abs(typeof l === 'string' ? l : l.url), score: 70, quelle: 'schema.org' }); } catch {} }

      // d) HAUSFARBEN aus berechneten Styles (Header, Buttons, Links, Footer)
      const zaehler = {};
      const merke = (farbe, gewicht) => {
        if (!farbe) return;
        const m = farbe.match(/\d+/g); if (!m || m.length < 3) return;
        const [r, g, b] = m.map(Number);
        if (m[3] !== undefined && Number(m[3]) === 0) return;
        const grau = Math.max(r,g,b) - Math.min(r,g,b) < 18;
        const extrem = (r+g+b)/3 > 244 || (r+g+b)/3 < 14;
        // Browser-Standardfarben für Links (#0000EE, besucht #551A8B) sind keine Hausfarben
        if ((r === 0 && g === 0 && b === 238) || (r === 85 && g === 26 && b === 139)) return;
        if (grau || extrem) return;
        const hex = '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
        zaehler[hex] = (zaehler[hex] || 0) + gewicht;
      };
      const sel = [['header,nav,.navbar',3],['a.btn,.button,button,.cta,[class*="btn"]',5],
                   ['footer',3],['h1,h2',2],['a',1]];
      for (const [s, g] of sel) {
        document.querySelectorAll(s).forEach(el => {
          const cs = getComputedStyle(el);
          merke(cs.backgroundColor, g);
          merke(cs.color, Math.max(1, g - 1));
          merke(cs.borderTopColor, 1);
        });
      }
      const farben = Object.entries(zaehler).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([hex, n]) => ({ hex, gewicht: n }));

      return { kandidaten: kandidaten.sort((a,b) => b.score - a.score).slice(0, 6), inlineSvg, farben };
    });
    } catch (e) { console.log(`  ⚠  Marken-Erfassung fehlgeschlagen: ${e.message.split('\n')[0]}`); return null; }
  }

  const gesehen = new Set(), seiten = [];
  const siegelFunde = new Map();   // URL -> {url, alt, stark, seite}  (Opitz: DATEV-Siegel)
  const pdfFunde = new Map();      // URL -> {url, text, seite}  (Spöri: Mandantenbriefe, Formulare)
  const warteschlange = [base];
  for (const u of ausSitemap) {
    try {
      const p = new URL(u);
      if (p.host !== host) continue;
      if (/\.(pdf|jpe?g|png|zip|docx?|xml)$/i.test(p.pathname)) continue;
      const clean = (p.origin + p.pathname).replace(/\/$/, '');
      if (!warteschlange.includes(clean)) warteschlange.push(clean);
    } catch {}
  }

  while (warteschlange.length && seiten.length < MAX_SEITEN) {
    const url = warteschlange.shift();
    if (gesehen.has(url)) continue;
    gesehen.add(url);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Autoscroll: Lazy-Load-Bilder laden (Standard bei WordPress & Co.)
      await page.evaluate(async () => {
        await new Promise(fertig => {
          let y = 0;
          const schritt = () => {
            y += 700; window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(schritt, 120);
            else { window.scrollTo(0, 0); fertig(); }
          };
          schritt();
        });
      });
      await page.waitForTimeout(600);
      // WICHTIG: Links ZUERST sammeln – danach wird nav/header/footer entfernt
      const links = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map(a => a.href));
      // Siegel, Zertifikate, Mitgliedschaften: stehen oft im Header/Footer -> VOR dem Entfernen sammeln
      const siegel = await page.evaluate(() => {
        const STARK = /siegel|zertifi|certif|award|auszeichnung|preistr|testsieger|t[uü]v|dekra|datev|smart.?expert|meisterbetrieb|innung|handwerkskammer|\bhwk\b|\bihk\b|focus|gepr[uü]ft|iso.?9001|fachbetrieb|qualit[aä]tssiegel|top.?(anwalt|arzt|mediziner|steuer|arbeitgeber)/i;
        const SCHWACH = /partner|mitglied|member|verband|haendler|händler|vertragswerkstatt|servicepartner/i;
        const SOZIAL = /facebook|instagram|linkedin|youtube|xing|whatsapp|twitter|tiktok|pinterest|google.?play|app.?store/i;
        const out = [];
        document.querySelectorAll('img').forEach(img => {
          const src = img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (!src || src.startsWith('data:')) return;
          // Siegel sind klein. Große Inhaltsbilder (Spöri: Infografik "7 Thesen") sind keine Siegel.
          const gr = img.getBoundingClientRect();
          if (gr.width > 420 || (img.naturalWidth > 1200 && img.naturalHeight > 700)) return;
          const a = img.closest('a');
          const txt = `${src} ${img.alt || ''} ${img.title || ''} ${a?.getAttribute('href') || ''} ${a?.getAttribute('title') || ''}`;
          if (SOZIAL.test(txt)) return;
          const stark = STARK.test(txt);
          if (!stark && !SCHWACH.test(txt)) return;
          try { out.push({ url: new URL(src, location.href).href, alt: (img.alt || img.title || '').trim(), stark }); } catch {}
        });
        return out;
      });
      for (const sg of siegel) if (!siegelFunde.has(sg.url)) siegelFunde.set(sg.url, { ...sg, seite: url.replace(base, '') || '/' });
      // Fotos als CSS-Hintergrund (Spöri: die besten Titelbilder lagen als background-image) und PDFs
      const extra = await page.evaluate(() => {
        const hg = [];
        document.querySelectorAll('body *').forEach(el => {
          const bg = getComputedStyle(el).backgroundImage || '';
          for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
            if (m[1].startsWith('data:') || /\.svg(\?|$)/i.test(m[1])) continue;
            const r = el.getBoundingClientRect();
            if (r.width < 300 || r.height < 150) continue;
            try { hg.push({ src: new URL(m[1], location.href).href, alt: '(Hintergrundbild)', w: Math.round(r.width), h: Math.round(r.height) }); } catch {}
          }
        });
        const pdfs = [...document.querySelectorAll('a[href]')].filter(a => /\.pdf(\?|#|$)/i.test(a.getAttribute('href') || ''))
          .map(a => ({ url: a.href, text: (a.innerText || a.title || '').trim().replace(/\s+/g, ' ').slice(0, 80) }));
        return { hg, pdfs };
      });
      for (const pd of extra.pdfs) if (!pdfFunde.has(pd.url) && (() => { try { return new URL(pd.url).host === host; } catch { return false; } })()) pdfFunde.set(pd.url, { ...pd, seite: url.replace(base, '') || '/' });

      const d = await page.evaluate(() => {
        document.querySelectorAll('script,style,nav,header,footer').forEach(e => e.remove());
        const t = (el) => (el.innerText || '').replace(/\s+/g, ' ').trim();
        return {
          titel: document.title,
          ueberschriften: [...document.querySelectorAll('h1,h2,h3')].map(t).filter(x => x.length > 2),
          bloecke: [...document.querySelectorAll('p,li,td')].map(t).filter(x => x.length > 45),
          bilder: [...document.querySelectorAll('img')].map(i => {
            // Beste Quelle: größte srcset-Variante > currentSrc > src > data-src
            let best = '';
            const ss = i.getAttribute('srcset') || i.getAttribute('data-srcset') || '';
            if (ss) {
              const kand = ss.split(',').map(s => s.trim().split(/\s+/))
                .map(([u, w]) => [u, parseInt(w) || 0]).sort((a, b) => b[1] - a[1]);
              if (kand[0]?.[0]) best = kand[0][0];
            }
            best = best || i.currentSrc || i.getAttribute('src') ||
                   i.getAttribute('data-src') || i.getAttribute('data-lazy-src') || '';
            return { src: best, alt: i.alt || '', w: i.naturalWidth || 0, h: i.naturalHeight || 0 };
          }).filter(b => b.src && !/sprite|placeholder|1x1|blank|spacer|tracking|pixel\.gif/i.test(b.src)),
          volltext: document.body ? (document.body.innerText || '').replace(/\s+/g, ' ') : '',
          // Schneider: Zählerwerte stehen oft nur im Attribut (data-target="1500"), der Text zeigt "0"
          zaehler: [...document.querySelectorAll('[data-target],[data-count],[data-to],[data-countup],[data-number],[data-value]')]
            .map(e => (e.getAttribute('data-target') ?? e.getAttribute('data-count') ?? e.getAttribute('data-to') ?? e.getAttribute('data-countup') ?? e.getAttribute('data-number') ?? e.getAttribute('data-value') ?? '').trim())
            .filter(v => /^\d{2,7}$/.test(v))
        };
      });
      d.bilder.push(...extra.hg.filter(h => !d.bilder.some(b => b.src === h.src)));
      const zaehlerFakten = [...new Set(d.zaehler || [])].map(v => Number(v).toLocaleString('de-DE'));
      if (zaehlerFakten.length) console.log(`     Zählerwerte (nur im Attribut): ${zaehlerFakten.join(', ')}`);
      seiten.push({ url, ...d, fakten: [...new Set([...fakten(d.volltext), ...zaehlerFakten])] });
      console.log(`  ✓ [${seiten.length}] ${url.replace(base, '') || '/'}  (${d.ueberschriften.length} H, ${d.bilder.length} Bilder)${warteschlange.length ? `  · ${warteschlange.length} in Warteschlange` : ''}`);

      for (const l of links) {
        try {
          const u = new URL(l);
          if (u.host !== host) continue;
          if (/\.(pdf|jpe?g|png|zip|docx?)$/i.test(u.pathname)) continue;
          const clean = (u.origin + u.pathname).replace(/\/$/, '');
          if (!gesehen.has(clean) && !warteschlange.includes(clean)) warteschlange.push(clean);
        } catch {}
      }
    } catch (e) { console.log(`  ⚠ ${url}: ${e.message.split('\n')[0]}`); }
  }

  if (warteschlange.length) {
    console.log(`\n  ⚠  LIMIT ERREICHT: ${warteschlange.length} Seiten NICHT erfasst!`);
    console.log(`     Erneut mit höherem Limit: node qa-relaunch.js --inventar ${base} --max=0\n`);
  }


  // ── LOGO HERUNTERLADEN (eigener Weg, umgeht den Bilder-Filter) ──
  // Ordner ZUERST anlegen: sonst scheitert das Speichern von _LOGO.* beim ersten Lauf,
  // die Schleife läuft weiter und am Ende landet der schwächste Kandidat (Favicon) als Logo.
  mkdirSync('original-bilder', { recursive: true });
  // Browser erst NACH der Marken-Erfassung schließen (vorher lief markeErfassen ins Leere:
  // kein Logo, keine Hausfarben – obwohl beides auf der Originalseite stand)
  const marke = await markeErfassen(base);
  await browser.close();
  if (!marke) console.log('\n  ⚠  Marke nicht erfassbar (Startseite lädt nicht) – Logo und Hausfarben von Hand sichern');
  let logoDatei = null, logoUrl = null;
  if (marke) {
    for (const k of marke.kandidaten) {
      if (!k.url) continue;
      try {
        const r = await fetch(k.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Autopilot Inventar)' } });
        if (!r.ok) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 300) continue;                    // echte Fehlbilder aussortieren
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        let ext = /svg/.test(ct) ? 'svg' : /png/.test(ct) ? 'png' : /webp/.test(ct) ? 'webp'
                : /jpe?g/.test(ct) ? 'jpg' : (new URL(k.url).pathname.split('.').pop() || 'png').slice(0, 4);
        mkdirSync('public/images', { recursive: true });
        logoDatei = `logo.${ext}`;
        writeFileSync(join('public', 'images', logoDatei), buf);
        writeFileSync(join('original-bilder', `_LOGO.${ext}`), buf);
        logoUrl = k.url;
        console.log(`\n  LOGO gefunden (${k.quelle}, Score ${k.score}) -> public/images/${logoDatei}`);
        break;
      } catch {}
    }
    if (!logoDatei) {
      console.log(`\n  ⚠  KEIN Logo automatisch ladbar${marke.inlineSvg ? ' (Header nutzt Inline-SVG – manuell aus dem Quelltext sichern!)' : ''}`);
    }

    let mmd = `# MARKE (aus ${base})\n\n## Logo\n`;
    mmd += logoDatei ? `Übernommen nach public/images/${logoDatei}\n=> in site-data.json: "meta": { "logo": "/images/${logoDatei}" }\n`
                     : `NICHT automatisch gefunden. Manuell von der Originalseite sichern und nach public/images/ legen.\n`;
    if (marke.inlineSvg) mmd += `Hinweis: Der Header der Originalseite enthält ein Inline-SVG – ggf. bessere Qualität als die Bilddatei.\n`;
    mmd += `\nKandidaten:\n`;
    for (const k of marke.kandidaten) mmd += `- [${k.score}] ${k.quelle}: ${k.url}${k.w ? ` (${k.w}x${k.h})` : ''}\n`;
    mmd += `\n## Hausfarben der Originalseite (Häufigkeit gewichtet)\n`;
    mmd += `Diese Farben sind Kundenidentität – NICHT neu erfinden.\n\n`;
    for (const f of marke.farben) mmd += `- ${f.hex}  (Gewicht ${f.gewicht})\n`;
    mmd += `\n=> Die dominanteste Farbe ist meist primary, die zweite secondary/accent.\n`;
    mmd += `   Vor Übernahme in site-data.json auf Kontrast prüfen (Text auf Fläche lesbar?).\n`;
    writeFileSync('MARKE.md', mmd);
    console.log(`  ${marke.farben.length} Hausfarben erkannt -> MARKE.md`);
  }

  // ── SIEGEL, ZERTIFIKATE, MITGLIEDSCHAFTEN (Opitz: DATEV-Siegel fast verloren) ──
  const siegel = [];
  for (const sg of siegelFunde.values()) {
    if (sg.url === logoUrl) continue;
    try {
      const r = await fetch(sg.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Autopilot Inventar)' } });
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 200) continue;
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      const ext = /svg/.test(ct) ? 'svg' : /png/.test(ct) ? 'png' : /webp/.test(ct) ? 'webp' : /gif/.test(ct) ? 'gif' : 'jpg';
      const stamm = (decodeURIComponent(new URL(sg.url).pathname.split('/').pop() || 'siegel').replace(/\.\w+$/, '')
        .replace(/[^\w\-äöüß]/gi, '_').slice(-50)) || 'siegel';
      let datei = `_SIEGEL-${stamm}.${ext}`, n = 2;
      while (siegel.some(x => x.datei === datei)) datei = `_SIEGEL-${stamm}-${n++}.${ext}`;
      writeFileSync(join('original-bilder', datei), buf);
      siegel.push({ datei, alt: sg.alt, url: sg.url, seite: sg.seite, stark: sg.stark });
    } catch {}
  }
  if (siegel.length) {
    let smd = `\n## Siegel, Zertifikate, Mitgliedschaften (${siegel.length})\n`;
    smd += `Vertrauenssignale der Originalseite. PFLICHT auf der neuen Startseite (Hero-Eyebrow,\n`;
    smd += `Vertrauensleiste oder Footer). Originaldatei verwenden, nicht nachbauen. SVG bevorzugen.\n\n`;
    for (const x of siegel) smd += `- ${x.stark ? 'PFLICHT' : 'prüfen '}  original-bilder/${x.datei}  ${x.alt ? `"${x.alt}"` : ''}  (gefunden auf ${x.seite})\n`;
    writeFileSync('MARKE.md', (existsSync('MARKE.md') ? readFileSync('MARKE.md', 'utf-8') : `# MARKE (aus ${base})\n`) + smd);
    console.log(`  ${siegel.length} Siegel/Zertifikate gefunden -> original-bilder/_SIEGEL-* und MARKE.md`);
  }

  // ── ORIGINAL-BILDER HERUNTERLADEN nach original-bilder/ ──
  mkdirSync('original-bilder', { recursive: true });
  const geladen = new Map(); // absURL -> {datei, w, h, alt, seite}
  let uebersprungen = 0;
  for (const s of seiten) {
    for (const b of s.bilder) {
      let abs;
      try { abs = new URL(b.src, s.url).href; } catch { continue; }
      if (geladen.has(abs)) continue;
      try {
        const r = await fetch(abs, { headers: { 'User-Agent': 'Mozilla/5.0 (Autopilot Inventar)' } });
        if (!r.ok) { uebersprungen++; continue; }
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 8 * 1024) { uebersprungen++; continue; } // Icons/Tracker
        let name = decodeURIComponent(new URL(abs).pathname.split('/').pop() || 'bild')
          .replace(/[^\w.\-äöüß]/gi, '_').slice(-80);
        if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(name)) name += '.jpg';
        let ziel = name, n = 2;
        while (geladen.size && [...geladen.values()].some(g => g.datei === ziel)) {
          ziel = name.replace(/(\.\w+)$/, `-${n}$1`); n++;
        }
        writeFileSync(join('original-bilder', ziel), buf);
        geladen.set(abs, { datei: ziel, kb: Math.round(buf.length / 1024),
          w: b.w, h: b.h, alt: b.alt, seite: s.url.replace(base, '') || '/' });
      } catch { uebersprungen++; }
    }
  }
  console.log(`\n  ${geladen.size} Original-Bilder -> original-bilder/ (${uebersprungen} übersprungen: klein/Fehler)`);

  // ── DOWNLOADS (PDFs: Formulare, Mandantenbriefe, Preislisten) nach original-downloads/ (Spöri) ──
  const downloads = [];
  if (pdfFunde.size) {
    mkdirSync('original-downloads', { recursive: true });
    for (const pd of [...pdfFunde.values()].slice(0, 60)) {
      try {
        const r = await fetch(pd.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Autopilot Inventar)' }, signal: AbortSignal.timeout(30000) });
        if (!r.ok) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length > 25 * 1024 * 1024 || buf.slice(0, 4).toString() !== '%PDF') continue;
        let name = decodeURIComponent(new URL(pd.url).pathname.split('/').pop() || 'datei.pdf').replace(/[^\w.\-äöüß]/gi, '_').slice(-80);
        if (!/\.pdf$/i.test(name)) name += '.pdf';
        let ziel = name, n = 2;
        while (downloads.some(x => x.datei === ziel)) ziel = name.replace(/\.pdf$/i, `-${n++}.pdf`);
        writeFileSync(join('original-downloads', ziel), buf);
        downloads.push({ datei: ziel, text: pd.text, seite: pd.seite, kb: Math.round(buf.length / 1024) });
      } catch {}
    }
    console.log(`  ${downloads.length} PDF-Downloads -> original-downloads/ (Formulare, Briefe: gehören auf die neue Seite oder bewusst weg)`);
  }

  // BILDER-INVENTAR.md
  let bmd = `# BILDER-INVENTAR (Original: ${base})\n\n`;
  bmd += `${geladen.size} Bilder liegen in original-bilder/. In Phase 2 KURATIEREN:\n`;
  bmd += `brauchbare nach public/images/ kopieren (Name darf bleiben), unbrauchbare\n`;
  bmd += `hier als "ERSETZT (Grund)" markieren. Vergessen ist kein Status.\n\n`;
  bmd += `| Datei | KB | Maße | Alt-Text | Fundseite | Status |\n|---|---|---|---|---|---|\n`;
  for (const g of geladen.values())
    bmd += `| ${g.datei} | ${g.kb} | ${g.w}×${g.h} | ${(g.alt || '–').slice(0, 40)} | ${g.seite} | offen |\n`;
  writeFileSync('BILDER-INVENTAR.md', bmd);

  const alleFakten = [...new Set(seiten.flatMap(s => s.fakten))];
  const alleBilder = [...geladen.values()].map(g => g.datei);
  writeFileSync('ORIGINAL-INHALTE.json', JSON.stringify({ base, seiten, alleFakten, alleBilder, siegel, downloads, bereiche: grosseBereiche }, null, 2));

  let md = `# CONTENT-INVENTAR (Original: ${base})\n\n`;
  md += `Automatisch erzeugt. JEDER Eintrag braucht am Ende Status\n`;
  md += `"übernommen" oder "BEWUSST WEGGELASSEN (Grund: ...)".\n`;
  md += `Vergessen ist kein Status. Prüfung: node qa-relaunch.js\n\n`;
  md += `## Seiten (${seiten.length})\n\n| Original-Seite | Überschriften | Bilder | Status |\n|---|---|---|---|\n`;
  for (const s of seiten) md += `| ${s.url.replace(base, '') || '/'} | ${s.ueberschriften.length} | ${s.bilder.length} | offen |\n`;
  md += `\n## Wichtige Fakten (${alleFakten.length}) – müssen ALLE auf der neuen Seite auftauchen\n\n`;
  for (const f of alleFakten) md += `- [ ] ${f}\n`;
  md += `\n## Überschriften/Inhalte je Seite\n\n`;
  for (const s of seiten) {
    md += `### ${s.url.replace(base, '') || '/'}\n`;
    for (const h of s.ueberschriften) md += `- [ ] ${h}\n`;
    md += `\n`;
  }
  if (grosseBereiche.length) {
    md += `\n## Seitenbereiche mit vielen gleichartigen Seiten – gleiche URLs übernehmen oder 301 in .htaccess\n\n`;
    for (const b of grosseBereiche) md += `- [ ] BEREICH ${b.pfad} (${b.n} Seiten, z. B. Ortsseiten einer SEO-Kampagne: Umsatzquelle des Kunden)\n`;
  }
  if (downloads.length) {
    md += `\n## Downloads (${downloads.length}) – in public/downloads/ übernehmen und verlinken oder BEWUSST WEGGELASSEN (Grund)\n\n`;
    for (const x of downloads) md += `- [ ] DOWNLOAD ${x.datei}${x.text ? ` ("${x.text}")` : ''} (auf ${x.seite}, ${x.kb} KB)\n`;
  }
  if (siegel.length) {
    md += `\n## Siegel & Zertifikate (${siegel.length}) – müssen auf die neue Seite (Startseite)\n\n`;
    for (const x of siegel) md += `- [ ] SIEGEL ${x.datei}${x.alt ? ` ("${x.alt}")` : ''}${x.stark ? '' : ' (prüfen)'}\n`;
  }
  md += `\n## Original-Bilder (${alleBilder.length})\n\n`;
  for (const b of alleBilder) md += `- [ ] ${b}\n`;
  writeFileSync('CONTENT-INVENTAR.md', md);

  console.log(`\n  ${seiten.length} Seiten erfasst`);
  if (ausSitemap.length && seiten.length < ausSitemap.length * 0.9)
    console.log(`  ⚠  Sitemap nannte ${ausSitemap.length} URLs – ${ausSitemap.length - seiten.length} nicht erreichbar (404/Weiterleitung?)`);
  console.log(`  ${alleFakten.length} Fakten · ${alleBilder.length} Bilder`);
  console.log(`  → ORIGINAL-INHALTE.json + CONTENT-INVENTAR.md geschrieben\n`);
  process.exit(0);
}

// ═══ MODUS 2: ABGLEICH ═══
if (!existsSync('ORIGINAL-INHALTE.json')) {
  // Ist es ein RELAUNCH? Dann ist das fehlende Inventar ein FEHLER, kein Überspringen.
  const url = originalUrl();
  if (url) {
    console.log(`\n══════ QA-RELAUNCH ══════\n`);
    console.log(`  ✖  INVENTAR FEHLT, obwohl dies ein Relaunch ist (Original: ${url}).`);
    console.log(`     Ohne Inventar prüft NICHTS, ob Inhalte und Bilder der alten Seite`);
    console.log(`     übernommen wurden – genau so gehen 40-60% verloren.`);
    console.log(`     Nachholen: node qa-relaunch.js --inventar ${url} --max=0`);
    console.log(`     Danach fehlende Inhalte/Bilder ergänzen und erneut prüfen.\n`);
    process.exit(1);
  }
  console.log('\n  (Neubau, kein Relaunch – Inhalts-Abgleich entfällt)\n');
  process.exit(0);
}
const inv = JSON.parse(readFileSync('ORIGINAL-INHALTE.json', 'utf-8'));

function distText(dir = 'dist') {
  let t = '';
  if (!existsSync(dir)) return t;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) t += distText(p);
    else if (e.name.endsWith('.html')) {
      t += ' ' + readFileSync(p, 'utf-8')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&shy;|­/gi, '').replace(/&[a-z]+;/gi, ' ');   // weiche Trennstellen gehören zum Wort
    }
  }
  return t;
}
const neu = distText();
if (!neu.trim()) { console.log('\n  Kein dist/ – erst npm run build\n'); process.exit(0); }
const neuNorm = norm(neu);

console.log(`\n══════ QA-RELAUNCH (Inhalts-Vollständigkeit) ══════`);
console.log(`  Original: ${inv.base}\n`);

// In CONTENT-INVENTAR.md als „BEWUSST WEGGELASSEN (Grund …)“ markierte Punkte gelten als erledigt
const inventarZeilen = existsSync('CONTENT-INVENTAR.md') ? readFileSync('CONTENT-INVENTAR.md', 'utf-8').split(/\r?\n/).map(z => z.toLowerCase()) : [];
const bewusstWeg = (x) => inventarZeilen.some(z => /bewusst weggelassen/.test(z) && z.includes(String(x).toLowerCase().trim()));

// 1. Fakten (kritisch – Kunden merken das sofort)
const faktenFehlt = inv.alleFakten.filter(f => !bewusstWeg(f)).filter(f => {
  const kern = norm(f).replace(/\s/g, '');
  return !norm(neu).replace(/\s/g, '').includes(kern);
});

// 2. Überschriften
const alleH = [...new Set(inv.seiten.flatMap(s => s.ueberschriften))];
const hFehlt = alleH.filter(h => !bewusstWeg(h)).filter(h => {
  const w = marken(h);
  if (!w.length) return false;
  const treffer = w.filter(x => neuNorm.includes(x)).length;
  return treffer / w.length < 0.6;
});

// 2b. Original-Bilder übernommen? (Dateinamen-Abgleich, Endung egal wegen WebP)
let bilderInfo = null;
if (existsSync('original-bilder') && existsSync('public/images')) {
  const stamm = (f) => f.replace(/\.\w+$/, '').toLowerCase();
  const orig = readdirSync('original-bilder').map(stamm);
  const pub = new Set(readdirSync('public/images').map(stamm));
  const uebernommen = orig.filter(o => pub.has(o)).length;
  bilderInfo = { orig: orig.length, uebernommen };
}

// 2c. Siegel/Zertifikate übernommen? (Opitz: Vertrauenssignale gehören auf die Startseite)
const siegelFehlt = [], siegelPruefen = [];
if (Array.isArray(inv.siegel) && inv.siegel.length) {
  // Nur Bild-Stellen zählen (img-Tags, SVG-Titel/Labels): der Name im Fließtext ersetzt kein Siegel
  const bildStellen = (function lies(dir) {
    let t = '';
    if (!existsSync(dir)) return t;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('_')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) t += lies(p);
      else if (e.name.endsWith('.html')) {
        const h = readFileSync(p, 'utf-8');
        t += ' ' + (h.match(/<img\b[^>]*>/gi) || []).join(' ');
        t += ' ' + (h.match(/<svg\b[^>]*>|<title>[^<]*<\/title>|aria-label="[^"]*"/gi) || []).join(' ');
      }
    }
    return t.toLowerCase();
  })('dist');
  const inventar = existsSync('CONTENT-INVENTAR.md') ? readFileSync('CONTENT-INVENTAR.md', 'utf-8').toLowerCase() : '';
  const STOP = new Set(['logo','siegel','badge','bild','image','icon','datei','partner','mitglied','member','zertifikat','zertifiziert','www','http','https','png','jpg','jpeg','svg','webp','gif','small','large','klein','gross','weiss','white','black','schwarz','footer','header','digitale','digital','kanzlei','firma','betrieb','geprueft','geprüft','qualitaet','qualität']);
  const worte = (t) => String(t || '').toLowerCase().split(/[^a-zäöüß0-9]+/).filter(w => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
  const ganzesWort = (w) => new RegExp(`(^|[^a-zäöüß0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zäöüß0-9]|$)`).test(bildStellen);
  for (const x of inv.siegel) {
    const stamm = x.datei.replace(/^_SIEGEL-/, '').replace(/(-\d+)?\.\w+$/, '');
    const ausName = worte(stamm), ausAlt = worte(x.alt);
    const da = ausName.length ? ausName.some(ganzesWort) : ausAlt.filter(ganzesWort).length >= Math.min(2, ausAlt.length || 1);
    const bewusst = inventar.split('\n').some(z => z.includes(x.datei.toLowerCase()) && /weggelassen/.test(z));
    if (!da && !bewusst) (x.stark ? siegelFehlt : siegelPruefen).push(x);
  }
}

// 2d. Downloads (PDFs) übernommen? (Spöri: Mandantenbriefe und Formulare)
const downloadsFehlen = [];
if (Array.isArray(inv.downloads) && inv.downloads.length) {
  const verlinkt = (function lies(dir) {
    let t = '';
    if (!existsSync(dir)) return t;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) t += lies(p); else if (e.name.endsWith('.html')) t += (readFileSync(p, 'utf-8').match(/href="[^"]+\.pdf"/gi) || []).join(' ');
    }
    return t.toLowerCase();
  })('dist');
  const inventarZ = existsSync('CONTENT-INVENTAR.md') ? readFileSync('CONTENT-INVENTAR.md', 'utf-8').toLowerCase().split('\n') : [];
  const kern = (n) => n.toLowerCase().replace(/\.pdf$/, '').replace(/[^a-z0-9äöüß]+/g, '');
  const pdfsNeu = (verlinkt.match(/href="[^"]+\.pdf"/g) || []).map(h => kern(h.split('/').pop().replace(/"$/, '')));
  for (const x of inv.downloads) {
    const k = kern(x.datei);
    const da = pdfsNeu.some(n => n && (n.includes(k.slice(0, 12)) || k.includes(n.slice(0, 12))));
    const bewusst = inventarZ.some(z => z.includes(x.datei.toLowerCase()) && /weggelassen|\[x\]/.test(z));
    if (!da && !bewusst) downloadsFehlen.push(x);
  }
}

// 2e. Große Seitenbereiche (Orts-/Kampagnenseiten) übernommen oder umgeleitet?
const bereicheFehlen = [];
for (const b of inv.bereiche || []) {
  const da = existsSync(join('dist', ...b.pfad.split('/').filter(Boolean)));
  const htaccess = ['public/.htaccess', 'dist/.htaccess'].filter(existsSync).map(f => readFileSync(f, 'utf-8')).join('\n');
  const umgeleitet = new RegExp(`(Redirect|RewriteRule)[^\\n]*${b.pfad.replace(/\//g, '\\/?')}`, 'i').test(htaccess);
  const bewusst = (existsSync('CONTENT-INVENTAR.md') ? readFileSync('CONTENT-INVENTAR.md', 'utf-8') : '').split('\n').some(z => z.includes(b.pfad) && /weggelassen/i.test(z));
  if (!da && !umgeleitet && !bewusst) bereicheFehlen.push(b);
}

// 3. Inhaltsblöcke
const alleB = [...new Set(inv.seiten.flatMap(s => s.bloecke))];
const bFehlt = alleB.filter(b => {
  const w = marken(b).slice(0, 12);
  if (w.length < 3) return false;
  const treffer = w.filter(x => neuNorm.includes(x)).length;
  return treffer / w.length < 0.5;
});

const quote = alleB.length ? Math.round((1 - bFehlt.length / alleB.length) * 100) : 100;
const hQuote = alleH.length ? Math.round((1 - hFehlt.length / alleH.length) * 100) : 100;

console.log(`  Überschriften übernommen: ${hQuote}%  (${alleH.length - hFehlt.length}/${alleH.length})`);
console.log(`  Inhaltsblöcke übernommen: ${quote}%  (${alleB.length - bFehlt.length}/${alleB.length})`);
console.log(`  Fakten gefunden: ${inv.alleFakten.length - faktenFehlt.length}/${inv.alleFakten.length}\n`);

const errors = [];
if (bilderInfo) {
  console.log(`  Original-Bilder übernommen: ${bilderInfo.uebernommen}/${bilderInfo.orig}\n`);
  if (bilderInfo.orig >= 3 && bilderInfo.uebernommen === 0) {
    errors.push('kein einziges Original-Bild übernommen');
    console.log('  ✖ KEIN einziges Original-Bild in public/images/ – echte Fotos schlagen');
    console.log('    IMMER Stock und KI. original-bilder/ sichten, brauchbare kopieren,');
    console.log('    Rest in BILDER-INVENTAR.md begründet als ERSETZT markieren.\n');
  }
}
if (siegelFehlt.length) {
  errors.push(`${siegelFehlt.length} Siegel/Zertifikate fehlen`);
  console.log(`  ✖ SIEGEL/ZERTIFIKATE DER ORIGINALSEITE FEHLEN (Vertrauen, gehört auf die Startseite):`);
  siegelFehlt.forEach(x => console.log(`     · original-bilder/${x.datei}${x.alt ? ` ("${x.alt}")` : ''}`));
  console.log(`    Einbauen (Hero-Eyebrow, Vertrauensleiste oder Footer) ODER in CONTENT-INVENTAR.md als BEWUSST WEGGELASSEN (Grund) markieren.\n`);
}
if (siegelPruefen.length) {
  console.log(`  · Weitere Partner-/Mitgliedslogos der Originalseite (prüfen, ob sie auf die neue Seite gehören):`);
  siegelPruefen.forEach(x => console.log(`     · original-bilder/${x.datei}${x.alt ? ` ("${x.alt}")` : ''}`));
  console.log('');
}
if (bereicheFehlen.length) {
  errors.push(`${bereicheFehlen.length} Seitenbereiche fehlen`);
  console.log(`  ✖ SEITENBEREICHE DER ORIGINALSEITE FEHLEN (Google-Rankings, oft bezahlte SEO-Kampagnen):`);
  bereicheFehlen.forEach(b => console.log(`     · ${b.pfad} (${b.n} Seiten)`));
  console.log(`    Gleiche URLs neu erzeugen, per 301 in .htaccess umleiten ODER in CONTENT-INVENTAR.md als BEWUSST WEGGELASSEN (Grund) markieren.\n`);
}
if (downloadsFehlen.length) {
  errors.push(`${downloadsFehlen.length} Downloads fehlen`);
  console.log(`  ✖ DOWNLOADS DER ORIGINALSEITE FEHLEN (Formulare, Briefe, Preislisten):`);
  downloadsFehlen.slice(0, 15).forEach(x => console.log(`     · original-downloads/${x.datei}${x.text ? ` ("${x.text}")` : ''}`));
  console.log(`    Nach public/downloads/ kopieren und verlinken ODER in CONTENT-INVENTAR.md als BEWUSST WEGGELASSEN (Grund) markieren.\n`);
}
if (faktenFehlt.length) {
  errors.push(`${faktenFehlt.length} Fakten fehlen`);
  console.log(`  ✖ FEHLENDE FAKTEN (Telefon/Zeiten/Preise/Jahre – Kunde merkt das sofort):`);
  faktenFehlt.slice(0, 25).forEach(f => console.log(`     · ${f}`));
  if (faktenFehlt.length > 25) console.log(`     … und ${faktenFehlt.length - 25} weitere`);
  console.log('');
}
if (hFehlt.length) {
  errors.push(`${hFehlt.length} Überschriften fehlen`);
  console.log(`  ✖ FEHLENDE THEMEN/ÜBERSCHRIFTEN:`);
  hFehlt.slice(0, 25).forEach(h => console.log(`     · ${h}`));
  if (hFehlt.length > 25) console.log(`     … und ${hFehlt.length - 25} weitere`);
  console.log('');
}
if (quote < 70) {
  errors.push(`nur ${quote}% der Inhalte übernommen`);
  console.log(`  ✖ ${bFehlt.length} Inhaltsblöcke fehlen. Beispiele:`);
  bFehlt.slice(0, 10).forEach(b => console.log(`     · ${b.slice(0, 110)}…`));
  console.log('');
}

writeFileSync('qa-relaunch-report.json', JSON.stringify({
  hQuote, quote, faktenFehlt, hFehlt, bloeckeFehlt: bFehlt, siegelFehlt,
  originalBilder: inv.alleBilder,
  hinweis: 'Fehlende Inhalte übernehmen ODER in CONTENT-INVENTAR.md als BEWUSST WEGGELASSEN mit Grund markieren.'
}, null, 2));

if (errors.length) {
  console.log(`  → ${errors.join(', ')}. Details: qa-relaunch-report.json`);
  console.log(`  → Übernehmen oder in CONTENT-INVENTAR.md begründet weglassen.\n`);
  process.exit(1);
}
console.log('  ✔ Inhalte vollständig übernommen\n');
process.exit(0);
