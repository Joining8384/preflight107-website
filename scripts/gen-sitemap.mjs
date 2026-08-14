#!/usr/bin/env node
// Generates public/sitemap.xml listing every public, indexable URL on
// preflight107.com — homepage, marketing pages, blog posts, guides, and
// per-city flyable pages — each paired with its Spanish /es/ twin via hreflang
// alternates so Google indexes the two languages as one localized set.
//
// Blog/guide slugs + city list are read dynamically so new content is picked
// up automatically. Authenticated/app routes (/dashboard, /app/*, /login,
// /signup, /delete-account) are intentionally EXCLUDED.
//
// Pages that are NOT translated (/verify, /privacy, /terms) are listed once in
// English with no alternates.
//
// Run via:  npm run prebuild  (auto-invoked by `npm run build`)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname  = path.dirname(url.fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const postsDir   = path.join(projectDir, 'src', 'posts');
const guidesDir  = path.join(projectDir, 'src', 'guides');
const cityFile   = path.join(projectDir, 'src', 'cityData.json');
const publicDir  = path.join(projectDir, 'public');
const siteOrigin = 'https://preflight107.com';

const buildDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Localized static pages (have a real /es/ counterpart).
const localizedStatic = [
  { loc: '/',        priority: '1.0', changefreq: 'weekly'  },
  { loc: '/blog',    priority: '0.9', changefreq: 'weekly'  },
  { loc: '/help',    priority: '0.7', changefreq: 'monthly' },
  { loc: '/compare', priority: '0.8', changefreq: 'monthly' },
  { loc: '/flyable', priority: '0.8', changefreq: 'weekly'  },
  { loc: '/support', priority: '0.4', changefreq: 'monthly' },
];

// English-only pages (no translation → no alternates).
const englishOnlyStatic = [
  { loc: '/verify',  priority: '0.6', changefreq: 'monthly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms',   priority: '0.3', changefreq: 'yearly'  },
];

function readPostDate(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return buildDate;
  const dateLine = m[1].split('\n').find((l) => l.trim().startsWith('date:'));
  if (!dateLine) return buildDate;
  return dateLine.slice(dateLine.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '') || buildDate;
}

// slug + lastmod + whether a Spanish translation exists (src/<dir>/es/<slug>.md)
function readContentDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const esDir = path.join(dir, 'es');
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      return {
        slug,
        lastmod: readPostDate(raw),
        hasEs: fs.existsSync(path.join(esDir, f)),
      };
    })
    .sort((a, b) => (a.lastmod < b.lastmod ? 1 : -1));
}

function getCities() {
  if (!fs.existsSync(cityFile)) return [];
  try { return JSON.parse(fs.readFileSync(cityFile, 'utf8')); } catch { return []; }
}

const esPath = (loc) => (loc === '/' ? '/es' : `/es${loc}`);

function alternates(loc) {
  const en = `${siteOrigin}${loc}`;
  const es = `${siteOrigin}${esPath(loc)}`;
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${en}" />`,
    `    <xhtml:link rel="alternate" hreflang="es" href="${es}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${en}" />`,
  ].join('\n');
}

function urlEntry({ loc, lastmod, priority, changefreq, alts }) {
  return [
    '  <url>',
    `    <loc>${siteOrigin}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    alts || '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

// Emit both the English URL and (if translated) its Spanish twin, each carrying
// the full alternate set. Untranslated pages get a single English entry.
function localizedEntries({ loc, lastmod, priority, changefreq, hasEs = true }) {
  if (!hasEs) return [urlEntry({ loc, lastmod, priority, changefreq })];
  const alts = alternates(loc);
  return [
    urlEntry({ loc, lastmod, priority, changefreq, alts }),
    urlEntry({ loc: esPath(loc), lastmod, priority, changefreq, alts }),
  ];
}

function main() {
  const posts  = readContentDir(postsDir);
  const guides = readContentDir(guidesDir);
  const cities = getCities();

  const entries = [
    ...localizedStatic.flatMap((r) => localizedEntries({ ...r, lastmod: buildDate })),
    ...englishOnlyStatic.map((r) => urlEntry({ ...r, lastmod: buildDate })),
    ...posts.flatMap((p) => localizedEntries({
      loc: `/blog/${p.slug}`, lastmod: p.lastmod, changefreq: 'monthly', priority: '0.7', hasEs: p.hasEs,
    })),
    ...guides.flatMap((g) => localizedEntries({
      loc: `/help/${g.slug}`, lastmod: buildDate, changefreq: 'monthly', priority: '0.5', hasEs: g.hasEs,
    })),
    ...cities.flatMap((c) => localizedEntries({
      loc: `/flyable/${c.slug}`, lastmod: buildDate, changefreq: 'weekly', priority: '0.7', hasEs: true,
    })),
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    entries.join('\n') + '\n' +
    '</urlset>\n';

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`[gen-sitemap] wrote sitemap.xml — ${entries.length} URLs (${localizedStatic.length} localized static ×2 + ${englishOnlyStatic.length} en-only + ${posts.length} posts + ${guides.length} guides + ${cities.length} cities, each localized pair)`);
}

main();
