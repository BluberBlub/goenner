# PHASE 3 – FEEDBACK-RUNDEN MIT NIKO (kurz, bei jedem Start in Phase 3 lesen)
# Hier entstehen 80 bis 90 % der Arbeitszeit und der Tokens (Schwabenpflege 459 von 535 Min, Schneider 207 von 277).
# Ziel: jeder Punkt sitzt beim ERSTEN Mal. Jede zweite Runde kostet mehr als jede Regel hier.

## ABLAUF JE RÜCKMELDUNG
1. Alle Punkte der Nachricht sofort wörtlich in AUFGABEN.md (`- [ ] … (Datum)`), dann erst arbeiten.
2. Unklarer Punkt (Stelle, Bild, Seite nicht eindeutig): EINE gesammelte Rückfrage, die klaren Punkte
   trotzdem sofort erledigen. Nicht raten und nicht alles blockieren.
3. Erst ansehen, dann ändern: `node schau.js <pfad> --sel "<css>"` zeigt die Stelle in Desktop und Handy.
4. Ursache beheben, nicht das Symptom. Kommt das Muster auf anderen Seiten vor (Hero, Karten, Listen,
   Abstände, Texte), dort GLEICH mit ändern: mit Grep alle Vorkommen suchen. Niko soll denselben Punkt
   nie pro Seite einzeln melden müssen.
5. Aus einem Einzelhinweis die Regel ableiten ("nach sprechen umbrechen" = Lesefluss-Regel, nicht ein <br>).
   Gehört sie ins Kit, in VERBESSERUNGEN.md notieren.
6. Vor "erledigt": bauen und JEDE sichtbare Änderung mit schau.js ansehen (ein Bild zeigt beide Breiten).
   Stimmt es nicht zu 100 %, weiterarbeiten. Nie ungesehen melden (Schneider: FAQ und Ablauf je zwei Runden).
7. Danach Teillauf der betroffenen Gates (`npm run qa -- --nur=craft,copy`), abhaken, committen.
   Deploy nur, wenn Niko die Demo ansehen soll oder es verlangt: dann am Ende der Runde EINMAL.
8. Rückmeldung höchstens 5 Zeilen: was erledigt ist, Demo-Link, offene Rückfrage.

## QUALITÄT IN DER RUNDE
- Maßstab bleibt das 250.000-€-Projekt und die Leitidee aus DESIGN-BRIEF.md: Eine Korrektur darf die
  Seite nie beliebiger machen. Passt ein Wunsch nicht zur Leitidee, kurz sagen und die passende Lösung zeigen.
- "Gefällt nicht / langweilig / anderes Bild" ohne Vorgabe: ZWEI klar verschiedene Varianten bauen und
  beide zeigen (schau.js), statt eine zu raten. Bei Bildern zuerst original-bilder/ und BILDER-INVENTAR.md.
- Nur belegte Aussagen, volle Uhrzeiten, keine Gedankenstriche, Contentkante, Lesefluss: wie in CLAUDE.md.
- Neue Sektion oder neue Seite: vorher _regeln/phase2-design.md lesen (sonst nicht nötig).
- Kit-Komponenten nie zurückbauen. Nach 2 Versuchen ohne Lösung: Eskalations-Regel (CLAUDE.md).

## TOKENS IN DER RUNDE
- Jeder Tool-Schritt liest das ganze Gespräch neu. Deshalb bündeln: mehrere Befehle in EINEM Bash-Aufruf
  (`npm run build && node schau.js / /kontakt/`), unabhängige Aufrufe parallel, keine Einzelschritte
  für ls/cat/git status. Mehrere Edits einer Datei in einem Zug.
- Dateien gezielt lesen (Grep, dann Read mit offset/limit). Bilder nur über schau.js, keine eigenen
  Playwright-Skripte. QA-Details nur bei rotem Gate aus .qa-berichte/.
- Fleißarbeit (viele gleichartige Seiten, Daten übertragen, Bilder zuordnen) an einen Sub-Agenten mit
  model "sonnet", danach Stichprobe selbst prüfen.
- QA-Komplettlauf nur am Ende der Phase oder wenn Niko es sagt: _regeln/phase3-qa.md dann lesen.
