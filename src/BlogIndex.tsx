import { useMemo, useState } from 'react';
import { navigate } from './navigate';
import { getPosts, ALL_CATEGORIES, type PostCategory } from './posts/index';
import type { Lang } from './lang';
import { withLang } from './lang';
import LanguageToggle from './LanguageToggle';

type Filter = 'All' | PostCategory;

const POSTS_PER_PAGE = 12;

// ── Bilingual strings ─────────────────────────────────────────────────────────
const en = {
  navHome: '← Home',
  navSupport: 'Support',
  eyebrow: 'From the Team',
  title: 'PreFlight 107 Blog',
  sub: 'Tips, tutorials, and insights for drone pilots.',
  filtersLabel: 'Filter posts by category',
  all: 'All',
  searchPlaceholder: 'Search articles…',
  searchAria: 'Search articles',
  empty: 'No articles match that filter.',
  clearFilters: 'Clear filters',
  readArticle: 'Read article →',
  loadMore: (n: number) => `Load more articles (${n} remaining)`,
  footerTagline: 'Fly safe out there.',
  privacy: 'Privacy',
  terms: 'Terms',
  support: 'Support',
  categories: {
    Weather: 'Weather',
    Airspace: 'Airspace',
    Compliance: 'Compliance',
    Equipment: 'Equipment',
    Business: 'Business',
  } as Record<PostCategory, string>,
};

const es: typeof en = {
  navHome: '← Inicio',
  navSupport: 'Soporte',
  eyebrow: 'Del Equipo',
  title: 'Blog de PreFlight 107',
  sub: 'Consejos, tutoriales e ideas para pilotos de drones.',
  filtersLabel: 'Filtrar publicaciones por categoría',
  all: 'Todas',
  searchPlaceholder: 'Buscar artículos…',
  searchAria: 'Buscar artículos',
  empty: 'Ningún artículo coincide con ese filtro.',
  clearFilters: 'Limpiar filtros',
  readArticle: 'Leer artículo →',
  loadMore: (n: number) => `Cargar más artículos (${n} restantes)`,
  footerTagline: 'Vuela seguro por ahí.',
  privacy: 'Privacidad',
  terms: 'Términos',
  support: 'Soporte',
  categories: {
    Weather: 'Clima',
    Airspace: 'Espacio aéreo',
    Compliance: 'Cumplimiento',
    Equipment: 'Equipo',
    Business: 'Negocio',
  },
};

const T = { en, es };

// Spanish-aware date formatter — keeps posts/index.ts untouched.
function fmtDate(dateStr: string, lang: Lang): string {
  if (!dateStr) return '';
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogIndex({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  const posts = useMemo(() => getPosts(lang), [lang]);

  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(p => {
      if (filter !== 'All' && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [filter, query, posts]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length };
    for (const c of ALL_CATEGORIES) counts[c] = 0;
    for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, [posts]);

  function applyFilter(next: Filter) {
    setFilter(next);
    setVisibleCount(POSTS_PER_PAGE);
  }

  function applyQuery(q: string) {
    setQuery(q);
    setVisibleCount(POSTS_PER_PAGE);
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate(withLang('/', lang))}>{t.navHome}</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <LanguageToggle />
        <button className="blog-nav-btn" onClick={() => navigate(withLang('/support', lang))}>{t.navSupport}</button>
      </header>

      <div className="blog-index-hero">
        <div className="blog-eyebrow">{t.eyebrow}</div>
        <h1 className="blog-index-title">{t.title}</h1>
        <p className="blog-index-sub">{t.sub}</p>
      </div>

      <div className="blog-controls">
        <div className="blog-filters" role="tablist" aria-label={t.filtersLabel}>
          {(['All', ...ALL_CATEGORIES] as Filter[]).map(c => {
            const count = countByCategory[c] ?? 0;
            if (c !== 'All' && count === 0) return null;
            const active = filter === c;
            const label = c === 'All' ? t.all : t.categories[c];
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                className={`blog-filter-chip${active ? ' is-active' : ''}`}
                onClick={() => applyFilter(c)}
              >
                {label}
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
            onChange={e => applyQuery(e.target.value)}
            aria-label={t.searchAria}
          />
        </div>
      </div>

      <div className="blog-grid-container">
        {filtered.length === 0 ? (
          <div className="blog-empty">
            <p>{t.empty}</p>
            <button className="blog-clear-btn" onClick={() => { applyFilter('All'); applyQuery(''); }}>
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {visible.map(post => (
                <article
                  key={post.slug}
                  className="blog-card"
                  onClick={() => navigate(withLang(`/blog/${post.slug}`, lang))}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(withLang(`/blog/${post.slug}`, lang)); }}
                >
                  <div className="blog-card-meta">
                    <span className="blog-card-category">{t.categories[post.category]}</span>
                    <span className="blog-card-sep">·</span>
                    <span className="blog-card-date">{fmtDate(post.date, lang)}</span>
                    <span className="blog-card-sep">·</span>
                    <span className="blog-card-read-time">{post.readTime}</span>
                  </div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-cta">{t.readArticle}</span>
                </article>
              ))}
            </div>
            {hasMore && (
              <div className="blog-load-more-row">
                <button
                  className="blog-load-more-btn"
                  onClick={() => setVisibleCount(c => c + POSTS_PER_PAGE)}
                >
                  {t.loadMore(filtered.length - visibleCount)}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <span className="blog-footer-logo">
            <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
          </span>
          <p className="blog-footer-tagline">{t.footerTagline}</p>
          <div className="blog-footer-links">
            <a href={withLang('/privacy', lang)} onClick={e => { e.preventDefault(); navigate(withLang('/privacy', lang)); }}>{t.privacy}</a>
            <span>·</span>
            <a href={withLang('/terms', lang)} onClick={e => { e.preventDefault(); navigate(withLang('/terms', lang)); }}>{t.terms}</a>
            <span>·</span>
            <a href={withLang('/support', lang)} onClick={e => { e.preventDefault(); navigate(withLang('/support', lang)); }}>{t.support}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
