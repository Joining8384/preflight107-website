import { useMemo, useState } from 'react';
import { navigate } from './navigate';
import { guides, GUIDE_SECTIONS, type GuideSection } from './guides/index';
import { withLang, type Lang } from './lang';
import LanguageToggle from './LanguageToggle';

type Filter = 'All' | GuideSection;

// UI chrome only. Guide titles/excerpts/body stay English (frontmatter fallback).
// Brand, 'Fly Now Score', 'Mission Briefing(s)' and acronyms stay canonical English.
const en = {
  home: '← Home',
  support: 'Support',
  eyebrow: 'Help & Guides',
  title: 'How can we help?',
  sub: 'Guides for getting the most out of PreFlight 107.',
  filterAria: 'Filter guides by section',
  searchPlaceholder: 'Search help…',
  searchAria: 'Search help guides',
  empty: 'No guides match your search.',
  clear: 'Clear search',
  readGuide: 'Read guide →',
  all: 'All',
  sections: {
    'Getting Started': 'Getting Started',
    'Using the App': 'Using the App',
    'Account & Billing': 'Account & Billing',
  } as Record<GuideSection, string>,
  tagline: 'Fly safe out there.',
  privacy: 'Privacy',
  terms: 'Terms',
  footerSupport: 'Support',
};

const es: typeof en = {
  home: '← Inicio',
  support: 'Soporte',
  eyebrow: 'Ayuda y guías',
  title: '¿Cómo podemos ayudarte?',
  sub: 'Guías para sacar el máximo provecho de PreFlight 107.',
  filterAria: 'Filtrar guías por sección',
  searchPlaceholder: 'Buscar ayuda…',
  searchAria: 'Buscar en las guías de ayuda',
  empty: 'Ninguna guía coincide con tu búsqueda.',
  clear: 'Borrar búsqueda',
  readGuide: 'Leer guía →',
  all: 'Todas',
  sections: {
    'Getting Started': 'Primeros pasos',
    'Using the App': 'Uso de la app',
    'Account & Billing': 'Cuenta y facturación',
  },
  tagline: 'Vuela con seguridad.',
  privacy: 'Privacidad',
  terms: 'Términos',
  footerSupport: 'Soporte',
};

const T = { en, es };

export default function GuidesIndex({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  const to = (path: string) => withLang(path, lang);
  const sectionLabel = (s: Filter) => (s === 'All' ? t.all : t.sections[s]);

  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter(g => {
      if (filter !== 'All' && g.section !== filter) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.excerpt.toLowerCase().includes(q) ||
        g.content.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const countBySection = useMemo(() => {
    const counts: Record<string, number> = { All: guides.length };
    for (const s of GUIDE_SECTIONS) counts[s] = 0;
    for (const g of guides) counts[g.section] = (counts[g.section] ?? 0) + 1;
    return counts;
  }, []);

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate(to('/'))}>{t.home}</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          <LanguageToggle />
          <button className="blog-nav-btn" onClick={() => navigate(to('/support'))}>{t.support}</button>
        </div>
      </header>

      <div className="blog-index-hero">
        <div className="blog-eyebrow">{t.eyebrow}</div>
        <h1 className="blog-index-title">{t.title}</h1>
        <p className="blog-index-sub">{t.sub}</p>
      </div>

      <div className="blog-controls">
        <div className="blog-filters" role="tablist" aria-label={t.filterAria}>
          {(['All', ...GUIDE_SECTIONS] as Filter[]).map(s => {
            const count = countBySection[s] ?? 0;
            if (s !== 'All' && count === 0) return null;
            const active = filter === s;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={active}
                className={`blog-filter-chip${active ? ' is-active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {sectionLabel(s)}
                <span className="blog-filter-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="blog-search-wrap">
          <input
            type="search"
            className="blog-search"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label={t.searchAria}
          />
        </div>
      </div>

      <div className="blog-grid-container">
        {filtered.length === 0 ? (
          <div className="blog-empty">
            <p>{t.empty}</p>
            <button className="blog-clear-btn" onClick={() => { setFilter('All'); setQuery(''); }}>
              {t.clear}
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map(guide => (
              <article
                key={guide.slug}
                className="blog-card"
                onClick={() => navigate(to(`/help/${guide.slug}`))}
                role="link"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') navigate(to(`/help/${guide.slug}`)); }}
              >
                <div className="blog-card-meta">
                  <span className="blog-card-category">{t.sections[guide.section]}</span>
                </div>
                <h2 className="blog-card-title">{guide.title}</h2>
                <p className="blog-card-excerpt">{guide.excerpt}</p>
                <span className="blog-card-cta">{t.readGuide}</span>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <span className="blog-footer-logo">
            <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
          </span>
          <p className="blog-footer-tagline">{t.tagline}</p>
          <div className="blog-footer-links">
            <a href={to('/privacy')} onClick={e => { e.preventDefault(); navigate(to('/privacy')); }}>{t.privacy}</a>
            <span>·</span>
            <a href={to('/terms')} onClick={e => { e.preventDefault(); navigate(to('/terms')); }}>{t.terms}</a>
            <span>·</span>
            <a href={to('/support')} onClick={e => { e.preventDefault(); navigate(to('/support')); }}>{t.footerSupport}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
