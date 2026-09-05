import adsbRaw from './ads-b-explained-drone-pilots.md?raw';
import faaDeadlinesRaw from './faa-deadlines-drone-pilots.md?raw';
import goNoGoRaw from './drone-go-no-go-decision.md?raw';
import densityAltitudeRaw from './density-altitude-drone-performance.md?raw';
import airspaceClassesRaw from './controlled-vs-uncontrolled-airspace-drone-pilots.md?raw';
import nightOpsRaw from './can-you-fly-a-drone-at-night.md?raw';
import whereToFlyRaw from './where-can-you-fly-a-drone.md?raw';
import aviationHazardsRaw from './aviation-hazards-explained-drone-pilots.md?raw';
import faaEvidenceRaw from './faa-evidence-packet-drone-pilots.md?raw';
import faaInquiryRaw from './faa-inquiry-prepared-drone-pilot.md?raw';
import flightLogRaw from './how-to-log-drone-flights-part-107.md?raw';
import laancRaw from './what-is-laanc-drone-pilots.md?raw';
import metarRaw from './how-to-read-a-metar-drone-pilot.md?raw';
import missionBriefingRaw from './what-is-a-mission-briefing-drone-pilots.md?raw';
import part107LicenseRaw from './do-you-need-a-part-107-license.md?raw';
import remoteIdRaw from './what-is-remote-id-drone-pilots.md?raw';
import sectionalRaw from './how-to-read-a-sectional-chart-drone-pilot.md?raw';
import tafRaw from './how-to-read-a-taf-drone-pilot.md?raw';
import tfrRaw from './what-is-a-tfr-drone-pilots.md?raw';
import windRaw from './how-much-wind-can-a-drone-fly-in.md?raw';
import verifiableCredentialsRaw from './verifiable-credentials-drone-pilots.md?raw';
import whiteLabelRaw from './white-label-client-mode-drone-pilots.md?raw';
import weatherMinimumsRaw from './part-107-weather-minimums-drone-pilots.md?raw';
import droneInsuranceRaw from './drone-insurance-part-107-pilots.md?raw';
import thunderstormsRaw from './flying-near-thunderstorms-drone-pilots.md?raw';
import batteryCareRaw from './drone-battery-care-lipo-safety.md?raw';
import airportMythRaw from './flying-drone-near-airport-5-mile-myth.md?raw';
import privatePropertyRaw from './can-you-fly-a-drone-over-private-property.md?raw';
import overPeopleRaw from './operations-over-people-drone-part-107.md?raw';
import pricingRaw from './how-much-to-charge-drone-services.md?raw';
import firstClientRaw from './how-to-get-first-drone-client.md?raw';
import contractRaw from './drone-service-contract-what-to-include.md?raw';
import realEstateRaw from './real-estate-drone-photography-workflow.md?raw';
import recurrentTrainingRaw from './part-107-recurrent-training-renewal.md?raw';
import coldWeatherRaw from './cold-weather-drone-flying-winter.md?raw';
import preflightChecklistRaw from './drone-preflight-checklist-part-107.md?raw';
import travelingRaw from './traveling-with-a-drone-rules.md?raw';
import rainRaw from './can-you-fly-a-drone-in-the-rain.md?raw';
import sub250Raw from './do-sub-250g-drones-need-faa-registration.md?raw';
import how400Raw from './how-high-can-you-fly-a-drone-400-foot-rule.md?raw';
import registerRaw from './how-to-register-your-drone-with-the-faa.md?raw';
import crashReportRaw from './do-you-have-to-report-a-drone-crash-to-the-faa.md?raw';

import type { Lang } from '../lang';

export type PostCategory = 'Weather' | 'Airspace' | 'Compliance' | 'Equipment' | 'Business';

export const ALL_CATEGORIES: PostCategory[] = ['Weather', 'Airspace', 'Compliance', 'Equipment', 'Business'];

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
  { slug: 'do-you-have-to-report-a-drone-crash-to-the-faa', raw: crashReportRaw, category: 'Compliance' },
  { slug: 'how-high-can-you-fly-a-drone-400-foot-rule',  raw: how400Raw,   category: 'Airspace' },
  { slug: 'how-to-register-your-drone-with-the-faa',     raw: registerRaw, category: 'Compliance' },
  { slug: 'can-you-fly-a-drone-in-the-rain',           raw: rainRaw,   category: 'Weather' },
  { slug: 'do-sub-250g-drones-need-faa-registration',   raw: sub250Raw, category: 'Compliance' },
  { slug: 'how-much-to-charge-drone-services',          raw: pricingRaw,         category: 'Business' },
  { slug: 'how-to-get-first-drone-client',              raw: firstClientRaw,     category: 'Business' },
  { slug: 'real-estate-drone-photography-workflow',     raw: realEstateRaw,      category: 'Business' },
  { slug: 'drone-service-contract-what-to-include',     raw: contractRaw,        category: 'Business' },
  { slug: 'part-107-recurrent-training-renewal',        raw: recurrentTrainingRaw, category: 'Compliance' },
  { slug: 'drone-preflight-checklist-part-107',         raw: preflightChecklistRaw, category: 'Equipment' },
  { slug: 'cold-weather-drone-flying-winter',           raw: coldWeatherRaw,     category: 'Weather' },
  { slug: 'traveling-with-a-drone-rules',               raw: travelingRaw,       category: 'Airspace' },
  { slug: 'can-you-fly-a-drone-over-private-property',  raw: privatePropertyRaw, category: 'Airspace' },
  { slug: 'operations-over-people-drone-part-107',      raw: overPeopleRaw,      category: 'Compliance' },
  { slug: 'flying-drone-near-airport-5-mile-myth',      raw: airportMythRaw,     category: 'Airspace' },
  { slug: 'flying-near-thunderstorms-drone-pilots',     raw: thunderstormsRaw,   category: 'Weather' },
  { slug: 'drone-battery-care-lipo-safety',             raw: batteryCareRaw,     category: 'Equipment' },
  { slug: 'part-107-weather-minimums-drone-pilots',     raw: weatherMinimumsRaw, category: 'Weather' },
  { slug: 'drone-insurance-part-107-pilots',            raw: droneInsuranceRaw,  category: 'Compliance' },
  { slug: 'faa-deadlines-drone-pilots',                 raw: faaDeadlinesRaw,    category: 'Compliance' },
  { slug: 'drone-go-no-go-decision',                    raw: goNoGoRaw,          category: 'Compliance' },
  { slug: 'density-altitude-drone-performance',         raw: densityAltitudeRaw, category: 'Weather' },
  { slug: 'where-can-you-fly-a-drone',                  raw: whereToFlyRaw,      category: 'Airspace' },
  { slug: 'can-you-fly-a-drone-at-night',                raw: nightOpsRaw,        category: 'Compliance' },
  { slug: 'controlled-vs-uncontrolled-airspace-drone-pilots', raw: airspaceClassesRaw, category: 'Airspace' },
  { slug: 'what-is-remote-id-drone-pilots',            raw: remoteIdRaw,        category: 'Compliance' },
  { slug: 'do-you-need-a-part-107-license',            raw: part107LicenseRaw,  category: 'Compliance' },
  { slug: 'how-much-wind-can-a-drone-fly-in',          raw: windRaw,            category: 'Weather' },
  { slug: 'what-is-a-tfr-drone-pilots',                raw: tfrRaw,             category: 'Airspace' },
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

// Spanish translations live in ./es/<slug>.md (same slug). Pulled in via glob so
// new posts' translations are picked up automatically — no per-file import.
const esRawModules = import.meta.glob('./es/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function buildPost(slug: string, raw: string, category: PostCategory): Post {
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
}

export const posts: Post[] = rawPosts.map(({ slug, raw, category }) => buildPost(slug, raw, category));

// Spanish set — falls back to the English raw for any slug not yet translated,
// so a missing translation degrades to English instead of a blank page.
const postsEs: Post[] = rawPosts.map(({ slug, raw, category }) =>
  buildPost(slug, esRawModules[`./es/${slug}.md`] ?? raw, category),
);

export function getPosts(lang: Lang = 'en'): Post[] {
  return lang === 'es' ? postsEs : posts;
}

export function getPost(slug: string, lang: Lang = 'en'): Post | undefined {
  return getPosts(lang).find(p => p.slug === slug) ?? posts.find(p => p.slug === slug);
}
