# AUFGABEN.md – Chat-Anweisungen

- [x] Relaunch https://www.ravensburg-psychotherapie.de/ als goenner.niko-endres.de, Autopilot v2 komplett (Design-Gate aus) (2026-11-09)
- [x] Referenzen müssen echte Psychotherapie-Seiten sein (Kinfolk/Kusnacht/Selfapy passten nicht) (2026-11-09)
- [x] Referenz: Octave (findoctave.com), aber Farben der aktuellen Seite (#3D652B, #88AF42) behalten (2026-11-09)
- [x] weiter (Autopilot fortsetzen nach Limit) (2026-11-09)
- [ ] Subdomain goenner.niko-endres.de im IONOS-Panel auf /demo/goenner + SSL (wartet auf Niko), danach qa-live (2026-11-09) — Stand 10.11.: Subdomain per HTTP erreichbar, SSL-Zertifikat fehlt noch (TLS-Handshake schlägt fehl). 10.11. 09:43: HTTPS antwortet 200, qa-live noch offen

## Feedback Niko 10.11.2026
- [x] "cta ist noch recht langweilig" (2026-11-10) → neue Sektion Abschluss.astro (3 Wegmarken mit Pfad) auf allen Seiten
- [x] "es fehlt übersichtsseiten, für die seiten mit dropdown in der navigation" (2026-11-10) → /behandlung/ und /fachliches/ als Übersicht, Unterseiten verschachtelt, Mega-Menü, .htaccess-Weiterleitungen
- [x] "stellenanzeigen müssen besser werden. für stellen unterseiten erstellen." (2026-11-10) → /fachliches/stellenangebote/ (Übersicht aus data/stellen.ts) + Detailseite
- [x] "heros auf unterseiten sind zu sehr abgedunkelt. texte sollten weiterhin lesbar bleiben." (2026-11-10) → SeitenHero.astro, nur Textecke tiefgrün, mit Brotkrumen
- [x] "footer ist noch langweilig. copyright fehlen abstände." (2026-11-10) → Sitemap-Footer mit Leitsatz, Copyright-Leerzeichen behoben
- [x] "seite ist insgesamt noch nicht sonderlich individuell. sieht sehr generisch/ai slop aus. muss noch optimiert werden" (2026-11-10) → Höhenlinien/Wegmarken-Motiv; Fortsetzung siehe Punkt unten (10.11.)
- [x] "deploy ohne qa" (2026-11-10) → node deploy.js --ohne-qa, live
- [x] "seite wirkt noch immer sehr generisch, baukasten mäßig. sie muss individueller, mutiger werden. darf auch interaktiver sein. mehr passende effekte" (2026-11-10) → wischbarer Nebel über Hero-Fotos (alle Seiten), asymmetrischer Start-Hero, Themen-Bühne zum Antippen, Versicherungs-Wegweiser, Weg-Pfad zeichnet sich, 40 von 100 Plätzen lösen sich auf, Team-Hover-Fokus. Teil-QA craft/copy/overflow grün, deployt. Hinweis: mehr als 2 Scroll-Effekte auf der Startseite (Niko-Wunsch nach mehr Effekten)

## Feedback Niko 10.11.2026 (2)
- [x] "nebel deaktivieren. super unpassend." (2026-11-10) → NebelWischen entfernt (Start + Unterseiten), deployt
- [x] "startseite ist extrem lang. hier sollte das wichtigste drauf. und nicht zugeschissen werden." (2026-11-10) → ERSTER SCHRITT: Villa, Versorgung, Lehre von der Startseite genommen (stehen auf Unterseiten), deployt. 10.11. Redesign: Hero, Wartezeit-Wegweiser, Themen, Weg, Team, FAQ, Abschluss; flache Flächen statt Karten, deutlich kompakter
- [x] "schau bitte nochmals nach anderen psychotherapie praxen seiten, gern große, bekannte.. die wert auf gute seiten legen. orientiere dich dort am design. wir müssen besser werden. die seite wirkt noch sehr baukastenmäßig" (2026-11-10) → Recherche: Two Chairs, Alma, Spring Health, Self Space, Wholeness Collective. Umgesetzt nach Two Chairs/Alma: flache satte Farbflächen (Waldgrün-Hero mit randlosem Foto, Tiefgrün-Themen, Blattgrün-Abschluss), knappe Radien, von Hand gezogene Weg-Linie als Signature, große S/W-Portraits, Unterseiten-Hero im selben Muster. Teil-QA craft/copy/overflow grün, deployt

## Feedback Niko 10.11.2026 (3)
- [x] "sektion Ihr nächster Schritt re spalte.. die linie fängt bei schritt 1 an, wächst aber nicht weiter runter.." (2026-11-10) → erledigt: vector-effect brach die Strichlänge (Abschluss, Wartezeit, Weg)
- [x] "tausche hero bild mit therapieraum-gruppe.avif auf startseite aus und setzte das andere auf der seite ein, wo das bild aktuell genutzt wird." (2026-11-10) → erledigt: Sessel und Gruppe überall getauscht (Start-Hero = Gruppe)
- [x] "entferne bei bildern den zusatz mit zb 'Therapieraum in der Karlstraße 8'" (2026-11-10) → erledigt (Start-Hero)
- [x] "entferne ki slop - das ein wort in kursiv in headlines ist ... das machen wir bitte nicht mehr. umsetzten und merken, dass alle projekte davon lernen." (2026-11-10) → erledigt: alle <em> aus Überschriften entfernt; Regel für alle Projekte: siehe Root-CLAUDE.md/phase2-design.md
- [x] "intro sektion auf unterseiten wirkt lieblos in diesem block." (2026-11-10) → SeitenIntro offen gesetzt: Titel volle Breite, Linie, große Einleitung + weiße Faktenkarte (alle Unterseiten)
- [x] "mega menü triggerpunkt beim klicken/neuladen der seite optimiere. wie bei schwabenhilfe.. sonst verdeckt das mega menü beim laden direkt die ganze seite." (2026-11-10) → wie Schwabenpflege: öffnet erst nach echter Mausbewegung (Seite.astro + site.css), Kit-Vorschlag notiert
- [x] "Verstärken Sie unser Team. foto ist nicht passend, das ist eine künstlerin keine mitarbeiterin." (2026-11-10) → Fachliches-Karte: Gruppenraum, Stellen-Hero: Wartebereich-Panorama
- [x] "kontakt page: sektion Anmeldung li spalte, hier könnte noch google maps rein." (2026-11-10) → erledigt: KarteLaden (Einwilligung) links, externeInhalte Google Maps, Datenschutz-Abschnitt
- [x] "kontakt formular ist optisch unschön" (2026-11-10) → erledigt: ruhige Felder, Versicherung/Anliegen als Auswahl-Chips, flache weiße Karte
- [x] "sicherstellen dass alles dsgvo konform gestaltet ist auf der seite. texte, cookiebanner etc." (2026-11-10) → Maps nur über KarteLaden nach Einwilligung, externeInhalte gesetzt (Banner + Footer "Cookie-Einstellungen"), Datenschutz um Maps/TDDDG ergänzt, Formular-Checkbox required
- [x] "sticky contact wirkt noch sehr uneinladend." (2026-11-10) → weiße Karte, Gesprächssymbol im grünen Kreis, "Sie möchten mit uns sprechen?" (CSS-Override, Kit-Vorschlag notiert)
