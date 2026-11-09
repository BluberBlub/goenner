// QA-CRAFT v3.2 – Handwerks-Gate: fängt die wiederkehrenden Ausführungsfehler
// Prüft maschinell, was Textregeln nicht halten konnten:
//  1. Sticky-Contact: versteckt bei Hero + Footer? überlappt nichts?
//  2. Bilder: verzerrt / stark beschnitten ohne Ausschnitt-Steuerung?
//  3. Footer: auf allen Seiten identisch? Footer-Logo kein weißer Kasten?
//  4. Active-State in der Navigation, klickbare Nav, keine toten #-Links
//  5. v2: Erster Bildschirm sofort sichtbar (keine verzögerten Hero-/KPI-Animationen, Alge)
//  6. v2: Hero-CTA auf Mobile ohne Scrollen sichtbar (Alge)
//  7. v2: Kontrast von Schrift auf Fläche (Weiß auf Gelb = Fehler, Opitz/RuckZuck)
//  8. v2: letzte Sektion verschmilzt nicht mit dem Footer (Opitz)
//  9. v2: Hurenkinder (v3: Fehler, Niko "No-Go"; Spöri, Weber)
// 10. v3: Hero = Fenster minus Navigation und Demo-Leiste (Joos, Bioladen, Weber, Spöri), auf allen Seiten gleich
// 11. v3: Text ragt aus seiner Box / Lücken zwischen Wörtern, 320–1440 px (Spöri: pruefe-textrahmen)
// 12. v3: Kein Bild doppelt auf einer Seite (Spöri: "no go")
// 13. v3: Zeilenabstand mehrzeiliger Überschriften: Ober- und Unterlängen dürfen sich nie berühren (Spöri)
// 14. v3: Nebeneinanderliegende Boxen gleich hoch (Spöri: "dauerhafte Regel")
// 15. v3: Einheitlicher Radius (Spöri, Weber, Joos)
// 16. v3: Demo-Leiste ab dem ersten Bildschirm sichtbar (Joos)
// 17. v3.2: Text außerhalb der Contentkante bei 1440 px (Schneider: Hero-Text am Fensterrand, Wischreihe bis
//     zum Rand; Niko "darf nicht passieren"). Gewollt randlos: data-randlos am Element. Fehler.
// 18. v3.2: Große Ziffer neben Text nicht auf einer Höhe (Schneider: nummerierte Listen). Hinweis.
// Aufruf: node qa-craft.js [baseUrl=http://localhost:4321] [--alle] [--limit=12]
import { chromium } from 'playwright';
import { readdirSync, existsSync, readFileSync } from 'fs';

const BASE = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:4321').replace(/\/$/, '');
const errors = [];
const hints = [];
const bad  = (m) => { errors.push(m); console.log('  ✖  ' + m); };
const hint = (m) => { hints.push(m); console.log('  ·  ' + m); };
const ok   = (m) => console.log('  ✔  ' + m);

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
const pages = stichprobe(findPages());

console.log(`\n══════ QA-CRAFT (Handwerks-Gate) ══════`);
console.log(`  ${pages.length} Seiten\n`);

// ── FOOTER STATISCH über ALLE Seiten (dist-HTML, kein Browser – volle Abdeckung) ──
// aria-current markiert die aktuelle Seite und darf sich unterscheiden.
{
  const alleSeiten = findPages();
  const sigs = [];
  for (const p of alleSeiten) {
    const f = 'dist' + (p === '/' ? '/index.html' : p + 'index.html');
    if (!existsSync(f)) continue;
    const html = readFileSync(f, 'utf-8');
    const m = html.match(/<footer[\s\S]*?<\/footer>/i);
    sigs.push([p, m ? m[0].replace(/\s*aria-current="page"/g, '').replace(/\s+/g, ' ') : null]);
  }
  const ref = sigs.find(([, s]) => s);
  if (ref) {
    const abw = sigs.filter(([, s]) => s !== ref[1]).map(([p]) => p);
    if (abw.length) bad(`Footer-HTML weicht statisch ab auf ${abw.length} Seiten: ${abw.slice(0, 6).join(', ')}${abw.length > 6 ? ' …' : ''}`);
    else ok(`Footer statisch identisch auf allen ${sigs.length} Seiten`);
  }
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
      console.log(`     Lösung: "npm run qa" nutzen (startet einen eigenen Server auf freiem Port)`);
      console.log(`     oder in DIESEM Ordner "npm run preview" starten und den Port angeben:`);
      console.log(`     node ${process.argv[1].split(/[\\/]/).pop()} http://localhost:PORT\n`);
      process.exit(2);
    }
  } catch (e) {
    console.log(`\n  ✖  Server ${base} nicht erreichbar – läuft "npm run preview"? (Einfacher: npm run qa)\n`);
    process.exit(2);
  }
}

// ── Im Browser: Sichtbarkeit des ersten Bildschirms messen ──
function messeErstenBildschirm() {
  const AUSNAHMEN = '#demo-bar, #sticky-contact, #cookie-banner, [aria-hidden="true"], #mobile-menu, script, style, noscript';
  const vh = window.innerHeight;
  const deckkraft = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.visibility === 'hidden') return 0;
      o *= parseFloat(cs.opacity);
    }
    return o;
  };
  const out = [];
  document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button, main li, main [data-counter], main span').forEach((el) => {
    if (el.closest(AUSNAHMEN)) return;
    const eigenerText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!eigenerText) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.top >= vh || r.bottom <= 0) return;
    // Hover-Einblendungen (opacity-0 group-hover:opacity-100) sind gewollt unsichtbar
    for (let n = el, i = 0; n && i < 4; n = n.parentElement, i++) {
      if (/hover:opacity|group-hover:/.test(typeof n.className === 'string' ? n.className : '')) return;
    }
    const o = deckkraft(el);
    if (o < 0.5) out.push({ text: (el.innerText || '').trim().slice(0, 50), o: Math.round(o * 100) / 100 });
  });
  return out;
}

// ── Im Browser: Text, der über den Innenrand seiner Box ragt, und Lücken zwischen Wörtern (Spöri) ──
function messeTextrahmen() {
  const out = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (tw.nextNode() && out.length < 6) {
    const n = tw.currentNode;
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('.sr-only,[aria-hidden="true"],script,style,#demo-bar,#cookie-banner,#mobile-menu,svg,[data-textrahmen-frei]')) continue;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    // Karussell/Laufband (waagerecht scrollbar) und bewusst gekürzter Text (… am Ende) sind gewollt
    let vf = el, gewollt = false;
    while (vf && vf !== document.body) { const c = getComputedStyle(vf); if (/(auto|scroll)/.test(c.overflowX) || c.textOverflow === 'ellipsis') { gewollt = true; break; } vf = vf.parentElement; }
    if (gewollt) continue;
    let box = el;
    while (box && box !== document.body) {
      const d = getComputedStyle(box).display;
      if (['block', 'flex', 'grid', 'list-item', 'table-cell', 'inline-block', 'inline-flex'].includes(d)) break;
      box = box.parentElement;
    }
    if (!box || box === document.body) continue;
    const s = getComputedStyle(box);
    if (s.position === 'fixed' || parseFloat(s.opacity) === 0 || s.visibility === 'hidden') continue;
    const br = box.getBoundingClientRect();
    if (br.width === 0) continue;
    const innen = br.right - parseFloat(s.paddingRight) - parseFloat(s.borderRightWidth);
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rects = [...rg.getClientRects()].filter(r => r.width > 0);
    if (!rects.length) continue;
    const rechts = Math.max(...rects.map(x => x.right));
    // auch über den Fensterrand hinaus ist ein Fehler (Box selbst zu breit)
    const zuWeit = rechts - innen > 1.5 ? rechts - innen : (rechts > window.innerWidth + 1 ? rechts - window.innerWidth : 0);
    if (zuWeit > 1.5) out.push({ art: 'rahmen', px: Math.round(zuWeit), text: n.textContent.trim().slice(0, 50) });
  }
  // Lücke an einer Wortbindung (z. B. Flex-Gap um die Bindung, Spöri "Zu den   Stellen")
  document.querySelectorAll('.bind').forEach(bd => {
    if (out.length >= 8) return;
    const vor = bd.previousSibling, nach = bd.nextSibling;
    if (!vor || !nach) return;
    const rg = document.createRange();
    rg.selectNodeContents(vor); const a = [...rg.getClientRects()].pop();
    rg.selectNodeContents(nach); const z = [...rg.getClientRects()][0];
    if (!a || !z || Math.abs(a.top - z.top) > 4) return;
    const em = parseFloat(getComputedStyle(bd.parentElement).fontSize);
    if (z.left - a.right > em * 0.6) out.push({ art: 'luecke', px: Math.round(z.left - a.right), text: (bd.parentElement.textContent || '').trim().slice(0, 40) });
  });
  return out;
}

// ── Im Browser: Desktop-Prüfungen (Hero-Höhe, gleich hohe Boxen, Radius, Überschriften-Zeilenabstand) ──
function messeLayout() {
  const erg = { hero: null, boxen: [], radien: {}, zeilen: [], demo: null, kopfzeilen: [], kante: [], ziffern: [], hoehe: document.documentElement.scrollHeight };
  const main = document.querySelector('main');
  const demo = document.getElementById('demo-bar');
  const demoH = demo && getComputedStyle(demo).display !== 'none' ? demo.getBoundingClientRect().height : 0;
  if (demo) { const r = demo.getBoundingClientRect(); erg.demo = r.height > 0 && r.top < window.innerHeight && parseFloat(getComputedStyle(demo).opacity) > 0.5; }
  // Hero
  const erste = main?.querySelector(':scope > section');
  const hero = document.querySelector('[data-hero]') || (location.pathname === '/' && erste?.querySelector('h1') ? erste : null);
  if (hero && main) {
    const r = hero.getBoundingClientRect();
    const oben = main.getBoundingClientRect().top + window.scrollY;
    erg.hero = { hoehe: Math.round(r.height), soll: Math.round(window.innerHeight - oben - demoH), oben: Math.round(r.top + window.scrollY - oben), markiert: hero.hasAttribute('data-hero') };
  }
  const sichtbar = (cs) => {
    const bg = (cs.backgroundColor.match(/[\d.]+/g) || []).map(Number);
    return (bg.length >= 3 && (bg.length < 4 || bg[3] > 0.05)) || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || (cs.boxShadow && cs.boxShadow !== 'none') || cs.backgroundImage !== 'none';
  };
  // Gleich hohe Boxen: Geschwister in Grid/Flex-Zeile mit sichtbarer Fläche
  main?.querySelectorAll('*').forEach(c => {
    if (erg.boxen.length >= 4) return;
    const cs = getComputedStyle(c);
    if (!(cs.display.includes('grid') || (cs.display.includes('flex') && !cs.flexDirection.startsWith('column')))) return;
    const nurBild = (k) => !(k.innerText || '').trim() && k.querySelector('img, picture, video, svg');
    const kinder = [...c.children].filter(k => { const r = k.getBoundingClientRect(); return r.width > 60 && r.height > 40 && sichtbar(getComputedStyle(k)) && !['IMG', 'PICTURE', 'svg'].includes(k.tagName) && !(['A', 'BUTTON'].includes(k.tagName) && r.height < 100) && !nurBild(k); });
    if (kinder.length < 2) return;
    const reihen = new Map();
    kinder.forEach(k => { const r = k.getBoundingClientRect(); const key = Math.round(r.top / 4); (reihen.get(key) || reihen.set(key, []).get(key)).push(r.height); });
    // Überschriften einer Kartenreihe gleich viele Zeilen (Schwabenpflege: Niko-Regel)
    if (erg.kopfzeilen.length < 3) {
      const nachReihe = new Map();
      kinder.forEach(k => {
        const h = k.querySelector('h2, h3, h4');
        if (!h) return;
        const cs = getComputedStyle(h);
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        const key = Math.round(k.getBoundingClientRect().top / 4);
        (nachReihe.get(key) || nachReihe.set(key, []).get(key)).push({ z: Math.round(h.getBoundingClientRect().height / lh), t: h.innerText.trim().slice(0, 30) });
      });
      for (const liste of nachReihe.values()) {
        if (liste.length < 2) continue;
        const zs = liste.map(x => x.z);
        if (Math.max(...zs) !== Math.min(...zs)) { erg.kopfzeilen.push(liste.map(x => `"${x.t}" ${x.z}`).join(' / ')); break; }
      }
    }
    for (const hs of reihen.values()) {
      if (hs.length < 2) continue;
      if (Math.max(...hs) - Math.min(...hs) > 3) { erg.boxen.push({ text: (c.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50), hoehen: hs.map(Math.round).join('/') }); break; }
    }
  });
  // Radien sichtbarer Flächen (Pillen und Kreise zählen nicht, sie sind gewollt rund)
  document.querySelectorAll('main *, header *, footer *').forEach(e => {
    const r = e.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) return;
    const cs = getComputedStyle(e);
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    if (rad < 3 || rad >= Math.min(r.width, r.height) / 2 - 1) return;
    if (!(sichtbar(cs) || e.tagName === 'IMG' || e.tagName === 'VIDEO')) return;
    if (e.closest('#demo-bar,#cookie-banner,#sticky-contact,#mobile-menu,[data-radius-frei]')) return;
    const k = Math.round(rad);
    (erg.radien[k] ||= []).push((e.className && typeof e.className === 'string' ? e.className.split(' ').find(x => x.startsWith('rounded')) : '') || e.tagName.toLowerCase());
  });
  // Contentkante: Abstand wie .container (Header-Container als Maß), gemessen an der echten Textausdehnung
  const ref = document.querySelector('header .container') || document.querySelector('main .container');
  if (ref && window.innerWidth >= 1200) {
    const rr = ref.getBoundingClientRect(), rcs = getComputedStyle(ref);
    const links = rr.left + parseFloat(rcs.paddingLeft), rechts = rr.right - parseFloat(rcs.paddingRight);
    const gesehen = new Set();
    main?.querySelectorAll('h1, h2, h3, p, li, blockquote, dt, dd').forEach(el => {
      if (erg.kante.length >= 4) return;
      if (el.closest('[data-randlos], #sticky-contact, #cookie-banner, #demo-bar, astro-island, [aria-hidden="true"]')) return;
      let p = el.parentElement, scrollt = false;
      while (p && p !== main) { const ox = getComputedStyle(p).overflowX; if (ox === 'auto' || ox === 'scroll') { scrollt = true; break; } p = p.parentElement; }
      if (scrollt) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) return;
      const rg = document.createRange(); rg.selectNodeContents(el);
      const rs = [...rg.getClientRects()].filter(r => r.width > 1 && r.height > 1);
      if (!rs.length) return;
      const l = Math.min(...rs.map(r => r.left)), r = Math.max(...rs.map(r => r.right));
      if (l < links - 2 || r > rechts + 2) {
        const t = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
        if (!t || gesehen.has(t)) return;
        gesehen.add(t);
        erg.kante.push({ text: t, um: Math.round(Math.max(links - l, r - rechts)) });
      }
    });
  }
  // Große Ziffer (01, 2, 3.) neben Text: Mitte (zur Überschrift) oder Grundlinie (zum Text) auf gleicher Höhe
  main?.querySelectorAll('*').forEach(z => {
    if (erg.ziffern.length >= 3 || z.children.length) return;
    if (!/^0?\d{1,2}[.)]?$/.test((z.textContent || '').trim())) return;
    const zcs = getComputedStyle(z);
    if (parseFloat(zcs.fontSize) < 24 || zcs.display === 'none') return;
    const nb = z.nextElementSibling || z.parentElement?.nextElementSibling;
    if (!nb || !(nb.innerText || '').trim()) return;
    const zr = z.getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(nb);
    const erste = [...rg.getClientRects()].find(r => r.width > 1 && r.height > 1);
    if (!erste || erste.left < zr.right - 2 || erste.left - zr.right > 200 || erste.top > zr.bottom || erste.bottom < zr.top) return;   // nur rechts daneben (Kennzahlen mit Text darunter zählen nicht)
    const mitte = Math.abs((zr.top + zr.bottom) / 2 - (erste.top + erste.bottom) / 2);
    const grund = Math.abs(zr.bottom - erste.bottom);
    if (Math.min(mitte, grund) > 8) erg.ziffern.push({ z: z.textContent.trim(), text: (nb.innerText || '').trim().slice(0, 30), um: Math.round(Math.min(mitte, grund)) });
  });
  // Zeilenabstand mehrzeiliger Überschriften
  document.querySelectorAll('main h1, main h2, main h3').forEach(h => {
    const cs = getComputedStyle(h);
    const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
    if (!fs || !lh) return;
    const zeilen = Math.round(h.getBoundingClientRect().height / lh);
    if (zeilen >= 2 && lh / fs < 1.12) erg.zeilen.push({ text: h.innerText.trim().slice(0, 40), wert: (lh / fs).toFixed(2) });
  });
  return erg;
}

// ── Im Browser: Kontrast aller Texte im aktuellen Ausschnitt ──
function messeKontrast() {
  const parse = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const ueber = (oben, unten) => {
    const a = oben.a + unten.a * (1 - oben.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const f = (k) => (oben[k] * oben.a + unten[k] * unten.a * (1 - oben.a)) / a;
    return { r: f('r'), g: f('g'), b: f('b'), a };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const kontrast = (x, y) => { const [h, d] = [lum(x), lum(y)].sort((a, b) => b - a); return (h + 0.05) / (d + 0.05); };
  const hex = (c) => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const MEDIEN = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME']);
  const out = [];
  const vh = window.innerHeight, vw = window.innerWidth;
  document.querySelectorAll('body *').forEach((el) => {
    if (el.dataset.qaKontrast) return;
    if (el.closest('[aria-hidden="true"], #demo-bar, script, style, noscript, svg')) return;
    const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (text.length < 3) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cx = r.left + Math.min(r.width, 40) / 2, cy = r.top + r.height / 2;
    if (cy < 0 || cy > vh || cx < 0 || cx > vw) return;
    const stapel = document.elementsFromPoint(cx, cy);
    const oben = stapel[0];
    // verdeckt (fixer Header o. Ä. liegt darüber): später in einem anderen Ausschnitt messen
    if (!oben || !(oben === el || el.contains(oben) || oben.contains(el))) return;
    el.dataset.qaKontrast = '1';
    const cs = getComputedStyle(el);
    let deck = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) deck *= parseFloat(getComputedStyle(n).opacity);
    if (deck < 0.1 || cs.visibility === 'hidden') return;
    // Hintergrund unter dem Text von oben nach unten zusammensetzen
    let bg = { r: 0, g: 0, b: 0, a: 0 };
    let unbekannt = false;
    for (const s of stapel) {
      if (MEDIEN.has(s.tagName)) { unbekannt = true; break; }
      const sc = getComputedStyle(s);
      if (sc.backgroundImage && sc.backgroundImage !== 'none') { unbekannt = true; break; }
      const c = parse(sc.backgroundColor);
      if (c && c.a > 0) {
        const o = parseFloat(sc.opacity);
        bg = ueber(bg, { ...c, a: c.a * (isNaN(o) ? 1 : o) });   // bisheriges liegt oben
        if (bg.a >= 0.99) break;
      }
    }
    if (unbekannt) return;
    if (bg.a < 0.99) bg = ueber(bg, { r: 255, g: 255, b: 255, a: 1 });
    const fg0 = parse(cs.color);
    if (!fg0) return;
    const fg = ueber({ ...fg0, a: fg0.a * deck }, bg);
    const k = kontrast(fg, bg);
    const px = parseFloat(cs.fontSize), fett = parseInt(cs.fontWeight) >= 700;
    const gross = px >= 24 || (px >= 18.5 && fett);
    out.push({ k: Math.round(k * 100) / 100, gross, fg: hex(fg), bg: hex(bg), text: text.slice(0, 40), tag: el.tagName.toLowerCase() });
  });
  return out;
}

const browser = await chromium.launch();
const guardPage = await browser.newPage();
await pruefeProjekt(guardPage, BASE);
await guardPage.close();
const footers = {};
const heroHoehen = { start: null, unterseiten: [] };
const radienGesamt = {};
const kontrastFehler = new Map();   // "fg|bg" -> {k, text, seiten:Set}
const kontrastHinweise = new Map();

for (const path of pages) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  try {
    // ── 0. ERSTER BILDSCHIRM SOFORT SICHTBAR (Alge: Hero/KPIs nie verzögert einblenden) ──
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(150);
    const frueh = await page.evaluate(messeErstenBildschirm);
    await page.waitForTimeout(1050);
    const spaet = await page.evaluate(messeErstenBildschirm);
    const verzoegert = spaet.filter(s => {
      const f = frueh.find(x => x.text === s.text);
      return s.o === 0 || (f && s.o > f.o);   // unsichtbar geblieben ODER blendet noch ein
    });
    for (const s of verzoegert)
      bad(`Im ersten Bildschirm nach 1,2 s noch unsichtbar auf ${path}: "${s.text}" (Deckkraft ${s.o}) – Hero und Kennzahlen sofort zeigen, Animation nur unterhalb (data-reveal aus dem Kit)`);
    const fruehNurKurz = frueh.filter(f => !spaet.some(s => s.text === f.text));
    if (fruehNurKurz.length)
      hint(`Erster Bildschirm blendet ein auf ${path} (${fruehNurKurz.length} Elemente, z. B. "${fruehNurKurz[0].text}") – Niko will Hero/KPIs sofort sichtbar`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // Sanftes Scrollen (scroll-behavior: smooth) würde alle Messungen nach scrollTo verfälschen
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

    // ── 0b. HERO-CTA OHNE SCROLLEN (Mobile) ──
    const heroCta = async () => page.evaluate(() => {
      const hero = document.querySelector('main > section:first-of-type') || document.querySelector('main > *:first-child');
      if (!hero) return null;
      const knopf = [...hero.querySelectorAll('a[href], button')].find(el => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (r.width < 60 || r.height < 30) return false;
        const bg = cs.backgroundColor.match(/[\d.]+/g) || [];
        const flaeche = bg.length >= 3 && (bg.length < 4 || parseFloat(bg[3]) > 0.5);
        const rahmen = parseFloat(cs.borderTopWidth) >= 1 && parseFloat(cs.paddingLeft) >= 8;
        return flaeche || rahmen;
      });
      if (!knopf) return null;
      const r = knopf.getBoundingClientRect();
      return { text: (knopf.innerText || '').trim().slice(0, 40), unten: Math.round(r.bottom + window.scrollY) };
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    const cta = await heroCta();
    if (cta && cta.unten > 844)
      bad(`Hero-Button "${cta.text}" auf ${path} erst nach Scrollen sichtbar (Unterkante ${cta.unten}px bei 390×844) – Button höher setzen bzw. Inhalt im Hero nach oben/mittig ausrichten (Hero bleibt Fensterhöhe minus Navigation)`);
    if (cta && path === '/') {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(250);
      const klein = await heroCta();
      if (klein && klein.unten > 667) hint(`Hero-Button "${klein.text}" auf kleinem iPhone (375×667) erst nach Scrollen sichtbar (${klein.unten}px)`);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(250);
    }

    // ── 1. BILD-VERZERRUNG ──
    const distorted = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('img').forEach(img => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const r = img.getBoundingClientRect();
        if (r.width < 30 || r.height < 30) return;
        const cs = getComputedStyle(img);
        // object-fit:cover/contain schneidet zu -> keine Verzerrung
        if (['cover','contain','none','scale-down'].includes(cs.objectFit)) return;
        const natural = img.naturalWidth / img.naturalHeight;
        const rendered = r.width / r.height;
        const abw = Math.abs(rendered - natural) / natural;
        if (abw > 0.03) out.push({ src: img.getAttribute('src') || '?',
          natural: natural.toFixed(2), rendered: rendered.toFixed(2), abw: Math.round(abw*100) });
      });
      return out;
    });
    for (const d of distorted) bad(`Bild verzerrt auf ${path}: ${d.src} (${d.abw}% Abweichung, natürlich ${d.natural} vs. gerendert ${d.rendered}) – object-fit:cover setzen oder Maße korrigieren`);

    // ── 2. STICKY-CONTACT VERHALTEN ──
    const sticky = page.locator('#sticky-contact, [class*="sticky-contact"], [data-sticky-contact]').first();
    if (await sticky.count()) {
      // a) Am Seitenanfang (Hero sichtbar) -> sollte NICHT sichtbar sein
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(2600); // verzögertes Einblenden (2s) abwarten
      const sichtbarImHero = await sticky.isVisible().catch(() => false);
      const opacity0 = await sticky.evaluate(el => parseFloat(getComputedStyle(el).opacity) < 0.1).catch(() => false);
      if (sichtbarImHero && !opacity0) bad(`Sticky-Contact im Hero sichtbar auf ${path} – muss ausgeblendet sein`);

      // b) Ganz unten (Footer sichtbar) -> sollte NICHT sichtbar sein
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(900);
      const sichtbarImFooter = await sticky.isVisible().catch(() => false);
      const opacity0b = await sticky.evaluate(el => parseFloat(getComputedStyle(el).opacity) < 0.1).catch(() => false);
      if (sichtbarImFooter && !opacity0b) bad(`Sticky-Contact über Footer sichtbar auf ${path} – muss ausgeblendet sein`);

      // c) Überlappung mit Inhalt (Mitte der Seite)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(700);
      const ueberlappt = await page.evaluate(() => {
        const s = document.querySelector('#sticky-contact, [class*="sticky-contact"], [data-sticky-contact]');
        if (!s) return null;
        const cs = getComputedStyle(s);
        if (parseFloat(cs.opacity) < 0.1 || cs.display === 'none') return null;
        const r = s.getBoundingClientRect();
        if (r.width === 0) return null;
        // Was liegt in der Mitte des Sticky-Buttons?
        const el = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        if (!el) return null;
        if (s.contains(el) || el.contains(s)) return null;
        const txt = (el.textContent || '').trim().slice(0, 60);
        return txt.length > 3 ? txt : null;
      });
      if (ueberlappt) bad(`Sticky-Contact überlappt Inhalt auf ${path}: "${ueberlappt}" – Abstand/z-index oder Ausblende-Logik prüfen`);
    }


    // ── 6. KLICKBARKEIT: Nav/Buttons dürfen nicht durch Animationen blockiert sein ──
    const unklickbar = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('header a, header button, nav a, nav button').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return; // bewusst versteckt (Mobile-Menü zu)
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.5) out.push({ was: (el.innerText||el.ariaLabel||'?').slice(0,30), grund: `opacity ${cs.opacity}` });
        else if (cs.pointerEvents === 'none') out.push({ was: (el.innerText||'?').slice(0,30), grund: 'pointer-events:none' });
      });
      return out;
    });
    for (const u of unklickbar)
      bad(`Nicht klickbar auf ${path}: "${u.was}" (${u.grund}) – Animations-Ausgangszustand opacity:0 auf interaktiven Elementen verboten`);

    // ── 6a. TIPPFLÄCHEN (Handy): mindestens 24×24 px, sonst trifft der Daumen daneben (WCAG 2.5.8) ──
    const klein = await page.evaluate(() => [...document.querySelectorAll('main a[href], main button, footer a[href], header button')].filter(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      if (getComputedStyle(el).display === 'inline' && el.closest('p, li, dd')) return false;   // Links im Fließtext sind ausgenommen
      return r.width < 24 || r.height < 24;
    }).slice(0, 4).map(el => `${(el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 25)} (${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)})`));
    if (klein.length) hint(`Kleine Tippflächen auf ${path} (390px): ${klein.join(', ')} – mindestens 24×24 px (Padding vergrößern)`);

    // ── 6b. TOTE LINKS (#, leer) – Opitz: "Service" im Footer führte ins Nichts ──
    const tot = await page.evaluate(() => [...document.querySelectorAll('a[href]')].filter(a => {
      const h = (a.getAttribute('href') ?? '').trim();
      if (h !== '' && h !== '#' && !/^javascript:/i.test(h)) return false;
      if (a.getAttribute('role') === 'button' || a.hasAttribute('aria-controls')) return false;
      return true;
    }).map(a => ({ text: (a.innerText || a.getAttribute('aria-label') || '?').trim().slice(0, 30), wo: a.closest('footer') ? 'Footer' : a.closest('header') ? 'Header' : 'Inhalt' })));
    for (const t of tot.slice(0, 5))
      bad(`Toter Link "${t.text}" (${t.wo}) auf ${path} – auf eine echte Seite verlinken; Menüpunkte ohne eigene Seite in site-data navigation mit children und ohne "#"-Link anlegen`);

    // ── 3. FOOTER-KONSISTENZ (voller Text + Linkstruktur) ──
    const footerSig = await page.evaluate(() => {
      const f = document.querySelector('footer');
      if (!f) return null;
      const text = (f.innerText || '').replace(/\s+/g, ' ').trim();
      const links = [...f.querySelectorAll('a')].map(a => a.getAttribute('href') || '').sort().join('|');
      const cols = f.querySelectorAll('div[class*="grid"] > div, ul').length;
      const cs = getComputedStyle(f);
      const farben = `${cs.backgroundColor}|${cs.color}`;
      return { text, links, cols, farben };
    });
    footers[path] = footerSig;

    // ── 3b. FOOTER-LOGO: einfarbig gefiltert, aber ohne Transparenz = weißer Kasten (Opitz) ──
    if (path === pages[0]) {
      const kasten = await page.evaluate(async () => {
        const img = [...document.querySelectorAll('footer img')].find(i => /brightness\(0\)/.test(getComputedStyle(i).filter));
        if (!img) return null;
        if (!img.complete) await new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 3000); });
        if (!img.naturalWidth) return null;
        const w = Math.min(img.naturalWidth, 240), h = Math.max(1, Math.round(img.naturalHeight * w / img.naturalWidth));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        try { ctx.drawImage(img, 0, 0, w, h); } catch { return null; }
        let d; try { d = ctx.getImageData(0, 0, w, h).data; } catch { return null; }
        let transparent = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] < 16) transparent++;
        return { src: img.getAttribute('src'), anteil: transparent / (w * h) };
      });
      if (kasten && kasten.anteil < 0.03)
        bad(`Footer-Logo wird zur einfarbigen Fläche (${kasten.src} hat keinen transparenten Hintergrund) – meta.logoFooterStil = "platte" setzen oder helle Logo-Version als meta.logoFooter`);
    }

    // ── 3c. LETZTE SEKTION VERSCHMILZT MIT FOOTER (Opitz) ──
    const verschmolzen = await page.evaluate(() => {
      const f = document.querySelector('footer');
      const main = document.querySelector('main');
      const letzte = main ? [...main.children].filter(e => !['SCRIPT', 'STYLE'].includes(e.tagName)).pop() : null;
      if (!f || !letzte) return null;
      const a = getComputedStyle(letzte), b = getComputedStyle(f);
      if (a.backgroundImage !== 'none' || letzte.querySelector(':scope > img, :scope > picture, :scope > video')) return null;
      const p = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      const [r1, g1, b1, a1 = 1] = p(a.backgroundColor), [r2, g2, b2] = p(b.backgroundColor);
      if (a1 < 0.9) return null;
      const abstand = Math.hypot(r1 - r2, g1 - g2, b1 - b2);
      return abstand < 18 ? (letzte.querySelector('h2, h3')?.innerText || '').trim().slice(0, 40) : null;
    });
    if (verschmolzen !== null)
      bad(`Letzte Sektion ("${verschmolzen}") hat dieselbe Farbe wie der Footer auf ${path} – verschmilzt zu einem Block. <Cta> aus dem Kit nutzen oder andere Fläche`);

    // ── 4. ACTIVE-STATE IN NAVIGATION ──
    const navAktiv = await page.evaluate((current) => {
      const norm = (h) => (h || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
      const links = [...document.querySelectorAll('nav a, header a')];
      const treffer = links.filter(a => norm(a.getAttribute('href')) === norm(current));
      if (!treffer.length) return { gefunden: false, markiert: false };
      const markiert = treffer.some(a => {
        if (a.getAttribute('aria-current')) return true;
        if (/active|aktiv|current/i.test(a.className)) return true;
        // Styling-Vergleich: unterscheidet sich der Link von seinen Geschwistern?
        const cs = getComputedStyle(a);
        const andere = links.filter(x => x !== a && norm(x.getAttribute('href')) !== norm(current));
        if (!andere.length) return false;
        const ref = getComputedStyle(andere[0]);
        return cs.color !== ref.color || cs.fontWeight !== ref.fontWeight ||
               cs.borderBottomWidth !== ref.borderBottomWidth ||
               cs.textDecorationLine !== ref.textDecorationLine;
      });
      return { gefunden: true, markiert };
    }, path);
    if (navAktiv.gefunden && !navAktiv.markiert)
      bad(`Kein Active-State in der Navigation auf ${path} – Nutzer sieht nicht, wo er ist (aria-current + sichtbare Hervorhebung, Desktop UND Mobile)`);

    // ── 5. BILD-ZUSCHNITT (object-fit: cover, aber extremer Beschnitt) ──
    const crops = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('img').forEach(img => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const cs = getComputedStyle(img);
        if (cs.objectFit !== 'cover') return;
        const r = img.getBoundingClientRect();
        if (r.width < 60 || r.height < 60) return;
        const nat = img.naturalWidth / img.naturalHeight;
        const box = r.width / r.height;
        const faktor = Math.max(nat, box) / Math.min(nat, box);
        if (faktor <= 1.5) return;
        // Starker Beschnitt ist auf Mobile normal – kritisch nur ohne Bildausschnitt-Steuerung
        const op = (cs.objectPosition || '').trim();
        const standard = /^(50% 50%|center|center center)$/.test(op);
        const artDirection = img.closest('picture') !== null || img.hasAttribute('srcset');
        if (standard && !artDirection) out.push({ src: img.getAttribute('src') || '?',
          nat: nat.toFixed(2), box: box.toFixed(2), faktor: faktor.toFixed(1) });
      });
      return out;
    });
    for (const cr of crops)
      bad(`Bild stark beschnitten OHNE Ausschnitt-Steuerung auf ${path}: ${cr.src} (Original ${cr.nat}, Slot ${cr.box} – Faktor ${cr.faktor}). object-position setzen (z.B. object-[50%_30%] damit das Motiv sichtbar bleibt) oder <picture> mit eigenem Mobile-Crop`);

    // Stil-Muster ist ein Arbeitsblatt (zeigt absichtlich Alternativen): keine Text-/Kontrastprüfung
    if (/stil-muster/.test(path)) { await page.close(); continue; }

    // ── 7. HURENKINDER (Hinweis): letztes Wort allein in der letzten Zeile ──
    const waisen = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('main h1, main h2, main h3, main p').forEach(el => {
        if (out.length >= 4) return;
        const r0 = el.getBoundingClientRect();
        if (r0.width === 0) return;
        if ((el.innerText || '').trim().split(/\s+/).length < 4) return;   // 2-3 Wörter: Umbruch unvermeidbar
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let letzter = null;
        while (w.nextNode()) if (w.currentNode.textContent.trim()) letzter = w.currentNode;
        if (!letzter) return;
        const t = letzter.textContent.replace(/\s+$/, '');
        const ende = t.length, anfang = t.search(/\S+$/);
        const davor = t.slice(0, anfang).search(/\S+\s*$/);
        if (anfang <= 0 || davor < 0) return;
        const rng = (a, b) => { const r = document.createRange(); r.setStart(letzter, a); r.setEnd(letzter, b); return r.getBoundingClientRect(); };
        const rl = rng(anfang, ende), rv = rng(davor, anfang);
        const cs = getComputedStyle(el);
        const zeilen = Math.round(r0.height / (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2));
        // Erlaubt: lange Wortpaare, die die Middleware auf schmalen Handys bewusst umbrechen lässt
        if (el.querySelector('.bind--lang, .wort-ganz--lang') && window.innerWidth < 480) return;
        if (zeilen >= 2 && rl.top - rv.top > 4 && t.slice(anfang).length <= 14)
          out.push(`${el.tagName.toLowerCase()}: "…${t.slice(Math.max(0, davor - 20), ende).trim()}"`);
      });
      return out;
    });
    for (const wz of waisen) bad(`Hurenkind auf ${path} (390px) ${wz} – letzte zwei Wörter zusammenhalten (src/middleware.ts aus dem Kit oder &nbsp;)`);

    // ── 12. KEIN BILD DOPPELT AUF EINER SEITE (Spöri: "no go") ──
    const doppelt = await page.evaluate(() => {
      const zaehl = new Map();
      document.querySelectorAll('main img').forEach(img => {
        const r = img.getBoundingClientRect();
        if (r.width < 80 || r.height < 60) return;
        if (img.closest('[aria-hidden="true"]')) return;   // geklonte Laufband-Bilder
        const src = (img.currentSrc || img.src || '').split(/[?#]/)[0];
        // nur die Varianten-Endungen von bild-formate.js entfernen (bad-2023 und bad-2024 bleiben verschieden)
        const name = src.split('/').pop().replace(/\.(jpe?g|png|webp|avif)$/i, '').replace(/-800$/i, '');
        if (!name || /logo|icon|siegel/i.test(name)) return;
        zaehl.set(name, (zaehl.get(name) || 0) + 1);
      });
      return [...zaehl].filter(([, n]) => n > 1).map(([nm, n]) => `${nm} (${n}×)`);
    });
    if (doppelt.length) bad(`Bild doppelt auf ${path}: ${doppelt.join(', ')} – jedes Foto nur einmal pro Seite (auch Hero und Abschluss-CTA)`);

    // ── 11. TEXT AUSSERHALB VON BOXEN / LÜCKEN (320–1440 px) ──
    const rahmenFunde = new Map();
    await page.addStyleTag({ content: '.rv-warten{opacity:1!important;transform:none!important}' });   // noch nicht eingeblendete Elemente stehen sonst versetzt
    for (const breite of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width: breite, height: 900 });
      await page.waitForTimeout(350);   // Kit löst überstehende Wortbindungen nach 120 ms
      for (const f of await page.evaluate(messeTextrahmen)) {
        const k = `${f.art}|${f.text}`;
        if (!rahmenFunde.has(k)) rahmenFunde.set(k, { ...f, breite });
      }
    }
    for (const f of [...rahmenFunde.values()].slice(0, 5)) {
      if (f.art === 'rahmen') bad(`Text ragt ${f.px}px aus seiner Box auf ${path} bei ${f.breite}px: "${f.text}" – Wortfugen in site-data.json umbruch.trennstellen eintragen (z. B. "Lohn|buchhaltung"), Schrift kleiner oder Box breiter. Nie mitten im Wort trennen`);
      else bad(`Lücke zwischen Wörtern (${f.px}px) auf ${path} bei ${f.breite}px: "${f.text}" – Wortbindung liegt in einem Flex-/Grid-Element (gap). Text in ein eigenes <span> legen`);
    }

    // ── 10/13–16. DESKTOP: Hero-Höhe, gleich hohe Boxen, Radius, Zeilenabstand, Demo-Leiste ──
    for (const [bw, bh] of [[1440, 900], [390, 844]]) {
      await page.setViewportSize({ width: bw, height: bh });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(250);
      const l = await page.evaluate(messeLayout);
      if (bw < 768 && l.hoehe > 12000) hint(`Seite ${path} ist auf dem Handy ${Math.round(l.hoehe / 1000)}.000 px lang – Kartengruppen als Wisch-Reihe (class="wisch") statt gestapelt (Schwabenpflege)`);
      if (l.demo === false) bad(`Demo-Leiste auf ${path} bei ${bw}px im ersten Bildschirm nicht sichtbar – sie muss immer sichtbar sein (Kit DemoBar v5)`);
      if (l.hero) {
        const diff = l.hero.hoehe - l.hero.soll;
        if (bw >= 1024 ? Math.abs(diff) > 6 : diff < -6)
          bad(`Hero auf ${path} bei ${bw}×${bh}: ${l.hero.hoehe}px statt ${l.hero.soll}px (Fenster minus Navigation${l.demo !== null ? ' und Demo-Leiste' : ''}) – Höhe min-h-[var(--hero-h)] bzw. h-[var(--hero-h)] aus dem BaseLayout nutzen${l.hero.markiert ? '' : ' und data-hero setzen'}`);
      } else if (path === '/' && bw === 1440) hint('Startseite ohne erkennbaren Hero (erste Sektion in <main>) – Hero-Höhe nicht geprüft');
      if (bw !== 1440) continue;
      if (path === '/') heroHoehen.start = l.hero?.hoehe; else if (l.hero) heroHoehen.unterseiten.push([path, l.hero.hoehe]);
      for (const b of l.boxen) bad(`Nebeneinanderliegende Boxen ungleich hoch auf ${path} (${b.hoehen}px) bei "${b.text}…" – gleiche Höhe (Grid ohne items-start, h-full in den Karten)`);
      for (const kz of l.kopfzeilen) bad(`Überschriften einer Kartenreihe mit unterschiedlicher Zeilenzahl auf ${path}: ${kz} – Titel kürzen oder angleichen, die Reihe soll ruhig wirken`);
      for (const k of l.kante) bad(`Text außerhalb der Contentkante auf ${path} bei 1440 px: "${k.text}…" (${k.um}px darüber) – Inhalt in .container oder padding-left: var(--rand) mit .buehne-huelle; gewollt randlos nur mit data-randlos`);
      for (const z of l.ziffern) hint(`Ziffer "${z.z}" neben "${z.text}…" auf ${path} nicht auf einer Höhe (${z.um}px versetzt) – zur Überschrift mittig, zum Fließtext auf die Grundlinie der ersten Zeile`);
      for (const z of l.zeilen) bad(`Überschrift mit zu engem Zeilenabstand auf ${path}: "${z.text}" (${z.wert}) – mindestens 1.15, Ober- und Unterlängen dürfen sich nie berühren`);
      for (const [px, wer] of Object.entries(l.radien)) { (radienGesamt[px] ||= { n: 0, wer: new Set(), seiten: new Set() }); radienGesamt[px].n += wer.length; wer.slice(0, 3).forEach(w => radienGesamt[px].wer.add(w)); radienGesamt[px].seiten.add(path); }
    }
    await page.setViewportSize({ width: 390, height: 844 });

    // ── 8. KONTRAST (ganze Seite, Animationen aus) ──
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}.rv-warten{opacity:1!important;transform:none!important}.sc-wort{opacity:1!important}#cookie-banner,#sticky-contact,#demo-bar{display:none!important}' });
    const hoehe = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < hoehe; y += 600) {
      await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
      await page.waitForTimeout(120);
      const werte = await page.evaluate(messeKontrast);
      for (const v of werte) {
        const schluessel = `${v.fg}|${v.bg}`;
        const grenze = v.gross ? 3 : 4.5;
        if (v.k < 2) {
          const e = kontrastFehler.get(schluessel) || { k: v.k, text: v.text, seiten: new Set() };
          e.seiten.add(path); kontrastFehler.set(schluessel, e);
        } else if (v.k < grenze) {
          const e = kontrastHinweise.get(schluessel) || { k: v.k, text: v.text, gross: v.gross, seiten: new Set() };
          e.seiten.add(path); kontrastHinweise.set(schluessel, e);
        }
      }
    }

  } catch (e) {
    bad(`${path}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}
await browser.close();

// Kontrast-Auswertung (je Farbpaar einmal)
for (const [paar, e] of kontrastFehler) {
  const [fg, bg] = paar.split('|');
  bad(`Unlesbar: Schrift ${fg} auf ${bg} (Kontrast ${e.k}:1, z. B. "${e.text}") auf ${[...e.seiten].slice(0, 4).join(', ')} – auf Farbflächen text-on-primary/-accent nutzen statt Farbe von Hand`);
}
for (const [paar, e] of [...kontrastHinweise].slice(0, 8)) {
  const [fg, bg] = paar.split('|');
  hint(`Schwacher Kontrast: ${fg} auf ${bg} (${e.k}:1, ${e.gross ? 'große Schrift, Ziel 3' : 'Ziel 4.5'}) z. B. "${e.text}" auf ${[...e.seiten].slice(0, 3).join(', ')}`);
}

// Radius-Auswertung: höchstens zwei Werte (Knopf + Karte, Pillen zählen nicht)
const radienListe = Object.entries(radienGesamt).sort((a, b) => b[1].n - a[1].n);
if (radienListe.length > 2)
  bad(`Uneinheitlicher Radius: ${radienListe.map(([px, e]) => `${px}px (${e.n}×, z. B. ${[...e.wer].slice(0, 2).join(' ')} auf ${[...e.seiten][0]})`).join(' · ')} – überall rounded-knopf / rounded-karte aus dem Kit (design.radius in site-data.json)`);
else if (radienListe.length) ok(`Radius einheitlich (${radienListe.map(([px]) => px + 'px').join(', ')})`);

// Unterseiten-Heros gleich hoch (folgt aus der Hero-Regel, eigene Meldung zur Übersicht)
{
  const hs = heroHoehen.unterseiten;
  if (hs.length > 1 && Math.max(...hs.map(h => h[1])) - Math.min(...hs.map(h => h[1])) > 6)
    bad(`Unterseiten-Heros unterschiedlich hoch bei 1440×900: ${hs.map(([p, h]) => `${p} ${h}px`).join(', ')} – auf allen Seiten gleich (PageHero aus dem Kit)`);
}

// Footer-Auswertung
const sigs = Object.entries(footers).filter(([, v]) => v);
if (!sigs.length) bad('Kein <footer> gefunden');
else {
  const ref = sigs[0][1];
  const diffText = sigs.filter(([, v]) => v.text !== ref.text).map(([p]) => p);
  const diffLinks = sigs.filter(([, v]) => v.links !== ref.links).map(([p]) => p);
  const diffCols = sigs.filter(([, v]) => v.cols !== ref.cols).map(([p]) => p);
  if (diffText.length) bad(`Footer-TEXT weicht ab auf: ${diffText.join(', ')} (Referenz: ${sigs[0][0]})`);
  if (diffLinks.length) bad(`Footer-LINKS weichen ab auf: ${diffLinks.join(', ')} – überall dieselben Links`);
  if (diffCols.length) bad(`Footer-STRUKTUR (Spaltenzahl) weicht ab auf: ${diffCols.join(', ')}`);
  const diffFarben = sigs.filter(([, v]) => v.farben !== ref.farben).map(([p, v]) => `${p} (${v.farben})`);
  if (diffFarben.length) bad(`Footer-FARBEN weichen ab auf: ${diffFarben.join(', ')} – Referenz ${ref.farben}. Footer muss überall identisch aussehen.`);
  if (!diffText.length && !diffLinks.length && !diffCols.length && !diffFarben.length)
    ok(`Footer auf allen ${sigs.length} Seiten identisch (Text, Links, Struktur, Farben)`);
}

if (!errors.length) ok('Keine Handwerksfehler gefunden');
console.log(`\n  ${errors.length} Fehler, ${hints.length} Hinweise\n`);
process.exit(errors.length ? 1 : 0);
