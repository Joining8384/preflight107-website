// Help / Guides content — how-to guides for using PreFlight 107.
// Same markdown + frontmatter pipeline as the blog (src/posts), but this is
// USER DOCUMENTATION (existing users), kept separate from the SEO blog.

import gettingStartedRaw from './getting-started.md?raw';
import flyNowScoreRaw from './understanding-fly-now-score.md?raw';
import missionBriefingRaw from './create-mission-briefing-client-bundle.md?raw';
import recurringRaw from './recurring-briefings.md?raw';
import liveObserverRaw from './live-observer-link.md?raw';
import accountRaw from './subscription-and-account.md?raw';

import type { Lang } from '../lang';

export type GuideSection = 'Getting Started' | 'Using the App' | 'Account & Billing';

export const GUIDE_SECTIONS: GuideSection[] = ['Getting Started', 'Using the App', 'Account & Billing'];

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  section: GuideSection;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    meta[key] = value;
  }
  return { meta, content: match[2] };
}

// Display order within the index.
const rawGuides: Array<{ slug: string; raw: string; section: GuideSection }> = [
  { slug: 'getting-started',                        raw: gettingStartedRaw,  section: 'Getting Started' },
  { slug: 'understanding-fly-now-score',            raw: flyNowScoreRaw,     section: 'Using the App' },
  { slug: 'create-mission-briefing-client-bundle',  raw: missionBriefingRaw, section: 'Using the App' },
  { slug: 'recurring-briefings',                    raw: recurringRaw,       section: 'Using the App' },
  { slug: 'live-observer-link',                     raw: liveObserverRaw,    section: 'Using the App' },
  { slug: 'subscription-and-account',               raw: accountRaw,         section: 'Account & Billing' },
];

// Spanish translations live in ./es/<slug>.md (same slug), pulled in via glob.
const esRawModules = import.meta.glob('./es/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function buildGuide(slug: string, raw: string, section: GuideSection): Guide {
  const { meta, content } = parseFrontmatter(raw);
  return {
    slug,
    title: meta['title'] ?? '',
    excerpt: meta['excerpt'] ?? '',
    section,
    content,
  };
}

export const guides: Guide[] = rawGuides.map(({ slug, raw, section }) => buildGuide(slug, raw, section));

const guidesEs: Guide[] = rawGuides.map(({ slug, raw, section }) =>
  buildGuide(slug, esRawModules[`./es/${slug}.md`] ?? raw, section),
);

export function getGuides(lang: Lang = 'en'): Guide[] {
  return lang === 'es' ? guidesEs : guides;
}

export function getGuide(slug: string, lang: Lang = 'en'): Guide | undefined {
  return getGuides(lang).find(g => g.slug === slug) ?? guides.find(g => g.slug === slug);
}

// Lightweight full-text search over title + excerpt + content, per language.
export function searchGuides(query: string, lang: Lang = 'en'): Guide[] {
  const set = getGuides(lang);
  const q = query.trim().toLowerCase();
  if (!q) return set;
  return set.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.excerpt.toLowerCase().includes(q) ||
    g.content.toLowerCase().includes(q)
  );
}
