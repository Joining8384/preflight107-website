import adsbRaw from './ads-b-explained-drone-pilots.md?raw';
import aviationHazardsRaw from './aviation-hazards-explained-drone-pilots.md?raw';
import faaEvidenceRaw from './faa-evidence-packet-drone-pilots.md?raw';
import faaInquiryRaw from './faa-inquiry-prepared-drone-pilot.md?raw';
import flightLogRaw from './how-to-log-drone-flights-part-107.md?raw';
import laancRaw from './what-is-laanc-drone-pilots.md?raw';
import metarRaw from './how-to-read-a-metar-drone-pilot.md?raw';
import missionBriefingRaw from './what-is-a-mission-briefing-drone-pilots.md?raw';
import sectionalRaw from './how-to-read-a-sectional-chart-drone-pilot.md?raw';
import tafRaw from './how-to-read-a-taf-drone-pilot.md?raw';
import verifiableCredentialsRaw from './verifiable-credentials-drone-pilots.md?raw';
import whiteLabelRaw from './white-label-client-mode-drone-pilots.md?raw';

export type PostCategory = 'Weather' | 'Airspace' | 'Compliance' | 'Equipment';

export const ALL_CATEGORIES: PostCategory[] = ['Weather', 'Airspace', 'Compliance', 'Equipment'];

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  category: PostCategory;
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

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Newest posts first — order here drives blog index display order
const rawPosts: Array<{ slug: string; raw: string; category: PostCategory }> = [
  { slug: 'faa-evidence-packet-drone-pilots',          raw: faaEvidenceRaw, category: 'Compliance' },
  { slug: 'white-label-client-mode-drone-pilots',      raw: whiteLabelRaw, category: 'Compliance' },
  { slug: 'verifiable-credentials-drone-pilots',       raw: verifiableCredentialsRaw, category: 'Compliance' },
  { slug: 'what-is-a-mission-briefing-drone-pilots',   raw: missionBriefingRaw, category: 'Compliance' },
  { slug: 'how-to-read-a-taf-drone-pilot',             raw: tafRaw,             category: 'Weather' },
  { slug: 'aviation-hazards-explained-drone-pilots',   raw: aviationHazardsRaw, category: 'Weather' },
  { slug: 'faa-inquiry-prepared-drone-pilot',          raw: faaInquiryRaw,      category: 'Compliance' },
  { slug: 'how-to-read-a-sectional-chart-drone-pilot', raw: sectionalRaw,       category: 'Airspace' },
  { slug: 'ads-b-explained-drone-pilots',              raw: adsbRaw,            category: 'Airspace' },
  { slug: 'how-to-log-drone-flights-part-107',         raw: flightLogRaw,       category: 'Compliance' },
  { slug: 'what-is-laanc-drone-pilots',                raw: laancRaw,           category: 'Airspace' },
  { slug: 'how-to-read-a-metar-drone-pilot',           raw: metarRaw,           category: 'Weather' },
];

export const posts: Post[] = rawPosts.map(({ slug, raw, category }) => {
  const { meta, content } = parseFrontmatter(raw);
  return {
    slug,
    title: meta['title'] ?? '',
    date: meta['date'] ?? '',
    excerpt: meta['excerpt'] ?? '',
    readTime: meta['readTime'] ?? '',
    category,
    content,
  };
});

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug);
}
