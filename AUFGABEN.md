# AUFGABEN.md – Chat-Anweisungen

- [x] Relaunch https://www.ravensburg-psychotherapie.de/ als goenner.niko-endres.de, Autopilot v2 komplett (Design-Gate aus) (2026-11-09)
- [x] Referenzen müssen echte Psychotherapie-Seiten sein (Kinfolk/Kusnacht/Selfapy passten nicht) (2026-11-09)
- [x] Referenz: Octave (findoctave.com), aber Farben der aktuellen Seite (#3D652B, #88AF42) behalten (2026-11-09)
- [x] weiter (Autopilot fortsetzen nach Limit) (2026-11-09)
- [x] Subdomain goenner.niko-endres.de im IONOS-Panel auf /demo/goenner + SSL (wartet auf Niko), danach qa-live (2026-11-09) — Stand 10.11.: Subdomain per HTTP erreichbar, SSL-Zertifikat fehlt noch (TLS-Handshake schlägt fehl). 10.11. 09:43: HTTPS antwortet 200, qa-live noch offen — 11.11.: qa-live grün (0 Fehler)

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

## Feedback 10.11. (4)
- [x] "nutze die bilder aus transfer auf der homepage. vllt können wir eins für den startseiten hero verwenden" (2026-11-10) → Zweig = Start-Hero, Fensterlicht/Vertäfelung in "Ihr Weg zu uns"
- [x] "sektion Behandlungsschwerpunkte wenn ich über punkte hovere wackelt das bild. höhen verändern sich, die ganze seite zittert" (2026-11-10) → alle Thementexte in einer Zelle gestapelt, Tafelhöhe fest (Test: Höhe beim Hovern konstant)
- [x] "mach buttons statt text links. sonst geht das unter." (2026-11-10) → alle Pfeil-Textlinks sind jetzt Buttons
- [x] "teilweise steht in sektionen re texte mit einem pfeil icon davor.. verwirrend ... re aufeinmal nochmals text? der geht unter.. keine gute ux" (2026-11-10) → Randnotizen (Team, Weg, Stellen) in den Text links übernommen, rechts nichts mehr
- [x] "bilder laden extrem langsam auf der seite. extrem." (2026-11-10) → Hero-Bilder wurden doppelt geladen (Vorladen mit falschen Größen), Team-Fotos 400px-Varianten, JPGs bis 3,8 MB verkleinert
- [x] "Hochparterre der Jugendstilvilla interessiert doch kein schwein" + "Lage Hochparterre - raus" (2026-11-10) → überall entfernt, im CONTENT-INVENTAR dokumentiert
- [x] "hero bild startseite und behandlung sind identisch, sollte nicht sein." (2026-11-10) → Start: Zweig, Behandlung: Gruppenraum
- [x] "aus team wird über uns" (2026-11-10) → Navigation, Footer, 404, Team-Seite (URL /team/ bleibt)
- [x] "sticky contact ist noch etwas unsichtbar" (2026-11-10) → Waldgrün mit Limettenkreis und deutlichem Schatten
- [x] "https://github.com/BluberBlub/goenner git push" (2026-11-10) → origin = BluberBlub/goenner, master → main gepusht
- [x] "footer Karlstraße 8. steht allein in einer eigenen zeile. das muss nicht sein." (2026-11-10) → Kurzbeschreibung ohne Adresse (steht in der Kontaktspalte)

- [x] "texte im hero sind noch nicht sonderlich ansprechend formatiert. das darf besser werden" (2026-11-10) → Titel ausgeglichen (balance), Einleitung ein ruhiger Satz, Sprechzeit mit Haarlinie abgesetzt, Unterseiten text-wrap pretty
- [x] "Ihr nächster Schritt cta bei 3 sollte der strich enden und nicht weiterfahren" (2026-11-10) → Linie wird von Kreis 1 bis Kreis 3 gemessen und endet dort
- [x] "Jugendstilvilla - das interessiert niemanden" (2026-11-10) → überall entfernt (Start, Praxis, Stellen, Meta)
- [x] "mobil ist die seite super unterirdisch. bitte komplett optimieren für mobil. darüber werden die meisten patienten kommen" (2026-11-10) → Hero Bild oben, Themen als Akkordeon, Team als Wischreihe, Team-Karten kompakt, Kontakt Formular vor Karte, Praxis-Galerie 2er-Raster, Wartezeit kompakt
- [x] "Mobil Hero Bild Startseite in bg integrieren. Darauf achten das Text lesbar bleibt. Grünes overlay ggf" (2026-11-10) → Bild vollflächig hinter dem Text, Waldgrün-Lasur nach unten dichter (nur mobil)
- [x] "Für alle Seiten so handhaben bitte" (Hero mobil: Bild als Hintergrund mit grüner Lasur, 2026-11-10)
- [x] "weiß noch nicht, ob mich die headline vom hocker reist" (Start-Hero, 2026-11-10) → 11.11. neu vorgeschlagen: 1 "Es muss nicht so bleiben, wie es gerade ist." 2 "Wenn der Kopf nicht mehr zur Ruhe kommt." 3 "Klarheit beginnt mit einem ersten Gespräch." 4 "Der erste Schritt ist ein Anruf. Den Rest gehen wir gemeinsam." Niko wählt 3, umgesetzt und deployt
- [x] "Einzel- und Gruppentherapie … könnte noch besser formatiert werden" (Start-Hero, 2026-11-11) → zwei Sinnzeilen, ausbalanciert, deployt
- [x] "Ablauf sektion - das bild passt hier garnicht an dieser stelle" (Startseite, 2026-11-11) → Bild entfernt, deployt
- [x] "Therapieteam sektion - text ist sehr seltsam formatiert. wir haben super viel platz in der breite. quetschen aber alles links ein eine schmale spalte.. das ist oft auf der ganzen seite" (2026-11-11) → 11.11.: Sektionsköpfe breiter, Team/Ablauf volle Breite, deployt
- [x] "prüfe bitte alle texte nochmals, auch optisch und stelle sicher, dass diese wirklich gut und ansprechend formatiert worden sind" (2026-11-11) → 11.11.: Fließtexte mobil vereinheitlicht, Umbruch-Fix .satz pretty, deployt
- [x] "prüfe bitte auf bildern ob ein korrekter ausschnitt vorhanden ist" (2026-11-11) → 11.11.: Ausschnitte geprüft, deployt
- [x] "die hero, abgesehn von der startseite wirken eher nach möbelhaus. es wird immer nur ein bild mit tischen/stühlen gezeigt" (Unterseiten-Hero, 2026-11-11) → 11.11.: Natur-Motive (KI-Platzhalter, KI-BILDER.md), Praxis: Fensterlicht, deployt
- [x] "kontakt page, li spalte sektion Anmeldung aktuell fährt nur die karte mit beim scrollen, ganze li spalte sollte mitfahren" (2026-11-11) → 11.11.: ganze Spalte sticky, deployt
- [x] "wieso ist da ein umbruch nach ravensburger? solche probleme haben wir recht oft" (So finden Sie uns, Kontakt, 2026-11-11) → 11.11.: Ursache Kit-.satz balance, Fix + breitere Spalte, Kit-Vorschlag, deployt
- [x] "zentriere die li spalte vertikal zur rechten spalte" (So finden Sie uns, 2026-11-11) → 11.11.: vertikal zentriert (Kontakt + Praxis), deployt
  - Plan 11.11.: (a) site.css: .sektions-kopf breiter, .satz text-wrap pretty statt balance (Ursache Umbruch "Ravensburger": Kit-Lesefluss setzt jeden Lead-Satz als Block mit balance), (b) Wrapper col-span um SektionsKopf prüfen, (c) Hero-Bilder: 11 Natur-Motive per generate-image.js (public/images/hero-*.jpg, KI-BILDER.md), (d) Kontakt: ganze li Spalte sticky, So finden Sie uns items-center
- [x] "unter transfer hast du bilder für die hero sektionen. nutze sie passend" (2026-11-11) → 4 Bilder auf alle 10 Unterseiten-Heroes verteilt, deployt
- [x] "100% gefallen mir die heros noch nicht. diese scharfe kante zwischen grünem bg und bild ist nicht so ansprechend" (2026-11-11) → Waldgrün läuft weich ins Foto aus (Start + alle Unterseiten, Desktop), deployt
- [x] "die sektionen haben teilweise zu harte kanten, mach sie weicher. runder.." (2026-11-11) → 11.11.: Farbflächen als gerundete Tafeln mit Rand, Heros unten rund, Knöpfe pillenförmig, Karten 14px
- [x] "der grüne strich aus der startseite/herosektion darf sich im kompletten projekt wiederfinden. spielerisch. minimalistisch. nicht zu viel, nicht störend.." (2026-11-11) → 11.11.: Schleife in allen Unterseiten-Heroes, Linie zeichnet sich in Schwerpunkte und Versorgung
- [x] Kontakt: Text "Bitte sprechen Sie Erstanfragen nicht auf unseren Anrufbeantworter. Weitere telefonische Erreichbarkeit … 07541 3739489." besser formatieren (2026-11-11) → 11.11.: Telefonkarte gegliedert (Sprechzeit, weitere Erreichbarkeit, Hinweis), neben dem Formular
- [x] "Generell nochmals die texte visuell prüfen ob diese auch optisch ansprechend formatiert wurden - egal welches gerät/auflösung" (2026-11-11) → 11.11.: Start, Kontakt, Praxis, Team, Ablauf auf Desktop/Handy geprüft, Umbruch Dipl.-Psych. behoben
- [x] "im vz transfer sind nochmals 2 weitere bilder gelandet, damit können wir praxis und kontakt noch verbessern" (2026-11-11) → 11.11.: Eichenzweig im Kontakt-Hero, Farn im Gegenlicht im Praxis-Hero
- [x] "das mit den rundungen hat nicht ganz geklappt.. ich glaub ich wollte eher wellen.. sanft, was zum thema psychotherapie passt" (2026-11-11) → 11.11.: sanfte Wellenkanten (CSS-Maske) an Hero und Farbflächen statt Rundungen
- [x] "kontaktformular ist unübersichtlich geworden mit den rundungunen. die texte sind zu groß, das ganze formular ist anstrengend. vllt etwas zum durchklicken? einfach machen.." (2026-11-11) → 11.11.: 3 Schritte (Anliegen, Versicherung per Klick, dann Kontakt), kleinere Schrift, weniger Rundung; QA-Formulartest klickt [data-weiter]
- [x] "der grüne strich zieht sich noch nicht durch die seite. er darf gern animiert sein." (2026-11-11) → 11.11.: Leitlinie.astro: eine durchgehende Linie ab Hero-Schleife bis Footer, zeichnet sich beim Scrollen (ab 1024 px)
- [x] Kontakt-Hero "Schreiben Sie uns. Wir antworten ehrlich.": "umbruch nach uns." (2026-11-11) → 11.11.: Umbruch nach „uns.“
- [x] "linie durchbrochen" (Start-Hero, 2026-11-11) → 11.11.: Schleife endet über der Welle, Leitlinie setzt nahtlos an
- [x] "der strich darf gern erst kommen wenn man scrollt.. und bei der hero überschrift anfangen" (2026-11-11) → 11.11.: Linie oben unsichtbar, beginnt hinter dem letzten Wort der Hero-Überschrift mit kleiner Schleife und wächst im Gleichschritt mit dem Scrollen
