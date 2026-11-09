# TECHNIK-DETAILS (Nachschlagewerk)
# WIRD NICHT AUTOMATISCH GELESEN.
# Hier stehen Lösungen für Spezialfälle. Nur aufschlagen, wenn der Fall
# im aktuellen Projekt wirklich vorkommt.
#
# HINWEIS: Vieles hier ist inzwischen ERSETZT durch:
#  - die gesperrten Komponenten in src/ (Sticky, PageHero, Header, Footer,
#    BaseLayout, CookieBanner) – dort ist es fest eingebaut
#  - die QA-Gates (Overflow, Kontaktformular, Bilder, OG-Tags, CSS-Variablen)
# Diese Abschnitte sind nur noch Hintergrundwissen, keine Arbeitsanweisung.

## PREMIUM-FEATURES (Wertigkeit je nach Preisklasse)

Damit eine Website 2.000-2.500€ rechtfertigt, braucht sie mehr als das Nötigste.

### Standard (immer):
Responsive, Kontaktformular, Impressum/Datenschutz, Cookie-Banner,
Scroll-Animationen, animierte Counter, Sticky Contact-Button.

### Premium (anstreben):
- Google Maps Click-to-Load (DSGVO-konform)
- WhatsApp-Integration (Floating Button + in Kontaktsektion)
- FAQ-Sektion mit Akkordeon
- Vorher/Nachher-Slider (für: Garten, Sanierung, Malerarbeiten, Reinigung, Karosserie –
  überall wo der Unterschied selbst das Argument ist)
  Implementierung: CSS clip-path + Range-Input, kein externes Library nötig
  Echte Fotos DESSELBEN Objekts – niemals zwei verschiedene Objekte vergleichen
- Echte/glaubwürdige Referenzen (keine Fakes)
- Mehrere Kontaktwege prominent platziert
- Lighthouse 90+

## RESPONSIVE-QUALITÄT (typische Fehler vermeiden)

### Horizontales Scrollen verhindern:
- html, body { overflow-x: hidden; } als Basis
- Dekorative absolute Elemente auf Mobile verstecken (hidden sm:block)
- Übergroße Deko-Texte (z.B. "20+") auf Mobile skalieren oder ausblenden

### Konsistente Paddings:
Einheitliches Pattern für alle Sektionen: py-16 sm:py-20 lg:py-24

### Prüfmethode:
Von 320px bis 1920px durchscrollen. Kein horizontaler Scrollbalken erlaubt.
Alle Abstände konsistent.

## CSS-VARIABLEN VS. DIREKTE FARBEN (kritisch)

Bei farbkritischen UI-Elementen NIEMALS Tailwind-Variablen-Klassen verwenden.

### Verbotene Muster bei Bannern, Modals, Overlays, Tooltips:
- `bg-secondary`, `text-primary`, `border-accent`
- Diese Klassen referenzieren CSS-Variablen die durch die Tailwind-Config
  unerwartet anders gemappt sein können

### Stattdessen direkte Hex-Codes:
- `bg-[#1A1A1A]`, `text-[#C9A227]`, `text-white`
- Garantiert das was gemeint ist

### Wo Variablen-Klassen ok sind:
Normale Seiten-Bereiche (Sections, Cards) – hier ist Konsistenz mit der
Theme-Palette gewollt. Aber bei kritischen Lesbarkeits-Elementen: Risiko vermeiden.

## STICKY CONTACT BUTTON (Pflicht-Komponente)

Eigene Komponente: `StickyContact.astro`. Auf ALLEN Seiten einbinden.

- Position: fixed bottom-6 right-6 z-40
- Design: Primärfarbe, Telefon-Icon, Telefonnummer (auf Desktop sichtbar, mobil nur Icon)
- Klick → `tel:` Link oder zur Kontaktseite
- Auf jeder Seite durchscrollen prüfen: Button muss immer sichtbar bleiben

## LEISTUNGS-UNTERSEITEN (Standard, nicht nur Übersicht)

Für SEO und Tiefe braucht jede Leistung eine eigene Seite.

### Setup:
- Dynamische Route: `src/pages/leistungen/[slug].astro`
- Jede Leistung aus `site-data.json` bekommt automatisch eine Detailseite
- Übersichtsseite `/leistungen` verlinkt zu allen Detailseiten

### Inhalt jeder Detailseite:
- Hero mit Leistungs-spezifischem Bild
- Ausführliche Beschreibung (mindestens 300 Wörter)
- Bulletpoints zu Vorteilen / Vorgehen / Leistungsumfang
- CTA-Bereich (Kontakt für genau diese Leistung)
- Verwandte Leistungen am Ende (interne Verlinkung)

### SEO pro Detailseite:
- Eigener Title (Leistung + Ort)
- Eigene Description
- JSON-LD Service-Schema
- Breadcrumb-Schema

## STICKY CONTACT BUTTON – INTELLIGENT (IntersectionObserver)

Ein starrer fixed-Button ist auf Mobile störend wenn Hero oder Footer
sowieso schon Kontaktoptionen zeigen.

### Lösung:
StickyContact.astro mit IntersectionObserver:
- Beobachtet den Hero-Bereich und den Footer
- Auf Mobile (max-width: 768px): Button AUSBLENDEN solange Hero oder Footer sichtbar
- Auf Desktop: Button bleibt permanent sichtbar
- Smooth Fade-In/Out beim Wechsel

### Implementierungs-Skizze:
```javascript
const hero = document.querySelector('#hero, [data-hero]');
const footer = document.querySelector('footer');
const sticky = document.querySelector('#sticky-contact');

const observer = new IntersectionObserver((entries) => {
  const heroVisible = entries.some(e => e.target === hero && e.isIntersecting);
  const footerVisible = entries.some(e => e.target === footer && e.isIntersecting);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile && (heroVisible || footerVisible)) {
    sticky.classList.add('opacity-0', 'pointer-events-none');
  } else {
    sticky.classList.remove('opacity-0', 'pointer-events-none');
  }
});

if (hero) observer.observe(hero);
if (footer) observer.observe(footer);
```

## KONTAKTFORMULAR-VALIDIERUNG (häufiger Fehlerpunkt)

### Pflicht-Tests in Phase 3:
- Test 1: Formular ohne Eingabe absenden → klare Fehlermeldungen je Feld
- Test 2: Ungültige E-Mail eingeben → Validierungs-Fehler erscheint
- Test 3: DSGVO-Checkbox leer + absenden → Fehler erscheint, nicht doch gesendet
- Test 4: Honeypot-Feld (website) mit Wert → Submit wird abgewiesen
- Test 5: Korrekte Eingabe absenden → Loading-State sichtbar → Erfolgsmeldung
- Test 6: mailer.php Endpoint korrekt (kein /api/contact mehr)

### Häufige Fehler die nicht passieren dürfen:
- ContactForm fetcht /api/contact statt /mailer.php (alter Astro-API-Endpoint)
- DSGVO-Checkbox ist required aber vorausgefüllt (DSGVO-Verstoß)
- Loading-State fehlt → User klickt mehrfach
- Erfolgsmeldung fehlt → User weiß nicht ob es geklappt hat
- Formular leitet weiter statt inline Bestätigung zu zeigen

## MOBILE-OVERFLOW-PRÄVENTION (kritisch, jedes Projekt)

Dekorative absolute Elemente (Blur-Orbs, Canvas, Floating-Shapes, Code-Rain)
verursachen horizontalen Overflow auf Mobile, selbst mit overflow-x:hidden gesetzt -
weil sie oft `width: 600px+` haben und absolut positioniert sind.

### Pflicht in BaseLayout.astro (globales CSS):
```css
@media (max-width: 767px) {
  .parallax-orb, .floating-element, .deco-element, .code-rain {
    display: none !important;
  }
  #particle-network { max-height: 100% !important; height: 100% !important; }
}
```

### Im HTML:
- Große Deko-Elemente: `class="hidden sm:block"` oder `class="hidden lg:block"`
- Canvas-Elemente zusätzlich im JS prüfen (siehe nächster Abschnitt)

## CANVAS-ANIMATIONEN: MOBILE-CHECK IM JAVASCRIPT

CSS `display:none` stoppt KEIN `requestAnimationFrame` - Canvas-Berechnungen
laufen unsichtbar weiter und kosten Akku/Performance.

### Pflicht-Pattern:
```javascript
const canvas = document.getElementById('particle-network');
const isMobile = window.innerWidth < 640;

if (canvas && !isMobile && canvas.offsetParent !== null) {
  const ctx = canvas.getContext('2d');
  // Animation initialisieren
}

window.addEventListener('resize', () => {
  if (window.innerWidth < 640) {
    cancelAnimationFrame(animationId);
    return;
  }
});
```

Jede Canvas-Animation MUSS diesen Mobile-Check haben - nicht nur CSS-Versteck.

## RESPONSIVE SECTION-PADDINGS (Mobile-Kompression)

Desktop-Paddings wie py-24/py-32 erzeugen auf Mobile zu viel Leerraum -
Nutzer scrollen endlos durch Luft.

### Bevorzugtes Pattern (direkt im HTML, für neue Sektionen):
```html
<section class="py-12 sm:py-16 lg:py-24">
```

### Falls global nötig (BaseLayout.astro):
```css
@media (max-width: 767px) {
  section.py-24, section.py-32 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
  .gap-16 { gap: 2rem !important; }
  .gap-12 { gap: 1.5rem !important; }
  .space-y-32 > * + * { margin-top: 3rem !important; }
}
@media (min-width: 768px) and (max-width: 1023px) {
  section.py-24, section.py-32 { padding-top: 4rem !important; padding-bottom: 4rem !important; }
}
```

Einheitliches Pattern projektweit: py-12 sm:py-16 lg:py-24.

## TEXT-OVERFLOW-SICHERHEIT IN CARDS

Stats mit langen Labels ("Jahre Teamerfahrung") oder großen Zahlen ("99,7%")
brechen auf Mobile um oder überlaufen Card-Grenzen.

### Global in BaseLayout.astro:
```css
.stat-card, .metric-box, .badge, .tag, .chip { overflow: hidden; }
.stat-label, .metric-label {
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.stat-value { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-content { word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; }
.font-mono { word-break: normal; overflow-wrap: break-word; }
```

### Im HTML:
Stat-Cards: `overflow-hidden` auf Container. Lange Labels: `leading-tight break-words hyphens-auto`.
Zahlen: `truncate` (oder `break-all` nur wenn wirklich nötig).

## MULTI-STANDORT-UNTERNEHMEN (DACH-Pattern)

Bei mehreren Standorten (z.B. AT/DE/CH): konsistente Struktur in site-data.json,
Schema.org, Kontaktseite und Footer.

### site-data.json:
```json
"meta": {
  "standorte": [
    {"land": "Österreich", "adresse": "Straße, PLZ Ort", "kuerzel": "AT"},
    {"land": "Deutschland", "adresse": "Straße, PLZ Ort", "kuerzel": "DE"}
  ]
}
```

### Schema.org (BaseLayout.astro):
```json
"address": [
  {"@type": "PostalAddress", "addressLocality": "Wien", "addressCountry": "AT"},
  {"@type": "PostalAddress", "addressLocality": "Friedrichshafen", "addressCountry": "DE"}
],
"areaServed": ["AT", "DE"]
```

### Kontaktseite: Standorte als nummerierte Cards (01, 02, 03), Länderkürzel/Flagge,
optional Click-to-Load Maps pro Standort.
### Footer: Alle Standorte + rechtliche Hinweise pro Land falls nötig (CH: UID, AT: FN, DE: HRB).

## DYNAMISCHE ROUTEN FÜR WIEDERKEHRENDE INHALTE

Für Blog-Artikel, Stellenanzeigen und ähnlich wiederkehrende Inhalte: dynamische
Routen statt manuell einzelne Seiten zu pflegen.

### Pattern:
**1. Daten in site-data.json:**
```json
"stellenangebote": [
  {"slug": "senior-devops-wien", "titel": "Senior DevOps Engineer", "standort": "Wien"}
],
"blogArtikel": [
  {"slug": "cloud-security-guide", "titel": "Cloud Security Guide", "kategorie": "Security"}
]
```

**2. Route:** `src/pages/karriere/[slug].astro`, `src/pages/blog/[slug].astro`

**3. getStaticPaths:**
```javascript
export async function getStaticPaths() {
  return siteData.stellenangebote.map(job => ({
    params: { slug: job.slug }, props: { job }
  }));
}
```

Vorteile: einheitliches Layout, neue Einträge nur in JSON, automatische Sitemap,
keine vergessenen Seiten.

## ZWEISTUFIGE NAVIGATION (B2B/Enterprise, viele Leistungen)

Bei zu vielen Nav-Links (Enterprise/B2B mit vielen Bereichen): zwei Ebenen.

### Pattern:
- Secondary Bar (oben): Karriere, Über uns, Blog, Kontakt-Icon
- Main Nav (darunter): Kernleistungen (4-5 Links) + CTA-Button

### Scroll-Verhalten:
- Secondary Bar verschwindet (height:0, opacity:0)
- Main Nav bekommt weißen Hintergrund + Blur
- Logo wechselt von weiß zu farbig (siehe Logo-Wechsel-Regel)

### Mobile: Secondary Bar ausblenden, im Mobile-Menu beide Gruppen mit Trennlinie.

Nur bei wirklich vielen Leistungen/Bereichen einsetzen - sonst eine Nav-Ebene reicht.

## LOGO-WECHSEL BEI HEADER-TRANSFORMATION (Hell/Dunkel)

Dunkler Header mit weißem Logo wird beim Scrollen oft weiß - Logo verschwindet.

### Zwei Logo-Versionen in site-data.json:
```json
"bilder": {"logo": "/images/logo.svg", "logoWhite": "/images/logo_weiss.svg"}
```

### Header.astro: beide Versionen übereinander, Sichtbarkeit per CSS-Klasse steuern:
```css
#header.scrolled .header-logo { opacity: 1; }
#header.scrolled .header-logo-white { opacity: 0; }
```

```javascript
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});
```

Nur relevant wenn Header transparent/dunkel startet und beim Scrollen wechselt.

## LOGO-MARQUEE: MOBILE-VARIANTE

Auto-scrollende Logo-Marquees (Kunden/Partner-Logos) sind auf Mobile oft zu
schnell oder unnötig performancehungrig.

### Desktop: Auto-scrollende Marquee (mit dupliziertem Track für nahtlose Schleife)
### Mobile: Touch-scrollbar OHNE Animation:
```html
<div class="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
  <div class="flex gap-2 pb-2">{logos.map(...)}</div>
</div>
```

```css
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

## STICKYCONTACT: VERZÖGERTES EINBLENDEN

StickyContact erscheint sonst sofort beim Laden, obwohl der Hero noch eigene
CTA-Buttons zeigt - doppelte CTAs im sichtbaren Bereich wirken unruhig.

### Initial unsichtbar, nach 2 Sekunden erst einblenden:
```html
<a id="sticky-contact" class="opacity-0 translate-y-4 transition-all duration-500 ...">
```

```javascript
setTimeout(() => {
  document.getElementById('sticky-contact')?.classList.remove('opacity-0', 'translate-y-4');
}, 2000);
```

Kombinierbar mit der IntersectionObserver-Logik aus STICKY CONTACT BUTTON –
INTELLIGENT: verzögertes Einblenden initial, danach Observer-Logik für Hero/Footer.

## OG-IMAGE: PFLICHT-ARTEFAKT FÜR JEDEN BUILD

Jede Website braucht ein branded OG-Image (1200×630 px Querformat):
- Logo prominent (Markenwiedererkennung in Social-Preview)
- Firmenname / Hauptleistung als Text
- Passendes Hintergrundfoto im Querformat
- Dateigröße < 200 KB (JPEG oder WebP)
- Ablage: /public/images/og-image.jpg

Pflicht-Meta-Tags (BaseLayout.astro):
og:image, og:image:width (1200), og:image:height (630),
og:image:type (image/jpeg), og:image:alt, og:image:secure_url,
og:site_name, og:locale (de_DE),
twitter:card (summary_large_image), twitter:image, twitter:image:alt

Prüfung nach Deploy: https://www.opengraph.xyz/ – Vorschau muss Querformat zeigen.

## FARB-DRIFT: REACT-KOMPONENTEN PRÜFEN

React-Komponenten driften von CSS-Variablen ab wenn sie direkt Hex-Werte
hardcoden statt CSS-Custom-Properties zu nutzen.

Pflicht-Check vor Deploy:
grep -ri "bg-\[#\|text-\[#\|border-\[#" src/components/

Jede hardcoded Hex-Farbe prüfen:
- Ist das der aktuelle Brand-Farbwert?
- Oder ein veralteter Wert aus alter tailwind.config?

Lösung: tailwind.config Farb-Keys referenzieren CSS-Variablen:
  primary: "var(--color-primary)" statt "#1E3A5F"
→ Alle Komponenten nutzen dann bg-primary und sind automatisch konsistent.


## MOBILE NAVIGATION ICONS: INLINE-SVG STATT LUCIDE-REACT (aus TCM-Projekt)

NIEMALS Lucide-React für Nav-Toggle-Buttons – React-Hydration kollidiert
mit Vanilla-JS-Scripts (Race Condition, Button reagiert nicht).

STATTDESSEN: Inline SVG direkt im Astro-Template:
```html
<button id="mobile-menu-btn" aria-expanded="false">
  <span class="menu-icon"><!-- inline hamburger SVG --></span>
  <span class="close-icon hidden"><!-- inline X SVG --></span>
</button>
```
State über aria-expanded + hidden/block Toggle der zwei Spans.

## STICKY CONTACT: REDUNDANZ-CHECK (aus TCM-Projekt)

Wenn Navigation BEREITS eine Telefonnummer zeigt:
→ StickyContact nur Icon + "Kontakt"-Text, Link auf /kontakt. KEINE zweite Nummer.
Wenn Nav KEINE Nummer zeigt: → StickyContact zeigt Icon + Telefonnummer.
Header und StickyContact nie dieselbe Info doppelt.

## CARD-GRIDS: BILD-ASPECT-RATIO ERZWINGEN (aus TCM-Projekt)

Bei Grids mit mehreren Cards IMMER aspect-ratio setzen, sonst unruhiges Grid:
```html
<div class="aspect-4/3"><img class="w-full h-full object-cover" /></div>
```
Konsistent über ALLE Cards. Nie w-full h-auto in Grids.

## PAGEHERO: MIN-HEIGHT + PADDING-TOP STATT FESTER HÖHE (aus HMT-Projekt)

h-[45vh] + items-end führt auf 320px zu Text-Überlauf in die Nav.
Richtig: min-h + responsive padding-top:
```html
<section class="relative pt-28 sm:pt-32 lg:pt-36 min-h-[45vh] lg:min-h-[50vh] flex items-end overflow-hidden">
```
Bei 320px prüfen: Text muss unter der Nav bleiben.

## COUNTER-ANIMATIONEN: COOKIE-BANNER ABWARTEN (aus HMT-Projekt)

Counter erst starten wenn Cookie-Banner bestätigt – sonst läuft die Animation
unbemerkt hinter dem Banner ab. CookieBanner löst Event aus:
```javascript
window.dispatchEvent(new CustomEvent('cookieconsent'));
```
Counter-Observer sammelt wartende Elemente in pendingCounters-Set,
startet sie beim cookieconsent-Event. Wiederkehrende Besucher: Counter normal.

## COUNTER-ANIMATION: FORMAT ERHALTEN (aus HMT-Projekt)

"45+" darf nach der Animation nicht "45" werden, "1.500" nicht "1500".
Vor Animation Original parsen:
```javascript
const suffix = (original.match(/[^\d.,\s]+$/) || [''])[0];
const sep = (original.match(/\d([.,])\d{3}/) || ['',''])[1];
```
Nach Animation Suffix + Tausendertrenner wieder anwenden.

## DOWNLOADS: BUILD-TIME EXISTENZ-CHECK (aus HMT-Projekt)

Jeder Download-Link prüft zur Build-Zeit ob die Datei existiert:
```javascript
import fs from 'node:fs'; import path from 'node:path';
const checkFile = (p) => fs.existsSync(path.join(process.cwd(), 'public', p));
```
Fehlende Dateien → "Auf Anfrage"-Mailto-Button statt totem 404-Link.

## MEHRSPRACHIGKEIT: ZENTRALISIERTE ÜBERSETZUNGEN (aus HMT-Projekt)

Bei i18n keine Textduplikation in Seitenkopien. Struktur:
src/i18n/ui.ts (kurze Strings), content.ts (lange Texte), utils.ts (useTranslations).
Seiten nutzen nur t('key') – Änderungen an genau einer Stelle.

## OG-IMAGE: NUR ABSOLUTE URLs (aus HMT-Projekt)

og:image, og:image:secure_url, twitter:image MÜSSEN absolute URLs sein –
relative Pfade werden von Facebook/LinkedIn nicht aufgelöst:
```javascript
const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
```

## A11Y: SUCHFELDER MIT ARIA-LABEL (aus HMT-Projekt)

Jedes <input type="search"> ohne sichtbares <label> braucht aria-label.
Lighthouse Accessibility prüft das explizit.

## SPLIT-HERO BILDAUSSCHNITT (aus TCM-Projekt)

VOR jeder Hero-Implementierung Hauptmotiv lokalisieren:
Motiv rechts → object-right oder object-[80%_center]. Links → object-[20%_center].
Mobile-Override wenn nötig: class="object-center sm:object-right".
NIEMALS blindes object-cover ohne Motiv-Check.

## PROJEKTREGELN (Detail-Referenz aus v1)

### Logo
NIEMALS verändern. Farbe, Form, Proportionen 1:1.

### Fonts
Lokal in /public/fonts/ als WOFF2. Niemals Google CDN.
@font-face in BaseLayout, font-display: swap, preload kritisch.

### Cookie-Banner (DSGVO)
3 Buttons: Alle akzeptieren / Nur notwendige / Einstellungen.
Consent in localStorage. Cookie-Link im Footer.

### Tech Stack
Astro 5+ (static), Tailwind 3.4+, TypeScript strict,
React nur für Kontaktformular (client:visible), lucide-react,
React Hook Form + Zod, PHP Mailer (/public/mailer.php).

### DSGVO
Fonts lokal. Datenschutz-Checkbox required, nicht vorausgefüllt.
Google Maps nur Click-to-Load. Impressum + Datenschutz vollständig.

### Performance-Ziele
Lighthouse: Performance 85+, SEO 95+, Accessibility 90+, Best Practices 90+
Bilder als WebP über Astro Image, lazy loading below the fold.

### Qualitäts-Gate
Visual QA Score min. 8/10 vor Deploy.
Neue Website muss BEWEISBAR besser und interessanter als alte sein.


## TEXTLESBARKEIT AUF FARBIGEN HINTERGRÜNDEN

### Auf hellen Accent-Farben (Gelb, Orange, Hellgrün):
- NIEMALS text-white verwenden
- IMMER dunkle Textfarbe (text-gray-900 oder dunkle Markenfarbe)

### Auf dunklen Farben (Primary, Dark):
- text-white ist ok
- Alternativ helle Accent-Farbe für Hervorhebungen

### Prüfung:
Jeden Button und jede farbige Fläche visuell prüfen.
Kontrast-Ratio mindestens 4.5:1 für normalen Text.

## HERO-DESIGN-KONSISTENZ ÜBER SEITEN

Alle Unterseiten haben IDENTISCHES Hero-Layout mit identischen Deko-Elementen.
Nur die Startseite darf ein eigenes, größeres Hero-Design haben.

### Falsch:
- Startseite: Gold-Ecke links oben
- Leistungen: Gold-Linien rechts oben
- Kontakt: Wieder anderes Muster

### Richtig:
- Startseite: eigenes großes Hero
- Alle Unterseiten: ein einheitliches Hero-Template mit gleichen Deko-Elementen,
  nur Bild/Headline/Eyebrow tauschen

### Prüfung:
Vor Deploy: alle Unterseiten nebeneinander öffnen, Hero-Bereiche vergleichen.
Sollten wie aus einem Guss wirken.

## DEKO-ELEMENTE ZUR CONTAINER-FORM PASSEND

Wenn ein Container abgerundete Ecken hat (rounded-2xl, rounded-3xl), dürfen
Deko-Elemente nicht eckig sein – das wirkt wie ein Designfehler.

### Falsch:
- Bild mit rounded-3xl, darauf Gold-Corner mit geraden Linien

### Richtig:
- Eckiger Container → eckige Corner-Akzente erlaubt
- Runder Container → Floating Badges (selbst gerundet), Punkt-Akzente, Schatten
- Regel: Deko darf nie gegen die Form des Containers arbeiten

## HINTERGRUNDBILDER: RUHE BEI VIEL TEXT

Je mehr Text im Vordergrund, desto ruhiger der Hintergrund.

### Stats/Counter/Zahlen-Sektionen:
- Niemals buntes, detailreiches Foto im Hintergrund
- Stattdessen: subtiles Muster (goldenes Gitter, Punktraster) mit opacity-[0.05]-[0.10]
- Wenn unbedingt Foto: ruhiges, leicht unscharfes Motiv, max. opacity-[0.15]

### Text-Sektionen mit langen Absätzen:
- Einfarbiger Hintergrund oder sehr subtiler Verlauf
- Keine konkurrierenden Bildmotive hinter Fließtext

Bunte, detailreiche Fotos sind HAUPT-Bildmotive – nie Hintergrund hinter Text.

## HERO-HEADLINES: MOBILE-UMBRÜCHE KONTROLLIEREN

Lange Hero-Headlines brechen auf Mobile (320-390px) oft an unschönen Stellen.

### Lösung – explizite Zeilenumbrüche:
```html
<h1>
  <span class="block">Wenn's um</span>
  <span class="block text-accent">Strom</span>
  <span class="block">geht, vertrauen</span>
  <span class="block">Sie dem <span class="text-accent">Profi.</span></span>
</h1>
```

### Regeln:
- Schlüsselwörter (Marke, Kernbegriff) auf eigene Zeile
- Akzentfarbe auf das wichtigste Wort
- IMMER auf 320px Breite testen, nicht nur Desktop

## RESPONSIVE BILD-FOKUS (object-position)

Hero-Bilder brauchen oft unterschiedlichen Fokuspunkt auf Mobile vs. Desktop.

### Problem:
Hero-Bild zeigt Person rechts. Auf Mobile (320px) wird die Person abgeschnitten
weil object-position zentriert ist.

### Lösung:
Vor jedem Hero: prüfen WO das Hauptmotiv liegt (Person, Produkt, Kernobjekt).
Responsive object-position setzen.

### Beispiel:
- Motiv rechts im Bild: `object-[85%_30%] sm:object-[center_30%]`
- Motiv links: `object-[15%_30%] sm:object-[center_30%]`
- Motiv mittig: `object-[center_30%]` (kein Wechsel nötig)

Die Mobile-Variante schiebt das Bild so dass das Motiv sichtbar bleibt.
Auf Desktop bleibt es zentriert.

## RESPONSIVE OVERLAYS

Wenn der Bildausschnitt auf Mobile anders ist (siehe object-position oben),
muss der Gradient/Overlay separat angepasst werden.

### Problem:
Auf Mobile schiebt sich ein hellerer Bildbereich unter den Text. Kontrast bricht weg.

### Lösung:
Gradient mit responsive Werten – auf Mobile stärker:
```html
<div class="bg-gradient-to-r from-white/95 via-white/85 to-white/60
            sm:via-white/80 sm:to-white/35"></div>
```

Faustregel: Wenn object-position responsive ist, ist auch der Overlay responsive.

## LEISTUNGS-HERO LESBARKEIT: ALLE EINZELN PRÜFEN

Schwierigste Bilder sind nicht vorhersehbar:
- Schnee/Eis → weißer Text auf Weiß (unsichtbar)
- Helle Pflasterflächen → zu viel Licht im oberen Bereich
- Grünes Laub → grüner Eyebrow-Text auf grünem Hintergrund

Robustes Overlay-Pattern (funktioniert für ALLE Bildtypen):
1. Basis-Scrim über gesamtes Bild: rgba(0,0,0,0.45) – dunkelt auch Weiß ab
2. Gerichteter Gradient: from-black/60 to-transparent
3. text-shadow auf ALLE Text-Elemente (Eyebrow, Headline, Subline)
4. Eyebrow IMMER in Akzentfarbe (Gold/Orange) – nie Grüntöne wenn Bild grün sein kann

CHECK: Jeden Leistungs-Hero EINZELN auf Mobile (390px) durchklicken.
Nicht nur die Startseite – jede Unterseite hat ihr eigenes Bild mit eigenen Tücken.


## SUBPIXEL-LÜCKEN BEI SVG-DIVIDERN (EGS)

1px-Lücken zwischen Sektionen bei bestimmten Zoomstufen (90%, 110%, 125%):
- Divider-SVG mit translate-y-[1px] an die Kante ziehen
- Bei hartnäckigen Fällen negative Margin statt Transform
- Zoom-Stufen beim Abnehmen kurz durchschalten

## MOBILE-NAV-DETAILS (im gesperrten Header v2 bereits eingebaut)

Akkordeon (ein Untermenü offen), Scroll-Lock mit scrollY-Speicherung
(body position:fixed + top:-scrollY, beim Schließen restore), iOS:
menü-eigenes overflow-y:auto + -webkit-overflow-scrolling:touch,
keine opacity-0-Ausgangszustände auf interaktiven Elementen.
Hier nur dokumentiert, falls ein Projekt mit .no-component-sync
einen eigenen Header pflegt.
