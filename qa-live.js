// QA-LIVE v1 – Post-Deploy Smoke-Test ueber ALLE Seiten
// Aufruf: node qa-live.js https://subdomain.niko-endres.de
const BASE = (process.argv[2] || '').replace(/\/$/, '');
if (!BASE.startsWith('http')) { console.error('Aufruf: node qa-live.js <live-url>'); process.exit(1); }

const errors = [];
const ok = (m) => console.log('  ✔  ' + m);
const bad = (m) => { errors.push(m); console.log('  ✖  ' + m); };

console.log(`\n══════ QA-LIVE: ${BASE} ══════\n`);

// Sitemap lesen
let urls = [BASE + '/'];
try {
  let smUrl = BASE + '/sitemap-index.xml';
  let res = await fetch(smUrl);
  if (!res.ok) { smUrl = BASE + '/sitemap-0.xml'; res = await fetch(smUrl); }
  const xml = await res.text();
  const subs = [...xml.matchAll(/<loc>([^<]+sitemap[^<]*)<\/loc>/g)].map(m => m[1]);
  let pageXml = xml;
  if (subs.length) pageXml = (await Promise.all(subs.map(u => fetch(u).then(r => r.text())))).join('');
  const found = [...pageXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => !u.includes('sitemap'));
  if (found.length) { urls = found; ok(`Sitemap: ${urls.length} Seiten`); }
  else bad('Sitemap leer/nicht lesbar – nur Startseite wird geprueft');
} catch { bad('Sitemap nicht erreichbar'); }

// Jede Seite: Status + Assets
for (const url of urls) {
  try {
    const res = await fetch(url);
    if (!res.ok) { bad(`${url} -> HTTP ${res.status}`); continue; }
    const html = await res.text();
    const assets = new Set();
    for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:css|js|jpg|jpeg|png|webp|svg|woff2))"/g)) assets.add(m[1]);
    for (const a of assets) {
      const ar = await fetch(BASE + a, { method: 'HEAD' });
      if (!ar.ok) bad(`Totes Asset auf ${url}: ${a} (${ar.status})`);
    }
  } catch (e) { bad(`${url}: ${e.message}`); }
}
ok(`${urls.length} Seiten geprueft`);

// mailer.php erreichbar
try {
  const res = await fetch(BASE + '/mailer.php', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: '{}' });
  res.status < 500 ? ok(`mailer.php antwortet (HTTP ${res.status})`) : bad(`mailer.php Server-Fehler ${res.status}`);
} catch { bad('mailer.php nicht erreichbar'); }

// og-image (Alge: WhatsApp zeigt nur echte JPGs zuverlässig)
try {
  const html = await (await fetch(urls[0])).text();
  const og = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1];
  if (!og) bad('og:image-Tag fehlt');
  else if (!og.startsWith('http')) bad(`og:image nicht absolut: ${og}`);
  else {
    const r = await fetch(og, { method: 'HEAD' });
    const typ = r.headers.get('content-type') || '';
    const kb = Math.round((+r.headers.get('content-length') || 0) / 1024);
    if (!r.ok) bad(`og:image 404: ${og}`);
    else if (!/image\/jpe?g/i.test(typ)) bad(`og:image ist kein JPG (${typ || 'unbekannt'}): ${og} – WhatsApp-Vorschau bleibt leer. og-image.jpg nutzen`);
    else {
      ok(`og:image erreichbar (JPG, absolut${kb ? `, ${kb} KB` : ''})`);
      if (kb > 300) bad(`og:image hat ${kb} KB – WhatsApp zeigt über 300 KB oft keine Vorschau (node og-bild.js)`);
    }
    const ogHost = new URL(og).host, liveHost = new URL(BASE).host;
    if (ogHost !== liveHost && !/niko-endres\.de/.test(liveHost))
      bad(`og:image zeigt auf ${ogHost} statt ${liveHost} – meta.siteUrl in site-data.json auf die Kundendomain setzen`);
  }
  const canon = html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];
  if (canon && !/niko-endres\.de/.test(new URL(BASE).host) && new URL(canon).host !== new URL(BASE).host)
    bad(`Canonical zeigt auf ${new URL(canon).host} statt ${new URL(BASE).host} – meta.siteUrl + astro.config site auf die Kundendomain setzen`);
} catch { bad('og:image-Pruefung fehlgeschlagen'); }

// KI-Bilder: auf der Kundendomain nicht erlaubt (Alge: Wasserzeichen-Bild ging fast live)
try {
  const { existsSync, readFileSync } = await import('fs');
  if (existsSync('KI-BILDER.md')) {
    const offen = readFileSync('KI-BILDER.md', 'utf-8').split('\n').filter(z => /^- \[ \]/.test(z));
    if (offen.length && !/niko-endres\.de/.test(new URL(BASE).host))
      bad(`${offen.length} KI-Bilder noch nicht ersetzt (KI-BILDER.md) – auf der Kundendomain nicht erlaubt: ${offen.slice(0, 3).map(z => z.replace(/^- \[ \]\s*/, '').split(' ')[0]).join(', ')}`);
    else if (offen.length) ok(`${offen.length} KI-Bilder offen (Demo ok, vor Go-Live ersetzen)`);
  }
} catch {}

// SEO auf der LIVE-Domain (EGS-Learning: noindex ging live)
try {
  const startHtml = await (await fetch(urls[0])).text();
  const isStaging = /niko-endres\.de/.test(BASE);
  if (/name="robots"[^>]*noindex/i.test(startHtml)) {
    if (isStaging) ok('noindex vorhanden (Staging-Domain – beim Go-Live meta.staging=false setzen!)');
    else bad('LIVE-SEITE HAT NOINDEX – Google ignoriert die komplette Website! meta.staging in site-data.json auf false, neu bauen, deployen');
  } else if (!isStaging) ok('robots-Meta: index');
  const rt = await fetch(BASE + '/robots.txt');
  if (!rt.ok) bad('robots.txt fehlt live (' + rt.status + ')');
  else {
    const rtx = await rt.text();
    if (/Disallow:\s*\/\s*$/m.test(rtx) && !isStaging) bad('robots.txt sperrt ALLES auf der Live-Domain (Disallow: /)');
    if (!/Sitemap:/i.test(rtx)) bad('robots.txt ohne Sitemap-Zeile');
  }
} catch (e) { bad('SEO-Check: ' + e.message); }

// Demo-Leiste: auf Staging ok, auf Kundendomain ein Fehler
try {
  const html0 = await (await fetch(urls[0])).text();
  const hatDemo = /id="demo-bar"/.test(html0);
  const isStaging2 = /niko-endres\.de/.test(BASE);
  if (hatDemo && !isStaging2) bad('DEMO-LEISTE IST AUF DER KUNDENDOMAIN LIVE – meta.demo in site-data.json auf false setzen, neu bauen, deployen');
  else if (hatDemo) ok('Demo-Leiste aktiv (Akquise-Demo auf Staging)');
  else if (isStaging2) ok('keine Demo-Leiste (bewusst?)');
} catch (e) { bad('Demo-Check: ' + e.message); }

// 404-Seite
try {
  const r = await fetch(BASE + '/diese-seite-existiert-nicht-qa-test');
  const t = await r.text();
  (r.status === 404 && t.includes('</html>')) ? ok('Branded 404 aktiv') : bad(`404-Routing: HTTP ${r.status}, branded=${t.includes('</html>')}`);
} catch { bad('404-Test fehlgeschlagen'); }

console.log(`\n  ${errors.length} Fehler\n`);
process.exit(errors.length ? 1 : 0);
