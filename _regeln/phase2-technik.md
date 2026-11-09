# PHASE 2 – TECHNIK-REGELN
# Wird von Claude zu Beginn von Phase 2 KOMPLETT gelesen.

## ⬤ ZUERST: DIE GESPERRTEN BAUSTEINE (Pflicht-Nutzung)

Diese Komponenten existieren fertig und getestet – NIEMALS neu bauen
(ein Hook blockt Änderungen, die Meldung GESPERRT ist Absicht):
- BaseLayout.astro   → title/description/ogImage/lcpBild (+ lcpVarianten bei PageHero) als Props, Rest automatisch
                       (Schriftfarbe auf Flächen, Reveal/Zähler, Scroll-Effekte data-scroll,
                       Seitenübergänge, Radius, --hero-h, Fokus, "Zum Inhalt"-Link)
- src/middleware.ts  → Umbruch-Regeln auf allen Seiten (keine Hurenkinder, Trennung nur an
                       Wortfugen, (m/w/d) klein). Lange Projektwörter: site-data.json
                       "umbruch": { "trennstellen": ["Lohn|buchhaltung"] }
- Section.astro      → JEDE Sektion nutzt sie: <Section variant="standard|kompakt|buehne" bg="base|tint|dark">
                       Eigene <section class="py-..."> sind VERBOTEN (Abstands-System!)
- Header.astro       → Navigation aus site-data.json (navigation: [{label, href}]), Active-State automatisch
- Footer.astro       → komplett aus site-data.json (meta, kontakt, navigation)
- PageHero.astro     → title/subtitle/image/imagePosition/eyebrow; Höhe = Fenster minus
                       Navigation, nutzt AVIF/WebP-Varianten von `npm run bilder` automatisch
- StickyContact.astro → Text/Icon über site-data "sticky": { titel, zeile, icon, href }
- CookieBanner.astro → Text richtet sich nach site-data "externeInhalte": ["Google Maps"]
                       (leer = Seite lädt nichts Externes; qa-checks prüft beides)
- DemoBar.astro      → immer sichtbar, sobald meta.demo = true
- SektionsKopf.astro / Fragen.astro / Oeffnungszeiten.astro → siehe phase2-design.md
- KarteLaden.astro   → Google-Karte NUR über diesen Baustein: lädt erst nach Einwilligung, "Alle akzeptieren"
                       zeigt sie sofort, Widerruf an der Karte. Dazu externeInhalte: ["Google Maps"] und ein
                       Google-Maps-Abschnitt in der Datenschutzerklärung. Andere Widgets (Chat, Buchung, Video)
                       nach dem Muster ../../_referenzen/bausteine/ChatLaden.astro, fremde Einbau-Skripte
                       (Objektlisten, Buchung) gekapselt per ../../_referenzen/bausteine/ExternesWidget.astro. Ein fest eingebautes
                       <script src="https://…"> blockt qa-checks.
- Cta.astro          → letzte Sektion vor dem Footer: <Cta titel="…" text="…" buttonText="…" />
                       (eigene Karte mit Abstand zum Footer, verschmilzt nie)
- KontaktKarte.astro → Firma + Ansprechpartner + Adresse/Route + Telefon + Mail + Zeiten
                       <KontaktKarte /> auf der Kontaktseite und in Kontakt-Sektionen (Alge),
                       ohneZeiten, wenn <Oeffnungszeiten> auf derselben Seite steht

Dein Spielraum: Sektions-Inhalte, eigene Komponenten in src/sections/
(z.B. GewaesserKarte.astro, LeistungsGrid.astro), Bilder, Texte, Anordnung
INNERHALB von <Section>. Volle Kreativität dort – null in den Grundlagen.

site-data.json braucht dafür: meta.firmenname, meta.kurzbeschreibung, meta.logo,
meta.siteUrl, meta.inhaber, navigation[], kontakt{telefon,email,strasse,plz,ort,
oeffnungszeiten}, design.farben{primary,secondary,accent,background,text},
design.fonts{display,body} (Namen passend zu src/styles/fonts.css; Namen mit
Ziffer in Anführungszeichen: "'Source Sans 3', sans-serif").
Optional: design.textAuf, design.radius, kontakt.land ("DE" | "AT" | "CH", Vorwahl in
Telefon-Links), kontakt.oeffnungszeitenWoche, externeInhalte, sticky, umbruch.trennstellen,
meta.logoMail, meta.mailPflichtangaben, meta.webdesign (false = ohne Credit im Footer),
meta.logoFooterStil, meta.logoFooter, meta.logoMitName,
design.fontPreload ["/fonts/display.woff2"]. `node validate-sitedata.js` prüft alles.
Menüpunkte mit Untermenü ohne eigene Seite: children angeben, href weglassen
(Header zeigt dann einen Button, Footer listet die Unterseiten).

## KONTAKTFORMULAR: SMTP ÜBER PHPMAILER-BUNDLE (aus HMT-Projekt)

PHP mail() ist unzuverlässig (Spam, Zustellung). Stattdessen PHPMailer über SMTP,
Dateien direkt gebündelt (kein Composer auf Shared Hosting):
public/mailer.php (Kit v2) + public/phpmailer/{Exception,PHPMailer,SMTP}.php (im Template)
Secrets in public/.env.php (gitignored + .htaccess "Require all denied").
.env.php.example als Vorlage committen. Bei Übergabe: SMTP-Daten und ggf. MAIL_TO in .env.php.
mailer.php v2 schickt ZWEI gestaltete Mails (Spöri): Anfrage an den Betrieb und
Eingangsbestätigung an den Absender, mit Logo (PNG/JPG, meta.logoMail falls das
Logo ein SVG ist), Markenfarbe, Adresse, Zeiten, Links zu Website, Impressum und
Datenschutz. Pflichtangaben (z. B. Kammer, USt-IdNr.) in meta.mailPflichtangaben.
Alles kommt aus site-data.json (optimize-build.js schreibt dist/mailer-daten.json),
Anrede du/sie und Ich/Wir aus tonalitaet. Die Bestätigung enthält bewusst keine Kopie
der Nachricht (Missbrauchsschutz). CORS nur für die eigene Domain. mailer.php nicht
umschreiben; Projektwünsche über site-data.json.

## HAZIRI-LEARNINGS (Technik-Bündel 2026-07)

### Lange URLs in Impressum/Datenschutz
`class="break-all"` auf Links, URL-Text ohne https:// anzeigen. Verhindert
320px-Overflow. (Die EU-OS-Plattform ist seit 20.07.2025 eingestellt: nicht verlinken.)

### SMTP-Testdaten: aus ../../mail-config.json
Initial IMMER Nikos Test-SMTP verwenden – Werte aus ../../mail-config.json lesen
und in public/.env.php eintragen (NIE committen, .env.php ist gitignored).
Bei Kundenübergabe durch Kundendaten ersetzen (Checkliste im PROJEKTBERICHT).
Hinweis: IONOS-SMTP ist von manchen Shared-Hosts geblockt (Port 587) –
Fallback auf natives mail() muss im mailer.php enthalten sein.

### PHPMailer: vollqualifizierter Namespace
`use`-Statements sind in if-Blöcken nicht erlaubt (500er!). Immer:
```php
$m = new \PHPMailer\PHPMailer\PHPMailer(true);
$m->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
```

### Kontaktseite: 3 große tappable Buttons
Telefon (tel:), WhatsApp (wa.me/), E-Mail (mailto:) als prominente Buttons –
Desktop 3-spaltig, Mobile full-width untereinander. Nie nur als Text.

### Video-Hero: object-position prüfen
Hintergrund-Videos: sichtbaren Ausschnitt auf Mobile prüfen,
object-position setzen (z.B. center 50% für Bildmitte).

### Galerie/Referenzen: Lightbox
Mit nativem <dialog> + wenig JS (kein Package). Thumbnails klickbar → Originalgröße.

## KI-BILDGENERIERUNG (Verweis)
Falls in Phase 1 KI-Bilder erzeugt wurden (Rangfolge siehe phase1-research.md):
optimize-images.js läuft danach normal drüber (Komprimierung). KI-Bilder wie
alle anderen behandeln – aspect-ratio, width/height, object-position beachten.


## STICKY-BUTTON, COOKIE-BANNER, DEMO-LEISTE: FERTIG IM KIT
Verzögerung, Ausblenden bei Hero/CTA/Footer/offenem Cookie-Banner, Rand gegen
Verschmelzen, Platz für die Demo-Leiste: alles eingebaut. Nichts davon selbst
bauen oder nachbessern. qa-craft prüft das Verhalten auf jeder Seite.

## BILDAUSSCHNITT BEI STARKEM BESCHNITT (Mobile-Hero & Cards)

Ein 16:9- oder 3:2-Bild in einem hochformatigen Mobile-Slot wird zwangsläufig
stark beschnitten – das ist normal. Der Fehler entsteht, wenn niemand steuert,
WELCHER Ausschnitt sichtbar bleibt: dann schneidet der Standard-Mittelpunkt
das Motiv weg (Kopf ab, Gebäude halb, Hauptmotiv außerhalb).

Pflicht bei jedem object-cover-Bild mit starkem Beschnitt (Faktor > 1.5):
1. Motiv lokalisieren und `object-position` setzen:
   `class="object-cover object-[50%_35%]"` (Motiv im oberen Drittel)
   Häufig: Landschaft mit Himmel → object-[50%_65%]; Person/Gebäude → object-[50%_30%]
2. ODER Art Direction mit eigenem Mobile-Zuschnitt:
```html
<picture>
  <source media="(max-width: 640px)" srcset="/images/hero-mobile.jpg">
  <img src="/images/hero.jpg" class="w-full h-full object-cover" alt="…">
</picture>
```
3. Bei Card-Grids: aspect-ratio des Slots am Bildformat orientieren
   (3:2-Bilder → aspect-[3/2], nicht aspect-square).

qa-craft.js meldet nur Bilder OHNE Steuerung – ein bewusst gesetztes
object-position gilt als gelöst.

## FARBEN NUR AUS SITE-DATA.JSON
Farben kommen ausschließlich aus design.farben über das gesperrte BaseLayout
(inkl. Alpha-Stufen wie bg-primary/5 und der Schriftfarben text-on-*).
Keine eigenen :root-Farbvariablen, keine zweite Farbdefinition in Sektionen
(zirkuläre Variablen haben früher die ganze Palette zerstört, qa-checks prüft).

## CTA-SEKTION: IMMER KLAR VOM FOOTER GETRENNT (Opitz)
Standard ist <Cta> aus dem Kit: eigene Karte (rounded-3xl, Schatten, Tiefe) auf
neutralem Grund mit Abstand zum Footer. Nichts ragt in den Footer hinein.
Baust du eine eigene letzte Sektion (z. B. Foto mit Kontaktdaten), darf sie
nicht dieselbe Fläche wie der Footer haben: qa-craft meldet "verschmilzt".


# ─── Aus phase2-design.md verschoben (technische Umsetzung) ───


## CODE-QUALITÄT (kein KI-Smell)

### Tu das:
- Kurze, präzise Kommentare nur wo nötig
- Klare kurze Variablennamen (`user`, nicht `theUserObject`)
- Konstanten oben in der Datei
- Frühe Returns statt verschachtelter if-else
- TypeScript: konkrete Typen, nie `any`
- Komponenten erst extrahieren wenn 2x verwendet
- Tailwind-Klassen logisch sortiert

### Tu das NICHT:
- Kommentare die Offensichtliches erklären (`// Set the name`)
- Übertriebene Defensive-Checks
- Verbose Funktionsnamen (`handleUserButtonClickEvent`)
- JSDoc für triviale Funktionen
- `console.log` im Production-Code
- `as any` oder `// @ts-ignore`
- Auskommentierten Code
- Mehrere Leerzeilen am Stück

## APACHE / SHARED HOSTING 404-ROUTING (.htaccess)

Astro generiert bei SSG eine /404.html – aber Apache liefert die nicht
automatisch aus.

### Problem:
Auf IONOS/Strato/All-Inkl Shared Hosting kommt bei unbekannten URLs eine
hässliche Server-Standard-Fehlermeldung statt der gestalteten 404-Seite.

### Pflicht-Lösung:
Datei `public/.htaccess` erstellen mit:
```
ErrorDocument 404 /404.html

# Optional: Cache-Headers für Performance
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/webp "access plus 6 months"
</IfModule>

# Optional: Gzip-Kompression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript text/xml
</IfModule>
```

Die .htaccess wird beim Build mitkopiert. PFLICHT in jedem Projekt.

## .gitignore HYGIENE (Projekt-Dateien NICHT ins Repo)

Interne Autopilot-Dateien gehören NICHT ins Git-Repo des Kunden.

### Pflicht in .gitignore (sofort beim Projektstart eintragen):
```
# Autopilot interne Dateien
CLAUDE.md
KUNDE.md
progress.json
VERBESSERUNGEN.md
PROJEKTBERICHT.md
_lessons-learned.md
.autopilot-prompt.txt
visual-qa-report.json
lighthouse-report.json

# Secrets
.env
.env.local
deploy-config.json
github-config.json

# Build & Dependencies
node_modules/
dist/
.astro/

# OS
.DS_Store
Thumbs.db
```

Vor dem ersten `git commit`: prüfen dass .gitignore vollständig ist.
Das Repo enthält nur sauberen Website-Quellcode – keine Prompts, keine Reports.


## AKTUELLES/NEWS: IMMER CONTENT COLLECTION

Dynamische Inhalte (Aktuelles, News, Termine mit Fließtext) NIE hardcoden:
- Schema in src/content/config.ts (title, datum, teaser, bild optional)
- Einträge als Markdown in src/content/aktuelles/
- Liste sortiert nach Datum, Detailseiten via [slug].astro
Grund: Der Kunde/Niko kann Einträge per Datei ergänzen, ohne Code anzufassen.
Nachträgliches Umstellen kostet Stunden (EGS-Learning).

## WIEDERHOLTE MUSTER IN KOMPONENTEN

CTA-Sektionen, Kontakt-Karten, Leistungs-Karten NICHT inline mehrfach schreiben.
Cta.astro und KontaktKarte.astro liegen fertig im Kit (@LOCKED):
    <Cta titel="…" text="…" buttonText="…" buttonHref="/kontakt/" />
    <KontaktKarte />   oder auf Farbfläche: <KontaktKarte variante="offen" />
Weitere wiederkehrende Muster als eigene Komponente in src/components/ anlegen
(z.B. ServiceCard.astro) – eine Änderung, eine Stelle.

## KI-BILDER SIND PLATZHALTER

generate-image.js protokolliert jedes erzeugte Bild in KI-BILDER.md.
Diese Bilder sind erkennbar künstlich und vor Go-Live durch echte Fotos oder
recherchierte lizenzfreie Aufnahmen (Unsplash, Pexels) zu ersetzen.
qa-checks warnt, solange offene Einträge in KI-BILDER.md stehen; qa-live blockt
sie auf der Kundendomain. Das OG-Bild nie per KI: `node og-bild.js`.
Im Projektbericht an Niko IMMER auflisten, welche Bilder KI-generiert sind.

## DEMO-LEISTE FÜR AKQUISE-DEMOS

Vorab gebaute Demos auf *.niko-endres.de tragen eine Hinweisleiste
("Dies ist eine unverbindliche Demo und nicht die offizielle Seite dieser Firma."
+ Link zu niko-endres.de). Aktivierung ausschließlich über site-data.json:
    "meta": { "demo": true, "staging": true }
Beides zusammen – eine Demo darf nie indexiert werden (qa-checks blockt sonst).

Die Leiste sitzt am UNTEREN Bildschirmrand (fixed bottom-0). Die @LOCKED-
Komponente DemoBar.astro setzt --demo-bar-h; Body-Padding, Sticky-Contact und
Cookie-Banner rechnen die Variable ein und weichen automatisch nach oben aus.
Bei demo=false ist die Variable 0 und nichts verschiebt sich.
NIEMALS eigene Offsets gegen die Leiste bauen – das bricht beim Go-Live.
Eigene fixed-Elemente am unteren Rand immer mit
`bottom: calc(<wert> + var(--demo-bar-h, 0px))` positionieren.

## GO-LIVE-CHECKLISTE (Staging -> Kundendomain)

1. site-data.json: meta.staging auf false (steuert robots-Meta im Layout)
1b. site-data.json: meta.demo auf false (entfernt die Demo-Leiste)
2. site-data.json: meta.siteUrl auf die Kundendomain
3. astro.config.mjs: site auf die Kundendomain (qa-checks vergleicht beides)
4. robots.txt: Allow + Sitemap-Zeile mit Kundendomain
4b. public/.env.php: SMTP-Zugang des Kunden (Testmail senden, beide Mails in Gmail und Outlook ansehen)
5. KI-BILDER.md abarbeiten: alle KI-Bilder durch echte Fotos ersetzen
6. npm run qa (grün) && node deploy.js && node qa-live.js https://kundendomain.de
qa-live schlägt Alarm bei noindex/Disallow, Demo-Leiste, offenen KI-Bildern,
OG-Bild ohne JPG oder mit falscher Domain und Canonical auf der Staging-Domain.

## KONTAKTFORMULAR EINBINDEN (Schwabenpflege)

`<ContactForm client:visible={{ rootMargin: "2500px" }} />` statt nur `client:visible`: sonst ist das
Formular beim ersten Klick weiter unten noch nicht interaktiv (qa-contact-form prüft die Hydration).

## SCHRIFTEN OHNE LAYOUTSPRUNG (Schwabenpflege: Desktop-CLS 0,2)

In src/styles/fonts.css für die Fließtextschrift eine größenangepasste Ersatzschrift anlegen und in
design.fonts.body direkt dahinter nennen. Dann nimmt Arial bis zum Laden dieselbe Breite ein:
```css
@font-face { font-family: 'Source Sans 3 Ersatz'; src: local('Arial'), local('ArialMT'), local('Liberation Sans');
  size-adjust: 93%; ascent-override: 110%; descent-override: 43%; line-gap-override: 0%; }
/* site-data: "body": "'Source Sans 3', 'Source Sans 3 Ersatz', sans-serif" */
```
Werte je Schrift anpassen (size-adjust so, dass ein Absatz gleich viele Zeilen hat). Hero-Schriften
zusätzlich in design.fontPreload. qa-speed misst die Startseite auch auf dem Desktop (CLS unter 0,1).

## ROBOTS.TXT AUF DEMOS (Joos)

Demos sperren Suchmaschinen, aber NICHT die Link-Vorschau (WhatsApp, Facebook,
LinkedIn halten sich an robots.txt, sonst kommt beim Verschicken keine Vorschau):
```
User-agent: facebookexternalhit
User-agent: WhatsApp
User-agent: Twitterbot
User-agent: LinkedInBot
User-agent: Slackbot
Allow: /

User-agent: *
Disallow: /

Sitemap: https://<subdomain>.niko-endres.de/sitemap-index.xml
```
Die Indexierung verhindert zusätzlich das noindex-Meta (meta.staging).

## BILDER, SEO, GEO: AUTOMATISCH (Spöri, Joos, Weber)

- `npm run bilder` (bild-formate.js): AVIF + WebP in 800 px und groß für alle Fotos.
  Danach nutzen PageHero und das LCP-Vorladen sie von selbst. Eigene Bilder:
  `<picture>` mit `<source type="image/avif" srcset="/images/x-800.avif 800w, /images/x.avif 1600w">`.
- `npm run build` ruft optimize-build.js: WebP-Verweise, Lazyload ab dem zweiten Bild,
  fehlende Bildmaße, Schema (WebSite, BreadcrumbList, LocalBusiness), llms.txt.
  Eigene, genauere Daten (z. B. AccountingService, JobPosting, FAQPage) gehen vor:
  optimize-build ergänzt nur, was fehlt.
- qa-seo prüft Titel (max. 60 Zeichen), Beschreibungen (120–160), eine H1 pro Seite,
  Canonical, Schema, Alt-Texte, llms.txt.

## WEITERE TECHNIK-DETAILS

Spezialfälle (Formulare, Video, Karten, Overlays,
spezielle Responsive-Fälle) stehen in _referenzen/technik-details.md.
Dort NUR nachschlagen, wenn der konkrete Fall im Projekt auftritt.
