#!/usr/bin/env node
// Renders public/og-preview.html to public/og-image.png using headless
// Chromium via Playwright. Run when you update og-preview.html so the
// social-media link preview image stays in sync.
//
// Usage:  npm run gen-og
//
// Output: public/og-image.png (1200x630 @ 2x = 2400x1260 retina-sharp).
// The PNG is committed to git so GitHub Actions doesn't need Playwright.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname  = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const htmlFile   = path.join(projectDir, 'public', 'og-preview.html');
const outFile    = path.join(projectDir, 'public', 'og-image.png');

if (!fs.existsSync(htmlFile)) {
  console.error(`[gen-og-image] Source not found: ${htmlFile}`);
  process.exit(1);
}

const WIDTH  = 1200;
const HEIGHT = 630;
const SCALE  = 2; // Retina

(async () => {
  console.log('[gen-og-image] Launching headless Chromium…');
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: SCALE,
    });
    const page = await ctx.newPage();

    // Load the local HTML file. file:// URLs work fine for static markup.
    const fileUrl = url.pathToFileURL(htmlFile).href;
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Wait one frame so any CSS animations/fonts settle before the snapshot.
    await page.waitForTimeout(150);

    console.log(`[gen-og-image] Rendering ${WIDTH}×${HEIGHT} @ ${SCALE}x → ${outFile}`);
    await page.screenshot({
      path: outFile,
      type: 'png',
      omitBackground: false,
      // The viewport is exactly WIDTH×HEIGHT and deviceScaleFactor doubles
      // it. Default screenshot captures the viewport which is what we want.
    });

    const stat = fs.statSync(outFile);
    console.log(`[gen-og-image] ✓ Wrote ${(stat.size / 1024).toFixed(1)} KB`);
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error('[gen-og-image] Render failed:', err);
  process.exit(1);
});
