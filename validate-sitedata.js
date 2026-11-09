// NIKO ENDRES – SITE-DATA VALIDATOR v3
// Prüft site-data.json gegen das, was die Kit-Komponenten WIRKLICH lesen
// (BaseLayout, Header, Footer, Cta, KontaktKarte). Gate vor Phase 1b/2.
// v2: Schema an das Kit angepasst (v1 verlangte veraltete Felder wie fonts.headline,
//     das BaseLayout liest aber fonts.display -> Schrift fiel still auf den Standard zurück).
// v3: "Startseite" in der Navigation ist erwünscht (Weber, Spöri: "generell"), neue Kit-Felder
//     (design.radius, sticky, externeInhalte, kontakt.oeffnungszeitenWoche, umbruch.trennstellen),
//     Hinweis bei Weiß auf Farbflächen unter 4.5:1 (Lighthouse meldet Buttons, Joos).
// Aufruf: node validate-sitedata.js

import { readFileSync, existsSync } from 'fs';

const path = './src/content/site-data.json';
if (!existsSync(path)) { console.error('❌ site-data.json fehlt!'); process.exit(1); }

let data;
try { data = JSON.parse(readFileSync(path, 'utf-8')); }
catch (e) { console.error(`❌ site-data.json ist kein gültiges JSON: ${e.message}`); process.exit(1); }
const errors = [];
const warnings = [];
const m = data.meta || {}, k = data.kontakt || {}, d = data.design || {}, f = d.farben || {}, fo = d.fonts || {};

// ── Pflichtfelder (werden von den Kit-Komponenten gelesen) ──
const pflicht = {
  'meta.firmenname': m.firmenname, 'meta.logo': m.logo, 'meta.siteUrl': m.siteUrl,
  'kontakt.email': k.email, 'design.leitidee': d.leitidee,
  'design.farben.primary': f.primary, 'design.farben.accent': f.accent,
  'design.farben.background': f.background, 'design.farben.text': f.text,
  'design.fonts.display': fo.display, 'design.fonts.body': fo.body,
  'tonalitaet.anrede': data.tonalitaet?.anrede,
};
for (const [key, val] of Object.entries(pflicht)) if (!val || String(val).trim() === '') errors.push(`Pflichtfeld fehlt: ${key}`);
if (fo.headline && !fo.display) errors.push('design.fonts.headline gesetzt, aber das Kit liest design.fonts.display – umbenennen');
if (m.logo && !existsSync('public' + m.logo)) errors.push(`meta.logo zeigt ins Leere: public${m.logo}`);
if (m.siteUrl && !/^https?:\/\//.test(m.siteUrl)) errors.push(`meta.siteUrl braucht https://… (ist "${m.siteUrl}")`);

// ── Navigation ──
const nav = data.navigation;
if (!Array.isArray(nav) || !nav.length) errors.push('navigation fehlt oder ist leer: [{ "label": "…", "href": "/…/" }]');
else for (const i of nav) {
  const echt = (h) => typeof h === 'string' && h.trim() && !h.trim().startsWith('#');
  if (!i.label) errors.push('navigation: Eintrag ohne label');
  if (!echt(i.href) && !(i.children || []).length) errors.push(`navigation "${i.label}": href fehlt oder ist "#" – echte Seite verlinken`);
  for (const c of i.children || []) if (!c.label || !echt(c.href)) errors.push(`navigation "${i.label}" > "${c.label || '?'}": Unterpunkt braucht label und echte href`);
}

// ── Farben: gültig und lesbar ──
const hex6 = (h) => { const s = String(h || '').trim(); if (/^#[\da-f]{6}$/i.test(s)) return s; const x = /^#([\da-f])([\da-f])([\da-f])$/i.exec(s); return x ? `#${x[1]}${x[1]}${x[2]}${x[2]}${x[3]}${x[3]}` : null; };
for (const key of ['primary', 'secondary', 'accent', 'background', 'text']) {
  if (f[key] && !hex6(f[key])) errors.push(`design.farben.${key} ist kein Hex-Wert: "${f[key]}" (Format #1a2b3c)`);
}
if (!f.secondary) warnings.push('design.farben.secondary fehlt – Standardwert wird genutzt');
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map(i => { const v = parseInt(hex.slice(i, i + 2), 16) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const kontrast = (a, b) => { const [h, dd] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (dd + 0.05); };
if (hex6(f.text) && hex6(f.background)) {
  const kt = kontrast(hex6(f.text), hex6(f.background));
  if (kt < 4.5) errors.push(`Fließtext (text auf background) hat nur Kontrast ${kt.toFixed(1)}:1 – mindestens 4.5`);
}
if (hex6(f.primary) && hex6(f.background) && kontrast(hex6(f.primary), hex6(f.background)) < 3)
  warnings.push(`primary auf background nur ${kontrast(hex6(f.primary), hex6(f.background)).toFixed(1)}:1 – Headlines/Links in primary wirken blass`);
for (const [key, wert] of Object.entries(d.textAuf || {})) {
  if (!['weiss', 'dunkel'].includes(wert)) { errors.push(`design.textAuf.${key} = "${wert}" – erlaubt: "weiss" oder "dunkel"`); continue; }
  const fl = hex6(f[key]);
  if (!fl) continue;
  const dunkel = hex6(f.text) && kontrast(hex6(f.text), '#ffffff') >= 7 ? hex6(f.text) : '#111111';
  const kk = kontrast(wert === 'weiss' ? '#ffffff' : dunkel, fl);
  if (kk < 2) errors.push(`design.textAuf.${key} = "${wert}" ist unlesbar (Kontrast ${kk.toFixed(1)}:1) – Eintrag entfernen, die Automatik wählt richtig`);
}

for (const key of ['primary', 'accent']) {
  const fl = hex6(f[key]);
  if (!fl || d.textAuf?.[key] === 'dunkel') continue;
  const kw = kontrast('#ffffff', fl);
  if (kw >= 2.2 && kw < 4.5 && d.textAuf?.[key] !== 'weiss')
    warnings.push(`Weiß auf ${key} hat nur ${kw.toFixed(1)}:1 – Lighthouse bemängelt Buttons darauf (Ziel 4.5). Bewusst so lassen oder design.textAuf.${key} = "dunkel"`);
}

// ── Neue Kit-Felder ──
const rad = d.radius;
if (rad !== undefined && !(typeof rad === 'object' || ['eckig', 'dezent', 'weich', 'rund'].includes(rad)))
  errors.push(`design.radius = "${rad}" – erlaubt: "eckig", "dezent", "weich", "rund" oder { "knopf": "4px", "karte": "4px" }`);
if (data.externeInhalte === undefined) warnings.push('externeInhalte fehlt: [] eintragen, wenn die Seite nichts Externes lädt, sonst z. B. ["Google Maps"] (steuert den Cookie-Banner-Text)');
if (k.land && !['DE', 'AT', 'CH'].includes(String(k.land).toUpperCase())) errors.push(`kontakt.land = "${k.land}" – erlaubt: DE, AT, CH (Telefon-Vorwahl in Links)`);
if (data.externeInhalte !== undefined && !Array.isArray(data.externeInhalte)) errors.push('externeInhalte muss eine Liste sein, z. B. ["Google Maps"] (leer = keine externen Inhalte)');
const ow = k.oeffnungszeitenWoche;
if (ow) {
  for (const [tag, zeiten] of Object.entries(ow)) {
    if (!['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'].includes(tag)) errors.push(`kontakt.oeffnungszeitenWoche: unbekannter Tag "${tag}" (mo … so)`);
    for (const z of zeiten || []) if (!/^\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}$/.test(String(z))) errors.push(`kontakt.oeffnungszeitenWoche.${tag}: "${z}" – Format "08:00-12:00"`);
  }
}
for (const w of data.umbruch?.trennstellen || []) if (!String(w).includes('|')) errors.push(`umbruch.trennstellen: "${w}" ohne Wortfuge – Format "Steuer|erklärungen"`);
if (data.sticky?.icon && !['chat', 'pfeil', 'telefon', 'kalender', 'keins'].includes(data.sticky.icon) && !String(data.sticky.icon).trim().startsWith('<'))
  errors.push(`sticky.icon = "${data.sticky.icon}" – erlaubt: chat, pfeil, telefon, kalender, keins oder ein SVG-Pfad`);

// ── Schriften: Namen mit Ziffer brauchen Anführungszeichen, sonst ignoriert der Browser alles ──
for (const [key, v] of Object.entries(fo)) {
  if (typeof v !== 'string') continue;
  for (const teil of v.split(',').map(t => t.trim())) {
    if (!/^['"]/.test(teil) && /\s\d|^\d/.test(teil)) errors.push(`design.fonts.${key}: "${teil}" in Anführungszeichen setzen ("'${teil}', …")`);
  }
}
for (const p of d.fontPreload || []) if (!existsSync('public' + p)) warnings.push(`design.fontPreload: public${p} fehlt`);

// ── Optionale Kit-Felder ──
if (m.logoFooterStil && !['weiss', 'platte', 'original'].includes(m.logoFooterStil)) errors.push(`meta.logoFooterStil = "${m.logoFooterStil}" – erlaubt: weiss, platte, original`);
if (m.logoFooter && !existsSync('public' + m.logoFooter)) errors.push(`meta.logoFooter zeigt ins Leere: public${m.logoFooter}`);
if (m.demo === true && m.staging !== true) errors.push('meta.demo = true braucht meta.staging = true (Demo darf nie indexiert werden)');
if (!m.kurzbeschreibung) warnings.push('meta.kurzbeschreibung fehlt (Footer, OG-Bild)');
if (!m.branche) warnings.push('meta.branche fehlt (Bild-Gate prüft Motive gegen die Branche)');
if (!m.ort) warnings.push('meta.ort fehlt (Bild-Gate prüft Region)');
if (!k.telefon) warnings.push('kontakt.telefon fehlt');
if (!k.strasse || !k.plz || !k.ort) warnings.push('kontakt.strasse/plz/ort unvollständig (Footer, KontaktKarte, Route planen)');
const perspektive = String(data.tonalitaet?.perspektive || '').toLowerCase();
if (perspektive && !['ich', 'wir'].includes(perspektive)) errors.push(`tonalitaet.perspektive muss "ich" oder "wir" sein, ist "${perspektive}"`);
if (!perspektive) warnings.push('tonalitaet.perspektive fehlt ("ich" bei Einzelunternehmern ohne Team, sonst "wir")');
const anrede = String(data.tonalitaet?.anrede || '').toLowerCase();
if (anrede && !['du', 'sie'].includes(anrede)) errors.push(`tonalitaet.anrede muss "du" oder "sie" sein, ist "${anrede}"`);

// ── Ausgabe ──
console.log('\n════════════════════════════════');
console.log('  SITE-DATA VALIDATION v2');
console.log('════════════════════════════════\n');
if (!errors.length && !warnings.length) { console.log('  ✅ Alles vollständig – bereit für Phase 1b/2\n'); process.exit(0); }
if (errors.length) { console.log('  ❌ FEHLER (blockieren):'); errors.forEach(e => console.log(`     • ${e}`)); console.log(); }
if (warnings.length) { console.log('  ⚠️  WARNUNGEN (nicht blockierend):'); warnings.forEach(w => console.log(`     • ${w}`)); console.log(); }
console.log('════════════════════════════════\n');
process.exit(errors.length ? 1 : 0);
