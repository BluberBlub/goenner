// @LOCKED v2 â€“ Astro-Grundkonfiguration. Wird bei der Projektanlage befuellt.
// NICHT neu schreiben: Tailwind und Sitemap muessen eingebunden bleiben,
// sonst wird kein CSS erzeugt und die Sitemap fehlt.
// site: steuert Canonical-URLs, OG-Tags und die Sitemap -> beim Go-Live auf
// die Kundendomain aendern (siehe GO-LIVE-CHECKLISTE in phase2-technik.md).
// v2: CSS direkt ins HTML (inlineStylesheets) -> kein blockierender CSS-Request,
// wichtigster Einzelschritt zu PageSpeed 100 (Alge-Learning).
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://goenner.niko-endres.de',
  output: 'static',
  integrations: [tailwind(), sitemap(), react()],
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
});
