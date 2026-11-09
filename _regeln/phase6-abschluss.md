# PHASE 6 – ABSCHLUSS & LEARNING (wenn Niko "fertig" sagt)
# Kurze Datei. Wird gelesen, sobald das Projekt abgeschlossen wird.

## AUSGANGSLAGE

Nach dem Autopilot arbeitet Niko in einer anderen IDE (mit Gemini) manuell
weiter – oft mehrere Stunden. Diese Arbeit ist die wertvollste Informationsquelle
über die Schwächen des Autopiloten. Sie darf NICHT verloren gehen und darf NICHT
aus dem Gedächtnis rekonstruiert werden: Du hast diese Änderungen nie gesehen.

## ABLAUF

1. `node abschluss.js`
   Erzeugt ABSCHLUSS-ANALYSE.md: alle seit dem Autopilot geänderten Dateien mit
   Zeilenzahlen, neu angelegte und gelöschte Dateien, konkrete Diff-Auszüge,
   und welche gesperrten Komponenten Niko überarbeitet hat.

2. ALLE Berichte vollständig lesen:
   - ABSCHLUSS-ANALYSE.md   (die Fakten)
   - PROJEKTBERICHT.md      (aus der externen IDE – Nikos eigene Doku)
   - VERBESSERUNGEN.md      (falls die externe IDE schon Punkte gesammelt hat)
   - AUFGABEN.md, OFFENE-FRAGEN.md, KI-BILDER.md

3. VERBESSERUNGEN.md schreiben oder ERGÄNZEN (vorhandene Punkte NIE löschen).
   Pro Punkt drei Zeilen:
     **Problem:** was der Autopilot geliefert hat
     **Nikos Lösung:** was tatsächlich geändert wurde (aus dem Diff belegt)
     **Vorschlag:** Komponente / Gate / Regel – und welche Datei betroffen wäre
   Regel: Jeder Punkt muss durch einen Diff oder einen Berichtseintrag belegt
   sein. Nichts erfinden, nichts aus der Erinnerung.

4. Besonders beachten: Komponenten, die überarbeitet wurden. Die Analyse nennt
   die Herkunft aus der Git-Historie: [AP] = der Autopilot hat eine gesperrte
   Komponente verändert (Regelverstoß, als solcher benennen), [extern] = Nikos
   Nacharbeit (Kit-Kandidat). Nikos Versionen und Diffs liegen automatisch in
   ../../_learnings/<projekt>/komponenten/. Eine Änderung an derselben Komponente
   in mehreren Projekten gehört ins Kit (_komponenten/), nicht in jedes Projekt
   einzeln. Das ausdrücklich vermerken.

5. Die Berichte liegen nach jedem weiter.bat-Start automatisch auch in
   ../../_learnings/<projekt>/ – dort gehen sie nicht verloren, auch wenn das
   Projekt archiviert wird.

## AM ENDE VON PHASE 3 (Autopilot fertig, VOR der manuellen Nacharbeit)
`node abschluss.js --marke` setzt den Vergleichspunkt (nur nach grünem `npm run qa`). Ohne diesen Marker kann
der Abschluss später nicht sauber ermitteln, was von Hand geändert wurde.
Dieser Schritt ist Pflicht.
