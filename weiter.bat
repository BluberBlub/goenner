@echo off
chcp 65001 >nul
cd /d "%~dp0"
for %%I in ("%~dp0.") do set "PROJEKT=%%~nxI"
set "ROOT=..\.."
if not exist "%ROOT%\_komponenten" (
  echo.
  echo   FEHLER: Autopilot-Root nicht gefunden ^(erwartet: %ROOT%^)
  echo   Dieses Projekt liegt nicht unter Websites\projekte\^<name^>.
  echo   Ohne Root werden Regeln, Gates und Komponenten NICHT aktualisiert.
  echo.
  pause
  exit /b 1
)
set "CACHE=.autopilot-sync"
echo.
echo   Setze Projekt fort: %PROJEKT%
echo.

if not exist "%CACHE%" mkdir "%CACHE%" >nul 2>&1

rem ---- Regeln und Gates: unkritisch, immer aktualisieren ----
copy /Y "%ROOT%\CLAUDE.md" "CLAUDE.md" >nul 2>&1
if not exist "_regeln" mkdir "_regeln"
copy /Y "%ROOT%\_regeln\*" "_regeln\" >nul 2>&1
if exist "%ROOT%\_referenzen" (
  if not exist "_referenzen" mkdir "_referenzen"
  copy /Y "%ROOT%\_referenzen\*" "_referenzen\" >nul 2>&1
)
for %%F in (qa-alle.js qa-checks.js qa-overflow.js qa-contact-form.js qa-live.js qa-craft.js qa-wow.js qa-copy.js qa-visual.js qa-relaunch.js qa-images.js qa-slop.js qa-speed.js qa-seo.js og-bild.js optimize-build.js bild-formate.js generate-image.js optimize-images.js validate-sitedata.js test-mailer.js) do copy /Y "%ROOT%\%%F" "%%F" >nul 2>&1
copy /Y "%ROOT%\abschluss.js" "abschluss.js" >nul 2>&1
copy /Y "%ROOT%\stand.js" "stand.js" >nul 2>&1
echo   Regeln und Pruef-Skripte aktualisiert.
rem ---- Einrichtung: Schutz-Hook fuer gesperrte Dateien, npm run qa, .gitignore ----
node stand.js --einrichten

rem ---- Berichte ins Root-Archiv sichern: Learnings duerfen NIE verloren gehen ----
if not exist "%ROOT%\_learnings" mkdir "%ROOT%\_learnings" >nul 2>&1
if not exist "%ROOT%\_learnings\%PROJEKT%" mkdir "%ROOT%\_learnings\%PROJEKT%" >nul 2>&1
for %%B in (VERBESSERUNGEN.md PROJEKTBERICHT.md ABSCHLUSS-ANALYSE.md AUFGABEN.md OFFENE-FRAGEN.md KI-BILDER.md DESIGN-BRIEF.md) do (
  if exist "%%B" copy /Y "%%B" "%ROOT%\_learnings\%PROJEKT%\%%B" >nul 2>&1
)
echo   Berichte ins Archiv _learnings\%PROJEKT%\ gesichert.

rem ---- Komponenten: NUR wenn unveraendert. Eigene Aenderungen bleiben IMMER erhalten. ----
echo.
echo   Komponenten-Abgleich ^(eigene Aenderungen bleiben, Kit-Verbesserungen werden eingearbeitet^):
node stand.js --abgleich
if errorlevel 1 (
  echo   Abgleich per Node fehlgeschlagen, einfacher Abgleich:
  if exist "src\layouts"    call :sync "BaseLayout" "src\layouts"
  if exist "src\components" (
    for %%K in (Header Footer Section PageHero StickyContact CookieBanner DemoBar Cta KontaktKarte SektionsKopf Fragen Oeffnungszeiten KarteLaden) do call :sync "%%K" "src\components"
  )
  call :syncdatei "tailwind.config.mjs" "tailwind.config.mjs"
  if exist "src" call :syncdatei "middleware.ts" "src\middleware.ts"
)

echo.
echo   Stand pruefen:      node stand.js
echo   Stand nachziehen:   node stand.js --uebernehmen
echo.

rem ---- Template im Root mitziehen, damit NEUE Projekte aktuell starten ----
if exist "%ROOT%\_template\src\components" (
  copy /Y "%ROOT%\_komponenten\*.astro" "%ROOT%\_template\src\components\" >nul 2>&1
  if exist "%ROOT%\_template\src\layouts" copy /Y "%ROOT%\_komponenten\BaseLayout.astro" "%ROOT%\_template\src\layouts\" >nul 2>&1
  if exist "%ROOT%\_template\src\pages" copy /Y "%ROOT%\_komponenten\stil-muster.astro" "%ROOT%\_template\src\pages\" >nul 2>&1
  copy /Y "%ROOT%\_komponenten\tailwind.config.mjs" "%ROOT%\_template\tailwind.config.mjs" >nul 2>&1
  if exist "%ROOT%\_template\src" copy /Y "%ROOT%\_komponenten\middleware.ts" "%ROOT%\_template\src\middleware.ts" >nul 2>&1
  if exist "%ROOT%\_template\_regeln" copy /Y "%ROOT%\_regeln\*" "%ROOT%\_template\_regeln\" >nul 2>&1
  copy /Y "%ROOT%\CLAUDE.md" "%ROOT%\_template\CLAUDE.md" >nul 2>&1
)

echo.
where claude >nul 2>&1
if errorlevel 1 ( echo   FEHLER: claude nicht gefunden. & pause & exit /b )
set "PROMPT=CLAUDE.md ist schon geladen, nicht erneut lesen. Lies progress.json und AUFGABEN.md (offene Punkte). Setze die Arbeit nahtlos fort - Regel-Datei der aktuellen Phase aus _regeln/ erneut lesen. Gibt es KIT-ZUSAMMENFUEHREN.md, das ZUERST erledigen (neue Kit-Fassung plus eigene Aenderungen, nichts Eigenes weglassen). Eigene Aenderungen an Kit-Dateien nie zurueckbauen. Rueckmeldungen an Niko hoechstens 5 Zeilen (CLAUDE.md). QA immer mit npm run qa (ein Befehl, eigener Server)."
rem ---- Sitzung: nur kleine, frische Sitzungen fortsetzen, sonst frisch starten ----
rem 09.11.2026: --continue setzte immer dieselbe Sitzung fort (Opitz: 404k Kontext, 41 Mio. Tokens).
rem Der Projektstand liegt in progress.json, CLAUDE.md und AUFGABEN.md, frisch starten verliert nichts.
rem ---- Schlanker Start (09.11.2026): Grundlast je Schritt war 90k Tokens (Desktop-App mit allen MCPs). ----
rem Der Autopilot braucht keine MCP-Server (Gmail, Docs, Browser): Playwright laeuft ueber eigene Skripte.
rem Nur wenn die installierte claude-Version die Schalter kennt, sonst normaler Start.
rem --mcp-config nimmt mehrere Werte: danach MUSS eine weitere Option folgen, sonst wird der Auftrag als Datei gelesen.
set "SCHLANK="
if not exist ".claude" mkdir ".claude"
> ".claude\mcp-leer.json" echo {"mcpServers":{}}
claude --help 2>nul | findstr /c:"--strict-mcp-config" >nul && set "SCHLANK=--strict-mcp-config --mcp-config .claude\mcp-leer.json"
node stand.js --sitzung
if errorlevel 1 (
  cmd /k claude -n "%PROJEKT%" --remote-control "%PROJEKT%" --model opus %SCHLANK% --dangerously-skip-permissions "%PROMPT%"
) else (
  cmd /k claude --continue --remote-control "%PROJEKT%" --model opus %SCHLANK% --dangerously-skip-permissions "%PROMPT%"
)
goto :eof

rem ============ Sync einer .astro-Komponente ============
:sync
set "N=%~1"
set "ZIELVZ=%~2"
set "SRC=%ROOT%\_komponenten\%N%.astro"
set "DST=%ZIELVZ%\%N%.astro"
set "SNAP=%CACHE%\%N%.astro"
if not exist "%SRC%" goto :eof
if not exist "%DST%" (
  copy /Y "%SRC%" "%DST%" >nul 2>&1
  copy /Y "%SRC%" "%SNAP%" >nul 2>&1
  echo     + %N%.astro neu angelegt
  goto :eof
)
if not exist "%SNAP%" goto :ersterabgleich
fc /b "%DST%" "%SNAP%" >nul 2>&1
if errorlevel 1 (
  echo     = %N%.astro BEHALTEN ^(von dir geaendert^)
  goto :eof
)
fc /b "%SRC%" "%DST%" >nul 2>&1
if errorlevel 1 (
  copy /Y "%SRC%" "%DST%" >nul 2>&1
  copy /Y "%SRC%" "%SNAP%" >nul 2>&1
  echo     ^> %N%.astro aktualisiert
)
goto :eof

rem ============ Sync einer normalen Datei ============
:syncdatei
set "N=%~1"
set "DST=%~2"
set "SRC=%ROOT%\_komponenten\%N%"
set "SNAP=%CACHE%\%N%"
if not exist "%SRC%" goto :eof
if not exist "%DST%" ( copy /Y "%SRC%" "%DST%" >nul 2>&1 & copy /Y "%SRC%" "%SNAP%" >nul 2>&1 & goto :eof )
if not exist "%SNAP%" goto :ersterabgleich
fc /b "%DST%" "%SNAP%" >nul 2>&1
if errorlevel 1 ( echo     = %N% BEHALTEN ^(von dir geaendert^) & goto :eof )
copy /Y "%SRC%" "%DST%" >nul 2>&1
copy /Y "%SRC%" "%SNAP%" >nul 2>&1
goto :eof

rem ============ Erster Abgleich ohne Snapshot ============
rem Gleich wie das Kit: Snapshot = Kit. Abweichend: eigene Fassung, Snapshot bekommt die Marke
rem AUTOPILOT-EIGEN. Frueher wurde hier die Projektdatei als Snapshot gesichert, dann sah der
rem naechste Abgleich "unveraendert" und setzte Nikos Version zurueck (Niko, 18.10.2026).
:ersterabgleich
fc /b "%SRC%" "%DST%" >nul 2>&1
if errorlevel 1 (
  > "%SNAP%" echo AUTOPILOT-EIGEN
  echo     = %N% BEHALTEN ^(eigene Fassung, wird nie automatisch ersetzt^)
  goto :eof
)
copy /Y "%SRC%" "%SNAP%" >nul 2>&1
goto :eof
