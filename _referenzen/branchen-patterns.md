# BRANCHEN- UND PROJEKT-PATTERNS (Referenz-Bibliothek)
# WIRD NICHT AUTOMATISCH GELESEN.
# Nur nachschlagen, wenn die Branche des aktuellen Projekts wirklich passt.
# Ein Muster aus einem Autohaus-Projekt gehört NICHT auf eine Vereinsseite.
# Falsch angewandte Fremdmuster sind eine Hauptursache für generisches Design.

## TECH-DESIGN-VOKABULAR (B2B Tech, SaaS, Consulting)

Tech-Unternehmen erwarten ein anderes Design-Vokabular als lokale Dienstleister.

### Erlaubt/erwartet bei Tech/SaaS/Consulting:
- Terminal-Windows (macOS-Style mit roten/gelben/grünen Dots)
- Typing-Animationen mit Cursor-Blink
- Monospace-Font für Code-Elemente (Commands, Badges)
- Dezente Glitch-Effekte auf Headlines (nur Hover)
- Particle Networks / Tech-Grids als Hintergrund
- Gradient-Text für Akzent-Wörter
- "LIVE"-Badges mit Puls-Animation

### NICHT verwenden bei:
Handwerk, Gastro, Arzt, lokale Dienstleister - dort warme Töne, Fotos, weniger Animation.

### In site-data.json unter design.dnaBegruendung explizit festhalten,
warum Tech-Elemente verwendet werden (oder bewusst nicht).

## CSS-3D-TECHNIKEN (ohne externe 3D-Assets umsetzbar)

Claude kann folgende 3D-Effekte selbst bauen – kein Blender, kein Spline nötig.
Diese Techniken erzeugen 80% des 3D-Gefühls durch CSS allein.

### Technik 1: Perspective-Tilt (Karten/Elemente leicht geneigt)
```css
.tilt-card {
  transform: perspective(800px) rotateX(-5deg) rotateY(3deg);
  transition: transform 0.3s ease;
}
.tilt-card:hover {
  transform: perspective(800px) rotateX(0deg) rotateY(0deg);
}
```

### Technik 2: Mehrschichtige Schatten (simulierte Tiefe)
```css
.depth-element {
  box-shadow:
    0 2px 4px rgba(0,0,0,0.08),
    0 8px 16px rgba(0,0,0,0.12),
    0 24px 48px rgba(0,0,0,0.16),
    0 48px 96px rgba(0,0,0,0.08);
}
```

### Technik 3: Diagonale Sektions-Schnitte (clip-path)
```css
.diagonal-section {
  clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%);
  /* oder schärfer: polygon(0 0, 100% 8%, 100% 100%, 0 92%) */
}
.diagonal-top {
  clip-path: polygon(0 8%, 100% 0, 100% 100%, 0 100%);
}
```

### Technik 4: Parallax-Scrolling (JS-basiert, leicht)
```javascript
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = el.dataset.parallax || 0.3;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
});
// Nutzung: <div data-parallax="0.2"> ... </div>
```

### Technik 5: Produkt-Motiv das aus dem Hero ragt
```html
<!-- Motiv ist nicht im Bild-Container – es überragt ihn -->
<div class="relative h-[80vh] bg-neutral-900">
  <!-- Hintergrund-Typo -->
  <span class="absolute inset-0 flex items-center justify-center
               text-[20vw] font-black text-white/5 select-none">
    MARKE
  </span>
  <!-- Produkt ragt über Hero hinaus -->
  <img src="/images/produkt-freigestellt.png"
       class="absolute bottom-[-10%] right-[5%] h-[110%] w-auto
              object-contain z-10 drop-shadow-2xl"
       alt="Produkt" />
  <!-- Text links -->
  <div class="absolute left-12 top-1/2 -translate-y-1/2 z-20">
    <h1 class="text-5xl font-black text-white">Headline</h1>
  </div>
</div>
```

Wichtig: Funktioniert NUR mit freigestellten Motiven (PNG mit Transparenz).
Bei normalen Fotos: anderen Archetyp wählen.

### Technik 6: Split-Color Hero
```html
<div class="relative h-screen flex">
  <!-- Linke Hälfte -->
  <div class="w-1/2 bg-[--color-primary]"></div>
  <!-- Rechte Hälfte -->
  <div class="w-1/2 bg-[--color-secondary]"></div>
  <!-- Inhalt liegt über beiden Hälften -->
  <div class="absolute inset-0 flex items-center justify-center">
    <img src="/images/motiv.png"
         class="h-[85%] w-auto object-contain z-10 drop-shadow-2xl" />
    <div class="absolute left-12 top-1/2 -translate-y-1/2">
      <h1 class="text-4xl font-black text-white">Headline</h1>
    </div>
  </div>
</div>
```

### Technik 7: Mono-Akzent Pattern
```html
<!-- Alles neutral, NUR die Markenfarbe als Akzent -->
<div class="bg-neutral-950 text-white">
  <!-- Übergroße Headline, monochrom -->
  <h1 class="text-[12vw] font-black text-white leading-none">
    FIRMEN<br>NAME
  </h1>
  <!-- Einziger Farbakzent: Linie oder kleines Element -->
  <div class="w-16 h-1 bg-[--color-accent] my-6"></div>
  <!-- Subline neutral -->
  <p class="text-neutral-400">Leistung. Qualität. Vertrauen.</p>
  <!-- CTA in Akzentfarbe -->
  <a class="inline-block bg-[--color-accent] text-black px-8 py-3 font-bold mt-8">
    Jetzt anfragen
  </a>
</div>
```

## PRODUKTDETAILS ALS SIDE-INFO (Peugeot/Lampz-Pattern)

Statt alle Features in die Headline zu packen: Spezifikationen als
dezente rechte oder untere Spalte mit Linien-Ankern.

Für lokale Dienstleister übersetzt:
- "15+ Jahre Erfahrung"
- "Festpreisgarantie"
- "24h Reaktionszeit"
- "Kostenlose Erstberatung"

```html
<!-- Spec-Liste rechts, mit Linie als Anker -->
<div class="absolute right-12 top-1/2 -translate-y-1/2 space-y-4">
  {specs.map(spec => (
    <div class="flex items-center gap-3 text-white/80">
      <div class="w-8 h-px bg-accent flex-shrink-0"></div>
      <span class="text-sm font-medium">{spec}</span>
    </div>
  ))}
</div>
```

Einsetzen wenn: der Hero-Archetyp Produktdetails zeigen soll ohne
den Fließtext zu überladen. Besonders gut bei Spotlight- und Split-Archetypen.

## HERO-KOMPLEXITÄT BEGRENZEN (aus TCM-Projekt – Ruhe-Branchen)

Für Branchen mit "Ruhe" als Kernwert (TCM, Yoga, Therapie, Wellness, Arzt):
- Max. 2 visuelle Effekte pro Hero (z.B. Gradient + dezente Linie)
- KEINE Animationen die vom Inhalt ablenken
- KEINE diagonalen Schnitte (zu dynamisch)
- Split-Layout: klare Trennung, kein Überlappen
"Mutig" bedeutet hier: große Typo, satte Farbe, gutes Foto – nicht Animation.

## PREMIUM-SCHATTEN: 4-SCHICHT-PATTERN (aus HMT-Projekt)

Einfache box-shadow wirkt flach. Für Cards und erhobene Elemente:
```css
.depth-shadow {
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.06),
              0 12px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.04);
}
.depth-shadow:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.10),
              0 24px 48px rgba(0,0,0,0.14), 0 48px 96px rgba(0,0,0,0.08);
}
```

## HERO-STATS: DIAGONALE ANBINDUNG (aus HMT-Projekt)

Stats-Bar unter dem Hero mit clip-path schräg anbinden statt gerader Kante.
Akzent-Linie durch verschachtelten clip-path (outer = Akzentfarbe, inner = weiß, 3px versetzt):
```css
.stats-bar { --slant: 34px; background: var(--color-accent);
  clip-path: polygon(0 var(--slant), 100% 0, 100% 100%, 0 100%); }
.stats-bar-inner { background: #fff;
  clip-path: polygon(0 calc(var(--slant) + 3px), 100% 3px, 100% 100%, 0 100%); }
@media (max-width: 640px) { .stats-bar { --slant: 18px; } }
```
NICHT bei Ruhe-Branchen einsetzen (siehe Hero-Komplexität).

## GASTRO/FOOD: HERO-PATTERNS (Referenz-Set 08-11)

Bei Gastronomie, Lebensmittel, Bio, Catering – diese Muster funktionieren:

### Teller von oben (Top-Down)
Hero-Motiv als freigestellter Teller in Draufsicht – appetitlicher als Seitenansicht.
Kombinierbar mit Split-Color oder organischer Form (Kreis/Bogen), wobei der
Teller die Formkante ÜBERSPANNT (ragt über Diagonale/Kreis hinaus – Tiefe).

### Verstreute Zutaten als Deko
Freigestellte Zutaten (Tomaten, Kräuter, Früchte) um das Hauptmotiv verteilt:
- 4-8 Elemente, unterschiedliche Größen, leicht rotiert
- Mit Float-Animation aus dem 3D-Motion-Layer (Baustein 2) = lebendige Tiefe
- Tiefenschärfe-Illusion: 1-2 Elemente mit blur-sm ganz vorne (groß),
  Hauptmotiv scharf – wirkt wie Kamera-Tiefenschärfe
- Auf Mobile: max 2-3 Elemente, Rest hidden sm:block

### Geister-Typo hinter dem Motiv
Firmenname/Keyword als riesige Outline- oder Tint-Typo hinter dem Teller
(vertikal oder horizontal, opacity 5-8%, select-none).

### Quelle: _design-referenzen/referenz-08 bis -11 anschauen.

## Pflege, Betreuung, Senioren (Schwabenpflege 2026-10)
- Wärme vor Technik: Menschenfotos in jeder Sektion, echte Ansprechpartner mit Namen und Foto,
  wenig Zahlen und Paragrafen, Häkchen statt Nummern und §-Zeichen, warme dunkle Töne (Anthrazit,
  Sand) statt kühlem Blau, eher kleiner Radius.
- Einstieg "Für wen?" (Angehörige, Betroffene, Kliniken) und eine Vertrauensleiste früh auf der Seite.
- Wortwahl: nichts, was nach Tod oder Abschied klingt ("bis zum Ende begleitet"), qa-copy weist darauf hin.
- Häufig: Pflegegrad-Rechner, Unterlagen zum Download, mehrere Büros (Schema mit allen Standorten).

