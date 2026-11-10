# PHASE 2 – KATALOGE (Mut-Katalog und Kompositions-Katalog)
# Einmal zu Beginn von Phase 2 lesen, bevor die Startseite geplant wird (Leitidee in Technik übersetzen),
# und erneut nur, wenn Niko mehr Wirkung will ("langweilig", "mehr Wow"). Nicht bei jedem Neustart:
# in progress.json "katalogeGelesen": true setzen (spart Tokens, 09.11.2026).

## ⬤ MUT-KATALOG – Techniken die Eindruck machen (das Gaspedal)

Die anderen Abschnitte sagen dir, was du NICHT tun sollst. Dieser sagt, was du
TUN sollst, damit die Seite bumst. Wähle 1 Signature Moment + 2-3 Verstärker.
Alles hier ist mit Astro + Tailwind + CSS/wenig JS umsetzbar, performant, ohne
schwere Libraries. Alle respektieren prefers-reduced-motion.

### 0. Kit-Bewegung (Standard, immer da, keine eigenen Skripte)
Das BaseLayout bringt Einblenden und Zähler mit. Nur Attribute setzen:
```html
<h2 data-reveal>…</h2>                          <!-- von unten -->
<div data-reveal="links">…</div>                <!-- auch: rechts, zoom, blende -->
<div class="grid …"><article data-reveal>…</article><article data-reveal>…</article></div>
                                                <!-- Geschwister automatisch gestaffelt -->
<p><span data-counter>1.250</span>+ Geräte</p>  <!-- Zahl steht fertig im HTML -->
```
Das Kit animiert NUR, was beim Laden unterhalb des ersten Bildschirms liegt.
Hero, H1, Kennzahlen im ersten Bildschirm stehen sofort da (Alge), darunter
entsteht der Wow (Opitz). Keine eigenen IntersectionObserver-Reveals mehr
schreiben: qa-craft meldet Inhalte, die im ersten Bildschirm verzögert erscheinen.
Hover mit Charakter gehört dazu: Karten hover:-translate-y-1 + Schatten,
Buttons mit leichtem Lift. Dosierung: Überschriften und Kartengruppen, nicht
jeder Absatz.

Scroll-Effekte aus dem Kit (Motion, nur geladen, wenn die Seite sie nutzt,
GPU-beschleunigt, bei "Bewegung reduzieren" aus). Nur Attribute setzen:
```html
<img data-scroll="parallax" data-staerke="8" …>   <!-- Bild wandert langsamer als die Seite -->
<img data-scroll="zoom" …>                        <!-- zoomt beim Hereinscrollen von 1.12 auf 1 -->
<p data-scroll="woerter" class="text-4xl …">…</p> <!-- Satz hellt sich Wort für Wort auf (Spöri-Manifest) -->
<span data-scroll="fortschritt" class="block h-px bg-accent"></span>  <!-- Linie wächst mit; data-richtung="y" senkrecht -->
```
Höchstens ZWEI Scroll-Effekte pro Seite, jeder mit Begründung (siehe HERO).
Parallax-Bilder brauchen Reserve: Bild 120 % hoch in einem overflow-hidden-Rahmen.

### 1. Scroll-Driven Animations (natives CSS – der stärkste Hebel 2026)
Kein JS, kein IntersectionObserver, GPU-billig, läuft mit dem Scrollbalken:
```css
@supports (animation-timeline: view()) {
  .sd-reveal {
    animation: sd-in linear both;
    animation-timeline: view();
    animation-range: entry 5% cover 35%;
  }
  @keyframes sd-in {
    from { opacity: 0; transform: translateY(48px) scale(.96); }
    to   { opacity: 1; transform: none; }
  }
  /* Bild "zoomt raus" während man scrollt – wirkt teuer */
  .sd-zoom img { animation: sd-scale linear both; animation-timeline: view();
                 animation-range: cover; }
  @keyframes sd-scale { from { transform: scale(1.25); } to { transform: scale(1); } }
}
@media (prefers-reduced-motion: reduce) { .sd-reveal, .sd-zoom img { animation: none; } }
```
Fallback für ältere Browser: das @supports greift einfach nicht, Inhalt ist normal da.

### 2. Seitenübergänge (schon aktiv, reines CSS)
Das BaseLayout blendet Seitenwechsel bereits sanft über (@view-transition).
Für ein Element, das über Seiten "fliegt" (Bild der Leistungskarte wird zum
Hero der Detailseite), auf BEIDEN Seiten denselben eindeutigen Namen setzen:
```html
<img src={bild} style={`view-transition-name: leistung-${slug}`} />
```
KEIN Astro-ClientRouter: er bricht Menü, Sticky-Button und Reveal nach dem
ersten Seitenwechsel (qa-checks blockt ihn).

### 3. Zeilen-/Wort-Reveal bei Headlines
Erste Wahl: `data-scroll="woerter"` aus dem Kit (an den Scroll gekoppelt).
Die folgende zeitgesteuerte Variante nur, wenn es wirklich ein Einblenden sein soll.
NICHT für die H1 im Hero (Alge: erster Bildschirm steht sofort da):
```html
<h2 class="reveal-words">Wir bauen <span>Gärten</span> die bleiben</h2>
```
```javascript
document.querySelectorAll('.reveal-words').forEach(el => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.innerHTML = el.textContent.trim().split(' ')
    .map((w,i) => `<span style="--i:${i}">${w}</span>`).join(' ');
});
```
```css
.reveal-words span { display:inline-block; opacity:0; transform:translateY(.6em);
  animation: word-in .6s cubic-bezier(.2,.8,.2,1) forwards;
  animation-delay: calc(var(--i) * 70ms); }
@keyframes word-in { to { opacity:1; transform:none; } }
```

### 4. Sticky-Scroll-Storytelling (der klassische "teure" Moment)
Ein Element bleibt stehen, der Inhalt daneben wechselt beim Scrollen.
Ideal für: Leistungen, Ablauf, Gewässer, Produktvarianten.
```html
<section class="grid lg:grid-cols-2 gap-16">
  <div class="lg:sticky lg:top-24 h-fit"><!-- Bild/Karte/Grafik bleibt --></div>
  <div class="space-y-[60vh]"><!-- Schritte scrollen durch --></div>
</section>
```
Mit JS die aktive Stufe hervorheben (IntersectionObserver auf die Schritte).

### 5. Übergroße, angeschnittene Typografie
Headline größer als der Viewport erlaubt – bewusst am Rand abgeschnitten:
```css
.mega { font-size: clamp(3.5rem, 14vw, 12rem); line-height: .85;
        letter-spacing: -.04em; }
```
Wichtig: negatives letter-spacing. line-height unter 1 NUR bei einzeiligen
Riesenzeilen. Mehrzeilige Überschriften mindestens 1.15 (Spöri: g und f
überlappten bei 1.06, "darf nie passieren", qa-craft prüft). Zaghaft = 2.5rem Headline.

### 6. Clip-Path-Reveal für Bilder
Bild wird beim Scrollen "aufgedeckt" statt eingeblendet:
```css
.clip-reveal { clip-path: inset(0 0 100% 0); transition: clip-path 1.1s cubic-bezier(.7,0,.2,1); }
.clip-reveal.visible { clip-path: inset(0 0 0 0); }
```

### 7. Horizontale Scroll-Sektion
Eine Sektion scrollt seitwärts während die Seite vertikal scrollt. Für
Projekt-Galerien, Zeitleisten, Referenzen. Auf Mobile: normaler Touch-Scroll.
```javascript
const track = document.querySelector('.h-track');
const wrap = document.querySelector('.h-wrap'); // height: 300vh
addEventListener('scroll', () => {
  const r = wrap.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (wrap.offsetHeight - innerHeight)));
  track.style.transform = `translateX(${-p * (track.scrollWidth - innerWidth)}px)`;
});
```

### 8. Magnetische Buttons (Desktop-Detail, das hängen bleibt)
Der Button "zieht" den Cursor leicht an:
```javascript
if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.25}px, ${(e.clientY-r.top-r.height/2)*.35}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}
```

### 9. Grain-/Noise-Overlay (macht flache Farbflächen wertig)
```css
body::after { content:''; position:fixed; inset:0; pointer-events:none; z-index:1;
  opacity:.035; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
```
Entweder richtig (0.03-0.05 opacity) oder gar nicht – halbherzig sieht schmutzig aus.

### 10. Zahlen-Counter mit Format-Erhalt
`<span data-counter>1.250</span>` aus dem Kit (siehe 0.). Format, Suffix und
Tausenderpunkt bleiben exakt, bei offenem Cookie-Banner wartet der Zähler.
Wirkt nur mit echten Zahlen.

---

### DOSIERUNG – aber jetzt richtig herum gedacht
Die Zurückhaltungs-Regeln in dieser Datei (max. 2 Effekte, Hero-Komplexität
begrenzen etc.) gelten für RUHE-BRANCHEN: Therapie, Arzt, Pflege, Bestatter.
Sie sind KEINE allgemeine Obergrenze.

| Branche | Signature Moment | Verstärker |
|---|---|---|
| Therapie, Arzt, Pflege, Bestatter | 1 ruhiger (z.B. sanftes Scroll-Reveal) | 1-2, sehr dezent |
| Verein, Gastro, Einzelhandel, Handwerk | 1 kräftiger | 2-3 |
| Bau, Metall, Automotive, Sport | 1 lauter (Mega-Typo, Sticky-Story) | 3-4 |
| Kreativ, Agentur, Premium-Produkt | 1 spektakulärer | 4+, darf auffallen |

Im Zweifel: EIN Effekt richtig und mutig schlägt fünf zaghafte.
Ein Design, das niemandem wehtut, beeindruckt auch niemanden.

## ⬤ KOMPOSITIONS-KATALOG – das, was Design von Sektionen unterscheidet

⚠ WICHTIG ZUERST: Diese Techniken sind ein ANGEBOT für bewusste Gestaltung,
KEINE Checkliste. Sie blind einzubauen ("irgendwo eine negative Margin, irgendwo
ein 7/4-Raster") macht das Design SCHLECHTER, nicht besser – Text klebt am Rand,
Elemente überlappen sinnlos, Abstände brechen. Jede dieser Techniken braucht eine
gestalterische Begründung und muss danach visuell geprüft werden.
Wenn du nicht sehen kannst, ob es besser aussieht: LASS ES. Ein sauberer,
ruhiger Aufbau schlägt eine kaputte Komposition deutlich.

Der MUT-KATALOG oben regelt Bewegung. DIESER regelt Aufbau – und der ist wichtiger.
Eine Seite aus gestapelten Standard-Sektionen bleibt generisch, egal wie viele
Effekte darauf liegen. Mindestens 3 dieser Techniken pro Projekt einsetzen.

### ⛔ Das generische Skelett, das der Autopilot sonst baut
```
<section class="py-20"><div class="container">
  <h2 class="text-center">Überschrift</h2>
  <div class="grid md:grid-cols-3 gap-8"> 3 gleiche Cards </div>
</div></section>
```
Fünfmal untereinander. Das ist der Grund für "sieht aus wie ein Template".

### 1. ÜBERLAPPUNG über Sektionsgrenzen (stärkster Einzelhebel)
Ein Element ragt in die nächste Sektion hinein. Erzeugt sofort Tiefe und
den Eindruck, dass jemand komponiert hat statt gestapelt.
```html
<section class="relative pt-24 pb-40 bg-primary text-white">
  <div class="container">…Inhalt…</div>
</section>

<section class="relative z-10 -mt-28">
  <div class="container">
    <div class="bg-white rounded-3xl shadow-2xl p-8 lg:p-14">
      …ragt in die Sektion darüber hinein…
    </div>
  </div>
</section>
```
Varianten: Bild ragt heraus, Zahlen-Leiste sitzt auf der Kante, Karte überlappt Hero.

### 2. ASYMMETRISCHES RASTER (nie stumpf 50/50)
```html
<div class="grid lg:grid-cols-12 gap-8 items-start">
  <div class="lg:col-span-7">…Hauptinhalt…</div>
  <div class="lg:col-span-4 lg:col-start-9 lg:mt-24">…Nebeninhalt, versetzt…</div>
</div>
```
Das `lg:mt-24` ist entscheidend: der Versatz macht aus zwei Spalten eine Komposition.

### 3. AUS DEM CONTAINER AUSBRECHEN
Bild über die volle Fensterbreite, Text im Container darüber:
```html
<div class="relative">
  <img src={bild} class="relative left-1/2 -translate-x-1/2 w-screen h-[65vh] object-cover" />
  <div class="container relative -mt-24 lg:-mt-32">
    <div class="bg-background p-8 lg:p-14 max-w-2xl rounded-2xl shadow-xl">
      <h2>…</h2>
    </div>
  </div>
</div>
```

### 4. ÜBERSCHRIFTEN NICHT IMMER MITTIG
Zentrierte Überschrift bei JEDER Sektion ist das sicherste Zeichen für Template.
Regel: max. ein Drittel der Sektionen zentriert. Der Rest linksbündig, gern
mit Nebeninhalt rechts daneben (Beschreibung, Zahl, CTA).

### 5. EDITORIAL-DETAILS (kosten nichts, wirken teuer)
```html
<span class="font-mono text-xs tracking-widest text-accent">01 / 04</span>
<div class="h-px w-16 bg-current opacity-30"></div>
<!-- vertikales Label am Rand -->
<span class="absolute left-0 top-32 -rotate-90 origin-top-left
             text-[11px] tracking-[0.3em] uppercase opacity-50">Leistungen</span>
```
Nummerierte Abschnitte, dünne Linien, Mikro-Labels, Jahreszahlen am Rand.
Das sind die Details, die "gestaltet" von "zusammengeklickt" trennen.

### 6. GROSSE FARBFLÄCHEN statt weiß + Akzentbutton
Mindestens eine Sektion nimmt die Markenfarbe VOLLFLÄCHIG ein (nicht 10% Tint,
sondern satt, weiße Schrift darauf, großzügig Raum). Mut zur Fläche.
```html
<section class="bg-primary text-white py-28 lg:py-40">
```

### 7. BILD-TEXT-VERZAHNUNG statt Nebeneinander
Text liegt teilweise ÜBER dem Bild, nicht sauber daneben:
```html
<div class="relative">
  <img class="w-full h-[70vh] object-cover rounded-3xl" />
  <div class="absolute -bottom-10 left-6 lg:left-14 bg-background
              p-8 max-w-md rounded-2xl shadow-2xl">
    <h3>…</h3>
  </div>
</div>
```

### 8. UNGLEICHE KARTEN statt drei identische
```html
<div class="grid lg:grid-cols-3 gap-6">
  <div class="lg:row-span-2 lg:col-span-2">…große Hauptkarte…</div>
  <div>…klein…</div>
  <div>…klein…</div>
</div>
```
Hierarchie im Grid: eine Karte ist wichtiger als die anderen. Zeig das.

### 9. RHYTHMUS IM WEISSRAUM
Nicht jede Sektion py-20. Wechsel: eng (py-12) → weit (py-32) → eng.
Ungleiche Abstände erzeugen Takt. Gleiche Abstände erzeugen Monotonie.

### Selbstprüfung vor Phase 3
- Überlappt mindestens EIN Element eine Sektionsgrenze?
- Gibt es mindestens EIN asymmetrisches Raster?
- Bricht mindestens EIN Element aus dem Container aus?
- Sind weniger als die Hälfte der Überschriften zentriert?
- Gibt es mindestens eine vollflächige Farbsektion?
Wenn die Antwort 3× nein ist: Es ist eine Template-Seite, keine gestaltete.

### 10. ATMOSPHÄRISCHE HINTERGRUND-ELEMENTE (aus der Leitidee abgeleitet)

Große leere Farbflächen wirken billig. Eine dezente, thematische Textur macht
daraus eine gestaltete Fläche – ohne vom Inhalt abzulenken.

Pflicht: Das Muster muss aus der LEITIDEE/Branche kommen, nie beliebige Deko.
- Wasser/Natur (Verein, Gartenbau, Wellness): Höhenlinien, Wellenlinien, Blattadern
- Bau/Metall (Handwerk, Industrie): Blueprint-Raster, technische Schraffur, Nieten-Punkte
- Gastro/Bäckerei: Mehl-/Korn-Textur, feine Kreisformen, Besteck-Silhouetten
- Beratung/Kanzlei: feine Linienraster, Papierfaser, geometrische Ordnung

```html
<!-- Beispiel: Höhenlinien für ein Wasser-/Naturthema -->
<section class="relative bg-primary text-white py-28 overflow-hidden">
  <svg class="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
       aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 800 400">
    <g fill="none" stroke="currentColor" stroke-width="1">
      <path d="M0,120 Q200,80 400,120 T800,110" />
      <path d="M0,160 Q200,120 400,160 T800,150" />
      <path d="M0,200 Q200,160 400,200 T800,190" />
      <path d="M0,240 Q200,200 400,240 T800,230" />
    </g>
  </svg>
  <div class="container relative z-10">…Inhalt…</div>
</section>
```

Regeln:
- Opacity 0.04–0.10. Darüber wird es Deko, darunter unsichtbar.
- `aria-hidden="true"` und `pointer-events-none` – nie fokussierbar.
- Max. 2 solcher Flächen pro Seite, nie hinter Fließtext mit wenig Kontrast.
- Auf Mobile prüfen: keine zusätzliche Scroll-Breite (Overflow-Regeln gelten).
- Inline-SVG bevorzugen (keine zusätzliche Anfrage, färbt mit currentColor mit).

