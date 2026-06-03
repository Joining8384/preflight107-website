#!/usr/bin/env node
// Generates per-city static HTML shells at public/flyable/<slug>/index.html so
// (a) deep links / direct hits to /flyable/<city> resolve on GitHub Pages, and
// (b) link-preview scrapers + search crawlers read city-specific title/OG/meta
// tags instead of the homepage's. Real browsers run the JS redirect at the
// bottom, bouncing into the SPA so FlyablePage mounts.
//
// Mirrors scripts/gen-blog-og-shells.mjs. Reads the city list from
// src/cityData.json so new cities are picked up automatically.
//
// Run via:  npm run prebuild  (auto-invoked by `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname  = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const dataFile   = path.join(projectDir, 'src', 'cityData.json');
const publicDir  = path.join(projectDir, 'public');
const outRoot    = path.join(publicDir, 'flyable');
const siteOrigin = 'https://preflight107.com';
// Custom "Can I Fly a Drone Today?" share card (generated from
// public/og-flyable.html via `node scripts/gen-og-image.mjs og-flyable.html og-flyable.png`).
const defaultOgImage = `${siteOrigin}/og-flyable.png`;

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function buildShellHtml(c) {
  const title = `Can I Fly a Drone in ${c.city}, ${c.state}?`;
  const fullTitle = `${title} — Live Conditions | PreFlight 107`;
  const canonical = `${siteOrigin}/flyable/${c.slug}`;
  const desc = `Can you fly a drone in ${c.city}, ${c.state} right now? Live wind, gusts, and precipitation plus the ${c.airspaceClass} airspace around ${c.facility} you need to clear first. Check LAANC + TFRs free with PreFlight 107.`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PreFlight 107" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:image" content="${defaultOgImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${defaultOgImage}" />

    <script>
      // Same SPA-redirect pattern as the blog shells / 404.html.
      (function () {
        var l = window.location;
        l.replace(
          l.protocol + '//' + l.host + '/?p=' +
          encodeURIComponent(l.pathname + l.search + l.hash)
        );
      })();
    </script>
    <noscript>
      <meta http-equiv="refresh" content="0; url=${escapeHtml(canonical)}" />
    </noscript>
  </head>
  <body>
    <main style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:48px auto;padding:0 16px;color:#222;">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(desc)}</p>
      <p><a href="${escapeHtml(canonical)}">See live conditions →</a></p>
    </main>
  </body>
</html>
`;
}

// Index shell so sharing the bare /flyable URL produces its own preview card
// (instead of falling back to a generic/blank preview).
function buildIndexShellHtml() {
  const title = 'Can I Fly a Drone Today? Live Conditions by City';
  const fullTitle = `${title} — PreFlight 107`;
  const canonical = `${siteOrigin}/flyable`;
  const desc = 'Check live drone-flying conditions for your city — current wind, gusts, and the airspace you need to clear before you fly. Free, no download. Powered by PreFlight 107.';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PreFlight 107" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:image" content="${defaultOgImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${defaultOgImage}" />

    <script>
      (function () {
        var l = window.location;
        l.replace(l.protocol + '//' + l.host + '/?p=' + encodeURIComponent(l.pathname + l.search + l.hash));
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=${escapeHtml(canonical)}" /></noscript>
  </head>
  <body>
    <main style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:48px auto;padding:0 16px;color:#222;">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(desc)}</p>
      <p><a href="${escapeHtml(canonical)}">Check your city →</a></p>
    </main>
  </body>
</html>
`;
}

function main() {
  if (!fs.existsSync(dataFile)) {
    console.warn(`[gen-flyable-shells] cityData.json not found at ${dataFile} — skipping`);
    return;
  }
  const cities = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  fs.mkdirSync(outRoot, { recursive: true });

  // Index page shell (public/flyable/index.html)
  fs.writeFileSync(path.join(outRoot, 'index.html'), buildIndexShellHtml(), 'utf8');

  let written = 0;
  for (const c of cities) {
    if (!c.slug || !c.city) continue;
    const outDir = path.join(outRoot, c.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildShellHtml(c), 'utf8');
    written++;
  }
  console.log(`[gen-flyable-shells] wrote 1 index + ${written} city shells under public/flyable/`);
}

main();
