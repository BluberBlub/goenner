// NIKO ENDRES – VISUAL QA CHECK v3.0
// Playwright Screenshots + Claude Vision + Lighthouse
// Aufruf: node visual-check.js <url> <branche>

import { chromium } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL  = process.argv[2] || 'http://localhost:4321';
const BRANCHE   = process.argv[3] || 'Allgemein';
const MIN_SCORE = 8;
const MIN_LIGHTHOUSE = { performance: 85, seo: 95, accessibility: 90, bestPractices: 90 };

let siteData = {};
try {
  const p = join(__dirname, 'src/content/site-data.json');
  if (existsSync(p)) siteData = JSON.parse(readFileSync(p, 'utf-8'));
} catch {}

const client = new Anthropic();

const pages = [{ path: '/', name: 'Startseite' }];
if (siteData.seiten?.length > 0) {
  const sub = siteData.seiten.find(s => s !== 'startseite' && s !== 'index');
  if (sub) pages.push({ path: `/${sub}`, name: sub });
}
pages.push({ path: '/404', name: '404' });

async function screenshots() {
  console.log('\n📸 Screenshots...');
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const result = [];
  for (const bp of [{ w: 1440, h: 900, n: 'Desktop' }, { w: 390, h: 844, n: 'Mobile' }]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: bp.w, height: bp.h });
    for (const p of pages) {
      try {
        await page.goto(BASE_URL + p.path, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(600);
        const buf = await page.screenshot({ fullPage: false });
        result.push({ name: `${p.name} (${bp.n})`, base64: buf.toString('base64') });
        console.log(`  ✅ ${p.name} (${bp.n})`);
      } catch (e) {
        console.log(`  ⚠️  ${p.name} (${bp.n}): ${e.message}`);
      }
    }
    await page.close();
  }
  await browser.close();
  return result;
}

async function lighthouseCheck() {
  console.log('\n💡 Lighthouse Check...');
  try {
    const cmd = `npx lighthouse ${BASE_URL} --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless --no-sandbox" --quiet`;
    execSync(cmd, { stdio: 'pipe' });
    const report = JSON.parse(readFileSync('./lighthouse-report.json', 'utf-8'));
    const scores = {
      performance:    Math.round(report.categories.performance.score * 100),
      seo:            Math.round(report.categories.seo.score * 100),
      accessibility:  Math.round(report.categories.accessibility.score * 100),
      bestPractices:  Math.round(report.categories['best-practices'].score * 100),
    };
    console.log(`  Performance:    ${scores.performance >= MIN_LIGHTHOUSE.performance ? '✅' : '❌'} ${scores.performance}/100`);
    console.log(`  SEO:            ${scores.seo >= MIN_LIGHTHOUSE.seo ? '✅' : '❌'} ${scores.seo}/100`);
    console.log(`  Accessibility:  ${scores.accessibility >= MIN_LIGHTHOUSE.accessibility ? '✅' : '❌'} ${scores.accessibility}/100`);
    console.log(`  Best Practices: ${scores.bestPractices >= MIN_LIGHTHOUSE.bestPractices ? '✅' : '❌'} ${scores.bestPractices}/100`);
    return scores;
  } catch (e) {
    console.log(`  ⚠️  Lighthouse fehlgeschlagen: ${e.message}`);
    return null;
  }
}

async function evaluate(shots) {
  console.log('\n🔍 Claude Sonnet bewertet visuell...\n');
  const kundenname = siteData.meta?.kundenname || '?';
  const zielgruppe = siteData.meta?.zielgruppe || '?';
  const stil       = siteData.design?.stil      || '?';

  const content = [
    {
      type: 'text',
      text: `Du bist erfahrener UI/UX Designer und Brand Strategist. Bewerte diese Website streng.

KONTEXT: Kunde: ${kundenname} | Branche: ${BRANCHE} | Zielgruppe: ${zielgruppe} | Stil: ${stil}

WICHTIG: Sei streng. Score 8+ = wirklich Premium. Branchenfremdes Design (z.B. Gaming für Handwerk) = Score 1-2 für Branchen-Passung.

BEWERTE je 0-10:
1. branchenPassung: Passt Design zu ${BRANCHE}?
2. zielgruppenPassung: Spricht es "${zielgruppe}" an?
3. professionalitaet: Premium-Niveau 8.000-15.000 EUR?
4. designQualitaet: Farben, Typo, Abstände, Hierarchie?
5. heroWirkung: Kraftvoll und überzeugend?
6. mobile: Mobile sauber und vollständig nutzbar?
7. vertrauen: Würde Besucher Kontakt aufnehmen?
8. individualitaet: Individuell oder 08/15-Template?
9. accessibility: Kontraste ok? Focus-States sichtbar?
10. cookieBanner: Vorhanden und korrekt?
11. navigation: Sauber, kein Startseite-Menüpunkt?
12. cta: Klare Handlungsaufforderungen auf jeder Seite?

Antworte NUR als valides JSON ohne Markdown:
{
  "gesamtscore": 7.2,
  "einzelscores": {"branchenPassung":6,"zielgruppenPassung":7,"professionalitaet":8,"designQualitaet":7,"heroWirkung":8,"mobile":7,"vertrauen":7,"individualitaet":6,"accessibility":7,"cookieBanner":10,"navigation":9,"cta":7},
  "kritischeFehler": ["Design zu technisch für Handwerk","Farben zu kalt"],
  "designKorrekturen": ["Primärfarbe wärmer machen","Schrift humanistischer"],
  "technischeKorrekturen": ["Cookie-Banner fehlt Mobile","404 nicht gebrandmarkt"],
  "positivesBehalten": ["Hero-Größe gut","Navigation sauber"]
}`
    },
    ...shots.map(s => ([
      { type: 'text', text: `\n--- ${s.name} ---` },
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: s.base64 } }
    ])).flat()
  ];

  const res = await client.messages.create({
    model: 'claude-sonnet-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content }],
  });

  const raw = res.content[0].text.trim();
  try { return JSON.parse(raw); }
  catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('JSON parse error');
  }
}

function report(r, lh) {
  console.log('\n════════════════════════════════════════');
  console.log('  VISUAL QA REPORT');
  console.log('════════════════════════════════════════\n');
  const visualOk = r.gesamtscore >= MIN_SCORE;
  console.log(`  Visual Score: ${visualOk ? '✅' : '❌'} ${r.gesamtscore}/10\n`);
  for (const [k, v] of Object.entries(r.einzelscores || {})) {
    const bar = '█'.repeat(Math.round(v)) + '░'.repeat(10 - Math.round(v));
    const e = v >= 7 ? '✅' : v >= 5 ? '⚠️ ' : '❌';
    console.log(`  ${e} ${k.padEnd(22)} ${bar} ${v}/10`);
  }
  if (r.kritischeFehler?.length)    { console.log('\n  ❌ KRITISCH:');  r.kritischeFehler.forEach(x => console.log(`     • ${x}`)); }
  if (r.designKorrekturen?.length)  { console.log('\n  🎨 DESIGN:');    r.designKorrekturen.forEach(x => console.log(`     • ${x}`)); }
  if (r.technischeKorrekturen?.length) { console.log('\n  🔧 TECHNIK:'); r.technischeKorrekturen.forEach(x => console.log(`     • ${x}`)); }
  if (r.positivesBehalten?.length)  { console.log('\n  ✅ BEHALTEN:');  r.positivesBehalten.forEach(x => console.log(`     • ${x}`)); }

  let lhOk = true;
  if (lh) {
    lhOk = lh.performance >= MIN_LIGHTHOUSE.performance &&
           lh.seo >= MIN_LIGHTHOUSE.seo &&
           lh.accessibility >= MIN_LIGHTHOUSE.accessibility &&
           lh.bestPractices >= MIN_LIGHTHOUSE.bestPractices;
  }

  const allOk = visualOk && lhOk;
  console.log('\n════════════════════════════════════════');
  console.log(allOk
    ? `  ✅ FREIGABE: Alles bestanden – Deploy möglich.`
    : `  ❌ NICHT FREIGEGEBEN: Korrekturen nötig.`);
  console.log('════════════════════════════════════════\n');

  // Report als JSON speichern für CI/Logs
  writeFileSync('./visual-qa-report.json', JSON.stringify({ ...r, lighthouse: lh, timestamp: new Date().toISOString() }, null, 2));

  return allOk;
}

(async () => {
  try {
    const shots = await screenshots();
    if (!shots.length) { console.error('❌ Keine Screenshots'); process.exit(1); }
    const result = await evaluate(shots);
    const lh = await lighthouseCheck();
    process.exit(report(result, lh) ? 0 : 1);
  } catch (e) {
    console.error('❌ Fehler:', e.message);
    process.exit(1);
  }
})();
