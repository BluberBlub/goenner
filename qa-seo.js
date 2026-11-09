// NIKO ENDRES – QA-SEO (SEO + GEO + Bild-Performance, prüft den fertigen Build in dist/)
// Läuft automatisch in npm run qa. Einzeln: node qa-seo.js
// ✖ = Fehler (Gate rot), ⚠ = Hinweis. optimize-build.js erledigt vieles automatisch –
// dieses Gate stellt sicher, dass es auch wirklich angekommen ist und prüft, was nur Menschen schreiben können
// (Titel, Beschreibungen, Überschriften, Alt-Texte).
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, relative, sep } from 'path';

const DIST = 'dist';
const fehler = [], hinweise = [];
const bad = (m) => { fehler.push(m); console.log(`  ✖  ${m}`); };
const hint = (m) => { hinweise.push(m); console.log(`  ⚠  ${m}`); };
console.log('\n══════ QA-SEO (SEO, GEO, Bilder) ══════');
if (!existsSync(DIST)) { bad('dist/ fehlt – erst bauen (npm run build)'); process.exit(1); }

const lies = (p) => { try { return readFileSync(p, 'utf8').replace(/^﻿/, ''); } catch { return ''; } };
let sd = {}; try { sd = JSON.parse(lies('src/content/site-data.json') || '{}'); } catch {}
const staging = sd.meta?.staging === true;
const walk = (d) => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const alle = walk(DIST);
const seiten = alle.filter(f => /index\.html$/.test(f) && !/stil-muster/.test(f));
const pfadVon = (f) => '/' + relative(DIST, f).split(sep).join('/').replace(/index\.html$/, '');
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const titel = new Map(), beschr = new Map();
let bilderGesamt = 0, jpgImg = 0, ohneLazy = 0;
for (const f of seiten) {
  const h = lies(f); const p = pfadVon(f); const recht = /impressum|datenschutz/.test(p);
  const t = text((h.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const d = (h.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '';
  if (!t) bad(`${p}: <title> fehlt`); else {
    (titel.get(t) || titel.set(t, []).get(t)).push(p);
    if (t.length > 70) bad(`${p}: Titel ${t.length} Zeichen (max. 60, Google schneidet ab): „${t}"`);
    else if (t.length > 60 || t.length < 25) hint(`${p}: Titel ${t.length} Zeichen (ideal 30–60)`);
  }
  if (!d) bad(`${p}: meta description fehlt`); else {
    (beschr.get(d) || beschr.set(d, []).get(d)).push(p);
    if (d.length > 200 || d.length < 60) bad(`${p}: Beschreibung ${d.length} Zeichen (ideal 120–160)`);
    else if (!recht && (d.length > 165 || d.length < 110)) hint(`${p}: Beschreibung ${d.length} Zeichen (ideal 120–160)`);
  }
  const h1 = (h.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) bad(`${p}: ${h1}× <h1> (genau eine pro Seite)`);
  const ebenen = [...h.matchAll(/<h([1-6])[\s>]/gi)].map(m => +m[1]);
  const spruenge = ebenen.filter((e, i) => i && e - ebenen[i - 1] > 1).length;
  if (spruenge) hint(`${p}: ${spruenge} Überschriften-Sprünge (z. B. h2 → h4)`);
  if (!/<html[^>]*\blang=/i.test(h)) bad(`${p}: <html lang> fehlt`);
  if (!/<link rel="canonical"/i.test(h)) bad(`${p}: Canonical fehlt`);
  if (!/<meta property="og:image"/i.test(h)) bad(`${p}: og:image fehlt`);

  // Strukturierte Daten
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const typen = [];
  for (const m of ld) { try { const j = JSON.parse(m[1]); typen.push(...(j['@graph'] || [j]).flatMap(x => [].concat(x['@type'] || []))); } catch { bad(`${p}: JSON-LD ist kein gültiges JSON`); } }
  if (!typen.includes('WebSite')) bad(`${p}: Schema WebSite fehlt (optimize-build.js lief nicht?)`);
  if (p === '/' && !typen.some(x => /Business|Organization|Shop|Store|Restaurant|Service/.test(x))) bad('/: Schema für den Betrieb (LocalBusiness o. ä.) fehlt');
  if (p !== '/' && !/\/404/.test(p) && !typen.includes('BreadcrumbList')) hint(`${p}: kein BreadcrumbList-Schema`);

  // Bilder
  const main = h.search(/<main\b/i);
  let erstes = true;
  for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0]; bilderGesamt++;
    if (!/\balt=/i.test(tag)) bad(`${p}: <img> ohne alt: ${tag.slice(0, 90)}`);
    if (!/\bwidth=/i.test(tag) || !/\bheight=/i.test(tag)) hint(`${p}: <img> ohne width/height (CLS): ${tag.slice(0, 80)}`);
    const src = (tag.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || '';
    if (/^\/[^?#]*\.(jpe?g|png)(\?|#|$)/i.test(src) && !/og-image|favicon/i.test(src)) {
      jpgImg++;
      if (existsSync(join(DIST, src.split(/[?#]/)[0].replace(/\.(jpe?g|png)$/i, '.webp')))) bad(`${p}: ${src} ausgeliefert, obwohl WebP existiert (optimize-build.js lief nicht?)`);
    }
    const imMain = main < 0 || m.index > main;
    if (imMain && !erstes && !/loading=["']lazy/i.test(tag) && !/fetchpriority=["']high/i.test(tag) && !/loading=["']eager/i.test(tag)) ohneLazy++;
    if (imMain) erstes = false;
  }
}
for (const [t, ps] of titel) if (ps.length > 1) bad(`Gleicher Titel auf ${ps.length} Seiten (${ps.join(', ')}): „${t}"`);
for (const [, ps] of beschr) if (ps.length > 1) bad(`Gleiche Beschreibung auf ${ps.length} Seiten: ${ps.join(', ')}`);
if (ohneLazy) hint(`${ohneLazy} Bilder unterhalb des ersten Bildschirms ohne loading="lazy"`);
if (jpgImg) hint(`${jpgImg}× JPG/PNG als <img> ausgeliefert (ohne WebP-Gegenstück)`);

// GEO + Indexierung
if (!existsSync(join(DIST, 'llms.txt'))) bad('llms.txt fehlt (GEO) – optimize-build.js erzeugt sie automatisch');
else if (lies(join(DIST, 'llms.txt')).length < 300) hint('llms.txt ist sehr knapp – Fakten ergänzen (eigene src/pages/llms.txt.ts)');
if (!alle.some(f => /sitemap-index\.xml$/.test(f))) bad('sitemap-index.xml fehlt');
else if (alle.some(f => /sitemap-\d+\.xml$/.test(f) && /stil-muster/.test(lies(f)))) bad('/stil-muster/ steht in der Sitemap');
const robots = lies(join(DIST, 'robots.txt'));
if (!robots) bad('robots.txt fehlt');
else if (!staging && /Disallow:\s*\/\s*$/mi.test(robots)) bad('Live-Seite, aber robots.txt sperrt alles (Disallow: /)');
else if (!/^Sitemap:/mi.test(robots)) bad('robots.txt ohne Sitemap-Zeile (qa-live verlangt sie)');
if (staging) hint('Staging: noindex aktiv – beim Go-Live meta.staging auf false und robots.txt freigeben');

// Bildgewichte (große Dateien bremsen LCP)
const schwer = alle.filter(f => /\.(webp|avif|jpe?g|png)$/i.test(f) && !/og-image/.test(f) && statSync(f).size > 350 * 1024);
if (schwer.length) hint(`${schwer.length} Bilddatei(en) über 350 KB: ${schwer.slice(0, 4).map(f => relative(DIST, f)).join(', ')}`);

console.log(`\n  ${seiten.length} Seiten, ${bilderGesamt} Bilder geprüft · ${fehler.length} Fehler, ${hinweise.length} Hinweise\n`);
process.exit(fehler.length ? 1 : 0);
