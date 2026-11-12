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

Vor dem Marker bei jedem Projekt mit Mega-Menü prüfen (Niko, 11.11.2026, hmt): Unterpunkte in betitelten
Spalten gruppiert, Menü öffnet erst nach echter Mausbewegung (8 px) oder Tab, 140 ms Verzögerung, schließt
nach Klick auf einen Menülink, auf Touch öffnet der erste Tipp. Muster: hmt `src/sections/TouchMenue.astro`
(auch Schwabenpflege, Gönner). Fehlt etwas davon: nachziehen, erst dann abschließen.


<!-- verschoben aus CLAUDE.md am 09.11.2026 (CLAUDE.md läuft bei jedem Schritt mit) -->
## ⬤ ABSCHLUSS: MARKER SETZEN UND LEARNINGS SICHERN

Am Ende von Phase 3 (Autopilot fertig): `node abschluss.js --marke`
Damit ist der Vergleichspunkt gesetzt, bevor Niko manuell weiterarbeitet.

Wenn Niko später "fertig" sagt: `node abschluss.js` ausführen, dann
_regeln/phase6-abschluss.md lesen und VERBESSERUNGEN.md aus den BELEGTEN
Diffs schreiben – nicht aus dem Gedächtnis. Die manuelle Nacharbeit in der
externen IDE ist die wichtigste Lernquelle und darf nicht verloren gehen.


## PHASE 6 - VERBESSERUNGEN.md (on-demand, vom Nutzer ausgelöst)

Sagt Niko "fertig", "abgeschlossen" o. ä. (auch in einer fortgesetzten Session):
`node abschluss.js`, dann _regeln/phase6-abschluss.md lesen und VERBESSERUNGEN.md
aus den BELEGTEN Diffs schreiben. Chat-Anweisungen aus AUFGABEN.md gehören dazu.
Kein Build, kein Deploy nötig. Kurz bestätigen, dass die Datei bereitliegt.


## ARBEITSZEIT IM PROJEKTBERICHT
### Im PROJEKTBERICHT.md am Ende:
```
## Arbeitszeit
- Reine Claude-Arbeitszeit: 8 Stunden und 55 Minuten
- Pausen/Wartezeiten: nicht enthalten
- Aufschlüsselung:
  - Phase 1 (Research): 21 Minuten
  - Phase 1b (Stil-Muster): 8 Minuten
  - Phase 2 (Build): 1 Stunde und 5 Minuten
  - Phase 2c (Design-Review): 8 Minuten
  - Phase 3 (QA): 7 Stunden und 39 Minuten
  - Phase 5 (Deploy): 10 Minuten
  - Phase 6 (Abschluss): 4 Minuten
```
Zeiten IMMER in Stunden und Minuten ausschreiben (Niko): "4 Stunden und 16 Minuten",
unter einer Stunde nur Minuten. Keine Dezimalstunden ("8.9 Stunden"), keine Minutensummen ("535 Minuten").


### progress.json Format:
```json
{
  "phase": 3,
  "status": "in_arbeit",
  "phaseStartzeit": "2026-05-22T14:30:00Z",
  "phaseEndzeit": null,
  "phaseDauerMinuten": null,
  "gesamtMinutenBisher": 67,
  "phasen": {
    "1": {"dauerMinuten": 22, "abgeschlossen": "2026-05-22T13:50:00Z"},
    "2": {"dauerMinuten": 45, "abgeschlossen": "2026-05-22T14:30:00Z"}
  }
}
```
