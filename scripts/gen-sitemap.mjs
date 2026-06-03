#!/usr/bin/env node
// Generates public/sitemap.xml listing every public, indexable URL on
// preflight107.com — the homepage, marketing pages, and one entry per blog
// post (read dynamically from src/posts/*.md so new posts are picked up
// automatically). robots.txt already points Google at /sitemap.xml, so this
// closes the loop: without this file that reference 404s and Google has no
// authoritative list of our URLs to crawl.
//
// Authenticated/app routes (/dashboard, /app/*, /login, /signup,
// /delete-account) are intentionally EXCLUDED — they're gated and have no
// SEO value.
//
// Run via:  npm run prebuild  (auto-invoked by `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname  = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const postsDir   = path.join(projectDir, 'src', 'posts');
const cityFile   = path.join(projectDir, 'src', 'cityData.json');
const publicDir  = path.join(projectDir, 'public');
const siteOrigin = 'https://preflight107.com';

const buildDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Static public pages. priority/changefreq are advisory hints to crawlers.
const staticRoutes = [
  { loc: '/',        priority: '1.0', changefreq: 'weekly'  },
  { loc: '/blog',    priority: '0.9', changefreq: 'weekly'  },
  { loc: '/compare', priority: '0.8', changefreq: 'monthly' },
  { loc: '/flyable', priority: '0.8', changefreq: 'weekly'  },
  { loc: '/verify',  priority: '0.6', changefreq: 'monthly' },
  { loc: '/support', priority: '0.4', changefreq: 'monthly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms',   priority: '0.3', changefreq: 'yearly'  },
];

// ── Pull blog post slugs + dates from the markdown frontmatter ──────────────
function readPostDate(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return buildDate;
  const dateLine = m[1].split('\n').find((l) => l.trim().startsWith('date:'));
  if (!dateLine) return buildDate;
  return dateLine.slice(dateLine.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '') || buildDate;
}

function getPosts() {
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(postsDir, f), 'utf8');
      return { slug, lastmod: readPostDate(raw) };
    })
    // newest first (cosmetic; crawlers don't care about order)
    .sort((a, b) => (a.lastmod < b.lastmod ? 1 : -1));
}

function urlEntry({ loc, lastmod, priority, changefreq }) {
  return [
    '  <url>',
    `    <loc>${siteOrigin}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

function getCities() {
  if (!fs.existsSync(cityFile)) return [];
  try { return JSON.parse(fs.readFileSync(cityFile, 'utf8')); } catch { return []; }
}

function main() {
  const posts = getPosts();
  const cities = getCities();

  const entries = [
    ...staticRoutes.map((r) => urlEntry({ ...r, lastmod: buildDate })),
    ...posts.map((p) => urlEntry({
      loc: `/blog/${p.slug}`,
      lastmod: p.lastmod,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...cities.map((c) => urlEntry({
      loc: `/flyable/${c.slug}`,
      lastmod: buildDate,
      changefreq: 'weekly',
      priority: '0.7',
    })),
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') + '\n' +
    '</urlset>\n';

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`[gen-sitemap] wrote sitemap.xml — ${staticRoutes.length} static + ${posts.length} blog + ${cities.length} flyable = ${staticRoutes.length + posts.length + cities.length} URLs`);
}

main();
