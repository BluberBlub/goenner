# PHASE 1b – STIL-MUSTER (visuelle Freigabe VOR dem Seitenbau)
# Kurze Datei, wird zu Beginn von Phase 1b gelesen.

## WARUM DIESE PHASE EXISTIERT

Bisher wurden alle visuellen Entscheidungen in TEXT getroffen und erst nach dem
Bau aller Seiten sichtbar. Fehler in der Anmutung kosteten dann Korrekturen über
das ganze Projekt – und machten es oft schlechter statt besser.

Designer arbeiten anders: Sie legen die visuelle Sprache an EINEM Artefakt fest,
schauen es an, korrigieren billig – und wenden es erst dann überall an.
Genau das ist diese Phase.

## ABLAUF

1. site-data.json vollständig befüllen (design.farben, design.fonts,
   design.leitidee, meta, navigation, kontakt).
2. Schriften real einbinden: WOFF2 nach /public/fonts/, @font-face in
   src/styles/fonts.css. Ohne echte Schriften ist das Stil-Muster wertlos.
3. Ein echtes Hero-Bild bereitstellen (Original oder generiert), damit die
   Bildwirkung beurteilbar ist.
4. src/pages/stil-muster.astro liegt schon im Projekt (Kit, gesperrt, nicht bearbeiten).
   OPTIONAL bei unklarer Richtung: 2-3 Formsprache-Varianten anbieten statt einer –
   design.varianten = [{name, radius: 'none'|'lg'|'3xl', farben:{...}}, ...] in
   site-data.json. Das Muster zeigt sie als A/B/C-Vergleich. Niko wählt, die
   gewählte Variante wird nach design.farben übernommen, varianten gelöscht.
   Auswahl ist schneller und besser als Korrektur einer einzelnen Setzung.
5. `npm run qa -- --nur=visual --seite=/stil-muster`
   (baut, startet einen eigenen Server, kein Port-Raten)
6. → Urteil zur Anmutung, Screenshots in .qa-screenshots/
7. FREIGABE-PUNKT: Niko schaut das Stil-Muster an (30 Sekunden) und sagt
   "passt" oder korrigiert in einem Satz ("wärmer", "härter", "mehr Kontrast",
   "Headline größer"). Korrekturen NUR in site-data.json + fonts.css.
8. Erst nach Freigabe beginnt Phase 2 (Seitenbau).

## DREI ENTSCHEIDUNGEN, DIE HIER FALLEN (in site-data.json festhalten)

- Schrift auf Farbflächen: Das Muster zeigt die automatische Wahl mit Kontrastwert
  und die Alternative. Gefällt die Alternative besser: design.textAuf setzen
  (z. B. "accent": "weiss" für Weiß auf Gold). Unter 2:1 ist gesperrt.
- Footer-Logo: eine der drei Varianten wählen (meta.logoFooterStil = weiss |
  platte | original) oder eine helle Logo-Datei als meta.logoFooter. "weiss" nur
  bei transparentem Hintergrund und wenn keine Details verloren gehen.
  Enthält das Logo den Namen schon: meta.logoMitName = true.
- Farbfamilie: Die Palette leitet sich aus EINEM Grundton ab (Alge: nicht drei
  verschiedene Grüns). USPs, Badges und CTA in derselben Farbfamilie.

## WAS DAS STIL-MUSTER ZEIGT

Farbflächen mit Hex · Typo-Skala von Mega-Headline bis Bildunterschrift ·
Buttons und Badge · Karte mit Schatten und Rundung · Bild im Rahmen ·
vollflächige Markenfarb-Sektion · zwei Hero-Proben mit dem ECHTEN Hero-Foto:
A Vollbild mit Abdunklung, B Foto rechts mit weichem Verlauf.
Niko wählt A oder B (oder eine Mischung) VOR dem Seitenbau. Schwabenpflege: Der
Startseiten-Hero brauchte sechs Anläufe, weil die Bildbehandlung erst spät feststand.
Das ist die komplette visuelle Sprache auf einer Seite.

## REGELN FÜR DIESE PHASE

- Am Stil-Muster wird NICHT gestaltet, es wird nur BEURTEILT.
  Änderungen laufen über site-data.json (Farben, Fonts) – nie über Sonderregeln
  in der Musterseite selbst.
- Wenn das Stil-Muster langweilig aussieht, wird die Website auch langweilig.
  Lieber hier zwei Runden drehen als später zehn.
- Maßstab ist ../../_design-referenzen/ – dort ANSCHAUEN, welches Niveau
  gemeint ist (Weißraum, Typo-Größe, Farbtiefe).
- Die Seite wird beim Start automatisch aus _komponenten/ gesynct und bleibt
  im Projekt (noindex, nicht in der Navigation). NICHT löschen – sie kommt
  beim nächsten Sync ohnehin zurück und dient dem Kunden als Stil-Referenz.

## ZEITBUDGET
Phase 1b soll 10-20 Minuten dauern. Sie spart in Phase 2/3 ein Vielfaches.
