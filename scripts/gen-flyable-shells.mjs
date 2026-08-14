#!/usr/bin/env node
// Generates per-city static HTML shells so (a) deep links to /flyable/<city>
// resolve on GitHub Pages, and (b) scrapers + crawlers read city-specific
// OG/meta tags. Real browsers run the JS redirect into the SPA (FlyablePage).
//
//   English:  public/flyable/<slug>/index.html      → /flyable/<slug>
//   Spanish:  public/es/flyable/<slug>/index.html    → /es/flyable/<slug>
//
// Each shell carries hreflang alternates pairing the en/es versions.
// Reads the city list from src/cityData.json so new cities are auto-included.
//
// Run via:  npm run prebuild  (auto-invoked by `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname   = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir  = path.resolve(__dirname, '..');
const dataFile    = path.join(projectDir, 'src', 'cityData.json');
const publicDir   = path.join(projectDir, 'public');
const outRoot     = path.join(publicDir, 'flyable');
const esOutRoot   = path.join(publicDir, 'es', 'flyable');
const siteOrigin  = 'https://preflight107.com';
const defaultOgImage = `${siteOrigin}/og-flyable.png`;

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// hreflang alternates for a given relative path suffix (e.g. '' for index, or
// '/<slug>' for a city).
function altLinks(suffix) {
  const en = `${siteOrigin}/flyable${suffix}`;
  const es = `${siteOrigin}/es/flyable${suffix}`;
  return [
    `    <link rel="alternate" hreflang="en" href="${en}" />`,
    `    <link rel="alternate" hreflang="es" href="${es}" />`,
    `    <link rel="alternate" hreflang="x-default" href="${en}" />`,
  ].join('\n');
}

// Wrap the common shell markup. `lang` drives <html lang>, canonical, locale.
function shell({ lang, canonical, fullTitle, desc, title, cta, alts }) {
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${alts}

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PreFlight 107" />
    <meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />
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
      <p><a href="${escapeHtml(canonical)}">${escapeHtml(cta)}</a></p>
    </main>
  </body>
</html>
`;
}

function buildCityShell(c, lang) {
  if (lang === 'es') {
    const title = `¿Puedo volar un dron en ${c.city}, ${c.state}?`;
    return shell({
      lang: 'es',
      canonical: `${siteOrigin}/es/flyable/${c.slug}`,
      fullTitle: `${title} — Condiciones en vivo | PreFlight 107`,
      desc: `¿Puedes volar un dron en ${c.city}, ${c.state} ahora mismo? Viento, ráfagas y precipitación en vivo, además del espacio aéreo ${c.airspaceClass} alrededor de ${c.facility} que debes autorizar primero. Consulta LAANC + TFR gratis con PreFlight 107.`,
      title,
      cta: 'Ver condiciones en vivo →',
      alts: altLinks(`/${c.slug}`),
    });
  }
  const title = `Can I Fly a Drone in ${c.city}, ${c.state}?`;
  return shell({
    lang: 'en',
    canonical: `${siteOrigin}/flyable/${c.slug}`,
    fullTitle: `${title} — Live Conditions | PreFlight 107`,
    desc: `Can you fly a drone in ${c.city}, ${c.state} right now? Live wind, gusts, and precipitation plus the ${c.airspaceClass} airspace around ${c.facility} you need to clear first. Check LAANC + TFRs free with PreFlight 107.`,
    title,
    cta: 'See live conditions →',
    alts: altLinks(`/${c.slug}`),
  });
}

function buildIndexShell(lang) {
  if (lang === 'es') {
    const title = '¿Puedo volar un dron hoy? Condiciones en vivo por ciudad';
    return shell({
      lang: 'es',
      canonical: `${siteOrigin}/es/flyable`,
      fullTitle: `${title} — PreFlight 107`,
      desc: 'Consulta las condiciones de vuelo de drones en vivo para tu ciudad — viento y ráfagas actuales y el espacio aéreo que debes autorizar antes de volar. Gratis, sin descargas. Con tecnología de PreFlight 107.',
      title,
      cta: 'Consulta tu ciudad →',
      alts: altLinks(''),
    });
  }
  const title = 'Can I Fly a Drone Today? Live Conditions by City';
  return shell({
    lang: 'en',
    canonical: `${siteOrigin}/flyable`,
    fullTitle: `${title} — PreFlight 107`,
    desc: 'Check live drone-flying conditions for your city — current wind, gusts, and the airspace you need to clear before you fly. Free, no download. Powered by PreFlight 107.',
    title,
    cta: 'Check your city →',
    alts: altLinks(''),
  });
}

function main() {
  if (!fs.existsSync(dataFile)) {
    console.warn(`[gen-flyable-shells] cityData.json not found at ${dataFile} — skipping`);
    return;
  }
  const cities = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  fs.mkdirSync(outRoot, { recursive: true });
  fs.mkdirSync(esOutRoot, { recursive: true });

  // Index shells (en + es)
  fs.writeFileSync(path.join(outRoot, 'index.html'), buildIndexShell('en'), 'utf8');
  fs.writeFileSync(path.join(esOutRoot, 'index.html'), buildIndexShell('es'), 'utf8');

  let written = 0;
  for (const c of cities) {
    if (!c.slug || !c.city) continue;
    const enDir = path.join(outRoot, c.slug);
    const esDir = path.join(esOutRoot, c.slug);
    fs.mkdirSync(enDir, { recursive: true });
    fs.mkdirSync(esDir, { recursive: true });
    fs.writeFileSync(path.join(enDir, 'index.html'), buildCityShell(c, 'en'), 'utf8');
    fs.writeFileSync(path.join(esDir, 'index.html'), buildCityShell(c, 'es'), 'utf8');
    written++;
  }
  console.log(`[gen-flyable-shells] wrote 2 index + ${written * 2} city shells (en+es) under public/flyable + public/es/flyable`);
}

main();
