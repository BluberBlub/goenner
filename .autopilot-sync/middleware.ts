// @LOCKED v3 – Umbruch-Regeln für alle Seiten, im Dev-Server und im Build (Spöri, Weber; Niko-Regeln).
// Liegt im Projekt als src/middleware.ts und wird wie die Kit-Komponenten synchronisiert.
// 1. Keine Hurenkinder: In Absätzen, Listenpunkten, Überschriften usw. bleiben die letzten beiden
//    Wörter zusammen (geschütztes Leerzeichen <span class="bind">, CSS im BaseLayout). Würde ein
//    gebundenes Paar in einer schmalen Box überstehen (Test: "Kostenvoranschlag vorab." in einer
//    Karte bei 768 px), löst das BaseLayout genau diese Bindung im Browser wieder (bind--frei).
//    Lange Paare (> 14 Zeichen) dürfen außerdem unter 480 px immer umbrechen.
// 2. Keine Worttrennung mitten im Wort: lange Komposita bekommen weiche Trennstellen (&shy;) NUR an
//    ihren Wortfugen. Getrennt wird dann nur dort, und nur wenn es nicht anders passt.
//    Projektwörter: site-data.json "umbruch": { "trennstellen": ["Steuer|erklärungen", …] }.
//    Meldet qa-craft Text außerhalb einer Box, das Wort mit seinen Fugen hier eintragen.
// 1b. v2 (Schwabenpflege): Ist das gebundene Schlusspaar kurz ("zu Ihnen."), wird das Wort davor mit
//    angebunden: auch zwei kurze Wörter allein sind ein Hurenkind. Endet der Satz mit <em>Wort</em>,
//    bleibt das Wort davor mit ihm zusammen.
// 4. v3 LESEFLUSS (Schneider, Niko-Regel für alle Projekte; vorher Projektlösung satzanfang.ts):
//    a) Einleitungen (<p data-lead> in SektionsKopf, PageHero, Cta sowie <p class="lead">): zwei bis drei
//       kurze Sätze (zusammen höchstens 45 Wörter) stehen je in einer eigenen Zeile (span.satz, CSS im
//       BaseLayout: block + balance). Ein Satz "Einleitung: ganzer Satz" bricht nach dem Doppelpunkt.
//       Von Hand gesetzte <br> werden ebenso zu Satz-Blöcken (ein <br> allein lässt Restzeilen stehen).
//    b) Überschriften h1/h2 brechen an der natürlichen Fuge: vor dem kursiven Teil (<em>) und nach ": "
//       (span.teil, inline-block + balance). Teile mit nur einem Wort werden nicht getrennt.
//    c) Kein Satzanfang allein am Zeilenende: nach . ! ? und nach : hängt das erste Wort (bis 12 Zeichen)
//       am zweiten (lösbare Bindung bind--anfang, wird bei Platznot zuerst gelöst).
//    d) Uhrzeiten immer voll: "8:30 Uhr" -> "08:30 Uhr" (nur vor Uhr, bis, und Zeitspannen).
//    Abschalten nur der Lesefluss-Regeln: site-data.json "umbruch": { "lesefluss": false }.
// 3. Bindestrich-Wörter (Franz-Walchner-Straße) und "(m/w/d)" bleiben ganz, (m/w/d) etwas kleiner.
// Kopf, Skripte, Styles und React-Inseln bleiben unberührt (die alte Build-Variante zerstörte die
// Hydration der Formulare). Abschalten: site-data.json "umbruch": { "aus": true }.
import { defineMiddleware } from 'astro:middleware';
import siteData from './content/site-data.json';

const cfg = ((siteData as Record<string, any>).umbruch ?? {}) as { aus?: boolean; lesefluss?: boolean; trennstellen?: string[] };

const MAX_PAAR: Record<string, number> = { h1: 18, h2: 20, h3: 24, span: 24, a: 24, em: 18, strong: 24, button: 24 };
const MAX_TEXT = 32;
const LANG = 14;      // ab hier darf das Paar auf schmalen Handys umbrechen
const TAGS = 'p|li|h1|h2|h3|h4|dd|dt|figcaption|span|a|strong|em|blockquote|button|label|th|td';
const MUSTER = new RegExp(`([^\\s<>]+)[ \\t]+([^\\s<>]{1,40})(\\s*)</(${TAGS})>`, 'g');
const AUSNAHMEN = /(<head[\s\S]*?<\/head>|<astro-island[\s\S]*?<\/astro-island>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<textarea[\s\S]*?<\/textarea>|<pre[\s\S]*?<\/pre>|<svg[\s\S]*?<\/svg>)/i;

// Häufige lange Wörter auf Handwerks-, Praxis- und Kanzleiseiten, mit Wortfugen ("|").
// Beugungsformen werden über den Wortanfang mit erfasst; Groß-/Kleinschreibung egal.
const BASIS = [
  'Datenschutz|erklärung', 'Datenschutz|beauftragter', 'Datenschutz|hinweise', 'Kontakt|formular', 'Ansprech|partner',
  'Öffnungs|zeiten', 'Leistungs|übersicht', 'Leistungs|bereiche', 'Leistungs|spektrum', 'Kunden|zufriedenheit',
  'Unternehmens|nachfolge', 'Unternehmens|beratung', 'Unternehmens|philosophie', 'Familien|unternehmen', 'Familien|betrieb',
  'Meister|betrieb', 'Fach|betrieb', 'Ausbildungs|betrieb', 'Ausbildungs|platz', 'Stellen|angebote', 'Bewerbungs|unterlagen',
  'Sanitär|installation', 'Heizungs|installation', 'Elektro|installation', 'Heizungs|modernisierung', 'Bad|sanierung',
  'Wärme|pumpen', 'Photovoltaik|anlagen', 'Lüftungs|anlagen', 'Klima|anlagen', 'Kunden|dienst', 'Not|dienst',
  'Wartungs|vertrag', 'Energie|beratung', 'Förder|mittel', 'Fenster|bau', 'Innen|ausbau', 'Garten|gestaltung',
  'Steuer|erklärungen', 'Steuer|beratung', 'Jahres|abschlüsse', 'Finanz|buchhaltung', 'Lohn|buchhaltung', 'Gehalts|buchhaltung',
  'Rechnungs|wesen', 'Wirtschafts|prüfer', 'Wirtschafts|beratung', 'Existenz|gründung', 'Sozial|versicherung',
  'Behandlungs|schwerpunkte', 'Praxis|team', 'Termin|vereinbarung', 'Ferien|wohnungen', 'Ferien|wohnung',
  'Mandanten|informations|brief', 'Berufs|genossenschafts|meldungen', 'Auftrags|bedingungen', 'Kooperations|partner',
];
const TRENN = [...BASIS, ...(cfg.trennstellen || [])].filter((w) => w.includes('|')).map((w) => {
  const fugen: number[] = [];
  w.split('|').reduce((pos, teil, i, alle) => { if (i < alle.length - 1) fugen.push(pos + teil.length); return pos + teil.length; }, 0);
  return { re: new RegExp(w.replace(/\|/g, ''), 'gi'), fugen };
}).sort((a, b) => b.re.source.length - a.re.source.length);   // längere zuerst
const trennWort = (wort: string) => TRENN.reduce((t, { re, fugen }) => t.replace(re, (treffer) =>
  treffer.includes('\u00ad') ? treffer : [...treffer].map((z, i) => (fugen.includes(i) ? '&shy;' : '') + z).join('')), wort);
// E-Mail-Adressen, Domains und URLs bleiben unangetastet (sonst landet ein unsichtbares Zeichen beim Kopieren in der Adresse)
const ADRESSE = /@|:\/\/|^www\.|\.(de|com|at|ch|eu|net|org|info)\b/i;
const trennen = (text: string) => text.split(/(\s+)/).map((teil) => (ADRESSE.test(teil) ? teil : trennWort(teil))).join('');

const sichtbar = (s: string) => s.replace(/&shy;|­/g, '').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, 'x').length;
const ganz = (w: string) => (/\w[-/]\w/.test(w) && !w.includes('=') && !/^https?:/.test(w)
  ? `<span class="wort-ganz${sichtbar(w) > LANG ? ' wort-ganz--lang' : ''}">${w}</span>` : w);

const KURZES_PAAR = 12;
const EM_ENDE = new RegExp(`([^\\s<>]+)[ \\t]+(<em>[^\\s<>]+</em>[.!?:,]?)(\\s*</(?:h1|h2|h3|h4|p|li|dd|figcaption)>)`, 'g');
const DREI = new RegExp(`([^\\s<>]+)[ \\t]+([^\\s<>]+)(<span class="bind(?: bind--lang)?"> </span>)((?:<span class="wort-ganz[^"]*">)?[^\\s<>]+(?:</span>)?)(\\s*</(${TAGS})>)`, 'g');

// ── 4. Lesefluss ──
const woerter = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const alsSaetze = (teile: string[]) => teile.map((t) => `<span class="satz">${t.trim()}</span>`).join(' ');
function leadUmbruch(inhalt: string): string {
  if (/<(ul|ol|div|p)\b|class="satz"/i.test(inhalt)) return inhalt;
  if (/<br\s*\/?>/i.test(inhalt)) return alsSaetze(inhalt.split(/<br\s*\/?>/i).filter((t) => t.trim()));
  const saetze = inhalt.trim().split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„])/);
  if (saetze.length >= 2 && saetze.length <= 3 && woerter(inhalt) <= 45 && saetze.every((x) => woerter(x) >= 3)) return alsSaetze(saetze);
  if (saetze.length === 1) {
    const m = inhalt.match(/^([\s\S]*?:)\s+([A-ZÄÖÜ„][\s\S]*)$/);
    if (m && woerter(m[1]) >= 3 && woerter(m[2]) >= 4) return alsSaetze([m[1], m[2]]);
  }
  return inhalt;
}
const LEAD = /(<p\b[^>]*(?:\sdata-lead\b|\sclass="lead\b)[^>]*>)([\s\S]*?)(<\/p>)/g;
const UEBERSCHRIFT = /(<(h1|h2)\b[^>]*>)([\s\S]*?)(<\/\2>)/g;
function fugen(inhalt: string): string {
  if (/class="teil"|<(div|p|br|span)\b/i.test(inhalt)) return inhalt;
  const teile = inhalt.split(/(?=<em\b)|(?<=<\/em>)|(?<=:)\s+(?=[^<]*(?:<|$))/).map((t) => t.trim()).filter(Boolean);
  if (teile.length < 2 || teile.some((t) => woerter(t) < 2)) return inhalt;
  return teile.map((t) => `<span class="teil">${t}</span>`).join(' ');
}
const SATZANFANG = /([.!?][“"»)]?)( +)([A-ZÄÖÜ„][^\s<&]{0,11}) +(?=[^\s<])/g;
const NACH_DOPPELPUNKT = /(:)( +)([^\s<&:]{1,12}) +(?=[^\s<])/g;
const KURZE_UHRZEIT = /(^|[^\d:.,/])(\d):(\d{2})(?=(?:\s|&nbsp;|\u00a0)*(?:Uhr|bis\b|[–-]\s*\d))/g;
const NACH_STRICH = /(\d:\d{2}\s*[–-]\s*)(\d):(\d{2})(?!\d)/g;   // zweite Zeit einer Spanne
// Als lösbare Bindung (nicht &nbsp;): Wird es in einer schmalen Box zu eng, löst das BaseLayout zuerst
// diese Anfangs-Bindungen, erst danach die Schluss-Bindung (sonst Hurenkind, Testfall "Ehrlicher
// Kostenvoranschlag vorab." in einer Karte bei 390 px).
const ANFANG = '<span class="bind bind--anfang"> </span>';
const bindeText = (s: string) => s
  .replace(SATZANFANG, `$1$2$3${ANFANG}`)
  .replace(NACH_DOPPELPUNKT, (t, d: string, ws: string, w: string) => (/^\d+$/.test(w) ? t : `${d}${ws}${w}${ANFANG}`))
  .replace(KURZE_UHRZEIT, '$10$2:$3')
  .replace(NACH_STRICH, '$10$2:$3');
export function lesefluss(teil: string): string {
  return teil
    .replace(LEAD, (_t, a: string, b: string, c: string) => a + leadUmbruch(b) + c)
    .replace(UEBERSCHRIFT, (_t, a: string, _tag: string, b: string, c: string) => a + fugen(b) + c)
    .split(/(<[^>]+>)/).map((s, j) => (j % 2 ? s : bindeText(s))).join('');
}

export function umbruchRegeln(html: string): string {
  return html.split(AUSNAHMEN).map((teil, i) => {
    if (i % 2) return teil;
    if (cfg.lesefluss !== false) teil = lesefluss(teil);
    return teil
      // weiche Trennstellen nur im Text, nie in Tags oder Attributen
      .split(/(<[^>]+>)/).map((s, j) => (j % 2 ? s : trennen(s))).join('')
      .replace(/>([^<]*?)\(m\/w\/d\)/g, (_m, vor) => `>${vor}<span class="mwd">(m/w/d)</span>`)
      .replace(MUSTER, (treffer, vor: string, wort: string, ws: string, tag: string, pos: number, alles: string) => {
        if (vor.includes('=') || vor.endsWith('"')) return treffer;   // Attribut, kein Text
        if (alles[pos - 1] === '>' && !alles.slice(0, pos).endsWith(ANFANG)) return `${vor} ${ganz(wort)}${ws}</${tag}>`;   // nur zwei Wörter: kein Hurenkind möglich
        const laenge = sichtbar(vor) + 1 + sichtbar(wort);
        if (laenge > (MAX_PAAR[tag] ?? MAX_TEXT)) return `${vor} ${ganz(wort)}${ws}</${tag}>`;
        // Nur das Leerzeichen wird geschützt: Trennstellen (&shy;) in den Wörtern bleiben wirksam
        return `${vor}<span class="bind${laenge > LANG ? ' bind--lang' : ''}"> </span>${ganz(wort)}${ws}</${tag}>`;
      })
      .replace(DREI, (treffer, w1: string, w2: string, bind: string, w3: string, rest: string, tag: string) => {
        if (w1.includes('=') || w1.endsWith('"') || w1.endsWith('>')) return treffer;
        const paar = sichtbar(w2) + 1 + sichtbar(w3);
        const alle = sichtbar(w1) + 1 + paar;
        if (paar > KURZES_PAAR || alle > (MAX_PAAR[tag] ?? MAX_TEXT)) return treffer;
        return `${w1}<span class="bind"> </span>${w2}${bind}${w3}${rest}`;
      })
      .replace(EM_ENDE, (treffer, w1: string, em: string, rest: string) => {
        if (w1.includes('=') || w1.endsWith('"') || w1.endsWith('>')) return treffer;
        return `${w1}<span class="bind"> </span>${em}${rest}`;
      });
  }).join('');
}

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const antwort = await next();
  if (cfg.aus || !(antwort.headers.get('content-type') || '').includes('text/html')) return antwort;
  const html = await antwort.text();
  return new Response(umbruchRegeln(html), { status: antwort.status, headers: antwort.headers });
});
