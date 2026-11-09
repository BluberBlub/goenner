# PHASE 5 – DEPLOY & ABSCHLUSS
# Wird von Claude zu Beginn von Phase 5 KOMPLETT gelesen.

## BUILD- UND DEPLOY-PROZESS (kritisch)

### Vor jedem Build: dist säubern
- Astro räumt alte Asset-Dateien (CSS/JS mit Hash) NICHT automatisch auf
- Nach mehreren Builds sammeln sich 30+ tote Dateien im dist/_astro/
- Lösung in package.json:
  `"build": "rimraf dist && astro build"` oder Pre-Build-Script

### Deploy-Script: Remote-Ordner KOMPLETT löschen
- Nur umbenennen reicht NICHT (alte Hash-Dateien bleiben)
- Astro generiert bei jedem Build neue Hash-Dateinamen
- Wenn alte Dateien auf dem Server bleiben → HTML referenziert neue Namen
  → CSS/JS 404 → kaputte Website
- Korrekt:
  1. Backup erstellen (umbenennen zu /projekt-backup)
  2. Remote-Ordner LÖSCHEN: `sftp.rmdir(REMOTE_PATH, true)`
  3. Neu anlegen: `sftp.mkdir(REMOTE_PATH, true)`
  4. Hochladen: `sftp.uploadDir(LOCAL_DIST, REMOTE_PATH)`
  5. Bei Erfolg: Backup löschen. Bei Fehler: Backup zurückbenennen.

## HTTPS-ZWANG: SERVER ZUERST PRÜFEN

Bevor .htaccess HTTP→HTTPS-Redirect und HSTS gesetzt wird:
1. Manuell testen: https://[domain] im Browser → lädt in < 3 Sekunden?
2. Wenn TLS-Handshake hängt: KEIN HTTPS-Zwang setzen
3. HSTS NIE direkt mit langer max-age starten:
   erst max-age=300 (5 Min), nach 24h stabiler HTTPS: max-age=31536000

Shared Hosting (IONOS, Strato, All-Inkl): TLS-Handshake ist server-seitig,
liegt außerhalb unserer Kontrolle – immer erst testen, nie blind setzen.

Fehler: Große max-age direkt setzen → Browser cached HTTPS für Monate →
wenn TLS danach kaputt geht ist die Site für alle gecachten Besucher tot.


## DEPLOY NUR NACH GRÜNER QA

`node deploy.js` prüft vor dem Upload den Nachweis aus `npm run qa`
(.qa-status.json). Solange der Autopilot läuft (noch kein Marker), bricht der
Deploy ohne grünen Komplettlauf ab. Nach dem Marker (Nikos Nacharbeit) gibt es
nur einen Hinweis. Bewusst ohne QA: `node deploy.js --ohne-qa` (nur auf Nikos Wunsch).

## POST-DEPLOY SMOKE-TEST: ALLE SEITEN (qa-live.js)

Nach jedem Deploy Pflicht:
`node qa-live.js https://[subdomain].niko-endres.de`
- Liest sitemap-index.xml / sitemap-0.xml
- Ruft JEDE Seite ab (HTTP 200?)
- Prüft jede Seite auf tote Assets (CSS/JS/Bilder mit 404 – der Hash-Bug!)
- Pingt mailer.php an (erreichbar, antwortet JSON?)
- Prüft og:image (erreichbar, echtes JPG, unter 300 KB, richtige Domain)
- Kundendomain: Canonical/og:image auf der Kundendomain? KI-Bilder alle ersetzt?
Exit 1 = Deploy gilt als FEHLGESCHLAGEN → Rollback-Backup NICHT löschen,
Problem beheben, neu deployen.

## GIT-COMMIT NACH JEDER PHASE

Nach jedem Phasen-Abschluss (nicht nur am Ende):
`git add -A && git commit -m "Phase N abgeschlossen: [Kurzbeschreibung]"`
Ermöglicht Rollback auf jeden Zwischenstand und sichtbare Diffs bei Eskalation.

## FEEDBACK.md ANLEGEN

Beim Projektabschluss FEEDBACK.md aus der Vorlage (../../FEEDBACK-vorlage.md)
ins Projekt kopieren. Niko füllt sie nach Kundenübergabe aus –
sie fließt in den nächsten Lessons-Learned-Zyklus ein.

## LESSONS LEARNED (erweitert)

../../_lessons-learned.md ergänzen mit: Datum, Projekt, Branche, Scores,
Hero-Archetyp + Sektions-Muster + Tonalität (für Abgrenzung künftiger Projekte),
was gut/schlecht lief, Erkenntnis, Arbeitszeit aus progress.json.


## DEMO-STATISTIK UND DEMO-URL (Niko, 21.10.2026)

- Solange `meta.demo = true`, setzt das BaseLayout im `<head>` jeder Seite unverändert
  `<script src="https://crawler.niko-endres.de/t/demo.js" defer></script>` (meldet Nikos Akquise-Tool,
  wann und wie lange die Demo angesehen wird; keine Cookies, kein Banner). Nichts daran ändern, keine
  Firmennamen oder IDs ergänzen: Die Zuordnung läuft über die Demo-Adresse. qa-checks prüft das.
- Jede Demo hat eine eigene, feste Adresse (Subdomain oder Pfad). Nach dem Versand NIE mehr ändern.
- Am Ende Niko die endgültige Demo-URL nennen (vollständige URL der Startseite, deploy.js gibt sie aus)
  und im PROJEKTBERICHT als "Demo-URL" eintragen. Niko trägt sie im Akquise-Tool beim Lead ein.
- Livegang auf der Kundendomain: `meta.demo = false`, dann fällt die Zeile automatisch weg
  (qa-checks meldet einen Fehler, falls sie trotzdem noch irgendwo steht).
- Die Zeile nie von Hand in andere Projekte, Nikos Website oder Vorlagen übernehmen.

## DEPLOY-ZIELPFAD: DEMOS UNTER /demo/

Standard für neue Projekte: `REMOTE_PATH = /demo/<projektname>`
(steht fest in der projekteigenen deploy.js, gesetzt bei der Projektanlage).
Grund: Der FTP-Root bleibt aufgeräumt, alle Akquise-Demos liegen gebündelt.

Kundenprojekte mit eigener Domain gehören NICHT unter /demo/ – dort vor der
Projektanlage `$env:AUTOPILOT_KUNDENPROJEKT = "1"` setzen, dann wird
`/<projektname>` verwendet.

WICHTIG – einmalig pro Demo im IONOS-Panel:
Die Subdomain (z. B. bombay.niko-endres.de) muss auf das neue Verzeichnis
/demo/bombay zeigen. Ohne diese Umstellung liefert die Subdomain den alten
Ordner aus bzw. läuft ins Leere. Bei bestehenden Demos: Ordner auf dem Server
nach /demo/ verschieben, Subdomain-Ziel anpassen, REMOTE_PATH in der
projekteigenen deploy.js von "/name" auf "/demo/name" ändern.

deploy.js bricht ab, wenn REMOTE_PATH ein Sammelordner ist (/, /demo, /kunden) –
sonst würde ein Deployment die Nachbarprojekte löschen.
