# ARCHIVIERTE DESIGN-EXPERIMENTE
# Aus phase2-design.md entfernt (2026-07-27), da sie parallel zu den
# regulären Regeln liefen und widersprüchliche Anweisungen erzeugten.
# Bei Bedarf einzeln und bewusst zurückholen.

## DESIGN-EXPERIMENTE (Test – Rückkehr möglich)

Die folgenden drei Elemente werden testweise eingebaut und nach echten Projekten bewertet.

### EXPERIMENT 1: Floating Social-Proof Card im Hero

Statt eigener Testimonial-Sektion: kleine schwebende Karte direkt im Hero.
Wirkt beiläufig und authentisch, nicht werblich.

```html
<!-- Floating Card: position absolute, rechts unten im Hero -->
<div class="absolute bottom-8 right-8 bg-white rounded-2xl shadow-lg p-4 max-w-[200px] z-20">
  <div class="text-2xl font-bold text-gray-900">127+</div>
  <div class="text-sm text-gray-600 mb-2">zufriedene Kunden</div>
  <!-- Avatar-Reihe: echte Fotos oder Initialen-Kreise -->
  <div class="flex -space-x-2">
    <div class="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center">TM</div>
    <div class="w-7 h-7 rounded-full bg-secondary text-white text-xs flex items-center justify-center">KL</div>
    <div class="w-7 h-7 rounded-full bg-accent text-white text-xs flex items-center justify-center">SR</div>
  </div>
</div>
```

Regeln:
- Nur mit belegbaren Zahlen (echte Kundenzahl, nicht erfunden)
- Avatar-Reihe: Initialen echter Kunden ODER weglassen
- Auf Mobile: Card ausblenden (hidden sm:block) oder unten zentriert
- Nicht auf jeder Seite – nur im Hero der Startseite

### EXPERIMENT 2: Stats in Hero-Unterleiste eingebettet

Statt eigener Stats-Sektion: dunkle Unterleiste direkt am Hero-Boden.
Spart eine Scroll-Tiefe, Vertrauen ohne extra Abschnitt.

```html
<!-- Hero-Stats-Bar: direkt am unteren Rand des Hero -->
<div class="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm">
  <div class="max-w-6xl mx-auto px-6 py-4 grid grid-cols-3 gap-8">
    <div class="text-center">
      <div class="text-2xl font-bold text-white">15+</div>
      <div class="text-xs text-white/70">Jahre Erfahrung</div>
    </div>
    <div class="text-center border-x border-white/20">
      <div class="text-2xl font-bold text-white">200+</div>
      <div class="text-xs text-white/70">Projekte</div>
    </div>
    <div class="text-center">
      <div class="text-2xl font-bold text-white">98%</div>
      <div class="text-xs text-white/70">Weiterempfehlung</div>
    </div>
  </div>
</div>
```

Regeln:
- Max 3-4 Zahlen (nicht mehr)
- Nur belegbare Werte
- backdrop-blur-sm für modernen Glassmorphism-Look
- Hero-Bild braucht genug Höhe (min-h: 85vh statt 100vh damit Bar Platz hat)
- Auf Mobile: 2 Spalten statt 3, oder als eigene schmale Sektion darunter

### EXPERIMENT 3: Inline-Formular neben Über-Uns Text

Statt separater Kontaktseite: Anfrage-Formular direkt neben dem Firmentext.
Conversion direkt nach erstem Vertrauensaufbau, ohne weiteren Klick.

```html
<!-- Über-Uns Sektion: 2-spaltig, Text + Formular -->
<section class="py-16 sm:py-20 lg:py-24">
  <div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">

    <!-- Links: Firmentext -->
    <div>
      <p class="text-sm font-medium text-accent uppercase tracking-wider mb-3">Über uns</p>
      <h2 class="text-3xl font-bold mb-6">[Firmenname]. [Kernversprechen].</h2>
      <p class="text-gray-600 leading-relaxed mb-6">[Fließtext]</p>
      <!-- Bullet-Points USPs -->
      <ul class="space-y-2 mb-8">
        <li class="flex items-center gap-2"><span class="text-accent">✓</span> [USP 1]</li>
        <li class="flex items-center gap-2"><span class="text-accent">✓</span> [USP 2]</li>
      </ul>
      <!-- Optionale Unterschrift des Inhabers -->
      <p class="text-sm text-gray-500 italic">[Vorname Nachname], Inhaber</p>
    </div>

    <!-- Rechts: Schnell-Anfrage Formular -->
    <div class="bg-gray-50 rounded-2xl p-8">
      <h3 class="text-xl font-bold mb-6">Kostenlose Anfrage</h3>
      <!-- ContactForm Komponente hier einbinden -->
      <ContactForm client:visible compact={true} />
    </div>

  </div>
</section>
```

Regeln:
- Formular kompakter als auf Kontaktseite (name, email, nachricht, DSGVO – kein Phone wenn optional)
- "Kostenlose Anfrage" oder "Unverbindliche Anfrage" als Titel – nicht "Kontakt"
- Inhaber-Unterschrift (Bild oder Text) erhöht Persönlichkeit – nur mit echten Daten
- Kontaktseite trotzdem behalten (für direkte Links, SEO, Maps)

### Bewertung nach echten Projekten:
Nach 2-3 Projekten mit diesen Elementen: hat es die Conversion erhöht?
Hat es gut ausgesehen? Hat der Autopilot es zuverlässig gebaut?
Ergebnis in _lessons-learned.md dokumentieren und ggf. als permanente Regel übernehmen oder zurücknehmen.


## ═══ EXPERIMENT 3D-MOTION-LAYER (v2.1-TEST – rückbaubar) ═══
# Inspiriert von skyclinics.al (Soft-Premium + subtile Tiefe/Bewegung).
# ROLLBACK: Diesen kompletten Block löschen – sonst wurde nichts geändert.
# Dosierung: MODERAT. Ziel ist "lebendig & wertig", nicht "Effekt-Show".
# Bei Ruhe-Branchen (Arzt, Therapie): max. Baustein 1+2. Lighthouse-Gates gelten weiter.

### Baustein 1: Scroll-Tilt-Reveals (Kern-Element, vanilla JS)
Bilder/Cards kommen mit leichter 3D-Neigung herein und richten sich auf:
```css
.tilt-reveal { opacity: 0; transform: perspective(900px) rotateX(8deg) translateY(32px);
  transition: opacity .7s ease, transform .9s cubic-bezier(.22,1,.36,1); will-change: transform; }
.tilt-reveal.visible { opacity: 1; transform: perspective(900px) rotateX(0) translateY(0); }
```
```javascript
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.tilt-reveal').forEach(el => io.observe(el));
```
Einsatz: Section-Bilder, Feature-Cards, Floating-Cards. NICHT auf Fließtext.

### Baustein 2: Schwebende Deko-Objekte (CSS-only)
2-3 weiche Elemente (Kreis-Tint, Blur-Orb in Markenfarbe, kleines Icon-Objekt)
die langsam schweben – erzeugt Tiefe ohne Assets:
```css
@keyframes floaty { 0%,100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-16px) rotate(2deg); } }
.float-slow { animation: floaty 7s ease-in-out infinite; }
.float-slower { animation: floaty 11s ease-in-out infinite reverse; }
@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .float-slow, .float-slower { animation: none; } }
```
Max. 3 pro Seite. Auf Mobile aus (bestehende Overflow-Regeln gelten).

### Baustein 3: Maus-Parallax im Hero (Desktop only, geLERPt)
Hero-Motiv + Deko reagieren minimal auf die Maus (Tiefenillusion):
```javascript
if (matchMedia('(pointer:fine)').matches) {
  const els = document.querySelectorAll('[data-depth]');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
  (function loop(){ cx += (tx-cx)*.06; cy += (ty-cy)*.06;
    els.forEach(el => { const d = +el.dataset.depth || 10;
      el.style.transform = `translate(${cx*d}px, ${cy*d}px)`; });
    requestAnimationFrame(loop); })();
}
```
Nutzung: `data-depth="8"` (Motiv), `data-depth="20"` (Deko dahinter). Max. 4 Elemente.

### Baustein 4: Smooth-Scroll via Lenis (optional, +8KB)
Das "butterweiche" Award-Gefühl. Nur wenn Lighthouse-Budget es hergibt:
```bash
npm install lenis
```
```javascript
import Lenis from 'lenis';
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); } requestAnimationFrame(raf);
```
Respektiert prefers-reduced-motion: dann NICHT initialisieren.

### Baustein 5: Marquee-Band (Akzent, sparsam)
Ein laufendes Text-Band als Deko-Trenner (Leistungen oder Claim, taxer-Style):
```html
<div class="overflow-hidden py-4 bg-[--color-primary] -rotate-1">
  <div class="flex gap-8 whitespace-nowrap animate-marquee text-white/90 font-medium">
    <!-- Inhalt 2x rendern für nahtlose Schleife -->
  </div>
</div>
```
```css
@keyframes marquee { to { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 28s linear infinite; }
```
Max. 1x pro Seite. Leichte Rotation (-1deg) gibt Charakter. Mobile: langsamer (40s).

### Dosierungs-Matrix
| Branche | Bausteine |
|---|---|
| Ruhe (Arzt, Therapie, Pflege) | 1 + 2 (dezent) |
| Handwerk, Gastro, Einzelhandel | 1 + 2 + 5 |
| Premium-Dienstleister, Kosmetik | 1 + 2 + 3 |
| Tech, Kreativ, Automotive | 1 + 2 + 3 + 4 (+5) |

### Bewertung nach 2 Projekten
In _lessons-learned.md: Lighthouse-Impact? Wirkt es wertig oder verspielt?
Nacharbeit nötig? → dann Block behalten, anpassen oder löschen (Rollback = Block raus).
## ═══ ENDE EXPERIMENT 3D-MOTION-LAYER ═══
