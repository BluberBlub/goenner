# PHASE 3 – QUALITÄTSSICHERUNG
# VORHER: Phase 2c (Design-Review) muss durchlaufen sein – _regeln/phase2c-designreview.md
# Wird von Claude zu Beginn von Phase 3 KOMPLETT gelesen.

## UMLAUT-PRÜFUNG (vor Deployment)

Im fertigen sichtbaren Text dürfen keine ASCII-Ersatzschreibweisen stehen.
Suche und korrigiere:
- "fuer" → "für", "ueber" → "über", "muess" → "müss"
- "waehrend" → "während", "moechten" → "möchten"
- "gross" → "groß" wo richtig
Hinweis: Gilt für sichtbaren Content, NICHT für Code/Variablennamen/Dateinamen.

## FINALE PRÜF-CHECKLISTE (vor jedem Deployment)

- Bildpassung: Passt jedes Bild zum Maßstab und Kontext der Firma?
- Bild-Konsistenz: Gleiches Thema überall gleiches Hauptbild?
- Textqualität: Keine abgehackten Sätze, natürlicher deutscher Fluss?
- Farbkontrast: Text auf Accent-Farben lesbar (kein Weiß auf Gelb)?
- Authentizität: Keine erfundenen Testimonials oder Fake-Portraits?
- Premium-Features: Dem Preis angemessen (WhatsApp, Maps, FAQ)?
- Responsive: Kein horizontales Scrollen von 320-1920px? Konsistente Paddings?
- Umlaute: Keine ue/ae/oe-Fehler im sichtbaren Text?
- Navigation: Nur ein CTA-Button, "Startseite" als erster Menüpunkt?
- Design: Mutig und charaktervoll, nicht langweilig-generisch?

- Hero-Design auf allen Unterseiten identisch?
- Deko-Elemente passen zur Container-Form (keine eckigen Corners auf runden Bildern)?
- Stats/Counter-Sektionen: Ruhiger Hintergrund (Muster, nicht buntes Foto)?
- Alle verwendeten Bilder visuell geprüft (nicht nur Dateinamen)?
- Hero-Headline: Mobile-Umbrüche kontrolliert (auf 320px getestet)?
- Testimonials: Echte Bewertungen oder Sektion weggelassen?
- robots.txt vorhanden und korrekt?
- Leistungs-Unterseiten existieren (nicht nur Übersichtsseite)?
- Hero-Bilder: responsive object-position gesetzt (Motiv auf Mobile sichtbar)?
- Hero-Overlay auf Mobile verstärkt (Lesbarkeit trotz Bildverschiebung)?
- Typografische Konsistenz: gleiche Alignment-Regeln pro Sektionstyp?
- progress.json hat ZEITSTEMPEL bei jeder Phase (Start + Ende)?
- Bei Eskalation: progress.json hat eskalation-Feld + PROJEKTBERICHT warnt prominent?
- Hero-Form bewusst gewählt und im DESIGN-BRIEF begründet?
- Tonalität: Du/Sie konsistent auf ALLEN Seiten (grep-Check gemacht)?
- 3-Sekunden-Test: Hero beantwortet Wer/Was/Wo/CTA?
- Telefonnummer als tel:-Link im Header, auf Mobile prominent?
- Vertrauenselemente im/unter dem Hero (nicht erst im Footer)?
- Kontaktseite: Kontaktweg above the fold?
- HTTPS: Vor Zwang manuell getestet? HSTS mit max-age=300 gestartet (nicht direkt 1 Jahr)?
- LCP-Bild (Hero): als lcpBild an BaseLayout übergeben?
- .htaccess: Cache-Control immutable für gehashte Astro-Assets (.css/.js)?
- Hero-Stats/Badges: bei 320px vollständig sichtbar (kein Abschneiden)?
- Leistungs-Heroes: JEDEN einzeln auf Mobile (390px) auf Lesbarkeit geprüft?
- Mobile-Overflow: Deko-Elemente (Orbs/Canvas/Blur) auf Mobile ausgeblendet?
- Canvas-Animationen: JS-Check fuer Mobile vorhanden (nicht nur CSS versteckt)?
- Section-Paddings: py-12 sm:py-16 lg:py-24 (kompakter auf Mobile)?
- Stat-Cards: overflow-hidden + text-overflow Schutz fuer lange Labels/Zahlen?


## MASCHINELLE GATES: EIN BEFEHL (Pflicht)

    npm run qa

Während der Lauf läuft: NICHTS ändern, nicht deployen. qa-alle erkennt
Änderungen und erklärt den Lauf dann für ungültig (Spöri). Jedes Gate hat ein
Zeitlimit (12 Min, KI-Gates 25 Min), ein hängender Dienst blockiert nichts mehr.
qa-craft v3 prüft zusätzlich Nikos dauerhafte Regeln (siehe CLAUDE.md): Hero-Höhe,
Text außerhalb von Boxen (320–1440 px), Hurenkinder (Fehler), doppelte Bilder,
Zeilenabstand der Überschriften, gleich hohe Boxen, einheitlicher Radius,
Demo-Leiste sichtbar. qa-seo prüft Titel, Beschreibungen, Schema, llms.txt.
Gemini-Gates (qa-images, qa-visual): Ist das Tageskontingent erschöpft, brechen sie sofort ab und
zählen als übersprungen (der Lauf kann trotzdem grün werden). qa-images merkt sich geprüfte Bilder
(.qa-cache/), der nächste Lauf prüft nur Neue. Für volle Prüfung: bezahlter Key in gemini-config.json.
Ausgeblendete feste Elemente (Chat-Knopf, Sticky) bekommen aria-hidden und inert, solange sie
unsichtbar sind: sonst wertet qa-craft sie als verzögerte Animation, und Screenreader lesen sie vor.
Abgebrochene Läufe räumt der nächste `npm run qa` selbst auf.

Das ist alles. Der Befehl (qa-alle.js) baut die Seite, startet einen EIGENEN
Server auf einem freien Port (kein Konflikt mit anderen Projekten oder der IDE),
führt alle Gates nacheinander aus und zeigt am Ende eine Tabelle:
checks · copy · relaunch · overflow · contact-form · craft · wow · speed ·
images · visual · slop (nur Hinweise). Nachweis: .qa-status.json.

1. `npm run qa` ausführen (dauert einige Minuten)
2. Jeden gemeldeten Fehler beheben
3. Nachtest nur der roten Gates: `npm run qa -- --nur=craft,copy` (schnell)
4. Zum Schluss wieder der KOMPLETTE Lauf `npm run qa` bis "ALLE GATES GRÜN".
   Nur der Komplettlauf zählt für Marker und Deploy.
5. Erst DANN die visuelle Prüfung (unten) und der Deploy (Phase 5).

Keinen eigenen Preview-Server auf Port 4321 starten: dort läuft oft ein anderes
Projekt. Einzelne Gates von Hand nur mit der URL, die `npm run qa` benutzt.
Ein Gate-Fehler ist NIE "known issue" – er wird behoben oder eskaliert
(Eskalations-Regel in CLAUDE.md).

## ⬤ UNABHÄNGIGE PRÜFUNG DURCH EINEN SUB-AGENTEN (Pflicht, nach grünem `npm run qa`)

Wer gebaut hat, übersieht die eigenen Fehler. Deshalb vor "fertig" und vor dem Marker
EINEN frischen Sub-Agenten (Agent-Tool, gleiches Modell) starten, der die Seite NICHT gebaut hat.
Auftrag an ihn, vollständig mitgeben (er kennt das Gespräch nicht):
- Projektordner, Dev-URL bzw. dist/, und dass er NUR prüft und NICHTS ändert.
- Lesen: CLAUDE.md (Abschnitt Gestaltungsregeln), _regeln/phase2-design.md, DESIGN-BRIEF.md,
  AUFGABEN.md (Nikos Wünsche aus dem Chat), bei Relaunch CONTENT-INVENTAR.md.
- Jede Seite bei 390 und 1440 px per Playwright ansehen (Startseite zusätzlich 2000 px).
- Prüfen gegen: Maßstab 250.000-€-Projekt, Leitidee durchgehalten, jeder offene Punkt aus
  AUFGABEN.md wirklich umgesetzt, nur belegte Aussagen, Contentkante, Lesefluss, Hurenkinder,
  gleiche Muster auf allen Unterseiten, nichts doppelt.
- Rückgabe: Liste "Fehler" (muss behoben werden, mit Seite und Stelle) und "Hinweise".
Danach selbst beheben, betroffene Gates erneut laufen lassen. Ergebnis kurz in PROJEKTBERICHT.md
("Unabhängige Prüfung: N Fehler gefunden, behoben").

## VISUELLE PRÜFUNG (nach den Gates, nicht statt ihnen)

- Jede Seite bei 390px UND 1440px öffnen und ANSCHAUEN (Screenshots via Playwright)
- Leistungs-Heroes einzeln: Lesbarkeit (Schnee=weiß auf weiß, Laub=grün auf grün)
- Texte LAUT lesen: natürliches Deutsch? Tonalität konsistent mit site-data.json?
- Bilder: zeigt jedes Bild was es soll (Maßstab, Kontext, keine Stock-Klischees)?
- Hero-Form wie im DESIGN-BRIEF umgesetzt? Mind. 2 Sektions-Varianzen?

## BILD-GATE (qa-images.js – maschinelle Motiv-Prüfung)

Teil von `npm run qa`. Gemini Vision schaut JEDES Bild in public/images/ an
und gleicht gegen Branche + Verwendungszweck (aus bildZuordnung) ab.
- Unpassendes Motiv (Bagger für Hausmeister, falscher Kontext) → Exit 1
- Ohne Gemini-Key: übersprungen mit Warnung (blockiert nicht, aber Bilder ungeprüft)
Meldet ein Bild als unpassend → ersetzen (echt > lizenzfrei > generieren), dann erneut `npm run qa`.
Das ist die maschinelle Absicherung gegen wiederkehrende Bild-Fehlwahl –
Text-Regeln allein greifen hier nicht, weil der Build-Prozess Bilder nicht "sieht".

## BILD-GATE: AUTOMATISCHER REPARATUR-LOOP (Autopilot Phase 3)

Wenn `npm run qa:images` mit Exit 1 endet und qa-images-report.json existiert:
FÜR JEDES unpassende Bild aus dem Report:
1. Prüfen ob echtes Kundenbild/Original vorhanden das besser passt → einsetzen
2. Sonst lizenzfrei (Unsplash/Pexels) mit passendem Motiv laden
3. Sonst generieren:
   node generate-image.js "<präzises Motiv aus zweck+branche+ort, KEIN falscher Kontext>" <pfad> 1600 1000
   Prompt-Regeln: konkretes Motiv, geografisch/kulturell passend (z.B. mitteleuropäisch
   statt tropisch/alpin wenn Ort das verlangt), Branche einbeziehen, keine echten Personen als "Team".
4. Nach dem Ersetzen ALLER Bilder: `npm run qa:images` erneut.
Wiederholen bis Exit 0 (0 unpassende Bilder). Max 3 Runden, dann eskalieren
(Eskalations-Regel) und im PROJEKTBERICHT.md die verbleibenden Bilder für Niko listen.
Alle generierten Bilder im PROJEKTBERICHT.md unter "KI-Bilder" vermerken.

## ANTI-SLOP-CHECK (qa-slop.js – Impeccable, nicht-blockierend)

Teil von `npm run qa`. Nutzt das Impeccable-CLI (deterministisch, kein LLM/Key)
zum Aufspüren typischer KI-Design-Klischees: Gradient-Text, verschachtelte Cards,
graue Schrift auf farbigem Grund, Bounce-Easing, Dark-Glows, geskippte Headings,
zu kleine Touch-Targets. Blockiert NICHT (Exit immer 0), gibt nur Hinweise.
Gemeldete Muster prüfen: bewusste Design-Entscheidungen (z.B. ein gewollter
Verlauf im Haus-Stil) dürfen bleiben – klare Klischees beheben.
Ergänzt phase2-design.md: dort steht WIE es aussehen soll, hier wird maschinell
gegengeprüft ob KI-Slop reingerutscht ist.


## HANDWERKS-GATE (qa-craft.js) – blockierend

Teil von `npm run qa`. Prüft mit Playwright auf allen Seiten:
- Sticky-Contact: im Hero ausgeblendet? über Footer ausgeblendet? überlappt keinen Inhalt?
- Bilder: gerendertes Seitenverhältnis == natürliches? (Verzerrung = Fehler;
  object-fit:cover/contain wird korrekt ignoriert)
- Footer: auf allen Seiten identisch? (Text, Links UND Spaltenstruktur)
- Active-State: ist der Link zur aktuellen Seite in der Navigation markiert?
  (aria-current oder sichtbar abweichendes Styling – Desktop und Mobile)
- Bild-Zuschnitt: wird ein Motiv durch object-fit:cover stark beschnitten
  (Verhältnis-Faktor > 1.5)? Dann Bild im passenden Format neu erzeugen.
- Erster Bildschirm: ist nach 1,2 s noch etwas unsichtbar (verzögerte Animation
  im Hero/KPIs)? Fehler. Hero und Kennzahlen stehen sofort da (Alge).
- Hero-CTA auf 390×844 ohne Scrollen sichtbar? Sonst Fehler (Alge).
- Kontrast Schrift auf Fläche: unter 2:1 Fehler (Weiß auf Gelb), unter 3 bzw.
  4.5 Hinweis. Lösung: text-on-primary / text-on-accent statt Farbe von Hand.
- Tote Links (href="#" oder leer): Fehler.
- Letzte Sektion in Footer-Farbe (verschmilzt): Fehler (Opitz).
- Footer-Logo als weiße Fläche ohne transparenten Hintergrund: Fehler.
- Hurenkinder in Überschriften/Absätzen: Hinweis (&nbsp; zwischen die letzten Wörter).
Exit 1 = Phase 3 nicht bestanden. Diese Fehler sind die häufigsten
Übergabe-Rückläufer und deshalb NICHT verhandelbar – auch nicht durch die Leitidee.

Zusätzlich bei Relaunch: CONTENT-INVENTAR.md durchgehen. Jeder Eintrag muss
Status "übernommen" oder "BEWUSST WEGGELASSEN (Grund)" haben. Fehlende Infos
vom Original sind ein Abbruchgrund für die Übergabe.


## MUT-GATE (qa-wow.js) – blockierend

Prüft messbare Indizien für Selbstbewusstsein (kein Geschmacksurteil):
- Ist ein SIGNATURE MOMENT in DESIGN-BRIEF.md dokumentiert und konkret?
- Typo-Mut: größte Headline mind. 3× Body-Größe (darunter = zaghaft)
- Bewegung vorhanden (Keyframes / Scroll-Reveal / scroll-driven CSS)
- Sektions-Varianz: nicht alle Abschnitte im gleichen Muster
- Hinweis wenn kein Full-Bleed-Element existiert
- KOMPOSITION: Überlappung über Sektionsgrenzen? asymmetrische Raster?
  nicht alle Überschriften zentriert? vollflächige Farbsektion? Abstands-Rhythmus?
  Das sind NUR Hinweise: bewusst entscheiden, nie blind umbauen (blindes
  Abarbeiten hat Seiten schlechter gemacht).
Exit 1 = Phase 3 nicht bestanden. Beheben über den MUT-KATALOG in phase2-design.md.
Eine fehlerfreie langweilige Seite ist ein Fehlschlag – dieses Gate macht das messbar.


## TEXT-GATE (qa-copy.js) – blockierend

Prüft das gebaute dist/ auf:
- Verbotene Floskeln ("Willkommen bei", "Ihr Partner für", "Alles aus einer Hand" …)
- H1-Qualität der Startseite: zu kurz = Firmenschild statt Botschaft
- Konkretheit: gibt es Zahlen/Jahreszahlen, die nur auf diese Firma zutreffen?
- Gedankenstriche im Text (Nikos Stilregel): Doppelpunkt, Komma, Klammer oder
  zwei Sätze. Bis-Striche (Mo–Fr, 8–12 Uhr) sind erlaubt.
Exit 1 blockiert Phase 3. Generischer Text ist der Hauptgrund für generische
Websites – stärker als jedes Design-Detail. Beheben über phase1-research.md,
Abschnitt POSITIONIERUNG & KERNBOTSCHAFT.


## SPEED-GATE (qa-speed.js) – blockierend

Lighthouse Mobile (wie PageSpeed Insights) auf Startseite, einer Unterseite und
Kontakt. Performance unter 85 = Fehler, unter 95 = Hinweis mit den größten
Bremsen und dem LCP-Element. Barrierefreiheit/Best Practices unter 90 und SEO
unter 95 = Fehler (noindex auf Staging wird nicht abgezogen). Typische Hebel:
Hero-Bild als WebP < 250 KB + lcpBild an BaseLayout, Bilder mit width/height,
loading="lazy" unterhalb des ersten Bildschirms, design.fontPreload für die
Headline-Schrift. Report: qa-speed-report.json.

## GROSSE PROJEKTE (40+ Seiten): STICHPROBEN-MODUS

qa-craft und qa-overflow prüfen bei mehr als 12 Seiten automatisch eine
STICHPROBE: Startseite + 1 Vertreter je Template-Gruppe + zufällige Auffüllung.
Seiten aus demselben Template teilen dieselben Fehler – 1 Vertreter genügt.
- Vollprüfung erzwingen: node qa-craft.js <url> --alle
- Kleinere/größere Probe: --limit=N
Der FOOTER wird zusätzlich STATISCH über ALLE dist-Seiten verglichen
(ohne Browser) – volle Abdeckung, wo sie nichts kostet.

## DAS AUGE (qa-visual.js) – Screenshots + Vision-Urteil

Der einzige Check, der beurteilt wie die Seite AUSSIEHT. Playwright macht
Screenshots (Startseite + 3 Seiten, je Mobile und Desktop), Gemini Vision
beurteilt sie als Art Director und meldet nur SICHTBARE Probleme:
Text am Rand, Kollisionen, kaputte Abstände, unlesbare Stellen,
falsch beschnittene Motive, Template-Anmutung.

Umgang mit dem Ergebnis:
- "fehler"  → beheben. Das ist sichtbar kaputt.
- "hinweis" → BEWUSST entscheiden, nicht blind umsetzen. Geschmacksfrage.
Screenshots liegen in .qa-screenshots/ – dort selbst reinschauen, bevor
etwas geändert wird. Report: qa-visual-report.json

REPARATUR-LOOP (wie bei qa-images, max. 2 Runden):
1. qa-visual-report.json lesen – NUR die "fehler" beheben, gezielt und minimal
2. Build + qa-visual erneut auf die betroffenen Seiten
3. Nach 2 Runden ohne grün: STOPP und an Niko eskalieren mit Screenshot-Pfaden
   – nicht weiter raten, das verschlimmert (ASV-Lektion)
"hinweise" werden NIE automatisch umgesetzt, nur im Bericht erwähnt.

WICHTIG: Nach jeder Design-Änderung erneut laufen lassen. Blind umgesetzte
Layout-Eingriffe (negative Margins, asymmetrische Raster) verschlechtern das
Ergebnis oft – nur dieser Check merkt das, weil er hinschaut.
Ohne Gemini-Key wird übersprungen (mit Warnung, nicht blockierend).


## RELAUNCH-GATE (qa-relaunch.js) – blockierend

Vergleicht dist/ gegen ORIGINAL-INHALTE.json (aus Phase 1):
- Fehlende FAKTEN (Telefon, Öffnungszeiten, Preise, Jahreszahlen, PLZ) → Fehler
- Fehlende ÜBERSCHRIFTEN/THEMEN der Originalseite → Fehler
- Inhaltsabdeckung unter 70% → Fehler
- SIEGEL/ZERTIFIKATE der Originalseite (MARKE.md, original-bilder/_SIEGEL-*)
  nicht auf der neuen Seite → Fehler (Opitz: DATEV-Siegel)
Report: qa-relaunch-report.json (nennt jeden fehlenden Punkt konkret,
plus die Liste aller Original-Bilder zum Abgleich).

Beheben: fehlende Inhalte übernehmen (gern neu formuliert) ODER in
CONTENT-INVENTAR.md als "BEWUSST WEGGELASSEN (Grund: ...)" markieren.
Ohne Inventar (Neubau statt Relaunch) wird der Check übersprungen.


## NACH BESTANDENER QA: VERGLEICHSPUNKT SETZEN

    node abschluss.js --marke

Pflicht. Funktioniert NUR nach einem grünen Komplettlauf von `npm run qa`
(sonst verweigert es und nennt den Grund). Markiert den Stand "Autopilot fertig". Alles, was Niko danach in der
externen IDE ändert, wird beim Abschluss als Lernquelle ausgewertet
(_regeln/phase6-abschluss.md). Ohne Marker geht dieses Wissen verloren.
