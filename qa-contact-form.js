import { readFileSync } from 'fs';
// QA-CONTACT-FORM v1.2 – Playwright: Formular ECHT testen (6 Szenarien, Hinweis zur Barrierefreiheit der Fehler)
// Aufruf: node qa-contact-form.js [baseUrl] [formPath=/kontakt]
// mailer.php wird im Preview nicht ausgefuehrt – der Submit-Request wird
// abgefangen und der Endpoint geprueft; Success-UI wird per Mock verifiziert.
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4321';
const PATH = process.argv[3] || '/kontakt';
const errors = [];
const ok = (m) => console.log('  ✔  ' + m);
const bad = (m) => { errors.push(m); console.log('  ✖  ' + m); };

console.log('\n══════ QA-CONTACT-FORM ══════\n');

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
const _g = await browser.newPage();
await pruefeProjekt(_g, BASE);
await _g.close();
const page = await browser.newPage();

let requestedUrl = null;
await page.route('**/mailer.php', route => {
  requestedUrl = route.request().url();
  route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
});
await page.route('**/api/contact*', route => {
  requestedUrl = route.request().url();
  route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
});

try {
  await page.goto(BASE + PATH, { waitUntil: 'networkidle', timeout: 15000 });
  const form = page.locator('form').first();
  if (!(await form.count())) { bad(`Kein <form> auf ${PATH}`); throw new Error('abort'); }
  const submit = form.locator('button[type="submit"], button:not([type])').last();
  // Formular erst in den Blick holen und auf die Hydration warten (Schwabenpflege: client:visible lag weiter
  // unten, der Klick kam vor dem Skript). Bleibt die Insel unhydriert, ist das auch für echte Besucher ein Fehler.
  await form.scrollIntoViewIfNeeded().catch(() => {});
  const hydriert = await page.waitForFunction(() => {
    const f = document.querySelector('form');
    const insel = f?.closest('astro-island');
    return !insel || !insel.hasAttribute('ssr');
  }, null, { timeout: 8000 }).then(() => true).catch(() => false);
  if (!hydriert) bad('Formular wird nicht interaktiv (React-Insel nach 8 s noch nicht hydriert) – client:visible={{ rootMargin: "2500px" }} oder client:idle nutzen');

  // Test 1: leer absenden -> Fehlermeldungen
  await submit.click();
  await page.waitForTimeout(600);
  const errCount = await page.locator('[class*="error"], [role="alert"], .text-red-500, .text-red-600').count();
  errCount > 0 ? ok(`Leer-Submit zeigt ${errCount} Fehlermeldung(en)`) : bad('Leer-Submit ohne sichtbare Fehlermeldungen');
  // Barrierefreiheit der Fehler (UX-Richtlinien): Screenreader müssen sie hören und dem Feld zuordnen können
  const a11y = await form.evaluate(f => ({
    angesagt: !!f.querySelector('[role="alert"], [aria-live]') || !!document.querySelector('[role="alert"]'),
    zugeordnet: [...f.querySelectorAll('[aria-invalid="true"]')].some(i => i.getAttribute('aria-describedby')),
  }));
  if (errCount > 0 && !a11y.angesagt && !a11y.zugeordnet)
    console.log('  ·  Fehlermeldungen werden Screenreadern nicht angesagt (role="alert" an der Meldung oder aria-invalid + aria-describedby am Feld)');

  // Test 2: invalide E-Mail
  const fill = async (sel, val) => { const l = form.locator(sel).first(); if (await l.count()) await l.fill(val); };
  await fill('input[name="name"]', 'QA Test');
  await fill('input[name="email"]', 'keine-mail');
  await fill('input[name="phone"]', '0123456');
  await fill('textarea', 'Dies ist eine automatische QA-Testnachricht.');
  await submit.click();
  await page.waitForTimeout(600);
  requestedUrl === null ? ok('Invalide E-Mail blockiert Submit') : bad('Invalide E-Mail wurde NICHT blockiert');

  // Test 3: DSGVO nicht angehakt
  await fill('input[name="email"]', 'qa@test.de');
  await submit.click();
  await page.waitForTimeout(600);
  requestedUrl === null ? ok('Fehlende DSGVO-Checkbox blockiert Submit') : bad('DSGVO-Checkbox wird NICHT erzwungen');

  // Test 4+5: korrekt ausfuellen -> Endpoint + Erfolgsmeldung
  const dsgvo = form.locator('input[type="checkbox"]').first();
  if (await dsgvo.count()) await dsgvo.check();
  await submit.click();
  await page.waitForTimeout(1500);
  if (!requestedUrl) bad('Korrekter Submit sendet keinen Request');
  else if (requestedUrl.includes('/mailer.php')) ok('Endpoint korrekt: /mailer.php');
  else bad(`FALSCHER Endpoint: ${requestedUrl}`);
  const success = await page.locator('text=/danke|erfolgreich|gesendet|erhalten/i').count();
  success > 0 ? ok('Erfolgsmeldung sichtbar') : bad('Keine Erfolgsmeldung nach Submit');

  // Test 6: Honeypot vorhanden?
  const honeypot = await form.locator('input[name="website"]').count();
  honeypot > 0 ? ok('Honeypot-Feld vorhanden') : bad('Honeypot-Feld (name="website") fehlt');
} catch (e) {
  if (e.message !== 'abort') bad('Testlauf-Fehler: ' + e.message.split('\n')[0]);
}

await browser.close();
console.log(`\n  ${errors.length} Fehler\n`);
process.exit(errors.length ? 1 : 0);
