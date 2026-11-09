# PHASE 2 – DESIGN-REGELN
# Wird von Claude zu Beginn von Phase 2 KOMPLETT gelesen.

## ⬤ LIES ZUERST: DIE LEITIDEE FÜHRT, DIE REGELN DIENEN

In Phase 1 hast du eine DESIGN-LEITIDEE formuliert (z.B. "Wie Wellen auf einem
stillen See"). Diese Leitidee ist der CHEF dieser ganzen Datei.

Alles was hier folgt – Kataloge, Patterns, CSS-Techniken – ist ein
REPERTOIRE, aus dem du wählst um die Leitidee umzusetzen. Es ist NICHT eine
Checkliste, die du stur abarbeitest. Der Unterschied ist der zwischen einer
Website die "korrekt" ist und einer die BERÜHRT.

Arbeitshaltung für Phase 2:
1. Halte die Leitidee im Kopf wie ein Musiker die Tonart.
2. Triff mutige Gestaltungs-Entscheidungen, die der Leitidee dienen.
   Ein stimmiges, eigenständiges Design schlägt ein regelkonformes Allerwelts-Design.
3. Nutze die folgenden Muster als Werkzeug – wähle bewusst, kombiniere neu,
   lass weg was nicht passt. Wenn die Leitidee etwas verlangt das hier nicht
   steht: TU ES TROTZDEM, wenn es gut ist.
4. ⚠ ABGRENZUNG – das gilt NUR für Gestaltung, NICHT fürs Handwerk:
   Unverhandelbar und OHNE Ausnahme einzuhalten sind alle TECHNISCHEN und
   HANDWERKLICHEN Regeln: Sticky-Contact-Verhalten (bei Hero+Footer ausblenden,
   nichts überlappen), Bild-Proportionen (object-fit, nie verzerren), Footer
   identisch auf allen Seiten, Responsive ohne Overflow, Lesbarkeit, DSGVO,
   Relaunch-Inhaltsvollständigkeit. Diese prüft die Maschine (npm run qa) und
   sie sind KEIN "Angebot". Freiheit hast du bei Farbe, Form, Layout, Rhythmus,
   Typo, Bewegung – also bei allem ÄSTHETISCHEN. Nicht beim Handwerk.
   Merksatz: Die Leitidee bestimmt WIE es aussieht, nie OB es funktioniert.

Frage bei jeder Design-Entscheidung nicht "welche Regel gilt hier?",
sondern "was würde die Leitidee tun?". So entsteht Wow statt 84%.

Denk an das PRINZIP hinter UNERA (nicht den Stil): Eine einzige starke Idee,
konsequent umgesetzt, ergibt eine stimmige Seite. Maßstab: wie ein 250.000€-Projekt einer
Spitzenagentur (Niko, 20.10.2026). Bei UNERA war die
Idee weich ("wie Wellen"). Bei einem Schlosser ist sie hart, bei einer Bäckerei
warm, bei einem Steuerberater klar. IMMER zur Branche passend, NIE UNERAs Look
kopieren. Sei der mutige Gestalter, der DIESER Firma ihre eigene Vision gibt.

────────────────────────────────────────────────────────────────────────

## DESIGN-PHILOSOPHIE (HÖCHSTE PRIORITÄT)

Das Ziel ist NICHT "sauber und professionell". Das ist die Falle die zu
langweiligen, generischen Websites führt. Das Ziel ist:

**MUTIG + CHARAKTERVOLL + TROTZDEM PROFESSIONELL**

Stell dir die besten Agentur-Websites vor (Awwwards-Niveau). Die sind nie
langweilig. Sie haben eine Idee, einen Charakter, etwas das im Kopf bleibt.

### Was eine Website von "okay" zu "wow" hebt:

**1. Eine gestalterische Leitidee**
Jede Website braucht EIN starkes visuelles Konzept das sich durchzieht.
Nicht nur "Sektionen untereinander". Beispiele:
- Ein durchgehendes geometrisches Motiv
- Eine markante diagonale/asymmetrische Führung
- Ein wiederkehrendes Akzent-Element (Linien, Formen, Muster)
- Eine ungewöhnliche aber konsistente Raumaufteilung

**2. Typografie als Designelement**
- Headlines GROSS und mutig (clamp bis 6-7rem auf Desktop)
- Starke Größenkontraste zwischen H1, H2, Body
- Gerne Mix aus zwei Schriftcharakteren (z.B. markante Display + klare Sans)
- Übergroße Zahlen/Wörter als visuelle Anker
- Text darf auch mal über Bilder ragen, überlappen, gedreht sein

**3. Mut zu Weißraum UND Dichte im Wechsel**
- Nicht alles gleichmäßig. Spannung durch Rhythmus.
- Mal viel Luft, mal dicht und intensiv
- Asymmetrie statt immer zentriert

**4. Bewegung und Tiefe**
- Parallax-Effekte auf Hero und Bildsektionen
- Scroll-getriggerte Animationen (Elemente fahren ein, Zahlen zählen hoch)
- Hover-Effekte mit Charakter (nicht nur Schatten – auch Farb-Shifts, Scale, Reveals)
- Layering: Elemente überlappen, Schatten erzeugen Tiefe
- Sanfte Page-Transitions

**5. Unerwartete Akzente**
- Ein mutiger Farbakzent an überraschender Stelle
- Asymmetrische Bild-Anordnungen statt Grid-Langeweile
- Diagonale Schnitte zwischen Sektionen statt gerader Linien
- Übergroße Akzent-Elemente die aus dem Raster brechen

### Die Balance (WICHTIG):
Mutig heißt NICHT chaotisch oder unseriös. Auch ein Handwerker oder Arzt
darf eine beeindruckende, charaktervolle Website haben – sie nutzt dann
eben kraftvolle aber passende Mittel (starke Typo, gute Fotos, klare Führung)
statt verspielter Gaming-Elemente.

Branchen-Anpassung des MUTES:
- Handwerk/Bau: mutig durch kraftvolle Typo, satte Erdfarben, große Bilder, diagonale Energie
- Gastronomie: mutig durch appetitliche Großaufnahmen, warme Intensität, sinnliche Layouts
- Arzt/Gesundheit: mutig durch klare Eleganz, großzügige Ruhe, edle Akzente (nicht steril!)
- Industrie/B2B: mutig durch technische Präzision, starke Raster-Brüche, beeindruckende Zahlen
- Coaches/Berater: mutig durch persönliche Großaufnahmen, inspirierende Typo, Bewegung
- Einzelhandel: mutig durch Produkt-Inszenierung, lebendige Akzente

### Verboten (führt zu Langeweile):
- Alle Sektionen gleich aufgebaut (Titel-Text-Bild, Titel-Text-Bild...)
- Alles zentriert
- Brave gleichgroße Cards im 3er-Grid ohne Variation
- Schwache, kleine Headlines
- Nur Schatten als einziger Hover-Effekt
- Gerade Trennlinien zwischen allen Sektionen
- Vorhersehbarer Standard-Aufbau den man 1000x gesehen hat

## TEXTQUALITÄT (Pflicht-Check, natürliches Deutsch)

Texte müssen wie von einem deutschen Muttersprachler klingen – nicht abgehackt,
nicht wie eine Stichwortliste, nicht maschinell.

### Verbotene Muster:
- Zwei-Wort-Sätze: "Wir liefern. Wir halten."
- Komma-Aufzählungen statt Sätzen: "Schnell, zuverlässig, fair."
- Abgehackte Parallelkonstruktionen: "Kein X, kein Y. Punkt."
- Stichwort-Paare: "Ein Anruf, ein Ergebnis."

### Stattdessen:
- Vollständige Sätze mit natürlichem Fluss
- Ergänzungen mit Komma, Doppelpunkt, Klammer oder Nebensatz
- KEINE Gedankenstriche (Nikos feste Stilregel, qa-copy prüft). Bis-Striche
  wie "Mo–Fr" oder "8–12 Uhr" sind erlaubt.
- Nebensätze und Konjunktionen nutzen

### Beispiel-Transformationen:
- "Wenn wir zusagen, halten wir." → "Was wir zusagen, das setzen wir auch um. Darauf können Sie sich verlassen."
- "Kein Ausreden, kein Verschieben. Punkt." → "Seit über 20 Jahren halten wir, was wir versprechen: ohne Ausreden und ohne Verschieben."
- "Ein Anruf, ein Ansprechpartner." → "Bei uns haben Sie immer denselben Ansprechpartner."
- "Faire Preise, pünktlich, alles besenrein." → "Die Preise waren fair, das Team war pünktlich und am Ende war alles besenrein."

### Ich oder Wir:
Einzelunternehmer ohne Team schreiben in der Ich-Form (Alge: René ist eine
One-Man-Show, "wir" wirkt dort unehrlich). In site-data.json festhalten:
tonalitaet.perspektive = "ich" oder "wir". qa-copy prüft die Ich-Form.

### Prüfmethode:
Text laut vorlesen. Klingt es wie natürliche Sprache oder wie eine Stichwortliste?
Würde ein deutscher Muttersprachler so sprechen?

## TYPOGRAFISCHE KONSISTENZ INNERHALB EINER SEITE

Sektionen auf derselben Seite müssen rhythmisch zusammenpassen.

### Problem:
"Story" linksbündig, "Mission" zentriert, "CTA" zentriert – wirkt wie aus
verschiedenen Templates zusammengebaut.

### Regel:
Wenn textlastige Sektionen direkt aufeinander folgen UND inhaltlich ähnlich sind
(Beschreibung, Mission, Werte): gleiche Textausrichtung verwenden.

Alignment-Wechsel nur bei Muster-Wechsel:
- Text-Sektion zentriert → Grid mit Cards linksbündig (Wechsel ok)
- Text-Sektion zentriert → nächste Text-Sektion linksbündig (NICHT ok)

### Prüfung:
Auf jeder Unterseite alle Sektionen untereinander betrachten. Wirkt der Rhythmus
schlüssig oder springt der Eindruck?

## CONVERSION-UX (Pflicht – schön reicht nicht, es muss konvertieren)

### Der 3-Sekunden-Test (Hero-Pflicht):
Ein Besucher der NUR den Hero sieht muss beantworten können:
1. WER ist das? (Firmenname/Logo klar sichtbar)
2. WAS machen die? (Leistung in der Headline oder Subline, nicht nur Slogan)
3. WO sind die? (Ort sichtbar – für lokale Dienstleister Pflicht im Hero)
4. WAS soll ich tun? (Ein klarer CTA)
Schöne aber vage Heros ("Qualität die begeistert") fallen durch → konkretisieren.

### Klickbare Telefonnummer (lokale Dienstleister = Pflicht):
- Im Header/Nav: Telefonnummer als tel:-Link, auf Mobile prominent
- Für Handwerker/Notdienste ist der Anruf DER Conversion-Weg, nicht das Formular
- Mobile: Telefon-Icon + Nummer im Sticky-Bereich oder Header immer erreichbar

### Vertrauen FRÜH zeigen (nicht erst im Footer):
Direkt im oder unter dem Hero mindestens 2 von:
- Google-Bewertung (Sterne + Anzahl, nur wenn echt)
- "Seit 19XX" / "XX Jahre Erfahrung"
- Zertifikate/Mitgliedschaften (Innung, Meisterbetrieb, Bio-Siegel)
- "Über X zufriedene Kunden" (nur wenn belegbar)
Siegel der Originalseite stehen in MARKE.md (Dateien original-bilder/_SIEGEL-*).
Sie gehören auf die Startseite: als Eyebrow im Hero, als Vertrauensleiste direkt
unter dem Hero oder als eigene Karte. Originaldatei verwenden (SVG bevorzugt),
nie nachbauen (Opitz: DATEV-Siegel). qa-relaunch prüft, ob sie übernommen wurden.

### Kontaktseite-UX:
- Formular ODER Telefonnummer above the fold – nicht erst nach Anfahrt+Öffnungszeiten
- Antwortzeit-Erwartung setzen: "Wir melden uns innerhalb von 24h"
- Alternative Kontaktwege sichtbar (Tel, Mail, WhatsApp) – Menschen haben Präferenzen

### Mobile-Conversion:
- Daumen-Zone: Wichtigste CTAs in der unteren Bildschirmhälfte erreichbar
- Formularfelder groß genug (min. 44px Touch-Target)
- Kein CTA der auf Mobile unter dem Fold verschwindet ohne Sticky-Alternative
- Hero-CTA auf 390×844 ohne Scrollen sichtbar (qa-craft prüft, Alge): Hero mobil
  höchstens min-h-[70svh], Text nicht zu tief, Buttons flex-col sm:flex-row

## GESTALTUNGS-QUALITÄT (branchenneutral – gilt immer)

Das hier ist HANDWERK, kein Stil. Gilt für jedes Projekt, egal welche Leitidee:
- Weißraum großzügig. Enge Seiten wirken billig, Luft wirkt teuer.
- Echter Kontrast: nie graue Schrift auf farbigem Grund, nie Text ohne Scrim auf Bild.
  Schrift auf Farbflächen immer text-on-primary / text-on-accent / text-on-secondary
  (wird nach Kontrast berechnet, Weiß auf Gold bleibt, Weiß auf Gelb nie). qa-craft misst.
- Keine Default-Farben: kein #007BFF-Blau, kein reines #000, kein kaltes #FFF als Fläche.
- Genau EINE Markenfarben-Familie (2-3 Stufen) + Neutrals. Keine zweite Buntfarbe.
- Max. 2 Schriftfamilien. Kontrast über Gewicht und Größe, nicht über eine dritte Schrift.
- Bildsprache über die ganze Seite konsistent (Licht, Farbtemperatur, Nähe).
- Abstände aus dem ABSTANDS-SYSTEM. Keine frei erfundenen Werte.

## FORMSPRACHE KOMMT AUS DER LEITIDEE – NICHT AUS EINEM KATALOG

Es gibt KEINEN festen Haus-Stil mehr. Die Formsprache leitet sich aus dem
Charakter der Leitidee ab. Ein Metallbauer darf nicht aussehen wie eine
Yoga-Praxis, nur weil beide "hochwertig" sein sollen.

| Charakter der Leitidee | Rundungen | Formen | Farbwelt | Bildsprache |
|---|---|---|---|---|
| weich/organisch (Coaching, Wellness, Natur) | rounded-2xl/3xl | Bögen, Wellen, Kreise | warme Neutrals, gedeckt | weiches Licht, Nähe |
| hart/präzise (Metall, Bau, Industrie, Technik) | rounded-none/sm | Kanten, sichtbares Raster, Diagonalen | kühl oder erdig, hoher Kontrast | Material, Detail, Werkzeug |
| warm/handwerklich (Bäckerei, Gastro, Hof) | rounded-lg/xl | ruhige Rechtecke, Materialtextur | satte Erdtöne | Prozess, Hände, Produkt |
| klar/seriös (Kanzlei, Praxis, Beratung) | rounded-md/lg | striktes Raster, viel Luft | gedeckt, wenig Farbe | Ordnung, Ruhe, Person |
| lebendig/jung (Verein, Sport, Event) | gemischt, mutig | Überlappung, Schnitte | kräftig, kontrastreich | Bewegung, Menschen, Aktion |

Regel: EINE Formsprache pro Projekt, konsequent durchgezogen. Nicht mischen.
Wenn du unsicher bist, welche Zeile gilt: nochmal die Leitidee lesen.

## MUSTER: BEWÄHRT vs. GEDANKENLOS

Es gibt keine grundsätzlich verbotenen Elemente – es gibt nur gedankenlose
Anwendung. Eyebrow-Labels, Stats-Counter, Testimonial-Avatare, Prozess-Schritte
sind BEWÄHRTES Conversion-Handwerk (Nikos eigene Seite nutzt sie erfolgreich).
Slop entsteht, wenn sie ohne Grund gestapelt werden.

### Diese Elemente sind ERLAUBT und oft richtig:
Eyebrow über H2 (über `<SektionsKopf>`, Niko will sie) · Stats/Zahlen-Counter · Testimonials mit Avatar/Initialen ·
nummerierte Prozess-Schritte · Trust-Badges · 3er-Card-Grids · Feature-Pills
Bedingung: Sie tragen echte Information (echte Zahlen, echte Namen, echte Schritte).

### Wirklich vermeiden (weil inhaltsleer oder abgenutzt):
- ERFUNDENE Sozialbeweise: "127+ zufriedene Kunden" ohne echte Zahl,
  Stock-Avatare für Testimonials, Fake-Logos
- Gradient-Text auf Headlines
- Emoji als Icon-Ersatz
- Wellen-SVG zwischen JEDER Sektion
- Eyebrow-Labels die nur die H2 wiederholen ("Leistungen" über "Unsere Leistungen")
- Beliebige Füll-Adjektive statt Fakten ("innovativ", "hochwertig", "individuell")

### Der eigentliche Test
Nicht "ist dieses Element modern?", sondern:
"Trägt es echte Information, die dieser Kunde wirklich hat?"
Ein Stats-Counter mit "seit 1961" ist stark. Einer mit "500+ Projekte"
bei einem Handwerker mit 3 Mitarbeitern ist Slop.


## SCHRIFTWAHL: DIE VERBRANNTEN DEFAULTS MEIDEN

Die Schrift ist einer der stärksten Treiber des "generischen KI-Looks".
Ein einziger Font-Tausch macht eine Seite oft spürbar eigenständiger.

### ⛔ NICHT verwenden (auf zu vielen KI-Seiten, sofort erkennbar):
Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans, Space Grotesk,
Playfair Display, Poppins, Montserrat, Open Sans, Lato.
Diese Schriften sind nicht schlecht – sie sind ERSCHÖPFT. Wer sie sieht,
denkt "Standard-Website", bevor er den ersten Satz liest.

### ✔ Kuratierter Pool (alle Open Source, lokal als WOFF2 einbindbar)

**Sans – warm/bodenständig** (Handwerk, Verein, Gastro, lokale Dienstleister):
Source Sans 3 · Libre Franklin · Karla · Work Sans · Atkinson Hyperlegible

**Sans – technisch/industriell** (Metall, Bau, IT, B2B):
IBM Plex Sans · Archivo · Chivo · Roboto Flex (nur Flex-Variante)

**Sans – klar/premium** (Beratung, Praxis, Kosmetik):
Instrument Sans · Public Sans · Be Vietnam Pro · Onest

**Serif – Headlines** (statt Fraunces/Playfair):
Source Serif 4 · Instrument Serif · Newsreader · Literata · Crimson Pro ·
Bitter · Zilla Slab · Petrona · Spectral · EB Garamond

### Auswahl-Regeln
1. Die Schrift muss der DESIGN-LEITIDEE dienen. Harte Leitidee → kantigere
   Schrift (Archivo, Chivo). Warme Leitidee → humanistische (Source Sans 3, Karla).
2. Superfamilien-Trick für sichere Harmonie: Source Serif 4 + Source Sans 3
   (füreinander entworfen). Ebenso IBM Plex Serif + IBM Plex Sans.
3. Maximal 2 Schriftfamilien pro Projekt. Kontrast über Gewicht/Größe, nicht
   über eine dritte Schrift.
4. Lesbarkeit ist NIE ein Argument für Inter – der Pool oben ist genauso lesbar.
   Bei echtem Accessibility-Fokus: Atkinson Hyperlegible (von der Braille-Stiftung
   für maximale Lesbarkeit entwickelt).
5. Kunden-CI schlägt alles: Hat der Kunde eine Hausschrift, wird sie verwendet.

### Umsetzung
Immer lokal als WOFF2 in /public/fonts/ (nie Google CDN – DSGVO + Performance),
font-display: swap, preload für die kritische Schrift im BaseLayout.
Die gewählte Schrift + Begründung gehört in DESIGN-BRIEF.md unter Typografie.

## ⬤ HERO UND KIT-BAUSTEINE (Nikos dauerhafte Regeln, qa-craft prüft)

### Hero
- Höhe = sichtbares Fenster minus Navigation und Demo-Leiste, auf ALLEN Seiten:
  `min-h-[var(--hero-h)]` (Startseite eigene Sektion mit `data-hero`), PageHero macht
  es selbst. Nicht höher (Weber UHD: "unten fehlen die Berge"), nicht kürzer.
- Keine Zahlen-/KPI-Leiste im Hero (Spöri: "wirkt wie eine Hotel-Buchungsmaske").
  Kennzahlen gehören als ruhige Information darunter, mit Abstand zum Fensterrand.
- Scroll-Szenen im Hero höchstens 40svh Scrollweg (Spöri: "dauert ewig").
- Jeden Effekt vorher in EINEM Satz begründen: welche Botschaft trägt er?
  (Spöri: "Abend wird Morgen" = Weitblick. Fensterlicht ohne Aussage flog raus.)
- Ist das Motiv im Hochformat nicht ganz sichtbar (Gebäude, Landschaft): eigenes
  Mobil-Layout, Text oben auf Farbfläche, darunter das ganze Motiv als Bildband.
- Ruhig nach Branche: Kanzlei, Praxis, Bank ruhig und langsam; Ferienhof darf spielen.

### Bausteine aus dem Kit (gesperrt, über Props/site-data anpassen)
- `<SektionsKopf eyebrow titel text>`: JEDER Sektionskopf. Eyebrow (beginnt groß),
  Headline, Text, dann Links (Slot "aktionen"), immer untereinander, nie Split
  (Headline links, Text rechts gefiel in Spöri und Weber nicht).
- `<Fragen fragen={[{f, a}]}>`: FAQ immer als Akkordeon, volle Contentbreite.
- `<Oeffnungszeiten>`: Wochenübersicht gruppiert (Mo–Do) mit Live-Status in
  natürlichem Deutsch. Daten: kontakt.oeffnungszeitenWoche. Steht sie auf einer Seite,
  dort `<KontaktKarte ohneZeiten />` (nie doppelt).
- Radius: Buttons `rounded-knopf`, Karten, Bilder, Boxen `rounded-karte`. Die Werte
  kommen aus design.radius ("eckig", "dezent", "weich", "rund"). Kantige Leitideen
  (Kanzlei, Metall) = "eckig" oder "dezent".
- Sticky-Kontakt projektbezogen: site-data "sticky": { "titel", "zeile", "icon" }
  (Spöri: "Persönliches Gespräch / Termin vereinbaren", Weber: "Ferien anfragen").

### Einheitlichkeit
- Ein Muster, das für eine Unterseite entsteht (Intro-Karte, Kopf, Abschluss),
  gilt sofort für ALLE Templates (Leistung, Stelle, Service, Kontakt).
- Nebeneinanderliegende Boxen gleich hoch; Nachbarspalten beginnen gemeinsam
  unter der Headline, nie auf ihrer Höhe.
- Kein Bild zweimal auf einer Seite. Der Abschluss-CTA wählt sein Bild gegen das Hero-Bild.
- Volle Contentbreite für Inhalte (FAQ, Rechtstexte, Listen), Lesebreite nur im Sektionskopf.
- Keine Bildunterschriften als Deko (Spöri: entfernt); nur wenn sie Information tragen.
- Überschriften einer Kartenreihe haben gleich viele Zeilen (Titel angleichen oder kürzen).
- Uhrzeiten immer voll und zweistellig: "08:00 Uhr", "08:30–12:00 Uhr" (nicht "8 Uhr", "8:30", "8.00").
  Kit-Öffnungszeiten und Middleware machen das automatisch, im eigenen Text selbst so schreiben.
- Lesefluss macht die Middleware (v3): Einleitungen mit `data-lead` oder `class="lead"` bekommen
  Satz-Blöcke, h1/h2 brechen vor `<em>` und nach dem Doppelpunkt, Satzanfänge hängen am zweiten Wort.
  Eigene Einleitungs-Absätze deshalb mit `class="lead"` auszeichnen statt `<br>` zu setzen.
- Nichts verlässt die Contentkante (auch Hero-Text und Wisch-Reihen am Desktop). Randlose Bühne:
  `class="buehne-huelle"` und im Inhalt `padding-left: var(--rand)`; qa-craft prüft bei 1440 px.
- Nummerierte Listen: große Ziffer und Überschrift als gemeinsame Zeile mittig, Ziffer und Fließtext
  auf der Grundlinie der ersten Zeile (qa-craft weist auf Versatz hin).
- Deko-Formen (Wellen, Kurven, Nähte) nur, wenn sie in der übrigen Formsprache vorkommen. Eckige Seite
  = gerade Kanten (Schneider: drei Hero-Runden für Wellen, die Niko alle entfernt hat).
- Hero vor dem Zeigen bei 1440 UND 2000 px ansehen (Text an der Kante, Motiv nicht abgeschnitten).
- Pro Unterseite ein nützliches Werkzeug (Rechner, Checkliste, Wegweiser, Anfrageformular) statt einer
  weiteren Textsektion. Vor dem Bau die Wortzahl alt/neu vergleichen, Wiederholungen streichen.
- Footer mit großem Logo: `meta.footerLayout: "logo-oben"` (Logo mit Linie oben, drei Spalten darunter).
  Breite Wortmarke im Header: `meta.logoHoehe: [56, 70]`.
- Zeitleisten chronologisch, "Heute" steht am Ende, nie zwischen Jahreszahlen.
- Kein Hochspringen beim Neuladen (macht das Kit), Akkordeons öffnen weich (Fragen aus dem Kit).
- Mobil: Kartengruppen als Wisch-Reihe (`class="wisch"` am Raster, Punkte kommen automatisch),
  Kennzahlen als ruhige Leiste, lange Linklisten aufklappbar, nichts doppelt. Ziel: Startseite
  auf dem Handy deutlich unter 12.000 px (Schwabenpflege: 20.000 px, qa-craft weist darauf hin).
  Mobil vor Niko zeigen, nicht erst nach seiner Rückmeldung verbessern.
- Automatisch wechselnde Inhalte (Slider, Bewertungs-Karussell) nur mit sichtbarer
  Pause-Taste, Stopp bei Hover und Fokus, und gar nicht bei "Bewegung reduzieren".
  Besser: alle Inhalte nebeneinander oder per Wischen, ohne Automatik.

## ⬤ MUT-KATALOG – Techniken die Eindruck machen (das Gaspedal)

Die anderen Abschnitte sagen dir, was du NICHT tun sollst. Dieser sagt, was du
TUN sollst, damit die Seite bumst. Wähle 1 Signature Moment + 2-3 Verstärker.
Alles hier ist mit Astro + Tailwind + CSS/wenig JS umsetzbar, performant, ohne
schwere Libraries. Alle respektieren prefers-reduced-motion.

### 0. Kit-Bewegung (Standard, immer da, keine eigenen Skripte)
Das BaseLayout bringt Einblenden und Zähler mit. Nur Attribute setzen:
```html
<h2 data-reveal>…</h2>                          <!-- von unten -->
<div data-reveal="links">…</div>                <!-- auch: rechts, zoom, blende -->
<div class="grid …"><article data-reveal>…</article><article data-reveal>…</article></div>
                                                <!-- Geschwister automatisch gestaffelt -->
<p><span data-counter>1.250</span>+ Geräte</p>  <!-- Zahl steht fertig im HTML -->
```
Das Kit animiert NUR, was beim Laden unterhalb des ersten Bildschirms liegt.
Hero, H1, Kennzahlen im ersten Bildschirm stehen sofort da (Alge), darunter
entsteht der Wow (Opitz). Keine eigenen IntersectionObserver-Reveals mehr
schreiben: qa-craft meldet Inhalte, die im ersten Bildschirm verzögert erscheinen.
Hover mit Charakter gehört dazu: Karten hover:-translate-y-1 + Schatten,
Buttons mit leichtem Lift. Dosierung: Überschriften und Kartengruppen, nicht
jeder Absatz.

Scroll-Effekte aus dem Kit (Motion, nur geladen, wenn die Seite sie nutzt,
GPU-beschleunigt, bei "Bewegung reduzieren" aus). Nur Attribute setzen:
```html
<img data-scroll="parallax" data-staerke="8" …>   <!-- Bild wandert langsamer als die Seite -->
<img data-scroll="zoom" …>                        <!-- zoomt beim Hereinscrollen von 1.12 auf 1 -->
<p data-scroll="woerter" class="text-4xl …">…</p> <!-- Satz hellt sich Wort für Wort auf (Spöri-Manifest) -->
<span data-scroll="fortschritt" class="block h-px bg-accent"></span>  <!-- Linie wächst mit; data-richtung="y" senkrecht -->
```
Höchstens ZWEI Scroll-Effekte pro Seite, jeder mit Begründung (siehe HERO).
Parallax-Bilder brauchen Reserve: Bild 120 % hoch in einem overflow-hidden-Rahmen.

### 1. Scroll-Driven Animations (natives CSS – der stärkste Hebel 2026)
Kein JS, kein IntersectionObserver, GPU-billig, läuft mit dem Scrollbalken:
```css
@supports (animation-timeline: view()) {
  .sd-reveal {
    animation: sd-in linear both;
    animation-timeline: view();
    animation-range: entry 5% cover 35%;
  }
  @keyframes sd-in {
    from { opacity: 0; transform: translateY(48px) scale(.96); }
    to   { opacity: 1; transform: none; }
  }
  /* Bild "zoomt raus" während man scrollt – wirkt teuer */
  .sd-zoom img { animation: sd-scale linear both; animation-timeline: view();
                 animation-range: cover; }
  @keyframes sd-scale { from { transform: scale(1.25); } to { transform: scale(1); } }
}
@media (prefers-reduced-motion: reduce) { .sd-reveal, .sd-zoom img { animation: none; } }
```
Fallback für ältere Browser: das @supports greift einfach nicht, Inhalt ist normal da.

### 2. Seitenübergänge (schon aktiv, reines CSS)
Das BaseLayout blendet Seitenwechsel bereits sanft über (@view-transition).
Für ein Element, das über Seiten "fliegt" (Bild der Leistungskarte wird zum
Hero der Detailseite), auf BEIDEN Seiten denselben eindeutigen Namen setzen:
```html
<img src={bild} style={`view-transition-name: leistung-${slug}`} />
```
KEIN Astro-ClientRouter: er bricht Menü, Sticky-Button und Reveal nach dem
ersten Seitenwechsel (qa-checks blockt ihn).

### 3. Zeilen-/Wort-Reveal bei Headlines
Erste Wahl: `data-scroll="woerter"` aus dem Kit (an den Scroll gekoppelt).
Die folgende zeitgesteuerte Variante nur, wenn es wirklich ein Einblenden sein soll.
NICHT für die H1 im Hero (Alge: erster Bildschirm steht sofort da):
```html
<h2 class="reveal-words">Wir bauen <span>Gärten</span> die bleiben</h2>
```
```javascript
document.querySelectorAll('.reveal-words').forEach(el => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.innerHTML = el.textContent.trim().split(' ')
    .map((w,i) => `<span style="--i:${i}">${w}</span>`).join(' ');
});
```
```css
.reveal-words span { display:inline-block; opacity:0; transform:translateY(.6em);
  animation: word-in .6s cubic-bezier(.2,.8,.2,1) forwards;
  animation-delay: calc(var(--i) * 70ms); }
@keyframes word-in { to { opacity:1; transform:none; } }
```

### 4. Sticky-Scroll-Storytelling (der klassische "teure" Moment)
Ein Element bleibt stehen, der Inhalt daneben wechselt beim Scrollen.
Ideal für: Leistungen, Ablauf, Gewässer, Produktvarianten.
```html
<section class="grid lg:grid-cols-2 gap-16">
  <div class="lg:sticky lg:top-24 h-fit"><!-- Bild/Karte/Grafik bleibt --></div>
  <div class="space-y-[60vh]"><!-- Schritte scrollen durch --></div>
</section>
```
Mit JS die aktive Stufe hervorheben (IntersectionObserver auf die Schritte).

### 5. Übergroße, angeschnittene Typografie
Headline größer als der Viewport erlaubt – bewusst am Rand abgeschnitten:
```css
.mega { font-size: clamp(3.5rem, 14vw, 12rem); line-height: .85;
        letter-spacing: -.04em; }
```
Wichtig: negatives letter-spacing. line-height unter 1 NUR bei einzeiligen
Riesenzeilen. Mehrzeilige Überschriften mindestens 1.15 (Spöri: g und f
überlappten bei 1.06, "darf nie passieren", qa-craft prüft). Zaghaft = 2.5rem Headline.

### 6. Clip-Path-Reveal für Bilder
Bild wird beim Scrollen "aufgedeckt" statt eingeblendet:
```css
.clip-reveal { clip-path: inset(0 0 100% 0); transition: clip-path 1.1s cubic-bezier(.7,0,.2,1); }
.clip-reveal.visible { clip-path: inset(0 0 0 0); }
```

### 7. Horizontale Scroll-Sektion
Eine Sektion scrollt seitwärts während die Seite vertikal scrollt. Für
Projekt-Galerien, Zeitleisten, Referenzen. Auf Mobile: normaler Touch-Scroll.
```javascript
const track = document.querySelector('.h-track');
const wrap = document.querySelector('.h-wrap'); // height: 300vh
addEventListener('scroll', () => {
  const r = wrap.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (wrap.offsetHeight - innerHeight)));
  track.style.transform = `translateX(${-p * (track.scrollWidth - innerWidth)}px)`;
});
```

### 8. Magnetische Buttons (Desktop-Detail, das hängen bleibt)
Der Button "zieht" den Cursor leicht an:
```javascript
if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.25}px, ${(e.clientY-r.top-r.height/2)*.35}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}
```

### 9. Grain-/Noise-Overlay (macht flache Farbflächen wertig)
```css
body::after { content:''; position:fixed; inset:0; pointer-events:none; z-index:1;
  opacity:.035; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
```
Entweder richtig (0.03-0.05 opacity) oder gar nicht – halbherzig sieht schmutzig aus.

### 10. Zahlen-Counter mit Format-Erhalt
`<span data-counter>1.250</span>` aus dem Kit (siehe 0.). Format, Suffix und
Tausenderpunkt bleiben exakt, bei offenem Cookie-Banner wartet der Zähler.
Wirkt nur mit echten Zahlen.

---

### DOSIERUNG – aber jetzt richtig herum gedacht
Die Zurückhaltungs-Regeln in dieser Datei (max. 2 Effekte, Hero-Komplexität
begrenzen etc.) gelten für RUHE-BRANCHEN: Therapie, Arzt, Pflege, Bestatter.
Sie sind KEINE allgemeine Obergrenze.

| Branche | Signature Moment | Verstärker |
|---|---|---|
| Therapie, Arzt, Pflege, Bestatter | 1 ruhiger (z.B. sanftes Scroll-Reveal) | 1-2, sehr dezent |
| Verein, Gastro, Einzelhandel, Handwerk | 1 kräftiger | 2-3 |
| Bau, Metall, Automotive, Sport | 1 lauter (Mega-Typo, Sticky-Story) | 3-4 |
| Kreativ, Agentur, Premium-Produkt | 1 spektakulärer | 4+, darf auffallen |

Im Zweifel: EIN Effekt richtig und mutig schlägt fünf zaghafte.
Ein Design, das niemandem wehtut, beeindruckt auch niemanden.

## ⬤ KOMPOSITIONS-KATALOG – das, was Design von Sektionen unterscheidet

⚠ WICHTIG ZUERST: Diese Techniken sind ein ANGEBOT für bewusste Gestaltung,
KEINE Checkliste. Sie blind einzubauen ("irgendwo eine negative Margin, irgendwo
ein 7/4-Raster") macht das Design SCHLECHTER, nicht besser – Text klebt am Rand,
Elemente überlappen sinnlos, Abstände brechen. Jede dieser Techniken braucht eine
gestalterische Begründung und muss danach visuell geprüft werden.
Wenn du nicht sehen kannst, ob es besser aussieht: LASS ES. Ein sauberer,
ruhiger Aufbau schlägt eine kaputte Komposition deutlich.

Der MUT-KATALOG oben regelt Bewegung. DIESER regelt Aufbau – und der ist wichtiger.
Eine Seite aus gestapelten Standard-Sektionen bleibt generisch, egal wie viele
Effekte darauf liegen. Mindestens 3 dieser Techniken pro Projekt einsetzen.

### ⛔ Das generische Skelett, das der Autopilot sonst baut
```
<section class="py-20"><div class="container">
  <h2 class="text-center">Überschrift</h2>
  <div class="grid md:grid-cols-3 gap-8"> 3 gleiche Cards </div>
</div></section>
```
Fünfmal untereinander. Das ist der Grund für "sieht aus wie ein Template".

### 1. ÜBERLAPPUNG über Sektionsgrenzen (stärkster Einzelhebel)
Ein Element ragt in die nächste Sektion hinein. Erzeugt sofort Tiefe und
den Eindruck, dass jemand komponiert hat statt gestapelt.
```html
<section class="relative pt-24 pb-40 bg-primary text-white">
  <div class="container">…Inhalt…</div>
</section>

<section class="relative z-10 -mt-28">
  <div class="container">
    <div class="bg-white rounded-3xl shadow-2xl p-8 lg:p-14">
      …ragt in die Sektion darüber hinein…
    </div>
  </div>
</section>
```
Varianten: Bild ragt heraus, Zahlen-Leiste sitzt auf der Kante, Karte überlappt Hero.

### 2. ASYMMETRISCHES RASTER (nie stumpf 50/50)
```html
<div class="grid lg:grid-cols-12 gap-8 items-start">
  <div class="lg:col-span-7">…Hauptinhalt…</div>
  <div class="lg:col-span-4 lg:col-start-9 lg:mt-24">…Nebeninhalt, versetzt…</div>
</div>
```
Das `lg:mt-24` ist entscheidend: der Versatz macht aus zwei Spalten eine Komposition.

### 3. AUS DEM CONTAINER AUSBRECHEN
Bild über die volle Fensterbreite, Text im Container darüber:
```html
<div class="relative">
  <img src={bild} class="relative left-1/2 -translate-x-1/2 w-screen h-[65vh] object-cover" />
  <div class="container relative -mt-24 lg:-mt-32">
    <div class="bg-background p-8 lg:p-14 max-w-2xl rounded-2xl shadow-xl">
      <h2>…</h2>
    </div>
  </div>
</div>
```

### 4. ÜBERSCHRIFTEN NICHT IMMER MITTIG
Zentrierte Überschrift bei JEDER Sektion ist das sicherste Zeichen für Template.
Regel: max. ein Drittel der Sektionen zentriert. Der Rest linksbündig, gern
mit Nebeninhalt rechts daneben (Beschreibung, Zahl, CTA).

### 5. EDITORIAL-DETAILS (kosten nichts, wirken teuer)
```html
<span class="font-mono text-xs tracking-widest text-accent">01 / 04</span>
<div class="h-px w-16 bg-current opacity-30"></div>
<!-- vertikales Label am Rand -->
<span class="absolute left-0 top-32 -rotate-90 origin-top-left
             text-[11px] tracking-[0.3em] uppercase opacity-50">Leistungen</span>
```
Nummerierte Abschnitte, dünne Linien, Mikro-Labels, Jahreszahlen am Rand.
Das sind die Details, die "gestaltet" von "zusammengeklickt" trennen.

### 6. GROSSE FARBFLÄCHEN statt weiß + Akzentbutton
Mindestens eine Sektion nimmt die Markenfarbe VOLLFLÄCHIG ein (nicht 10% Tint,
sondern satt, weiße Schrift darauf, großzügig Raum). Mut zur Fläche.
```html
<section class="bg-primary text-white py-28 lg:py-40">
```

### 7. BILD-TEXT-VERZAHNUNG statt Nebeneinander
Text liegt teilweise ÜBER dem Bild, nicht sauber daneben:
```html
<div class="relative">
  <img class="w-full h-[70vh] object-cover rounded-3xl" />
  <div class="absolute -bottom-10 left-6 lg:left-14 bg-background
              p-8 max-w-md rounded-2xl shadow-2xl">
    <h3>…</h3>
  </div>
</div>
```

### 8. UNGLEICHE KARTEN statt drei identische
```html
<div class="grid lg:grid-cols-3 gap-6">
  <div class="lg:row-span-2 lg:col-span-2">…große Hauptkarte…</div>
  <div>…klein…</div>
  <div>…klein…</div>
</div>
```
Hierarchie im Grid: eine Karte ist wichtiger als die anderen. Zeig das.

### 9. RHYTHMUS IM WEISSRAUM
Nicht jede Sektion py-20. Wechsel: eng (py-12) → weit (py-32) → eng.
Ungleiche Abstände erzeugen Takt. Gleiche Abstände erzeugen Monotonie.

### Selbstprüfung vor Phase 3
- Überlappt mindestens EIN Element eine Sektionsgrenze?
- Gibt es mindestens EIN asymmetrisches Raster?
- Bricht mindestens EIN Element aus dem Container aus?
- Sind weniger als die Hälfte der Überschriften zentriert?
- Gibt es mindestens eine vollflächige Farbsektion?
Wenn die Antwort 3× nein ist: Es ist eine Template-Seite, keine gestaltete.

### 10. ATMOSPHÄRISCHE HINTERGRUND-ELEMENTE (aus der Leitidee abgeleitet)

Große leere Farbflächen wirken billig. Eine dezente, thematische Textur macht
daraus eine gestaltete Fläche – ohne vom Inhalt abzulenken.

Pflicht: Das Muster muss aus der LEITIDEE/Branche kommen, nie beliebige Deko.
- Wasser/Natur (Verein, Gartenbau, Wellness): Höhenlinien, Wellenlinien, Blattadern
- Bau/Metall (Handwerk, Industrie): Blueprint-Raster, technische Schraffur, Nieten-Punkte
- Gastro/Bäckerei: Mehl-/Korn-Textur, feine Kreisformen, Besteck-Silhouetten
- Beratung/Kanzlei: feine Linienraster, Papierfaser, geometrische Ordnung

```html
<!-- Beispiel: Höhenlinien für ein Wasser-/Naturthema -->
<section class="relative bg-primary text-white py-28 overflow-hidden">
  <svg class="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
       aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 800 400">
    <g fill="none" stroke="currentColor" stroke-width="1">
      <path d="M0,120 Q200,80 400,120 T800,110" />
      <path d="M0,160 Q200,120 400,160 T800,150" />
      <path d="M0,200 Q200,160 400,200 T800,190" />
      <path d="M0,240 Q200,200 400,240 T800,230" />
    </g>
  </svg>
  <div class="container relative z-10">…Inhalt…</div>
</section>
```

Regeln:
- Opacity 0.04–0.10. Darüber wird es Deko, darunter unsichtbar.
- `aria-hidden="true"` und `pointer-events-none` – nie fokussierbar.
- Max. 2 solcher Flächen pro Seite, nie hinter Fließtext mit wenig Kontrast.
- Auf Mobile prüfen: keine zusätzliche Scroll-Breite (Overflow-Regeln gelten).
- Inline-SVG bevorzugen (keine zusätzliche Anfrage, färbt mit currentColor mit).

## CTA-TEXTE: KONKRET STATT AUSTAUSCHBAR

Ein CTA aus der Welt des Kunden bleibt eher hängen als "Jetzt anfragen".
Beispiele aus echten Projekten:
  Maler:     "Lassen Sie uns Ihre Vision streichen."
  Werkstatt: "Ihr Auto in besten Händen"
  Store:     "Dein neuer Lieblingslook wartet"
  Coaching:  "Vielleicht darfst du einfach wieder bei dir ankommen."
Wenn kein gutes Sprachbild da ist: lieber schlicht und klar ("Termin
vereinbaren") als ein bemühtes Wortspiel.
Jede Seite (und jedes Objekt, z. B. jede Ferienwohnung) bekommt eigenen Titel,
Text und Button-Text (Weber). Ein zweiter Satz beginnt in einer neuen Zeile, nie
mitten im Satz umbrechen (Cta macht das automatisch, eigene CTAs mit <br>). Erzwungene Kreativität ist schlimmer
als Schlichtheit. Weitere Beispiele: _referenzen/niko-stil.md.

## SEITEN-DRAMATURGIE (aus _referenzen/niko-stil.md)

Die Startseite folgt einer Verkaufsdramaturgie, keiner Sektionsliste:
Hero → Problem (Kundenfragen) → Lösung → Referenzen → Prozess → Person →
Testimonials → FAQ (Einwände) → CTA → Kontakt.
Erst Schmerz, dann Lösung, dann Beweis, dann Vertrauen, dann Einwände, dann
Handlung. Kürzen ist erlaubt, die Reihenfolge bleibt.
Details und Textbeispiele: _referenzen/niko-stil.md

## UNTERSEITEN-AUFBAU (Pflicht – häufigster Mangel)

Jede Unterseite braucht nach dem Hero eine kurze INTRO-SEKTION, bevor Details
kommen: 2-4 Sätze, worum es auf dieser Seite geht und für wen. Ein Hero, dem
sofort eine Karten-Liste folgt, lässt den Besucher raten.
Aufbau: PageHero -> Intro (SektionsKopf, ruhig, max. 60 Zeichen Zeilenlänge)
        -> Inhalt -> passender CTA.
Der Intro-Text wird gestaltet eingebunden, nicht "plump eingefügt" (Spöri):
eigene Fläche oder Karte, die den Hero mit dem Inhalt verbindet, auf ALLEN
Unterseiten gleich gebaut.
Außerdem: Unterseiten nutzen dieselbe Formsprache wie die Startseite und haben
mindestens einen eigenen visuellen Moment (Bild, Faktenblock, Farbfläche) –
nicht nur Fließtext.

## LEISTUNGEN BRAUCHEN EIGENE SEITEN

Jede angebotene Leistung bekommt eine eigene Unterseite (/leistungen/<slug>),
verlinkt aus der Navigation und einer Übersichtsseite. Gründe: SEO, Verlinkbarkeit,
Platz für echte Details. Eine reine Karten-Liste auf der Startseite reicht nicht.
Ebenso ist KONTAKT immer eine eigene Seite (/kontakt) mit Formular, Adresse,
Öffnungszeiten und Routenlink – nicht nur eine Sektion.

## MOBILE-FIRST: EXPLIZITE BREAKPOINTS (Pflicht)

Desktop zuerst zu denken erzeugt auf dem Handy unlesbare Seiten. Konkret:
- Fließtext:      text-[13px] sm:text-base md:text-lg   (nicht nur text-lg)
- Hero-Headline:  mobil klein anfangen (text-3xl oder text-4xl), dann in
                  Stufen wachsen (sm:/md:/lg:). Nie text-6xl als Basis.
- Button-Gruppen: flex-col sm:flex-row (mobil gestapelt, volle Breite)
- Vor jedem Element fragen: Wie sieht das auf 375px aus? (Opitz)
- USP-/Merkmal-Listen: grid grid-cols-2 gap-y-4 md:flex  (nicht flex flex-wrap,
  das bricht auf schmalen Displays unlesbar um)
- Abstände in Zeilen: gap-1.5 sm:gap-2
- HERO MOBIL: items-end lg:items-center + pb-12 lg:pb-0 – Text unten, Bild
  bleibt oben sichtbar. Vertikal zentrierter Hero konkurriert mobil mit dem Motiv.
- Kernphrasen nicht umbrechen lassen: <span class="whitespace-nowrap">…</span>
  für Firmenname, Telefonnummer und die tragende Wortgruppe der Headline.

## OG-IMAGE: SCHLICHT HALTEN
Logo zentriert auf Markenfarbe, 1200x630, KEIN Text, keine Bildmontage.
Zusammengesetzte OG-Bilder werden von WhatsApp/Messengern schlecht gerendert.
Erzeugen: `node og-bild.js` (genau dieses Format als echtes JPG unter 300 KB).
Nie ein KI-Bild als OG-Bild.

## ⬤ ABSTANDS-SYSTEM (Pflicht – gegen "zusammengewürfelt")

Der häufigste Grund für "wirkt zusammengewürfelt": frei gewählte Abstände.
Jede Sektion mit eigenen Werten (py-12 hier, py-20 da, gap-5 dort) ergibt Chaos.
NUR diese Stufen verwenden – keine Zwischenwerte:

VERTIKALER SEKTIONS-ABSTAND (nur diese drei Klassen):
- Standard:  py-16 sm:py-20 lg:py-28
- Kompakt:   py-12 sm:py-16 lg:py-20
- Bühne:     py-20 sm:py-28 lg:py-36   (Hero-nah, CTA, große Momente)

ÜBERSCHRIFT → INHALT:   mb-10 lg:mb-14   (immer identisch)
GRID/FLEX-GAP:          gap-6 lg:gap-8   (Standard; nur bei kleinen Chips gap-3)
TEXTBLÖCKE:             space-y-4 (eng) / space-y-6 (normal)
CONTAINER-PADDING:      kommt aus .container (clamp), NIE zusätzlich px auf Sektionen

Regel: Steht ein Abstandswert nicht in dieser Liste, ist er falsch.
Gleichmäßige, wiederkehrende Abstände = ruhiges, professionelles Bild.
Das ist wichtiger als jeder Effekt – ein sauberes Raster wirkt sofort teurer.

CONTAINER-PADDING im BaseLayout (gegen Text-klebt-am-Rand):
  padding-left: clamp(1.5rem, 5vw, 4rem);
  padding-right: clamp(1.5rem, 5vw, 4rem);
