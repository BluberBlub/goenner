// NIKO ENDRES - IMAGE OPTIMIZER
// Komprimiert alle Bilder in /public/images/ vor Build
// Aufruf: node optimize-images.js

import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const IMAGES_DIR = './public/images';
const MAX_WIDTH = 1920;
const QUALITY = 82;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const files = walk(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
console.log(`\n🖼️  ${files.length} Bilder werden optimiert...\n`);

let savedTotal = 0;
for (const file of files) {
  try {
    const before = statSync(file).size;
    const ext = extname(file).toLowerCase();
    const tmpFile = file + '.tmp';

    const pipeline = sharp(file).resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === '.png') await pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toFile(tmpFile);
    else await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(tmpFile);

    const after = statSync(tmpFile).size;
    if (after < before) {
      const { renameSync } = await import('fs');
      renameSync(tmpFile, file);
      const saved = before - after;
      savedTotal += saved;
      console.log(`  ✅ ${file.split('/').pop()}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${(saved/1024).toFixed(0)}KB)`);
    } else {
      const { unlinkSync } = await import('fs');
      unlinkSync(tmpFile);
      console.log(`  ⏭  ${file.split('/').pop()}: bereits optimiert`);
    }
  } catch (e) {
    console.log(`  ⚠️  ${file}: ${e.message}`);
  }
}

console.log(`\n💾 Gesamt eingespart: ${(savedTotal/1024/1024).toFixed(2)} MB\n`);
