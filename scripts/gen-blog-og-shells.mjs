#!/usr/bin/env node
// Generates per-post static HTML shells so link-preview scrapers (iMessage,
// Slack, X, Facebook, LinkedIn, Discord, WhatsApp) and search crawlers read
// per-post OG/meta tags instead of the homepage tags. Real browsers run the JS
// redirect at the bottom, bouncing into the SPA so BlogPost mounts.
//
//   English:  public/blog/<slug>/index.html          → /blog/<slug>
//   Spanish:  public/es/blog/<slug>/index.html        → /es/blog/<slug>  (if a
//             translation exists at src/posts/es/<slug>.md)
//
// Each shell also carries hreflang alternates so Google pairs the en/es
// versions instead of treating them as duplicate content.
//
// Run via:  npm run prebuild  (auto-invoked by `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname   = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir  = path.resolve(__dirname, '..');
const postsDir    = path.join(projectDir, 'src', 'posts');
const esPostsDir  = path.join(postsDir, 'es');
const publicDir   = path.join(projectDir, 'public');
const blogOutDir  = path.join(publicDir, 'blog');
const esBlogOutDir = path.join(publicDir, 'es', 'blog');
const siteOrigin  = 'https://preflight107.com';
const defaultOgImage = `${siteOrigin}/og-image.png`;

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&',  '&amp;')
    .replaceAll('<',  '&lt;')
    .replaceAll('>',  '&gt;')
    .replaceAll('"',  '&quot;')
    .replaceAll("'",  '&#39;');
}

// Minimal YAML frontmatter parser — same shape as src/posts/index.ts
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, content: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    meta[key] = val;
  }
  return { meta, content: m[2] };
}

// hreflang alternates (only emitted when a Spanish translation exists).
function altLinks(slug, hasEs) {
  if (!hasEs) return '';
  const en = `${siteOrigin}/blog/${slug}`;
  const es = `${siteOrigin}/es/blog/${slug}`;
  return [
    `    <link rel="alternate" hreflang="en" href="${en}" />`,
    `    <link rel="alternate" hreflang="es" href="${es}" />`,
    `    <link rel="alternate" hreflang="x-default" href="${en}" />`,
  ].join('\n');
}

// Per-language UI strings for the shell chrome + fallback copy.
const STR = {
  en: {
    htmlLang: 'en',
    fallbackDesc: 'Read this post on PreFlight 107 — drone pilot operations and Part 107 compliance.',
    cont: 'Continue to the post →',
    readingTime: 'Reading time',
  },
  es: {
    htmlLang: 'es',
    fallbackDesc: 'Lee esta publicación en PreFlight 107 — operaciones de pilotos de drones y cumplimiento de la Part 107.',
    cont: 'Continuar a la publicación →',
    readingTime: 'Tiempo de lectura',
  },
};

function buildShellHtml({ slug, title, excerpt, readTime, date, lang, hasEs }) {
  const s = STR[lang];
  const fullTitle = `${title} — PreFlight 107`;
  const canonical = lang === 'es'
    ? `${siteOrigin}/es/blog/${slug}`
    : `${siteOrigin}/blog/${slug}`;
  const desc = excerpt || s.fallbackDesc;
  const alts = altLinks(slug, hasEs);

  return `<!doctype html>
<html lang="${s.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta name="robots" content="noai, noimageai" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${alts ? alts + '\n' : ''}
    <!--
      Static per-post shim generated at build time by
      scripts/gen-blog-og-shells.mjs. GitHub Pages serves this verbatim to
      link-preview scrapers so they read the post-specific OG tags below.
      Real browsers run the JS redirect at the bottom into the SPA.
    -->

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="PreFlight 107" />
    <meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:image" content="${defaultOgImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    ${date     ? `<meta property="article:published_time" content="${escapeHtml(date)}" />` : ''}
    ${readTime ? `<meta name="twitter:label1" content="${s.readingTime}" />\n    <meta name="twitter:data1" content="${escapeHtml(readTime)}" />` : ''}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${defaultOgImage}" />

    <script>
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
      <p><a href="${escapeHtml(canonical)}">${s.cont}</a></p>
    </main>
  </body>
</html>
`;
}

function main() {
  if (!fs.existsSync(postsDir)) {
    console.warn(`[gen-blog-og-shells] posts dir not found at ${postsDir} — skipping`);
    return;
  }
  fs.mkdirSync(blogOutDir, { recursive: true });

  const posts = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
  if (posts.length === 0) {
    console.warn('[gen-blog-og-shells] no .md posts found — skipping');
    return;
  }

  let en = 0, es = 0;
  for (const file of posts) {
    const slug = file.replace(/\.md$/, '');
    const raw  = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { meta } = parseFrontmatter(raw);
    if (!meta.title) {
      console.warn(`[gen-blog-og-shells] ${file} missing title — skipping`);
      continue;
    }

    const esFile = path.join(esPostsDir, file);
    const hasEs = fs.existsSync(esFile);

    // English shell
    const enHtml = buildShellHtml({ slug, title: meta.title, excerpt: meta.excerpt, readTime: meta.readTime, date: meta.date, lang: 'en', hasEs });
    const enDir = path.join(blogOutDir, slug);
    fs.mkdirSync(enDir, { recursive: true });
    fs.writeFileSync(path.join(enDir, 'index.html'), enHtml, 'utf8');
    en++;

    // Spanish shell (only when a translation exists)
    if (hasEs) {
      const esMeta = parseFrontmatter(fs.readFileSync(esFile, 'utf8')).meta;
      const esHtml = buildShellHtml({ slug, title: esMeta.title || meta.title, excerpt: esMeta.excerpt, readTime: esMeta.readTime, date: meta.date, lang: 'es', hasEs: true });
      const esDir = path.join(esBlogOutDir, slug);
      fs.mkdirSync(esDir, { recursive: true });
      fs.writeFileSync(path.join(esDir, 'index.html'), esHtml, 'utf8');
      es++;
    }
  }

  console.log(`[gen-blog-og-shells] wrote ${en} EN + ${es} ES post shells (public/blog, public/es/blog)`);
}

main();
