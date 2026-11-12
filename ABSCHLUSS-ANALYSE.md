# ABSCHLUSS-ANALYSE

Projekt: goenner
Erstellt: 12.11.2026, 08:46:47
Autopilot fertig: 9.11.2026, 20:47:12

Diese Datei listet, WAS nach dem Autopilot noch von Hand geändert wurde.
Sie ist die Faktenbasis für VERBESSERUNGEN.md – nicht das Gedächtnis.

## QA-Gesamtlauf

Letzter Lauf: 11.11.2026, 22:06:00 · GRÜN (Teillauf)

- qa-copy: bestanden
- qa-craft: bestanden

## Geänderte Dateien seit Autopilot-Abschluss (116)

| Datei | + | - | Bewertung |
|---|---|---|---|
| src/styles/site.css | 275 | 27 | KOMPLETT ÜBERARBEITET |
| src/components/forms/ContactForm.tsx | 123 | 74 | stark geändert |
| src/components/Leitlinie.astro | 161 | 0 | stark geändert |
| src/content/site-data.json | 129 | 17 | stark geändert |
| src/sections/Schwerpunkte.astro | 113 | 23 | stark geändert |
| src/sections/Wartezeit.astro | 78 | 29 | stark geändert |
| schau.js | 97 | 0 | stark geändert |
| src/pages/fachliches/stellenangebote/index.astro | 94 | 0 | stark geändert |
| src/pages/fachliches/stellenangebote/psychotherapeutin-verhaltenstherapie.astro | 91 | 0 | stark geändert |
| src/sections/Abschluss.astro | 83 | 0 | stark geändert |
| src/pages/stellenangebote.astro | 0 | 82 | stark geändert |
| AUFGABEN.md | 81 | 0 | stark geändert |
| src/sections/StartHero.astro | 36 | 43 | stark geändert |
| src/pages/kontakt.astro | 40 | 34 | stark geändert |
| src/pages/fachliches/index.astro | 72 | 0 | stark geändert |
| src/pages/behandlung/index.astro | 67 | 0 | stark geändert |
| src/sections/SeitenHero.astro | 57 | 0 | angepasst |
| src/pages/praxis.astro | 26 | 27 | angepasst |
| src/pages/{behandlung.astro => behandlung/therapie-und-schwerpunkte.astro} | 23 | 22 | angepasst |
| src/sections/Uebersicht.astro | 42 | 0 | angepasst |
| src/pages/team.astro | 19 | 17 | angepasst |
| src/pages/{ => behandlung}/ablauf-und-kosten.astro | 17 | 16 | angepasst |
| src/layouts/Seite.astro | 29 | 3 | angepasst |
| src/pages/{ => fachliches}/supervision-und-lehre.astro | 15 | 14 | angepasst |
| src/pages/{ => fachliches}/versorgung-in-not.astro | 15 | 14 | angepasst |
| src/sections/SeitenIntro.astro | 17 | 12 | angepasst |
| src/pages/{ => behandlung}/aok-und-bkk.astro | 14 | 13 | angepasst |
| src/sections/Weg.astro | 15 | 11 | angepasst |
| src/sections/VersorgungAnriss.astro | 20 | 5 | angepasst |
| src/components/DemoBar.astro | 17 | 3 | angepasst |
| src/pages/index.astro | 6 | 12 | angepasst |
| src/sections/TeamAnriss.astro | 7 | 11 | angepasst |
| src/components/Schwung.astro | 17 | 0 | angepasst |
| KI-BILDER.md | 16 | 0 | angepasst |
| public/.htaccess | 9 | 7 | angepasst |
| FEEDBACK.md | 14 | 0 | angepasst |
| src/data/stellen.ts | 10 | 0 | Feinschliff |
| src/pages/404.astro | 4 | 4 | Feinschliff |
| src/sections/LehreAnriss.astro | 4 | 4 | Feinschliff |
| src/pages/datenschutz.astro | 5 | 2 | Feinschliff |

**Gesamt: 2516 geänderte Zeilen in 116 Dateien.**

### Neu angelegt (61) – hat der Autopilot vergessen
- FEEDBACK.md
- KI-BILDER.md
- public/images/fensterlicht-vertaefelung-800.avif
- public/images/fensterlicht-vertaefelung-800.webp
- public/images/fensterlicht-vertaefelung.avif
- public/images/fensterlicht-vertaefelung.jpg
- public/images/fensterlicht-vertaefelung.webp
- public/images/hero-buchenlaub-800.avif
- public/images/hero-buchenlaub-800.webp
- public/images/hero-buchenlaub.avif
- public/images/hero-buchenlaub.jpg
- public/images/hero-buchenlaub.webp
- public/images/hero-efeu-800.avif
- public/images/hero-efeu-800.webp
- public/images/hero-efeu.avif
- public/images/hero-efeu.jpg
- public/images/hero-efeu.webp
- public/images/hero-eichenzweig-800.avif
- public/images/hero-eichenzweig-800.webp
- public/images/hero-eichenzweig.avif
- public/images/hero-eichenzweig.jpg
- public/images/hero-eichenzweig.webp
- public/images/hero-farn-800.avif
- public/images/hero-farn-800.webp
- public/images/hero-farn-licht-800.avif
- public/images/hero-farn-licht-800.webp
- public/images/hero-farn-licht.avif
- public/images/hero-farn-licht.jpg
- public/images/hero-farn-licht.webp
- public/images/hero-farn.avif
- public/images/hero-farn.jpg
- public/images/hero-farn.webp
- public/images/hero-knospenzweig-800.avif
- public/images/hero-knospenzweig-800.webp
- public/images/hero-knospenzweig.avif
- public/images/hero-knospenzweig.jpg
- public/images/hero-knospenzweig.webp
- public/images/team/baumeister-400.avif
- public/images/team/baumeister-400.webp
- public/images/team/fuelster-400.avif
- public/images/team/fuelster-400.webp
- public/images/team/kaltenbrunner-400.avif
- public/images/team/kaltenbrunner-400.webp
- public/images/team/kloetzl-400.avif
- public/images/team/kloetzl-400.webp
- public/images/zweig-im-licht-800.avif
- public/images/zweig-im-licht-800.webp
- public/images/zweig-im-licht.avif
- public/images/zweig-im-licht.jpg
- public/images/zweig-im-licht.webp
- schau.js
- src/components/Leitlinie.astro
- src/components/Schwung.astro
- src/data/stellen.ts
- src/pages/behandlung/index.astro
- src/pages/fachliches/index.astro
- src/pages/fachliches/stellenangebote/index.astro
- src/pages/fachliches/stellenangebote/psychotherapeutin-verhaltenstherapie.astro
- src/sections/Abschluss.astro
- src/sections/SeitenHero.astro
- src/sections/Uebersicht.astro

### Gelöscht (1) – war überflüssig oder falsch
- src/pages/stellenangebote.astro

## Konkrete Änderungen (Auszug)

### src/styles/site.css
```diff
diff --git a/src/styles/site.css b/src/styles/site.css
index 3415367..8d2ab2c 100644
--- a/src/styles/site.css
+++ b/src/styles/site.css
@@ -2,24 +2,11 @@
    Farben ausschließlich über die Kit-Variablen aus site-data.json. */
 
-/* Nebel: weiche, übereinanderliegende Schwaden aus Blatt- und Waldgrün auf Nebelweiß */
-.nebel {
-  background-color: var(--color-background);
-  background-image:
-    radial-gradient(60% 70% at 12% 18%, rgb(var(--color-accent-rgb) / .20), transparent 70%),
-    radial-gradient(55% 60% at 88% 12%, rgb(var(--color-primary-rgb) / .10), transparent 70%),
-    radial-gradient(70% 80% at 70% 95%, rgb(var(--color-accent-rgb) / .14), transparent 72%),
-    linear-gradient(180deg, rgb(255 255 255 / .55), rgb(255 255 255 / 0));
-}
-.nebel-zart {
-  background-color: var(--color-background);
-  background-image:
-    radial-gradient(50% 60% at 90% 10%, rgb(var(--color-accent-rgb) / .14), transparent 70%),
-    radial-gradient(60% 70% at 5% 100%, rgb(var(--color-primary-rgb) / .07), transparent 70%);
-}
-.nebel-karte {
-  border-radius: var(--radius-karte);
-  border: 1px solid rgb(var(--color-primary-rgb) / .09);
-  box-shadow: 0 1px 0 rgb(255 255 255 / .7) inset, 0 30px 60px -40px rgb(var(--color-secondary-rgb) / .25);
-}
+/* Redesign 10.11. (Referenzen Two Chairs, Alma): flache, satte Flächen statt Verlaufs-Karten mit Schatten.
+   Klassennamen bleiben, damit alle Unterseiten einheitlich mitziehen. */
+.nebel { background-color: color-mix(in srgb, rgb(var(--color-accent-rgb)) 13%, var(--color-background)); }
+.nebel-zart { background-color: #fff; }
+.nebel-karte { border-radius: var(--radius-karte); border: 1px solid rgb(var(--color-primary-rgb) / .16); }
+.flaeche-tief { background: var(--color-secondary); color: rgb(var(--color-on-secondary-rgb)); }
+.flaeche-licht { background: var(--color-accent); color: rgb(var(--color-on-accent-rgb)); }
 
 /* Etikett und Randnotiz (belegte Information neben Überschriften, Octave-Prinzip) */
@@ -72,5 +59,5 @@
 
 /* Höhenlinien als atmosphärischer Hintergrund (Branchensymbol: ein Weg zeichnet sich ab) */
-.hoehenlinien { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .08; }
+.hoehenlinien { display: none; }
 
 /* Knöpfe */
@@ -78,11 +65,31 @@
   display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
   min-height: 3rem; padding: .8rem 1.4rem; border-radius: var(--radius-knopf);
-  font-weight: 600; font-size: 1rem; line-height: 1.2; transition: transform .25s ease, box-shadow .25s ease, background-color .25s ease;
+  font-weight: 600; font-size: 1rem; line-height: 1.2; transition: background-color .25s ease, color .25s ease;
+}
+.knopf svg { transition: transform .25s ease; }
+.knopf:hover svg { transform: translateX(3px); }
+.knopf-voll { background: var(--color-primary); color: rgb(var(--color-on-primary-rgb)); }
+.knopf-voll:hover { background: var(--color-secondary); }
+.knopf-rand { border: 1px solid currentColor; color: var(--color-primary); }
+.knopf-rand:hover { background: rgb(var(--color-primary-rgb) / .06); }
+.knopf-hell { background: var(--color-background); color: var(--color-secondary); }
+.knopf-hell:hover { background: #fff; }
+.knopf-tief { background: var(--color-secondary); color: rgb(var(--color-on-secondary-rgb)); }
+.knopf-tief:hover { background: #172810; }
+.knopf-rand-tief { border: 1px solid var(--color-secondary); color: var(--color-secondary); }
```

### src/components/forms/ContactForm.tsx
```diff
diff --git a/src/components/forms/ContactForm.tsx b/src/components/forms/ContactForm.tsx
index daa8cc7..ffa5f44 100644
--- a/src/components/forms/ContactForm.tsx
+++ b/src/components/forms/ContactForm.tsx
@@ -1,18 +1,20 @@
-import { useState } from 'react';
+import { useEffect, useRef, useState } from 'react';
 import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 
-// Anfrage an /mailer.php. Versicherungsstatus entscheidet über Wartezeit und Privatpraxis (Selbstzahler),
-// technisch optional (QA-Formulartest füllt keine Auswahlfelder). Zusatzfelder landen in der Nachricht.
+// Anfrage an /mailer.php, in drei kurzen Schritten (Niko 11.11.: "das ganze formular ist anstrengend.
+// vllt etwas zum durchklicken? einfach machen.."). Schritt 1 und 2 sind eine Auswahl mit einem Klick
+// (optional, "Weiter" mit data-weiter überspringt sie, darauf stützt sich auch der QA-Formulartest),
+// Schritt 3 nur das Nötige. Versicherung und Anliegen landen in der Nachricht.
 
+const ANLIEGEN = ['Therapieanfrage', 'Beratungs- oder Diagnostiktermin', 'Gruppentherapie', 'Supervision oder Lehrpraxis', 'Etwas anderes'] as const;
 const VERSICHERUNG = [
-  'Gesetzlich: AOK Baden-Württemberg mit Hausarztvertrag',
-  'Gesetzlich: Betriebskrankenkasse mit BKK-Selektivvertrag',
-  'Gesetzlich: andere Krankenkasse',
+  'AOK Baden-Württemberg mit Hausarztvertrag',
+  'Betriebskrankenkasse mit BKK-Selektivvertrag',
+  'Andere gesetzliche Krankenkasse',
   'Privat versichert oder Beihilfe',
   'Selbstzahler (Privatpraxis)',
 ] as const;
-const ANLIEGEN = ['Therapieanfrage', 'Beratungs- oder Diagnostiktermin', 'Gruppentherapie', 'Supervision oder Lehrpraxis', 'Etwas anderes'] as const;
 
 const schema = z.object({
@@ -20,6 +22,6 @@ const schema = z.object({
   email: z.string().trim().email('Bitte geben Sie eine gültige E-Mail-Adresse an.'),
   phone: z.string().trim().optional(),
-  versicherung: z.string().optional(),
-  anliegen: z.string().optional(),
+  versicherung: z.string().nullish(),
+  anliegen: z.string().nullish(),
   message: z.string().trim().min(10, 'Bitte schreiben Sie uns ein paar Worte mehr (mindestens 10 Zeichen).'),
   dsgvo: z.literal(true, { errorMap: () => ({ message: 'Bitte bestätigen Sie die Datenschutzerklärung.' }) }),
@@ -29,7 +31,10 @@ type Daten = z.infer<typeof schema>;
 type Status = 'bereit' | 'sendet' | 'ok' | 'fehler';
 
-const feld = 'w-full rounded-karte border border-primary/25 bg-background px-4 py-3.5 text-base text-text placeholder:text-text/45 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15';
-const label = 'mb-1.5 block text-sm font-semibold text-primary';
-const fehlerText = 'mt-1.5 text-sm font-semibold text-primary';
+const feld = 'w-full rounded-[10px] border border-text/15 bg-white px-3.5 py-2.5 text-[0.95rem] text-text placeholder:text-text/45 transition hover:border-text/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10';
+const label = 'mb-1.5 block text-sm font-medium text-text';
+const fehlerText = 'mt-1 text-sm font-semibold text-primary';
+const wahl = 'group flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-text/12 bg-white px-4 py-3 text-[0.95rem] text-text transition hover:border-primary/40 hover:bg-primary/[0.03] has-[:checked]:border-primary has-[:checked]:bg-primary/[0.06] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/15';
+const leise = 'text-sm font-medium text-text/70 underline-offset-4 transition hover:text-primary hover:underline';
+const SCHRITTE = ['Anliegen', 'Versicherung', 'Kontakt'];
 
 const honeypot = (reg: UseFormRegisterReturn) => (
@@ -41,9 +46,24 @@ const honeypot = (reg: UseFormRegisterReturn) => (
 
 const nachricht = (d: Daten) =>
-  [`Versicherungsstatus: ${d.versicherung || "nicht angegeben"}`, d.anliegen && `Anliegen: ${d.anliegen}`, d.message].filter(Boolean).join('\n\n');
+  [`Versicherungsstatus: ${d.versicherung || 'nicht angegeben'}`, d.anliegen && `Anliegen: ${d.anliegen}`, d.message].filter(Boolean).join('\n\n');
```

### src/components/Leitlinie.astro
```diff
diff --git a/src/components/Leitlinie.astro b/src/components/Leitlinie.astro
new file mode 100644
index 0000000..3c6d7ee
--- /dev/null
+++ b/src/components/Leitlinie.astro
@@ -0,0 +1,161 @@
+---
+// Die grüne Leitlinie (Niko 11.11.: "der grüne strich zieht sich noch nicht durch die seite. er darf gern animiert sein.").
+// Sie beginnt hinter der Hero-Überschrift und schwingt in den Seitenrändern bis zum Footer,
+// an jedem zweiten Sektionswechsel quert sie sanft die Seite. Beim Scrollen zeichnet sie sich mit.
+// Botschaft: Der Weg aus dem ersten Bild begleitet durch die ganze Seite, ruhig und ohne Unterbrechung.
+// Nur ab 1024 px und nur, wenn der Rand breit genug ist (sonst läge sie über Text). Rein dekorativ.
+---
+<svg class="leitlinie" aria-hidden="true" fill="none">
+  <defs><clipPath id="leitlinie-cta"><rect></rect></clipPath></defs>
+  <path class="leitlinie-hell" pathLength="1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
+  <!-- im hellgrünen Abschluss wäre die Linie unsichtbar: dort dieselbe Linie in Dunkelgrün darüber -->
+  <path class="leitlinie-tief" clip-path="url(#leitlinie-cta)" pathLength="1" stroke-width="1.6" stroke-linecap="round"></path>
+</svg>
+
+<script>
+  const svg = document.querySelector<SVGSVGElement>('svg.leitlinie');
+  const pfad = svg?.querySelector<SVGPathElement>('path.leitlinie-hell');
+  const tief = svg?.querySelector<SVGPathElement>('path.leitlinie-tief');
+  const rahmen_ = svg?.querySelector('#leitlinie-cta rect');
+  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
+  let proben: number[] = [];
+
+  const seiteY = (r: DOMRect) => r.top + scrollY;
+  function bauen() {
+    if (!svg || !pfad) return;
+    const main = document.querySelector('main');
+    const cont = document.querySelector<HTMLElement>('main .container');
+    const footer = document.querySelector('footer');
+    if (!main || !cont || !footer || innerWidth < 1024) { svg.style.display = 'none'; return; }
+    const cr = cont.getBoundingClientRect();
+    const innen = cr.left + parseFloat(getComputedStyle(cont).paddingLeft);
+    if (innen < 64) { svg.style.display = 'none'; return; }
+    svg.style.display = '';
+    const breite = document.documentElement.clientWidth;
+    const xL = innen * 0.45, xR = breite - innen * 0.45;
+    // endet im Abschluss-CTA, die letzte Sektion vor dem Footer (Niko 11.11.: "strich - cta reicht, nicht footer"):
+    // knapp unter ihrer oberen Welle läuft sie in einem Haken aus
+    const ziel = main.querySelector(':scope > section:last-of-type') ?? footer;
+    // Gibt es den Abschluss mit "Der erste Schritt …", hängt sie sich genau hinter dessen Überschrift ein
+    // (Niko 11.11.: "der strich sollte immer beim cta hängen bleiben. genau da, wo die überschrift ist"),
+    // als Gegenstück zum Anfang hinter der Hero-Überschrift.
+    const zielH2 = ziel.querySelector<HTMLElement>('.abschluss h2');
+    let zielPunkt: { x: number; y: number } | null = null;
+    if (zielH2) {
+      const b = document.createRange(); b.selectNodeContents(zielH2);
+      const z = [...b.getClientRects()].filter((r) => r.width > 2);
+      const l = z[z.length - 1] ?? zielH2.getBoundingClientRect();
+      zielPunkt = { x: l.right + 18, y: seiteY(l) + l.height * 0.62 };
+    }
+    const ende = zielPunkt ? zielPunkt.y : seiteY(ziel.getBoundingClientRect()) + 70;
+    svg.setAttribute('width', String(breite));
+    svg.setAttribute('height', String(ende + 40));
+    svg.setAttribute('viewBox', `0 0 ${breite} ${ende + 40}`);
+
```

## Gesperrte Komponenten, die überarbeitet wurden (1)

Das wertvollste Signal: Wenn dieselbe Komponente in mehreren Projekten überarbeitet
wird, gehört die Änderung ins Kit (_komponenten/) statt in jedes Projekt einzeln.
Herkunft aus der Git-Historie: "Autopilot" = Commit mit Claude als Co-Autor.

- **src/components/BaseLayout.astro** – 0 Commits (0 Autopilot, 0 extern)

Nikos Versionen + Diffs gesichert in: _learnings/goenner/komponenten/

## Kit-Dateien im Root von Hand geändert (4)

Vom Setup behalten, neue Kit-Fassung liegt in _kit-konflikte/: Footer.astro, Header.astro, kit-hashes.json, StickyContact.astro.
Beide Fassungen (Root-_komponenten und _kit-konflikte) beim nächsten Kit-Update mitschicken.

## Vom Autopiloten mit Freigabe geänderte Kit-Dateien

- 2026-11-11T17:31:15.615Z Bash: BaseLayout.astro (per Befehl) (mit .kit-freigabe)
- 2026-11-11T17:31:19.899Z Bash: BaseLayout.astro (per Befehl) (mit .kit-freigabe)

## 11.11.2026 – DemoBar v6 + BaseLayout (--hero-h) + qa-craft (Niko: Infoleiste erst beim Scrollen)
- DemoBar: beim Laden ausgeblendet (translate-y-full), gleitet beim ersten Scrollen herein und bleibt.
- BaseLayout: --hero-h = 100svh minus Navigation (Demo-Leiste wird nicht mehr abgezogen).
- qa-craft: prüft direkt nach dem Laden, dass die Leiste unsichtbar ist; Hero-Soll ohne Leiste.
- Geändert in _komponenten, _template und Projekt; kit-hashes.json ergänzt. Freigabe per .kit-freigabe, danach gelöscht.

- 11.11.2026 qa-craft: Hero-Soll zieht optionales --hero-luft ab (Luft unter Hero-Welle, Gönner).

## Vorhandene Berichte

- **PROJEKTBERICHT.md** (39 Zeilen) – VOLLSTÄNDIG LESEN und einarbeiten
- **VERBESSERUNGEN.md** (17 Zeilen) – VOLLSTÄNDIG LESEN und einarbeiten
- **AUFGABEN.md** (89 Zeilen) – VOLLSTÄNDIG LESEN und einarbeiten
- **KI-BILDER.md** (17 Zeilen) – VOLLSTÄNDIG LESEN und einarbeiten
- **OFFENE-FRAGEN.md** (14 Zeilen) – VOLLSTÄNDIG LESEN und einarbeiten

## Auftrag für die Auswertung

1. Alle oben genannten Berichte lesen (besonders PROJEKTBERICHT.md aus der externen IDE).
2. Die Diffs oben durchgehen: Jede größere Änderung ist ein Autopilot-Mangel.
3. VERBESSERUNGEN.md schreiben – pro Punkt: Problem, was Niko tat, Regel/Mechanik-Vorschlag.
4. Keine Punkte erfinden und keine aus dem Gedächtnis – nur was hier belegt ist.
5. Herkunft beachten: Komponenten-Änderungen mit [AP] hat der Autopilot gemacht (Regelverstoß),
   [extern] ist Nikos Nacharbeit (Kit-Kandidat).
