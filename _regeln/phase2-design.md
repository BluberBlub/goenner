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

## ⬤ MUT-KATALOG UND KOMPOSITIONS-KATALOG → phase2-kataloge.md

Die Techniken, die Eindruck machen, und die Kompositionsmuster stehen in phase2-kataloge.md.
Einmal zu Beginn von Phase 2 lesen (vor der Planung der Startseite) und progress.json
"katalogeGelesen": true setzen. Erneut lesen, wenn Niko mehr Wirkung verlangt.

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
