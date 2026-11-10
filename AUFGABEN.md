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
- [ ] "seite ist insgesamt noch nicht sonderlich individuell. sieht sehr generisch/ai slop aus. muss noch optimiert werden" (2026-11-10) → TEILWEISE: Höhenlinien/Wegmarken-Motiv, Hero-Rahmen wie Startseite. OFFEN: Startseite durchsehen, npm run qa, Deploy
- [x] "deploy ohne qa" (2026-11-10) → node deploy.js --ohne-qa, live
