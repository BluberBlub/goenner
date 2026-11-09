// QA-CHECKS v1 – statische Pruefungen (Teil von npm run qa)
// Exit 0 = bestanden, Exit 1 = Fehler gefunden
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const errors = [];
const warn = [];

function walk(dir, exts) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(extname(e))) out.push(full);
  }
  return out;
}
const read = (f) => readFileSync(f, 'utf-8');

// 1. Tonalitaet: Du/Sie-Mix
let siteData = {};
try { siteData = JSON.parse(read('src/content/site-data.json')); } catch { errors.push('site-data.json fehlt oder invalide'); }
const anrede = (siteData.tonalitaet?.anrede || '').toLowerCase();
if (!['du','sie'].includes(anrede)) errors.push('tonalitaet.anrede fehlt oder ungueltig');
const pages = walk('src/pages', ['.astro']).filter(f => !f.includes('karriere'));
if (anrede === 'sie') {
  for (const f of pages) {
    const matches = read(f).match(/>[^<]*\b(du|dich|dir|dein\w*)\b[^<]*</gi) || [];
    if (matches.length) errors.push(`Du-Form in Sie-Projekt: ${f} (${matches.length}x)`);
  }
} else if (anrede === 'du') {
  for (const f of pages) {
    const matches = read(f).match(/>[^<]*\b(Ihnen|Ihr\w*)\b[^<]*</g) || [];
    if (matches.length) warn.push(`Moegliche Sie-Form in Du-Projekt: ${f} (${matches.length}x)`);
  }
}

// 2. Hardcoded Hex in React-Components
for (const f of walk('src/components', ['.tsx', '.jsx'])) {
  const matches = read(f).match(/(?:bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/g) || [];
  if (matches.length) errors.push(`Hardcoded Hex in ${f}: ${[...new Set(matches)].join(', ')}`);
}

// 3. OG-Tags vollstaendig + absolut (BaseLayout)
const layouts = walk('src/layouts', ['.astro']);
const layoutSrc = layouts.map(read).join('\n');
for (const tag of ['og:title','og:description','og:image','og:url','og:type','og:image:width','og:image:height','og:image:alt','og:site_name','og:locale','twitter:card','twitter:image']) {
  if (!layoutSrc.includes(tag)) errors.push(`OG-Tag fehlt in Layouts: ${tag}`);
}
if (/property="og:image"\s+content="\/(?!\/)/.test(layoutSrc) && !layoutSrc.includes('startsWith')) {
  errors.push('og:image scheint relativ zu sein – absolute URL noetig');
}

// 4. Pflicht-Dateien
for (const f of ['public/robots.txt','public/.htaccess','public/mailer.php']) {
  if (!existsSync(f)) errors.push(`Pflicht-Datei fehlt: ${f}`);
}
if (existsSync('public/robots.txt') && !read('public/robots.txt').includes('Sitemap:')) warn.push('robots.txt ohne Sitemap-Referenz');
if (existsSync('public/.htaccess') && !read('public/.htaccess').includes('ErrorDocument 404')) errors.push('.htaccess ohne ErrorDocument 404');
// OG-Bild: MUSS ein echtes JPG sein (WhatsApp zeigt WebP/PNG oft nicht, Alge-Learning)
{
  const og = 'public/images/og-image.jpg';
  if (!existsSync(og)) {
    errors.push(`${og} fehlt${existsSync('public/images/og-image.png') || existsSync('public/images/og-image.webp') ? ' (nur PNG/WebP vorhanden – WhatsApp braucht JPG)' : ''} – "node og-bild.js" erzeugt es aus Hero-Bild und Logo`);
  } else {
    const b = readFileSync(og);
    if (!(b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF)) errors.push(`${og} ist kein echtes JPEG (nur umbenannt?) – "node og-bild.js" neu erzeugen lassen`);
    else {
      // Maße aus dem SOF-Marker lesen
      let i = 2, w = 0, h = 0;
      while (i < b.length - 9) {
        if (b[i] !== 0xFF) { i++; continue; }
        const mk = b[i + 1];
        if (mk >= 0xC0 && mk <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(mk)) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; }
        i += 2 + b.readUInt16BE(i + 2);
      }
      if (w && (w !== 1200 || h !== 630)) warn.push(`og-image.jpg ist ${w}×${h} statt 1200×630 – Vorschau wird beschnitten ("node og-bild.js")`);
      if (b.length > 300 * 1024) warn.push(`og-image.jpg hat ${Math.round(b.length / 1024)} KB – über 300 KB zeigt WhatsApp oft keine Vorschau`);
    }
  }
}

// 5. img ohne width/height (nur direkte <img> in astro)
for (const f of walk('src', ['.astro'])) {
  const src = read(f);
  const imgs = src.match(/<img\b[^>]*>/g) || [];
  for (const tag of imgs) {
    if (!/width=/.test(tag) && !/class="[^"]*(w-full|w-auto)[^"]*h-(full|\d)/.test(tag) && !/aspect-/.test(src)) {
      warn.push(`<img> evtl. ohne width/height (CLS): ${f}`);
      break;
    }
  }
}

// 6. Umlaut-Ersatzschreibweisen im sichtbaren Text
// Nur Text, nicht Code: Frontmatter, <script>, <style> und {…}-Ausdrücke (Variablennamen wie "fuer",
// Schwabenpflege-Fehlalarm) werden vorher entfernt.
for (const f of walk('src/pages', ['.astro'])) {
  const text = read(f).replace(/^---[\s\S]*?\n---/, '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
    .replace(/\{[^{}]*\}/g, ' ').replace(/\{[^{}]*\}/g, ' ');
  const matches = text.match(/>[^<]*\b(fuer|ueber|koennen|moechten|waehrend|zuverlaess\w*|gross)\b[^<]*</gi) || [];
  if (matches.length) errors.push(`Umlaut-Ersatzschreibweise in ${f}: ${matches.length}x, z. B. "${matches[0].replace(/[<>]/g, '').trim().slice(0, 50)}"`);
}

// 7. .gitignore-Hygiene
if (existsSync('.gitignore')) {
  const gi = read('.gitignore');
  for (const must of ['CLAUDE.md','progress.json','node_modules','dist','.env']) {
    if (!gi.includes(must)) errors.push(`.gitignore fehlt Eintrag: ${must}`);
  }
} else errors.push('.gitignore fehlt');

// 8. aria-label fuer Suchfelder
for (const f of walk('src', ['.astro','.tsx'])) {
  const matches = read(f).match(/<input[^>]*type="search"(?![^>]*aria-label)[^>]*>/g) || [];
  if (matches.length) errors.push(`Suchfeld ohne aria-label: ${f}`);
}

// 9. ContactForm Endpoint
for (const f of walk('src/components', ['.tsx'])) {
  const src = read(f);
  if (src.includes('fetch(')) {
    if (src.includes('/api/contact')) errors.push(`FALSCHER Endpoint /api/contact in ${f} – muss /mailer.php sein`);
    if (!src.includes('/mailer.php') && /ContactForm/i.test(f)) errors.push(`ContactForm ohne /mailer.php-Fetch: ${f}`);
  }
}


// 10b. Lokale Bilder, auf die das HTML zeigt, müssen existieren (Schneider: bild-formate.js überspringt
//      Fotos unter 400 px, die eigene Foto-Komponente verwies trotzdem auf .avif -> leere Bilder in Safari/Chrome)
if (existsSync('dist')) {
  const fehlend = new Map();
  for (const f of walk('dist', ['.html'])) {
    const src = read(f);
    const pfade = [];
    for (const m of src.matchAll(/\s(?:src|href)="(\/[^"#?]+\.(?:avif|webp|jpe?g|png|svg|gif))"/gi)) pfade.push(m[1]);
    for (const m of src.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/gi)) for (const t of m[1].split(',')) { const u = t.trim().split(/\s+/)[0]; if (u.startsWith('/')) pfade.push(u.split(/[?#]/)[0]); }
    for (const p of pfade) if (!existsSync('dist' + decodeURIComponent(p))) (fehlend.get(p) || fehlend.set(p, f).get(p));
  }
  if (fehlend.size) errors.push(`${fehlend.size} Bilddateien fehlen, auf die das HTML zeigt, z. B. ${[...fehlend].slice(0, 3).map(([p, f]) => `${p} (${f.replace(/\\/g, '/').replace('dist/', '')})`).join(', ')} – Varianten nur ausgeben, wenn die Datei existiert (wie PageHero), oder node bild-formate.js`);
}

// 10. OG-Tags pro gebauter Seite (dist) – jede Seite braucht og:title/description/image
if (existsSync('dist')) {
  const htmls = walk('dist', ['.html']).filter(f => f.endsWith('index.html') || f.endsWith('404.html'));
  for (const f of htmls) {
    const src = read(f);
    for (const tag of ['og:title', 'og:description', 'og:image']) {
      if (!src.includes(`property="${tag}"`)) errors.push(`OG fehlt auf Seite: ${f} (${tag})`);
    }
    const ogBild = src.match(/property="og:image"\s+content="([^"]+)"/)?.[1];
    if (ogBild && !/\.jpe?g(\?|$)/i.test(ogBild)) errors.push(`og:image ist kein JPG auf ${f}: ${ogBild} – ogImage nur als .jpg übergeben (WhatsApp)`);
  }
}

// 11. PHPMailer-Namespace (use in if-Block = 500er)
if (existsSync('public/mailer.php')) {
  const mp = read('public/mailer.php');
  if (/if\s*\([^)]*\)\s*\{[^}]*use\s+PHPMailer/s.test(mp)) {
    errors.push('mailer.php: use-Statement im if-Block (500er!) – vollqualifizierten Namespace nutzen');
  }
}


// 12. Verbrannte Standard-Fonts (generischer KI-Look) – Warnung
const BURNED = ['Inter', 'Roboto', 'Fraunces', 'Geist', 'Plus Jakarta Sans',
                'Space Grotesk', 'Playfair Display', 'Poppins', 'Montserrat'];
for (const f of walk('src', ['.astro', '.css', '.ts', '.js'])) {
  const src = read(f);
  for (const font of BURNED) {
    if (new RegExp(`font-family[^;]*['"\`]?${font}`, 'i').test(src) ||
        new RegExp(`['"]${font}['"]`).test(src) && /font/i.test(src)) {
      warn.push(`Verbrannte Standard-Schrift "${font}" in ${f} – wirkt generisch, siehe SCHRIFTWAHL in phase2-design.md`);
      break;
    }
  }
}


// 13. Zirkuläre CSS-Variablen im Layout (zerstört die Farbpalette)
for (const f of walk('src/layouts', ['.astro'])) {
  const src = read(f);
  const circ = src.match(/--(color-[\w-]+)\s*:\s*var\(\s*--\1\s*\)/g);
  if (circ) errors.push(`Zirkuläre CSS-Variable in ${f}: ${circ[0]} – define:vars nutzt sie schon, :root-Umdefinition entfernen (siehe phase2-technik.md)`);
}


// 14. Gesperrte Komponenten: @LOCKED-Marker muss vorhanden sein
// (übersprungen bei .no-component-sync = bewusster Antigravity-Feinschliff)
// Von Niko extern überarbeitete Komponenten (weiter.bat meldet sie als BEHALTEN)
// sind bewusst abweichend – dort keinen @LOCKED-Marker verlangen.
function lokalGeaendert(pfad) {
  const snap = '.autopilot-sync/' + pfad.split('/').pop();
  if (!existsSync(snap) || !existsSync(pfad)) return false;
  return read(snap) !== read(pfad);
}
const LOCKED = existsSync('.no-component-sync') ? [] : ['src/layouts/BaseLayout.astro','src/components/Header.astro',
  'src/components/Footer.astro','src/components/Section.astro','src/components/PageHero.astro',
  'src/components/StickyContact.astro','src/components/Cta.astro','src/components/CookieBanner.astro',
  'src/components/DemoBar.astro','tailwind.config.mjs'];
// neu im Kit, fehlt in alten Projekten (werden beim nächsten weiter.bat ergänzt)
const OPTIONAL_LOCKED = ['src/components/KontaktKarte.astro', 'src/components/SektionsKopf.astro', 'src/components/Fragen.astro',
  'src/components/Oeffnungszeiten.astro', 'src/components/KarteLaden.astro', 'src/middleware.ts'];
const ueberarbeitet = [];
for (const f of [...LOCKED, ...OPTIONAL_LOCKED]) {
  if (!existsSync(f)) { if (LOCKED.includes(f)) errors.push(`Gesperrte Komponente fehlt: ${f}`); continue; }
  if (lokalGeaendert(f)) { ueberarbeitet.push(f.split('/').pop()); continue; }   // von Niko überarbeitet – bleibt
  if (!read(f).includes('@LOCKED')) errors.push(`Gesperrte Komponente wurde verändert/ersetzt: ${f} – Niko fragen, NICHT eigenmächtig zurücksetzen. Anpassungen gehören in site-data.json oder eigene Sektions-Komponenten`);
}
if (ueberarbeitet.length) warn.push(`Lokal überarbeitete Kit-Komponenten (bleiben so, werden beim Abschluss ausgewertet): ${ueberarbeitet.join(', ')}`);

// 14b. Astro-ClientRouter bricht die Kit-Skripte (Menü, Sticky, Reveal laufen nur einmal).
//      Seitenübergänge macht das BaseLayout bereits per CSS (@view-transition).
for (const f of walk('src', ['.astro', '.ts', '.tsx', '.js'])) {
  if (/\b(ClientRouter|ViewTransitions)\b/.test(read(f)) && /astro:transitions/.test(read(f)))
    errors.push(`${f} nutzt den Astro-ClientRouter – entfernen. Mobile-Menü, Sticky-Button und Reveal funktionieren damit nach dem ersten Seitenwechsel nicht mehr. Übergänge sind im BaseLayout schon aktiv (CSS)`);
}

// 14c. Schrift auf Farbfläche von Hand gesetzt (passt sich nicht an die Palette an)
{
  let treffer = 0; const dateien = new Set();
  for (const f of walk('src', ['.astro', '.tsx', '.jsx'])) {
    if (/src[\\/](layouts|components)[\\/](BaseLayout|Header|Footer|Cta|StickyContact|CookieBanner|KontaktKarte|Section|PageHero|DemoBar|SektionsKopf|Fragen|Oeffnungszeiten)\.astro$/.test(f)) continue;
    for (const cls of read(f).match(/class(?:Name)?="[^"]*"/g) || []) {
      if (/\bbg-(primary|secondary|accent)\b(?!\/)/.test(cls) && /\btext-(white|black)\b/.test(cls)) { treffer++; dateien.add(f); }
    }
  }
  if (treffer) warn.push(`${treffer}x Schriftfarbe auf Farbfläche von Hand (bg-accent/primary + text-white/black) in ${[...dateien].slice(0, 4).join(', ')} – text-on-accent / text-on-primary nutzen, dann passt der Kontrast automatisch`);
}

// 14d. Schriftnamen mit Ziffer ohne Anführungszeichen sind ungültiges CSS (Schrift fällt still weg)
{
  try {
    const fo = JSON.parse(read('src/content/site-data.json')).design?.fonts || {};
    for (const [k, v] of Object.entries(fo)) {
      if (typeof v !== 'string') continue;
      for (const teil of v.split(',').map(t => t.trim())) {
        if (!/^['"]/.test(teil) && /\s\d|^\d/.test(teil)) errors.push(`design.fonts.${k}: "${teil}" muss in Anführungszeichen stehen ("'${teil}'"), sonst ignoriert der Browser die ganze Schriftangabe`);
      }
    }
    for (const p of JSON.parse(read('src/content/site-data.json')).design?.fontPreload || []) {
      if (!existsSync('public' + p)) errors.push(`design.fontPreload zeigt ins Leere: public${p}`);
    }
  } catch {}
}


// 15. Du/Sie-Bruch in Formularen und Consent-Texten (N13-Learning)
{
  const alle = walk('src', ['.astro', '.jsx', '.tsx']);
  let du = 0, sie = 0;
  const duRe = /\b(du|dein|deine|deinem|deinen|dich|dir)\b/gi;
  const sieRe = /\b(Sie|Ihr|Ihre|Ihrem|Ihren|Ihnen)\b/g;
  for (const f of alle) { const s = read(f); du += (s.match(duRe)||[]).length; sie += (s.match(sieRe)||[]).length; }
  const modus = du > sie * 1.5 ? 'du' : (sie > du * 1.5 ? 'sie' : null);
  if (modus) {
    for (const f of alle) {
      if (!/form|kontakt|contact|consent|cookie/i.test(f)) continue;
      const s = read(f);
      const dTreffer = (s.match(duRe)||[]).length, sTreffer = (s.match(sieRe)||[]).length;
      if (modus === 'du' && sTreffer > dTreffer && sTreffer > 1)
        errors.push(`Du/Sie-Bruch in ${f}: Seite duzt, aber hier wird gesiezt (Formular/Consent) – vereinheitlichen`);
      if (modus === 'sie' && dTreffer > sTreffer && dTreffer > 1)
        errors.push(`Du/Sie-Bruch in ${f}: Seite siezt, aber hier wird geduzt – vereinheitlichen`);
    }
  }
}


// 15a. astro.config.mjs: ohne Tailwind-Integration entsteht KEIN CSS
if (!existsSync('astro.config.mjs')) {
  errors.push('astro.config.mjs fehlt – ohne sie wird kein CSS gebaut und keine Sitemap erzeugt');
} else {
  const ac = read('astro.config.mjs');
  if (!/tailwind\(\)/.test(ac)) errors.push('astro.config.mjs ohne tailwind() – es wird KEIN CSS erzeugt, die Seite erscheint unformatiert');
  if (!/sitemap\(\)/.test(ac)) warn.push('astro.config.mjs ohne sitemap() – keine sitemap.xml für Suchmaschinen');
  if (/__SITE_URL__/.test(ac)) errors.push('astro.config.mjs enthält noch den Platzhalter __SITE_URL__ – echte Domain eintragen');
}

// 15b. Tailwind-Config: Alpha-Ausfall (Klassen wie bg-primary/5 fehlen sonst KOMPLETT)
if (existsSync('tailwind.config.mjs')) {
  const tw = read('tailwind.config.mjs');
  if (/['"]var\(--color-/.test(tw))
    errors.push('tailwind.config nutzt var(--color-x) direkt – alle Opacity-Abstufungen (bg-primary/5, /90 …) werden dadurch NICHT generiert. Auf rgb(var(--color-x-rgb) / <alpha-value>) umstellen (gesperrte Config aus _komponenten/)');
}

// 15c. Demo-Leiste: Demo muss immer noindex sein (sonst rankt die Demo statt der Kundenseite)
{
  try {
    const sd = JSON.parse(read('src/content/site-data.json'));
    if (sd.meta?.demo === true && sd.meta?.staging !== true)
      errors.push('meta.demo=true, aber meta.staging fehlt/false – eine Demo darf NIE indexierbar sein. staging auf true setzen.');
  } catch {}
}

// 15d. LOGO: muss existieren und darf kein Platzhalter sein (3x hintereinander vergessen)
{
  try {
    const sd = JSON.parse(read('src/content/site-data.json'));
    const lp = sd.meta?.logo;
    if (!lp) errors.push('meta.logo fehlt in site-data.json');
    else {
      const datei = 'public' + lp;
      if (!existsSync(datei)) errors.push(`Logo-Datei fehlt: ${datei} (meta.logo zeigt ins Leere)`);
      else {
        const kb = statSync(datei).size / 1024;
        const inhalt = /\.svg$/i.test(datei) ? read(datei) : '';
        const platzhalter = kb < 0.8 || /<circle[^>]*\/>\s*<\/svg>/.test(inhalt.replace(/\s+/g,' '));
        if (platzhalter) errors.push(`Logo wirkt wie ein Platzhalter (${datei}, ${kb.toFixed(1)} KB) – Original-Logo der Kundenseite verwenden (siehe MARKE.md / original-bilder/_LOGO.*)`);
      }
    }
    // Relaunch: Logo wurde gefunden, aber nicht eingesetzt?
    if (existsSync('MARKE.md') && existsSync('original-bilder')) {
      const gefunden = readdirSync('original-bilder').filter(f => /^_LOGO\./i.test(f));
      if (gefunden.length && lp && !readdirSync('public/images').some(f => /^logo\./i.test(f)))
        errors.push('Original-Logo liegt in original-bilder/, wird aber nicht genutzt – nach public/images/ kopieren und meta.logo setzen');
    }
  } catch {}
}

// 15e0. Nav-CTA-Ziel muss existieren (Header verlinkt auf /kontakt/)
{
  try {
    const sd = JSON.parse(read('src/content/site-data.json'));
    if ((sd.meta?.navCta || 'kontakt') !== 'telefon') {
      const da = existsSync('src/pages/kontakt.astro') || existsSync('src/pages/kontakt/index.astro');
      if (!da) errors.push('Header verlinkt auf /kontakt/, aber es gibt keine Kontaktseite – src/pages/kontakt.astro anlegen (oder meta.navCta auf "telefon" setzen)');
    }
  } catch {}
}

// 15e. Kontaktformular ist Pflicht (Punkt 9 Traut)
{
  const hatForm = walk('src', ['.astro','.jsx','.tsx']).some(f => /ContactForm|<form/i.test(read(f)));
  if (!hatForm) errors.push('Kein Kontaktformular gefunden – jede Seite braucht eines (ContactForm + PHPMailer)');
}

// 15f. KI-Bilder müssen vor Go-Live ersetzt werden (Punkt 11 Traut)
if (existsSync('KI-BILDER.md')) {
  const offen = read('KI-BILDER.md').split('\n').filter(z => /^- \[ \]/.test(z)).length;
  if (offen) warn.push(`${offen} KI-generierte Bilder noch nicht ersetzt – siehe KI-BILDER.md (vor Go-Live durch echte Fotos ersetzen)`);
}

// 16. SEO-Fallen (EGS-Learning): noindex/Disallow nur bei staging-Flag erlaubt
{
  let staging = false;
  try { staging = JSON.parse(read('src/content/site-data.json')).meta?.staging === true; } catch {}
  if (existsSync('public/robots.txt')) {
    const rt = read('public/robots.txt');
    if (/Disallow:\s*\/\s*$/m.test(rt) && !staging)
      errors.push('robots.txt sperrt ALLES (Disallow: /) ohne meta.staging=true in site-data.json – Suchmaschinen finden die Seite nie');
    if (!/Sitemap:/i.test(rt)) warn.push('robots.txt ohne Sitemap-Zeile');
  }
  for (const f of walk('src/layouts', ['.astro'])) {
    const src = read(f);
    // Nur HARTES noindex melden – das staging-gesteuerte Ternary im BaseLayout ist korrekt
    const hart = src.split('\n').some(z => /noindex/.test(z) && !/staging/.test(z));
    if (hart && !staging) errors.push(`Hartes noindex im Layout ${f} – blockiert Google live. Über meta.staging in site-data.json steuern statt fest verdrahten`);
  }
}

// 17. astro.config site == site-data siteUrl (EGS: veraltete Domain nach Umbenennung)
{
  try {
    const cfg = read('astro.config.mjs');
    const m = cfg.match(/site:\s*['"]([^'"]+)['"]/);
    const sd = JSON.parse(read('src/content/site-data.json'));
    const soll = (sd.meta?.siteUrl || '').replace(/\/$/, '');
    if (m && soll && m[1].replace(/\/$/, '') !== soll)
      errors.push(`Domain-Konflikt: astro.config site="${m[1]}" vs. site-data siteUrl="${soll}" – Sitemap+Canonicals zeigen auf die falsche Domain`);
  } catch {}
}

// 18. Bildgrößen (EGS: 2,9-MB-PNG deployt)
{
  const dir = 'public/images';
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      const p = `${dir}/${f}`;
      try {
        const kb = Math.round(statSync(p).size / 1024);
        if (kb > 1024) errors.push(`Bild zu groß: ${p} (${kb} KB) – vor Deploy komprimieren/WebP (Ziel: Hero <250 KB, Rest <400 KB)`);
        else if (kb > 400 && !/og-image/.test(f)) warn.push(`Bild schwer: ${p} (${kb} KB) – WebP prüfen`);
      } catch {}
    }
  }
}

// 19. Externe Inhalte vs. Cookie-Banner (Spöri: Banner nannte Google Maps ohne Karte = rechtlich falsch;
//     umgekehrt darf keine Karte/kein Video laden, ohne dass der Banner es nennt)
{
  let extern = [];
  try { extern = JSON.parse(read('src/content/site-data.json')).externeInhalte || []; } catch {}
  const DIENSTE = [[/google\.[a-z.]+\/maps(\/embed|\?[^"'\s]*output=embed)|maps\.google\.[a-z.]+\/maps\?[^"'\s]*output=embed/i, 'Google Maps'], [/youtube(-nocookie)?\.com\/embed/i, 'YouTube'],
    [/player\.vimeo\.com/i, 'Vimeo'], [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, 'Google Fonts'], [/openstreetmap\.org\/export\/embed/i, 'OpenStreetMap']];
  const gefunden = new Set();
  for (const f of [...walk('src', ['.astro', '.tsx', '.jsx', '.html', '.md', '.json', '.ts'])]) {
    if (/KarteLaden\.astro$/.test(f)) continue;   // Kit-Baustein: zählt nur, wo er eingesetzt wird (Prüfung unten)
    const src = read(f);
    for (const [re, name] of DIENSTE) if (re.test(src)) gefunden.add(name);
  }
  for (const name of gefunden) {
    if (name === 'Google Fonts') { errors.push('Google Fonts werden extern geladen – Schriften lokal einbinden (DSGVO, siehe fonts.css)'); continue; }
    if (!extern.some(e => String(e).toLowerCase().includes(name.toLowerCase().split(' ')[0])))
      errors.push(`${name} wird eingebunden, steht aber nicht in site-data.json "externeInhalte" – der Cookie-Banner muss es nennen und erst nach Zustimmung laden`);
  }
}

// 19b. Externe Skripte nur nach Einwilligung (Schwabenpflege: Chat-Widget, Karte). Ein fest eingebautes
//      <script src="https://…"> lädt fremden Code vor jeder Zustimmung.
for (const f of walk('src', ['.astro', '.tsx', '.jsx', '.html'])) {
  const treffer = (read(f).match(/<script\b[^>]*\bsrc=["']https?:\/\/[^"']+/gi) || []).filter(t => !t.includes('https://crawler.niko-endres.de/t/demo.js'));
  for (const t of treffer) errors.push(`Externes Skript ohne Einwilligung in ${f}: ${t.replace(/^.*src=["']/, '').slice(0, 70)} – erst nach Zustimmung laden (Muster: KarteLaden, _referenzen/bausteine/ChatLaden.astro) und in externeInhalte nennen`);
}
// 19c. Demo-Statistik (Niko, 21.10.2026): bei meta.demo = true auf JEDER Seite genau diese Zeile, sonst nirgends
//      (Livegang auf der Kundendomain, eigene Website, Vorlagen).
if (existsSync('dist')) {
  let demo = false;
  try { demo = JSON.parse(read('src/content/site-data.json')).meta?.demo === true; } catch {}
  const ZEILE = '<script src="https://crawler.niko-endres.de/t/demo.js" defer></script>';
  const seiten = walk('dist', ['.html']);
  const ohne = seiten.filter(f => !read(f).includes(ZEILE));
  const mit = seiten.filter(f => read(f).includes('crawler.niko-endres.de/t/demo.js'));
  if (demo && ohne.length) errors.push(`Demo-Statistik fehlt auf ${ohne.length} Seite(n), z. B. ${ohne[0]} – BaseLayout aus dem Kit nutzen (setzt die Zeile bei meta.demo = true)`);
  if (!demo && mit.length) errors.push(`Demo-Statistik auf ${mit.length} Seite(n), obwohl meta.demo nicht true ist (Livegang/Kundenseite) – Zeile entfernen`);
}
// KarteLaden nutzt Google Maps: dann muss es in externeInhalte stehen
{
  let extern = [];
  try { extern = JSON.parse(read('src/content/site-data.json')).externeInhalte || []; } catch {}
  const nutzt = walk('src', ['.astro', '.tsx', '.jsx', '.mdx']).some(f => !/KarteLaden\.astro$/.test(f) && /<KarteLaden\b/.test(read(f)));
  if (nutzt && !extern.some(e => /google/i.test(String(e))))
    errors.push('KarteLaden wird genutzt, aber "Google Maps" fehlt in site-data.json externeInhalte (Cookie-Banner und Footer-Link "Cookie-Einstellungen" hängen daran)');
}

// 20. Mailer: CORS nicht für alle Domains öffnen (Spöri)
if (existsSync('public/mailer.php') && (/Allow-Origin:[^\n]*\*/.test(read('public/mailer.php')) && !/HTTP_ORIGIN/.test(read('public/mailer.php'))))
  warn.push('mailer.php erlaubt Anfragen von jeder Domain (Access-Control-Allow-Origin: *) – auf die eigene Domain begrenzen (Kit-mailer.php v2)');
if (existsSync('public/mailer.php') && !existsSync('public/phpmailer/PHPMailer.php') && /phpmailer\/PHPMailer\.php/.test(read('public/mailer.php')))
  warn.push('public/phpmailer/ ist leer – Mails gehen nur über PHP mail() raus (Spam-Gefahr). Bundle aus _projektdateien/phpmailer kopieren');

// 21. Demo/Staging-robots: Link-Vorschau-Bots (WhatsApp, Facebook, LinkedIn) zulassen (Joos), sonst keine Vorschau
{
  let staging = false;
  try { staging = JSON.parse(read('src/content/site-data.json')).meta?.staging === true; } catch {}
  if (staging && existsSync('public/robots.txt')) {
    const rt = read('public/robots.txt');
    if (/Disallow:\s*\/\s*$/m.test(rt) && !/facebookexternalhit|WhatsApp/i.test(rt))
      warn.push('robots.txt (Demo) sperrt auch WhatsApp/Facebook – keine Link-Vorschau. Vorschau-Bots erlauben (siehe phase2-technik.md, ROBOTS)');
  }
}

// Ausgabe
console.log('\n══════ QA-CHECKS ══════');
warn.forEach(w => console.log('  ⚠  ' + w));
errors.forEach(e => console.log('  ✖  ' + e));
console.log(`\n  ${errors.length} Fehler, ${warn.length} Warnungen\n`);
process.exit(errors.length ? 1 : 0);
