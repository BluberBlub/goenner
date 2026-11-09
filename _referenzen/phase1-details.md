# PHASE-1-DETAILS (Nachschlagewerk)
# WIRD NICHT AUTOMATISCH GELESEN. Nur bei konkretem Bedarf aufschlagen.
# Kern-Entscheidungen stehen in _regeln/phase1-research.md – hier die
# ausführlichen Kataloge und Spezialfälle dahinter.

## DESIGN-DNA & ARCHETYPEN (Pflicht in Phase 1 – verhindert Einheitslook)

Jedes Projekt bekommt eine eigene Design-DNA. Ziel: Kein Projekt sieht aus
wie das vorherige. Hochwertig heißt maßgeschneidert, maßgeschneidert heißt
unterschiedlich.

### Schritt 1: Hero-Archetyp bewusst wählen (nicht immer derselbe!)

| Archetyp | Beschreibung | Passt zu |
|---|---|---|
| Vollbild | 100vh Foto, Gradient, zentrierte/linke Typo | Emotionale Branchen, starke Fotos |
| Split | Text links (50-60%), Bild rechts, kein Overlay | Beratung, Praxen, B2B mit Persönlichkeit |
| | NICHT wenn: kein starker Personen-/Objekt-Anker rechts. | Servicebilder (Garten, Reinigung, Winterdienst) |
| | Wirken im 50%-Slot verloren → Full-Bleed bevorzugen. | |
| Editorial | Riesige Typo dominiert, Bild klein/sekundär | Selbstbewusste Marken, Coaches, Kreative |
| Card-Overlap | Bild als Karte, Text überlappt versetzt | Moderne Dienstleister, Einzelhandel |
| Geteilt-Diagonal | Diagonale Trennung Bild/Farbe | Handwerk mit Energie, Sport, Dynamik |
| Produkt-Spotlight | Dunkler/neutraler Hintergrund, EIN freigestelltes Motiv dominiert, | Premium-Handwerk, Maschinen, Fahrzeuge, |
| | übergroße Typo dahinter/darüber, minimale Nav. | alles mit starkem Hauptobjekt + freigestelltem PNG |
| Split-Color | Zwei Hintergrundhälften in Primär/Sekundärfarbe, | Bio/Lebensmittel, Produkte, Einzelhandel, |
| | Hauptmotiv überspannt beide Hälften. Keine Animation nötig. | alles mit klar isolierbarem Hauptobjekt |
| Mono-Akzent | Schwarz-Weiß oder monochrom, EIN einziger Farbakzent. | Handwerk mit starker Markenfarbe (Orange, |
| | Maximale Wirkung durch Reduktion. | Gold, Magenta), Automotive, Sport |

### Schritt 2: Sektions-Muster variieren
Nicht jede Seite braucht denselben Rhythmus. Mindestens 2 dieser Variationen einsetzen:
- Zickzack (Bild links/rechts alternierend) statt nur gestapelt
- Eine Full-Bleed-Sektion (Bild über volle Breite mit Text-Overlay)
- Eine asymmetrische Sektion (1/3 zu 2/3 statt 50/50)
- Eine Sektion mit überlappendem Element (Karte ragt in nächste Sektion)

### Schritt 3: Abgrenzung von früheren Projekten (Pflicht!)
- Lies _lessons-learned.md: Welche Archetypen/Muster hatten die letzten 2 Projekte?
- Wähle BEWUSST anders, wenn die Branche es zulässt
- In site-data.json dokumentieren: design.heroArchetyp, design.dnaBegruendung

### Schritt 3b: Formsprache aus der Leitidee ableiten
Es gibt KEINEN festen Haus-Stil. Rundungen, Formen, Farbtiefe und Bildsprache
folgen dem Charakter der Leitidee – die Tabelle dazu steht in phase2-design.md
unter "FORMSPRACHE KOMMT AUS DER LEITIDEE".
Ein Metallbauer wird kantig und erdig, eine Yoga-Praxis weich und warm.
Was IMMER gilt (branchenneutral): großzügiger Weißraum, echter Kontrast,
eine Farbfamilie, max. 2 Schriften – siehe "GESTALTUNGS-QUALITÄT".

PFLICHT: Die Bilder in ../../_design-referenzen/ ANSCHAUEN, bevor entschieden
wird. Sie zeigen das angestrebte Qualitätsniveau konkreter als jede Textregel.
Nicht kopieren – aber das Niveau (Weißraum, Typo-Größe, Farbtiefe, Bildqualität)
ist der Maßstab.

### Schritt 4: Die Wahl begründen
Die Design-DNA muss aus der ZIELGRUPPE kommen, nicht aus Zufall:
"Split-Hero weil Arztpraxis → Patienten wollen sofort ein Gesicht sehen,
Vertrauen vor Wow-Effekt."

## TONALITÄTS-PROFIL (Pflicht in Phase 1 – Wording auf den Kunden abgestimmt)

Bevor irgendein Text geschrieben wird, MUSS das Tonalitäts-Profil stehen.
Es wird in site-data.json unter "tonalitaet" gespeichert und gilt für ALLE Texte.

### Entscheidung 1: Du oder Sie? (wichtigste Wording-Entscheidung)
- B2B, Industrie, Anwalt, Arzt, Steuerberater → Sie
- Junge Zielgruppe, Fitness, Szene-Gastro, lockerer Einzelhandel → Du
- Handwerk, klassische Gastro, lokale Dienstleister → meist Sie, regional auch Du
- Anhaltspunkt: Wie spricht der Kunde auf seiner alten Seite / in Google-Antworten?
- EINMAL entscheiden, dann 100% konsistent. Nie mischen.

### Entscheidung 2: Tonlage (genau eine wählen + dokumentieren)
- warm-persönlich: "Wir nehmen uns Zeit für Sie" (Praxen, Pflege, Familienbetriebe)
- sachlich-kompetent: "Präzision seit 1985" (Industrie, B2B, Technik)
- direkt-bodenständig: "Wir packen an" (Handwerk, Bau, Dienstleistung)
- herzlich-einladend: "Komm vorbei" (Gastro, Einzelhandel, Bio/Regional)
- inspirierend-motivierend: "Dein nächster Schritt" (Coaches, Fitness, Bildung)

### Entscheidung 3: Regionale Färbung (ja/nein + wie stark)
- Lokaler Dienstleister im Allgäu: Region aktiv einbauen ("im Allgäu", "aus Wangen",
  "in der Region") – das ist SEO UND Vertrauen
- Überregionaler B2B: Region nur im Footer/Kontakt

### Entscheidung 4: Kundenvokabular übernehmen
- Welche Begriffe nutzt der Kunde selbst? (alte Website, Google-Bewertungen, Branche)
- Beispiel: Sagt er "Anlagen" oder "Maschinen"? "Praxis" oder "Ordination"?
- Die Sprache des Kunden ist die Sprache seiner Kunden – übernehmen, nicht ersetzen.

### Konsistenz-Check (Phase 3, Pflicht):
grep -ri "\bdu\b\|\bdein" src/pages/ bei Sie-Projekten (und umgekehrt).
Jede Mischform ist ein Fehler der sofort korrigiert wird.

## TONALITÄTS-WECHSEL: KARRIERE VS. HAUPTSEITEN

B2B-Websites nutzen oft "Sie" - aber Karriere-Seiten sollten Bewerber persönlicher
mit "Du" ansprechen. Bewerber sind potenzielle Kollegen, keine Kunden.

### site-data.json:
```json
"tonalitaet": {
  "anrede": "Sie",
  "tonlage": "sachlich-kompetent",
  "karriereAnrede": "Du"
}
```

### Beispiel:
- Hauptseite: "Wir freuen uns auf Ihre Anfrage."
- Karriere: "Du bist erfahren in Cloud-Technologien? Werde Teil unseres Teams."

### Konsistenz-Check anpassen:
Du/Dein-Grep NUR außerhalb von src/pages/karriere/ als Fehler werten.
Innerhalb karriere/ ist "Du" bei Sie-Unternehmen korrekt (falls karriereAnrede=Du).

## PERSONENFREIE MOTIVE (wenn keine echten Mitarbeiterfotos vorhanden)

Wenn kein echtes Mitarbeiterteam abgebildet werden kann/soll:
- Arbeits-ERGEBNIS zeigen statt Prozess mit Person
  (fertiger Garten statt Gärtner beim Pflanzen)
- Werkzeug/Material als Hauptmotiv (Heckenschere, Pflastersteine, Räumschild)
- Nahaufnahmen der Qualität (Pflasterfuge, frisch gemähter Rasen, Winterweg)
- NIEMALS: Person von hinten, Silhouette, eindeutig gestellte Stock-Pose

Vorteil: Authentischer als Stock-Posen, DSGVO-unbedenklich.

## ECHTE 3D-ASSETS: WANN UND WIE

Claude kann keine 3D-Assets selbst erstellen. Folgende Optionen:

### Option A: Freigestellte PNG-Fotos (empfohlen)
Viele Branchen haben hervorragende freigestellte Fotos:
- Werkzeuge, Maschinen, Fahrzeuge, Produkte
- remove.bg oder Kunde liefert freigestellt
- CSS drop-shadow-2xl statt box-shadow für weiche Schatten unter transparenten PNGs

### Option B: Spline.design Embed (für Tech/Premium-Kunden)
Spline.design erlaubt kostenlose 3D-Szenen als iframe.
```html
<iframe
  src='https://my.spline.design/[scene-id]/'
  class="w-full h-full absolute inset-0 z-0"
  frameborder='0'
></iframe>
```
Muss vom Kunden/Designer erstellt werden – Claude kann es einbinden.

### Option C: CSS-Illusion (immer möglich)
Die CSS-3D-Techniken oben. Kein Asset nötig, funktioniert immer.

### Entscheidungsbaum:
- Freigestelltes PNG vorhanden? → Produkt-Spotlight oder Split-Color Archetyp
- Spline-Asset vorhanden? → Tech-Design mit Spline-Embed
- Nichts davon? → CSS-3D-Techniken (Parallax, clip-path, Shadows, Tilt)
- Normale Fotos? → Vollbild, Editorial, Geteilt-Diagonal (wie bisher)


## FARBDISZIPLIN (aus TCM-Projekt – bei Vertrauens-/Ruhe-Branchen)

Vor Build: EXAKT 4 Farben festlegen und NICHT erweitern:
- Primary (Buttons, Links), Accent (Eyebrows, Deko), Text (dunkel), Background (hell)

VERBOTEN bei Ruhe-Branchen (Arzt, Therapie, Pflege, Beratung, Wellness):
- Diagonale clip-path Schnitte im Hero (Überlappungsprobleme)
- Text auf Gradienten die Farben wechseln
- Mehr als 2 Hintergrund-Farben pro Seite

ERLAUBT: Opacity-Varianten der 4 Grundfarben, White für Cards,
dunkelste Farbe als alternativer Section-BG (max. 1-2x pro Seite).
In site-data.json: farben.primary/accent/text/background fixieren.

## AKZENTFARBE AUS KUNDENFOTOS ABLEITEN (aus Haziri)

Wenn keine Corporate-Farbe existiert: Farbe aus echten Kundenfotos extrahieren –
Arbeitskleidung, Firmenfahrzeug, Ladenfront. (Haziri: Rost-Braun #B5651D vom T-Shirt.)
Handwerker-Bonus: Dominante Arbeitskleidungs-Farbe eignet sich als Sekundärfarbe
für Footer, PageHero-Overlays, Mobile-Menu (Haziri: #3d4438 Olivgrün).
Standard-Paletten ("Handwerker = Orange") können daneben liegen – Foto schlägt Klischee.

## ALT (manuell, nur als Ergänzung): INHALTS-INVENTAR

Bei JEDEM Relaunch: bevor gebaut wird, ein CONTENT-INVENTAR.md anlegen.
Jede Seite und jeder inhaltliche Abschnitt der ALTEN Website wird dort gelistet:

| Alte Seite/Abschnitt | Inhalt (Stichwort) | Status |
|---|---|---|
| Startseite/Öffnungszeiten | Mo-Fr 8-17 Uhr | übernommen |
| Über uns/Vereinsgeschichte | gegründet 1974, ... | übernommen |
| Preise/Tageskarte | 15€ Tageskarte | BEWUSST WEGGELASSEN (Grund: veraltet) |

Regeln:
- KEIN Abschnitt darf fehlen ohne Eintrag. "Vergessen" ist kein Status.
- Weglassen ist erlaubt – aber nur mit explizitem Grund in der Tabelle.
- Vor Phase 5: Inventar durchgehen, jeder Eintrag hat Status "übernommen"
  oder "BEWUSST WEGGELASSEN (Grund: ...)".
- Alles was übernommen wird, muss auf der neuen Seite AUFFINDBAR sein.
Der Kunde merkt sofort wenn seine Öffnungszeiten, Preise oder Ansprechpartner
fehlen – das ist der häufigste Übergabe-Rückläufer.


# ─── Ausführliche Bild-Regeln (Kern: BESCHAFFUNGS-HIERARCHIE) ───

## BILD-KONSISTENZ (WICHTIG – verhindert zusammengewürfelten Look)

Ein häufiger Fehler: dasselbe Thema bekommt auf verschiedenen Seiten
unterschiedliche Hauptbilder. Das wirkt unprofessionell und verwirrt Kunden.

### Regel: Ein Thema = ein festes Hauptbild

In site-data.json wird eine zentrale Bild-Zuordnung gepflegt:
```json
"bildZuordnung": {
  "leistung-maler":     "/images/maler-hauptbild.jpg",
  "leistung-boden":     "/images/boden-hauptbild.jpg",
  "team":               "/images/team.jpg",
  "ueber-uns":          "/images/werkstatt.jpg",
  "hero-startseite":    "/images/hero.jpg"
}
```

### Anwendung:
- Jedes Thema/jede Leistung hat GENAU EIN definiertes Hauptbild
- Dieses Hauptbild wird ÜBERALL gleich verwendet:
  - Auf der Übersichtsseite (z.B. Leistungs-Card)
  - Auf der Detailseite (z.B. als Hero der Leistungsseite)
  - In verwandten Verweisen
- Wenn Leistung "Malerarbeiten" auf der Startseite Bild X hat,
  dann hat sie auf der Unterseite AUCH Bild X – nicht ein anderes.

### Ausnahme (erlaubt):
- ZUSÄTZLICHE Motive auf einer Detailseite sind ok (Galerie, Detailaufnahmen)
- Aber das HAUPTBILD/Header-Bild des Themas bleibt konsistent
- Beispiel: Leistungsseite "Malerarbeiten" hat als Hero das feste Malerbild,
  darf aber im Inhalt weitere Maler-Detailbilder zeigen

### Vor dem Build prüfen:
Gehe alle Seiten durch. Stelle sicher dass dasselbe Thema überall dasselbe
Hauptbild nutzt. Inkonsistenzen korrigieren.

## BILDPASSUNG (vor Bild-Konsistenz prüfen)

Bild-Konsistenz allein reicht nicht – das Bild muss auch zum Thema PASSEN.

### Vor jeder Bildverwendung prüfen:

**Maßstab:** Passt die Größenordnung zur Firma?
- Lokaler Hausmeister → Schneeschaufel, nicht industrieller Radlader
- Kleiner Kurierdienst → Transporter, nicht Sattelzug
- Handwerker → Werkzeug in der Hand, nicht riesige Fabrikhalle

**Authentizität:** Wirkt das Bild echt?
- Echte Fotos schlagen 3D-Render
- Gebrandete Fahrzeuge schlagen generische Stock-Vans
- Echte Arbeitsszenen schlagen gestellte Poses

**Kontext:** Zeigt das Bild die richtige Situation?
- Winterdienst → verschneiter Gehweg vor Wohnhaus, nicht Autobahn-Räumfahrzeug
- Reinigung → Treppenhaus/Büro, nicht Krankenhaus-OP
- Hausmeister → Wohnanlage, nicht Wolkenkratzer

### Bei unpassenden Bildern:
- Erst: anderes vorhandenes Bild prüfen (z.B. hero.jpg umnutzen)
- Sonst: lizenzfreies Bild von Unsplash/Pexels/Pixabay holen
- NIEMALS ein unpassendes Bild behalten nur weil es schon da ist

## BILDER VISUELL PRÜFEN (nicht nur Dateinamen)

Dateinamen sind keine Garantie für den Inhalt.

### Beispiel-Falle:
- Datei "sicherungskasten.jpg" zeigt Nest Thermostat
- Datei "team.jpg" zeigt nur Werkzeuge
- Datei "winterdienst.jpg" zeigt Bagger statt Schneeschaufel

### Vor jeder Verwendung:
- Bild mit Read-Tool öffnen oder direkt anschauen
- Prüfen: Zeigt es wirklich was der Name suggeriert?
- Im Zweifel: Bild verwerfen und ersetzen

## RELAUNCH: ORIGINALBILDER SIND PFLICHT, NICHT OPTION (aus Haziri)

Bei jedem Relaunch als HARTER Schritt 1.3:
1. Logo von der Original-URL herunterladen und EXAKT verwenden
2. ALLE brauchbaren Bilder der Original-Seite extrahieren (Hero, Leistungen, Team, Referenzen)
3. Stock/KI-Bilder nur als dokumentierter Notnagel wenn Original unbrauchbar
4. Fehlende Bilder → im PROJEKTBERICHT.md als "vom Kunden anfordern" listen,
   NICHT stillschweigend durch Fremdmaterial ersetzen
Kunden erwarten IHRE Bilder – Fremdmaterial verfehlt den Zweck eines Relaunches.
