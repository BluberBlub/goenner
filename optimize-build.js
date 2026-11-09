// NIKO ENDRES – OPTIMIZE-BUILD (Performance + SEO + GEO, läuft AUTOMATISCH nach jedem Build)
// Aufruf: steckt in "npm run build" (package.json) → greift bei npm run qa UND bei node deploy.js.
// Manuell: node optimize-build.js
//
// Was passiert (alles auf dist/, die Quellen bleiben unverändert):
//  1. Bilder:  JPG/PNG → WebP (gecacht), alle Verweise in HTML/CSS/JS auf WebP umgestellt.
//              Ausnahmen: OG-/Twitter-Bild (WhatsApp braucht JPG), Favicons/Touch-Icons, PHP-Dateien.
//  2. <img>:   loading="lazy" + decoding="async" für alles unterhalb des Headers außer dem ersten
//              Bild in <main> (LCP) und Bildern mit fetchpriority="high"/loading="eager".
//              Fehlende width/height werden aus der Bilddatei ergänzt (kein Layout-Springen).
//  3. Schema:  WebSite auf jeder Seite, BreadcrumbList auf Unterseiten, LocalBusiness auf der
//              Startseite – jeweils NUR wenn das Projekt nicht schon eigene Daten dieses Typs liefert.
//  4. GEO:     llms.txt (Faktenübersicht für KI-Suchen) aus site-data.json + allen Seiten,
//              falls das Projekt keine eigene erzeugt.
//  5. Index:   /stil-muster/ aus Sitemap + llms.txt, noindex; robots.txt bekommt die Sitemap-Zeile.
//  6. Mailer:  dist/mailer-daten.json (Firma, Kontakt, Logo, Markenfarbe, Anrede) für mailer.php v2.
// Fehler in einer Datei brechen den Build nicht ab – die Datei bleibt dann einfach unverändert.

import sharp from 'sharp';
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync, unlinkSync } from 'fs';
import { join, relative, sep } from 'path';
import { createHash } from 'crypto';

const DIST = 'dist';
if (!existsSync(DIST)) { console.log('  optimize-build: kein dist/ – übersprungen'); process.exit(0); }

const CACHE = join('node_modules', '.cache', 'optimize-build');
mkdirSync(CACHE, { recursive: true });
const t0 = Date.now();
const log = { webp: 0, webpCache: 0, verweise: 0, lazy: 0, masse: 0, schema: 0, llms: false };

// ── Projektdaten ─────────────────────────────────────────────────────────────
const lies = (p) => { try { return readFileSync(p, 'utf8').replace(/^﻿/, ''); } catch { return ''; } };
let sd = {};
try { sd = JSON.parse(lies('src/content/site-data.json') || '{}'); } catch {}
const meta = sd.meta || {}, k = sd.kontakt || {};
const siteUrl = String(meta.siteUrl || (lies('astro.config.mjs').match(/site:\s*['"]([^'"]+)['"]/) || [])[1] || '').replace(/\/$/, '');
const firma = meta.firmenname || meta.kundenname || '';
const staging = meta.staging === true;

const walk = (d) => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const alle = walk(DIST);
const url = (p) => '/' + relative(DIST, p).split(sep).join('/');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── 1. WebP erzeugen ────────────────────────────────────────────────────────
const AUSNAHME = /(^|\/)(og-image|favicon|apple-touch|icon-|android-chrome|mstile)[^/]*$/i;
const ersatz = new Map(); // '/images/a.jpg' -> '/images/a.webp'
for (const f of alle.filter(f => /\.(jpe?g|png)$/i.test(f))) {
  const u = url(f);
  if (AUSNAHME.test(u) || /\/(phpmailer|verwaltung|api)\//.test(u)) continue;
  const ziel = f.replace(/\.(jpe?g|png)$/i, '.webp');
  const zielUrl = u.replace(/\.(jpe?g|png)$/i, '.webp');
  try {
    if (!existsSync(ziel)) {
      const st = statSync(f);
      const key = createHash('md5').update(u + st.size + st.mtimeMs).digest('hex') + '.webp';
      const cache = join(CACHE, key);
      if (existsSync(cache)) { copyFileSync(cache, ziel); log.webpCache++; }
      else {
        const png = /\.png$/i.test(f);
        const m = await sharp(f).metadata();
        const tmp = ziel + '.tmp';
        await sharp(f).rotate().resize({ width: Math.min(m.width || 2400, 2400), withoutEnlargement: true })
          .webp(png ? { quality: 90, alphaQuality: 100, effort: 5 } : { quality: 78, effort: 5 }).toFile(tmp);
        // Nur verwenden, wenn WebP wirklich kleiner ist
        if (statSync(tmp).size >= st.size) { unlinkSync(tmp); continue; }
        renameSync(tmp, ziel); copyFileSync(ziel, cache); log.webp++;
      }
    }
    ersatz.set(u, zielUrl);
  } catch (e) { console.log(`  ⚠ optimize-build: ${u} nicht konvertiert (${e.message})`); }
}

// ── Bildmaße (für width/height) ─────────────────────────────────────────────
const masse = new Map();
async function mass(src) {
  const pfad = src.split(/[?#]/)[0];
  if (!pfad.startsWith('/') || pfad.startsWith('//')) return null;
  if (masse.has(pfad)) return masse.get(pfad);
  const datei = join(DIST, ...pfad.slice(1).split('/').map(decodeURIComponent));
  let m = null;
  try { if (existsSync(datei) && !/\.svg$/i.test(datei)) { const d = await sharp(datei).metadata(); if (d.width && d.height) m = [d.width, d.height]; } } catch {}
  masse.set(pfad, m); return m;
}

// ── Seiten einsammeln (für Brotkrumen + llms.txt) ───────────────────────────
const htmlDateien = alle.filter(f => f.endsWith('.html'));
const seiteVon = (f) => { const u = url(f).replace(/index\.html$/, ''); return u; };
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const seiten = new Map();
for (const f of htmlDateien) {
  const h = lies(f);
  const pfad = seiteVon(f);
  const titel = text((h.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const h1 = text((h.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
  const beschreibung = (h.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '';
  seiten.set(pfad, { f, titel, h1, beschreibung, name: (titel.split(/\s[|·]\s/)[0] || h1).trim() });
}
const nurSeiten = [...seiten.keys()].filter(p => p.endsWith('/') && !/stil-muster|\/404/.test(p));

// ── 2./3. HTML, CSS, JS umschreiben ─────────────────────────────────────────
const ersatzRegex = ersatz.size
  // nur echte Pfade dieser Seite: davor "/" am Anfang eines Attributwerts (nicht https://altseite.de/images/… oder /team/images/…)
  ? new RegExp(`(?<=(?:^|[\\s"'(,=])/)(${[...ersatz.keys()].map(u => esc(u.slice(1))).join('|')})(?=[\\s"'),?#&;\\\\]|$)`, 'g')
  : null;
const umstellen = (s) => ersatzRegex ? s.replace(ersatzRegex, (m) => { log.verweise++; return ersatz.get('/' + m).slice(1); }) : s;

const GESCHAEFT = /Business|Organization|Shop|Store|Restaurant|Service$|Bakery|Dentist|Physician|Attorney|Contractor|Agency|Hotel|Salon|Studio|Club|Practice|Clinic|Center/;

for (const f of alle.filter(f => /\.(html|css|js|mjs|json|xml|txt|webmanifest)$/i.test(f))) {
  if (/[\\/](phpmailer|verwaltung)[\\/]/.test(f) || /sitemap/i.test(f)) continue;
  let s = lies(f); const vorher = s;
  try {
    if (f.endsWith('.html')) {
      // OG/Twitter-Meta und Icon-Links schützen
      const tresor = [];
      s = s.replace(/<meta\b[^>]*>|<link\b(?![^>]*\bas="image")[^>]*>/gi, (m) => { tresor.push(m); return `\u0000${tresor.length - 1}\u0000`; });
      s = umstellen(s);
      s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => tresor[+i]);

      // <img>: lazy, async, Maße
      const mainStart = s.search(/<main\b/i);
      let ersteImMain = true;
      const teile = []; let letzte = 0;
      for (const m of s.matchAll(/<img\b[^>]*>/gi)) {
        let tag = m[0]; const pos = m.index;
        const imMain = mainStart >= 0 ? pos > mainStart : true;
        const vorrang = /fetchpriority=["']high/i.test(tag) || /loading=["']eager/i.test(tag);
        if (imMain && !vorrang && !/\bloading=/i.test(tag)) {
          if (ersteImMain) { /* erstes Bild in <main> bleibt eager (LCP-Kandidat) */ }
          else { tag = tag.replace(/<img\b/i, '<img loading="lazy"'); log.lazy++; }
        }
        if (imMain) ersteImMain = false;
        if (!vorrang && !/\bdecoding=/i.test(tag)) tag = tag.replace(/<img\b/i, '<img decoding="async"');
        if (!/\bwidth=/i.test(tag) && !/\bheight=/i.test(tag)) {
          const src = (tag.match(/\bsrc=["']([^"']+)["']/i) || [])[1];
          const d = src ? await mass(src) : null;
          if (d) { tag = tag.replace(/<img\b/i, `<img width="${d[0]}" height="${d[1]}"`); log.masse++; }
        }
        teile.push(s.slice(letzte, pos), tag); letzte = pos + m[0].length;
      }
      teile.push(s.slice(letzte)); s = teile.join('');

      // Strukturierte Daten ergänzen (nur was fehlt)
      const pfad = seiteVon(f);
      if (siteUrl && !/stil-muster/.test(pfad)) {
        const typen = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].flatMap(m => {
          try { const j = JSON.parse(m[1]); return (j['@graph'] || [j]).flatMap(x => [].concat(x['@type'] || [])); } catch { return []; }
        });
        const neu = [];
        if (!typen.includes('WebSite')) neu.push({ '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: firma || seiten.get('/')?.name || '', inLanguage: 'de-DE' });
        if (pfad !== '/' && pfad.endsWith('/') && !/\/404/.test(pfad) && !typen.includes('BreadcrumbList')) {
          const teileP = pfad.split('/').filter(Boolean); const liste = [{ name: 'Startseite', item: `${siteUrl}/` }];
          teileP.forEach((_, i) => { const p = '/' + teileP.slice(0, i + 1).join('/') + '/'; const sei = seiten.get(p); if (sei) liste.push({ name: (i === teileP.length - 1 ? (sei.h1 || sei.name) : (sei.name || sei.h1)).slice(0, 80), item: siteUrl + p }); });
          if (liste.length > 1) neu.push({ '@type': 'BreadcrumbList', itemListElement: liste.map((x, i) => ({ '@type': 'ListItem', position: i + 1, ...x })) });
        }
        if (pfad === '/' && firma && !typen.some(t => GESCHAEFT.test(t))) {
          const adresse = k.strasse ? { '@type': 'PostalAddress', streetAddress: k.strasse, postalCode: k.plz || undefined, addressLocality: k.ort || meta.ort || undefined, addressCountry: 'DE' } : (k.adresse || undefined);
          neu.push({ '@type': 'LocalBusiness', '@id': `${siteUrl}/#organisation`, name: firma, url: `${siteUrl}/`, description: meta.kurzbeschreibung || seiten.get('/')?.beschreibung || undefined,
            telephone: k.telefon || undefined, email: k.email || undefined, address: adresse, logo: meta.logo ? siteUrl + meta.logo : undefined, image: `${siteUrl}/images/og-image.jpg` });
        }
        if (neu.length) {
          const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': neu }).split('<').join('\\u003c');
          s = s.replace(/<\/head>/i, `<script type="application/ld+json">${json}</script></head>`); log.schema += neu.length;
        }
      }
      if (/stil-muster/.test(pfad) && !/noindex/.test(s)) s = s.replace(/<head>/i, '<head><meta name="robots" content="noindex, nofollow">');
    } else {
      s = umstellen(s);
    }
    if (s !== vorher) writeFileSync(f, s);
  } catch (e) { console.log(`  ⚠ optimize-build: ${url(f)} unverändert (${e.message})`); }
}

// ── 4. llms.txt (nur wenn das Projekt keine eigene hat) ─────────────────────
const llmsPfad = join(DIST, 'llms.txt');
if (!existsSync(llmsPfad) && siteUrl) {
  const start = seiten.get('/') || {};
  const kontakt = [
    k.strasse ? `Adresse: ${k.strasse}, ${[k.plz, k.ort].filter(Boolean).join(' ')}` : (k.adresse ? `Adresse: ${k.adresse}` : ''),
    k.telefon ? `Telefon: ${k.telefon}` : '', k.email ? `E-Mail: ${k.email}` : '',
    typeof k.oeffnungszeiten === 'string' && k.oeffnungszeiten ? `Öffnungszeiten: ${k.oeffnungszeiten}` : '',
  ].filter(Boolean).map(x => `- ${x}`).join('\n');
  // Große Bereiche mit vielen gleichartigen Seiten (z. B. 448 Ortsseiten, Schwabenpflege) als EINE Zeile
  // zusammenfassen, sonst wird llms.txt riesig und für KI-Suchen wertlos.
  const kandidaten = nurSeiten.filter(p => !/impressum|datenschutz/.test(p)).sort();
  const proBereich = {};
  for (const p of kandidaten) { const seg = p.split('/').filter(Boolean)[0]; if (seg && p.split('/').filter(Boolean).length > 1) proBereich[seg] = (proBereich[seg] || 0) + 1; }
  const gross = new Set(Object.entries(proBereich).filter(([, n]) => n > 20).map(([seg]) => seg));
  const zeilenListe = [];
  const schonZusammengefasst = new Set();
  for (const p of kandidaten) {
    const teile = p.split('/').filter(Boolean);
    if (teile.length > 1 && gross.has(teile[0])) {
      if (!schonZusammengefasst.has(teile[0])) {
        schonZusammengefasst.add(teile[0]);
        const ueber = seiten.get(`/${teile[0]}/`);
        zeilenListe.push(`- [${ueber?.name || teile[0]}: ${proBereich[teile[0]]} Seiten](${siteUrl}/${teile[0]}/)`);
      }
      continue;
    }
    if (gross.has(teile[0]) && teile.length === 1) continue;   // Übersichtsseite steht schon in der Sammelzeile
    const x = seiten.get(p);
    zeilenListe.push(`- [${x.name || x.h1 || p}](${siteUrl}${p})${x.beschreibung ? `: ${x.beschreibung}` : ''}`);
  }
  const liste = zeilenListe.join('\n');
  writeFileSync(llmsPfad, `# ${firma || start.name || siteUrl}\n\n> ${meta.kurzbeschreibung || start.beschreibung || ''}\n\n${kontakt ? `## Kontakt\n${kontakt}\n\n` : ''}## Seiten\n${liste}\n`);
  log.llms = true;
}

// ── 5. Sitemap + robots ─────────────────────────────────────────────────────
for (const f of alle.filter(f => /sitemap-\d+\.xml$/.test(f))) {
  const s = lies(f); const n = s.replace(/<url><loc>[^<]*\/stil-muster\/<\/loc>[\s\S]*?<\/url>/g, '');
  if (n !== s) writeFileSync(f, n);
}
const robots = join(DIST, 'robots.txt');
// Sitemap-Zeile immer (auch auf Staging, dort bleibt Disallow bestehen – qa-live verlangt sie)
if (existsSync(robots) && existsSync(join(DIST, 'sitemap-index.xml')) && siteUrl) {
  const r = lies(robots); if (!/^Sitemap:/mi.test(r)) writeFileSync(robots, r.replace(/\s*$/, '') + `\nSitemap: ${siteUrl}/sitemap-index.xml\n`);
}

// ── 6. Firmendaten für den Mailer (mailer.php liest dist/mailer-daten.json) ───
// Logo, Markenfarbe, Pflichtangaben und Anrede kommen so aus site-data.json statt von Hand ins PHP.
try {
  const fa = sd.design?.farben || {}, ton = sd.tonalitaet || {};
  const hex = (h) => /^#?[\da-f]{6}$/i.test(String(h || '').trim()) ? '#' + String(h).trim().replace('#', '') : null;
  const lum = (h) => { const m = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h || ''); if (!m) return 0; const [r, g, b] = [m[1], m[2], m[3]].map(x => { const v = parseInt(x, 16) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const farbe = hex(fa.primary) || '#1A5C4A';
  const weissTraegt = (1.05) / (lum(farbe) + 0.05) >= 2.2;
  const auf = sd.design?.textAuf?.primary === 'dunkel' ? '#111111' : sd.design?.textAuf?.primary === 'weiss' ? '#FFFFFF' : (weissTraegt ? '#FFFFFF' : '#111111');
  // Mail-Programme zeigen kein SVG: Logo als PNG/JPG (meta.logoMail, sonst meta.logo, wenn kein SVG)
  const logoMail = meta.logoMail || (/\.(png|jpe?g)$/i.test(meta.logo || '') ? meta.logo : '');
  const z = k.oeffnungszeiten;
  const zeiten = typeof z === 'string' ? z : Array.isArray(z) ? z.map(e => typeof e === 'string' ? e : [e.tage, e.zeiten].filter(Boolean).join(' ')).join(', ') : '';
  const serif = /serif|garamond|cormorant|playfair|lora|merriweather|baskerville|fraunces|newsreader|georgia|bodoni|caslon|crimson|spectral|libre/i.test(String(sd.design?.fonts?.display || '')) && !/sans/i.test(String(sd.design?.fonts?.display || '').split(',')[0]);
  writeFileSync(join(DIST, 'mailer-daten.json'), JSON.stringify({
    firma, siteUrl, email: k.email || '', telefon: k.telefon || '', strasse: k.strasse || '', plz: k.plz || '', ort: k.ort || meta.ort || '',
    zeiten, pflichtangaben: meta.mailPflichtangaben || '', logo: logoMail, farbe, farbeText: auf, serif,
    land: String(k.land || 'DE').toUpperCase(), anrede: String(ton.anrede || 'sie').toLowerCase(), perspektive: String(ton.perspektive || 'wir').toLowerCase(), inhaber: meta.inhaber || '',
  }));
} catch (e) { console.log(`  ⚠ optimize-build: mailer-daten.json nicht geschrieben (${e.message})`); }

console.log(`  optimize-build: ${ersatz.size} Bilder als WebP (${log.webp} neu, ${log.webpCache} aus Cache), ${log.verweise} Verweise umgestellt, `
  + `${log.lazy}× lazy, ${log.masse}× Maße ergänzt, ${log.schema} Schema-Blöcke ergänzt${log.llms ? ', llms.txt erzeugt' : ''} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
