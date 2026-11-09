// NIKO ENDRES – BILD-FORMATE v1 (Spöri: Lighthouse 98–100 durch AVIF/WebP in zwei Größen)
// Erzeugt für jedes Foto in public/images moderne Formate in 800 px und voller Breite (max. 1600 px):
//   hero.jpg  ->  hero.avif, hero.webp, hero-800.avif, hero-800.webp
// PageHero und das LCP-Vorladen im BaseLayout nutzen diese Varianten AUTOMATISCH, sobald sie da sind
// (Handy lädt das kleine AVIF statt der großen Datei). Eigene <picture> können sie genauso nutzen.
// Ausgelassen: Logos, Favicons, og-image (WhatsApp braucht JPG), Bilder unter 400 px Breite.
// Unveränderte Bilder werden übersprungen (schnell bei jedem Lauf).
// Aufruf: node bild-formate.js          (npm run bilder)
//         node bild-formate.js --neu    alles neu erzeugen
import sharp from 'sharp';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const ORDNER = join('public', 'images');
const neu = process.argv.includes('--neu');
if (!existsSync(ORDNER)) { console.log('  bild-formate: public/images fehlt'); process.exit(0); }

const AUSNAHME = /^(og-image|logo|favicon|apple-touch|icon-|android-chrome|mstile|_SIEGEL)/i;
const lauf = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? lauf(p) : [p]; });
const quellen = lauf(ORDNER).filter((f) => /\.(jpe?g|png)$/i.test(f) && !AUSNAHME.test(basename(f)) && !/-800\.(jpe?g|png)$/i.test(f));

let erzeugt = 0, uebersprungen = 0, gespart = 0;
for (const q of quellen) {
  try {
    const m = await sharp(q).metadata();
    const w = m.width || 0;
    if (w < 400) continue;
    const basis = q.slice(0, -extname(q).length);
    const ziele = [{ b: Math.min(w, 1600), suffix: '' }];
    if (w > 900) ziele.push({ b: 800, suffix: '-800' });
    const qZeit = statSync(q).mtimeMs;
    for (const { b, suffix } of ziele) {
      for (const ext of ['avif', 'webp']) {
        const ziel = `${basis}${suffix}.${ext}`;
        if (!neu && existsSync(ziel) && statSync(ziel).mtimeMs >= qZeit) { uebersprungen++; continue; }
        const s = sharp(q).rotate().resize({ width: b, withoutEnlargement: true });
        const info = ext === 'avif'
          ? await s.avif({ quality: 52, effort: 5, chromaSubsampling: '4:2:0' }).toFile(ziel)
          : await s.webp({ quality: 78, effort: 5 }).toFile(ziel);
        erzeugt++;
        if (!suffix) gespart += Math.max(0, statSync(q).size - info.size);
      }
    }
  } catch (e) { console.log(`  ⚠ ${q}: ${e.message}`); }
}
console.log(`  bild-formate: ${quellen.length} Fotos · ${erzeugt} Varianten erzeugt, ${uebersprungen} aktuell` + (gespart ? ` · ${Math.round(gespart / 1024)} KB kleiner als die Originale` : ''));
