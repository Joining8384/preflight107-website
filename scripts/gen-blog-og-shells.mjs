#!/usr/bin/env node
// Generates per-post static HTML shells at public/blog/<slug>/index.html so
// link-preview scrapers (iMessage, Slack, X, Facebook, LinkedIn, Discord,
// WhatsApp) see per-post OG meta tags instead of the homepage tags.
//
// Why this exists: PreFlight 107's website is a Vite SPA. Scrapers don't run
// JavaScript, so a link to /blog/<slug> would normally render the homepage's
// OG tags. By writing static shells at the exact slug paths, GitHub Pages
// serves them verbatim to scrapers while a tiny JS redirect at the bottom
// bounces real browsers into the SPA so the actual BlogPost component mounts.
//
// Same pattern as public/verify/index.html and public/pilot/index.html, just
// generated dynamically from the posts/ markdown files so we don't have to
// hand-write one per post.
//
// Run via:  npm run prebuild  (auto-invoked by `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname  = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const postsDir   = path.join(projectDir, 'src', 'posts');
const publicDir  = path.join(projectDir, 'public');
const blogOutDir = path.join(publicDir, 'blog');
const siteOrigin = 'https://preflight107.com';
const defaultOgImage = `${siteOrigin}/og-image.png`;

// ── HTML-escape values that go into attributes / text content ───────────────
function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&',  '&amp;')
    .replaceAll('<',  '&lt;')
    .replaceAll('>',  '&gt;')
    .replaceAll('"',  '&quot;')
    .replaceAll("'",  '&#39;');
}

// ── Minimal YAML frontmatter parser — same shape as src/posts/index.ts ──────
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

// ── Build one shell ──────────────────────────────────────────────────────────
function buildShellHtml({ slug, title, excerpt, readTime, date }) {
  const fullTitle = `${title} — PreFlight 107`;
  const canonical = `${siteOrigin}/blog/${slug}`;
  const desc      = excerpt || `Read this post on PreFlight 107 — drone pilot operations and Part 107 compliance.`;

  return `<!doctype html>
<html lang="en">
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

    <!--
      Static per-post shim — generated at build time by
      scripts/gen-blog-og-shells.mjs from src/posts/${slug}.md
      GitHub Pages serves this verbatim to link-preview scrapers
      (iMessage / Slack / X / Facebook / LinkedIn / Discord / WhatsApp)
      so they read the post-specific OG tags below instead of the
      homepage tags. Real browsers run the JS redirect at the bottom,
      which bounces them into the SPA so BlogPost mounts.
    -->

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="PreFlight 107" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:image" content="${defaultOgImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    ${date     ? `<meta property="article:published_time" content="${escapeHtml(date)}" />` : ''}
    ${readTime ? `<meta name="twitter:label1" content="Reading time" />\n    <meta name="twitter:data1" content="${escapeHtml(readTime)}" />` : ''}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${defaultOgImage}" />

    <script>
      // Same SPA-redirect pattern as 404.html and public/verify/index.html.
      // Encode the current path into the query string, redirect to root,
      // which then restores the real URL via history.replaceState before
      // the SPA mounts. Scrapers don't run this — they just read the meta
      // tags above and move on.
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
    <!-- Visible fallback if JS is off and the noscript redirect doesn't fire -->
    <main style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:48px auto;padding:0 16px;color:#222;">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(desc)}</p>
      <p><a href="${escapeHtml(canonical)}">Continue to the post →</a></p>
    </main>
  </body>
</html>
`;
}

// ── Main ────────────────────────────────────────────────────────────────────
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

  let written = 0;
  for (const file of posts) {
    const slug = file.replace(/\.md$/, '');
    const raw  = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { meta } = parseFrontmatter(raw);

    if (!meta.title) {
      console.warn(`[gen-blog-og-shells] ${file} missing title in frontmatter — skipping`);
      continue;
    }

    const html = buildShellHtml({
      slug,
      title:    meta.title,
      excerpt:  meta.excerpt,
      readTime: meta.readTime,
      date:     meta.date,
    });

    const outDir  = path.join(blogOutDir, slug);
    const outFile = path.join(outDir, 'index.html');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');
    written++;
  }

  console.log(`[gen-blog-og-shells] wrote ${written} post shells under public/blog/`);
}

main();
