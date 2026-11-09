# PHASE 2c – DESIGN-REVIEW (Selbst-Check zwischen Bau und QA)
# Kurze Datei. Wird nach Fertigstellung aller Seiten gelesen, VOR Phase 3.
# Zeitbudget: 10-15 Minuten.

## WARUM

Der Bau optimiert auf Vollständigkeit, nicht auf Wirkung. Das Ergebnis ist
technisch korrekt, aber oft brav: gleiche Sektionen, gleiche Abstände, überall
Karten. Dieser Schritt schaut EINMAL bewusst hin, bevor die Gates laufen –
und behebt das Offensichtliche, solange es billig ist.

## ABLAUF

1. `npm run build` und Preview starten.
2. `npm run qa -- --nur=visual` (baut und startet einen eigenen Server)
   Das prüft Startseite UND Unterseiten in Mobile + Desktop.
   Screenshots landen in .qa-screenshots/ – DORT SELBST REINSCHAUEN.
3. Die vier Fragen unten beantworten (im Kopf, nicht als Datei).
4. Nur beheben, was klar schwach ist. Dann Phase 3.

## DIE VIER FRAGEN

**1. Sticht eine Sektion heraus?**
Wenn man die Seite durchscrollt: Gibt es einen Moment, der anders ist als der
Rest – eine vollflächige Farbfläche, ein randloses Bild, ein Bruch im Rhythmus?
Wenn alles gleich fließt, fehlt der Halt fürs Auge.

**2. Ist die Karte das einzige Werkzeug?**
Karten sind gut – aber wenn JEDE Sektion ein Karten-Grid ist, wirkt die Seite
wie ein Baukasten. Mindestens eine tragende Sektion sollte ohne Karten
auskommen (Text mit Bild, Zitat, Zahlenband, Prozess-Zeitstrahl).
KEINE Zählregel: es geht um Abwechslung, nicht um eine Höchstzahl.

**3. Sehen die Unterseiten aus wie die Startseite?**
Häufigster Fehler: Die Startseite wird überarbeitet, die Unterseiten bleiben
Fließtext unter einem Hero. Jede Unterseite braucht dieselbe Formsprache und
mindestens einen eigenen Moment – ein Bild, ein Faktenblock, eine Farbfläche.
Eine inkonsistente Unterseite entwertet die ganze Seite.

**4. Trägt jedes Bild echte Information?**
Original-Bilder des Kunden bevorzugt (original-bilder/), Motiv passend zu
Maßstab, Region und Handwerk, bei Handwerk möglichst Menschen bei der Arbeit.
qa-images.js prüft das maschinell – hier nur der Blick, ob es stimmig wirkt.

## ANTI-CHURN-REGEL (wichtig)

Änderungen in dieser Phase sind gezielt und minimal. Verboten:
- Mechanisches Umbauen, um eine der Fragen "abzuhaken" (Karten löschen,
  irgendwo eine negative Margin setzen, zufällige Asymmetrie einbauen).
  Erzwungene Auffälligkeit sieht schlechter aus als ehrliche Schlichtheit.
- Mehr als EINE Überarbeitungsrunde. Wenn danach etwas nicht sitzt:
  in AUFGABEN.md notieren und an Niko übergeben – nicht weiter probieren.
Grund: Blind umgesetzte Layout-Eingriffe haben in der Vergangenheit
funktionierende Seiten kaputt gemacht. Sehen schlägt Raten.

## ZEIT ERFASSEN
progress.json: Phase "designReview" mit Start- und Endzeit eintragen,
damit der Aufwand messbar bleibt.
