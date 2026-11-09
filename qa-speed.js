// QA-SPEED v2 – PageSpeed-Gate: Lighthouse lokal, Mobile (dieselbe Messung wie PageSpeed Insights) + Startseite Desktop
// Alge-Learning: 100/100 ist erreichbar. Dieses Gate misst es bei jedem QA-Lauf,
// statt dass Niko es hinterher von Hand optimiert.
// Aufruf: node qa-speed.js [baseUrl=http://localhost:4321] [--seiten=3]
// Grenzen: Performance < 90 = Fehler (Joos), < 95 = Hinweis mit den größten Bremsen.
//          Barrierefreiheit/Best Practices < 90, SEO < 95 = Fehler.
//          SEO ohne "noindex"-Abzug, solange meta.staging = true (Demo/Staging ist gewollt noindex).
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';

const BASE = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:4321').replace(/\/$/, '');
const anzahl = parseInt((process.argv.find(a => a.startsWith('--seiten=')) || '').split('=')[1]) || 3;
const errors = [], hints = [];
const bad  = (m) => { errors.push(m); console.log('  ✖  ' + m); };
const hint = (m) => { hints.push(m); console.log('  ·  ' + m); };
const ok   = (m) => console.log('  ✔  ' + m);

let lighthouse, chromeLauncher, chromium;
try {
  lighthouse = (await import('lighthouse')).default;
  chromeLauncher = await import('chrome-launcher');
  ({ chromium } = await import('playwright'));
} catch (e) {
  console.log('\n  ✖  qa-speed: Lighthouse fehlt – im Projektordner "npm install" ausführen.\n');
  process.exit(1);
}

let staging = false;
try { staging = JSON.parse(readFileSync('src/content/site-data.json', 'utf-8')).meta?.staging === true; } catch {}

// Seiten: Startseite, eine typische Unterseite, Kontakt
function scan(dir, prefix = '') {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || ['images', 'fonts'].includes(e.name)) continue;
    if (e.isDirectory()) out.push(...scan(`${dir}/${e.name}`, `${prefix}/${e.name}`));
    else if (e.name === 'index.html') out.push(prefix ? prefix + '/' : '/');
  }
  return out;
}
const alle = scan('dist').filter(p => !/impressum|datenschutz|stil-muster|404/.test(p));
const seiten = ['/'];
const unter = alle.filter(p => p !== '/' && !/kontakt/.test(p)).sort((a, b) => b.split('/').length - a.split('/').length);
if (unter[0]) seiten.push(unter[0]);
const kontakt = alle.find(p => /kontakt/.test(p));
if (kontakt) seiten.push(kontakt);
const pruefen = [...new Set(seiten)].slice(0, anzahl);

console.log(`\n══════ QA-SPEED (Lighthouse Mobile) ══════`);
console.log(`  ${pruefen.length} Seiten: ${pruefen.join(', ')}${staging ? '  (Staging: noindex wird nicht abgezogen)' : ''}\n`);

const flags = ['--headless=new', '--disable-gpu', '--no-first-run'];
if (process.platform === 'linux' && process.getuid?.() === 0) flags.push('--no-sandbox');
let chrome;
try {
  chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH || chromium.executablePath(), chromeFlags: flags });
} catch (e) {
  console.log(`  ✖  Chrome für Lighthouse nicht startbar: ${e.message.split('\n')[0]}`);
  console.log('     Lösung: npx playwright install chromium\n');
  process.exit(1);
}

// Kategorie-Score ohne bestimmte Audits neu berechnen (noindex auf Staging)
const scoreOhne = (lhr, kat, ohne) => {
  const refs = lhr.categories[kat].auditRefs.filter(r => r.weight > 0 && !ohne.includes(r.id));
  const summe = refs.reduce((s, r) => s + r.weight, 0);
  const wert = refs.reduce((s, r) => s + r.weight * (lhr.audits[r.id]?.score ?? 0), 0);
  return summe ? Math.round((wert / summe) * 100) : 100;
};
const fehlgeschlagen = (lhr, kat, ohne = []) => lhr.categories[kat].auditRefs
  .filter(r => r.weight > 0 && !ohne.includes(r.id) && (lhr.audits[r.id]?.score ?? 1) < 0.9)
  .sort((a, b) => b.weight - a.weight).slice(0, 4).map(r => lhr.audits[r.id].title);

const bericht = [];
try {
  for (const pfad of pruefen) {
    const url = BASE + pfad;
    let lhr;
    try {
      const r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
      lhr = r?.lhr;
    } catch (e) { bad(`${pfad}: Lighthouse-Fehler ${e.message.split('\n')[0]}`); continue; }
    if (!lhr || lhr.runtimeError) { bad(`${pfad}: Lighthouse konnte nicht messen (${lhr?.runtimeError?.message || 'unbekannt'})`); continue; }

    const ohneSeo = staging ? ['is-crawlable'] : [];
    const s = {
      perf: Math.round((lhr.categories.performance.score || 0) * 100),
      a11y: Math.round((lhr.categories.accessibility.score || 0) * 100),
      bp: Math.round((lhr.categories['best-practices'].score || 0) * 100),
      seo: scoreOhne(lhr, 'seo', ohneSeo),
    };
    const lcp = lhr.audits['largest-contentful-paint']?.displayValue || '?';
    const cls = lhr.audits['cumulative-layout-shift']?.displayValue || '?';
    console.log(`  ${pfad.padEnd(28)} Performance ${String(s.perf).padStart(3)} · Barrierefreiheit ${String(s.a11y).padStart(3)} · Best Practices ${String(s.bp).padStart(3)} · SEO ${String(s.seo).padStart(3)}   (LCP ${lcp}, CLS ${cls})`);

    // Größte Bremsen (Opportunities mit Einsparung) + LCP-Element
    const bremsen = Object.values(lhr.audits)
      .filter(a => a.details?.type === 'opportunity' && (a.details.overallSavingsMs || 0) >= 150)
      .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs).slice(0, 3)
      .map(a => `${a.title} (~${Math.round(a.details.overallSavingsMs)} ms)`);
    const lcpEl = lhr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet
               || lhr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || '';

    if (s.perf < 90) bad(`${pfad}: Performance ${s.perf} (Ziel 95+). Bremsen: ${bremsen.join('; ') || 'siehe qa-speed-report.json'}${lcpEl ? ` · LCP-Element: ${lcpEl.slice(0, 90)}` : ''}`);
    else if (s.perf < 95) hint(`${pfad}: Performance ${s.perf} – bis 95+ fehlt: ${bremsen.join('; ') || 'Kleinigkeiten'}${lcpEl ? ` · LCP-Element: ${lcpEl.slice(0, 90)}` : ''}`);
    if (s.a11y < 90) bad(`${pfad}: Barrierefreiheit ${s.a11y}: ${fehlgeschlagen(lhr, 'accessibility').join('; ')}`);
    if (s.bp < 90) bad(`${pfad}: Best Practices ${s.bp}: ${fehlgeschlagen(lhr, 'best-practices').join('; ')}`);
    if (s.seo < 95) bad(`${pfad}: SEO ${s.seo}: ${fehlgeschlagen(lhr, 'seo', ohneSeo).join('; ')}`);
    bericht.push({ seite: pfad, ...s, lcp, cls, bremsen, lcpElement: lcpEl });
  }
  // Desktop-Messung der Startseite (Schwabenpflege: mobil 100, live auf dem Desktop CLS 0,2 durch die
  // breiter laufende Ersatzschrift im Hero; mobil fiel es nicht auf)
  try {
    const desktopConfig = (await import('lighthouse/core/config/desktop-config.js')).default;
    const r = await lighthouse(BASE + '/', { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'] }, desktopConfig);
    const lhr = r?.lhr;
    if (lhr && !lhr.runtimeError) {
      const perf = Math.round((lhr.categories.performance.score || 0) * 100);
      const clsWert = lhr.audits['cumulative-layout-shift']?.numericValue ?? 0;
      console.log(`  ${'/ (Desktop)'.padEnd(28)} Performance ${String(perf).padStart(3)}   (CLS ${clsWert.toFixed(3)})`);
      if (clsWert > 0.1) bad(`/ Desktop: Layoutverschiebung CLS ${clsWert.toFixed(2)} (Ziel unter 0,1) – meist die Ersatzschrift: in fonts.css eine größenangepasste Ersatzschrift (size-adjust) anlegen, siehe phase2-technik.md`);
      else if (perf < 90) bad(`/ Desktop: Performance ${perf} (Ziel 95+)`);
      bericht.push({ seite: '/ (Desktop)', perf, cls: clsWert.toFixed(3) });
    }
  } catch (e) { hint(`Desktop-Messung nicht möglich: ${e.message.split('\n')[0]}`); }
} finally {
  // Windows: Chrome hält den Temp-Ordner beim Beenden oft noch fest (EPERM beim Aufräumen).
  // Das betrifft nur das Aufräumen, nicht die Messung, und darf das Gate nicht abbrechen.
  try { await chrome.kill(); } catch (e) { if (e?.code !== 'EPERM' && e?.code !== 'EBUSY') throw e; }
}

writeFileSync('qa-speed-report.json', JSON.stringify({ zeit: new Date().toISOString(), staging, seiten: bericht }, null, 2));
if (!errors.length) ok(`PageSpeed im Ziel (${bericht.map(b => `${b.seite} ${b.perf}`).join(', ')})`);
console.log(`\n  ${errors.length} Fehler, ${hints.length} Hinweise  (Details: qa-speed-report.json)\n`);
process.exit(errors.length ? 1 : 0);
