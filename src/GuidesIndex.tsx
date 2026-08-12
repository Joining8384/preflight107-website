import { useMemo, useState } from 'react';
import { navigate } from './navigate';
import { guides, GUIDE_SECTIONS, type GuideSection } from './guides/index';

type Filter = 'All' | GuideSection;

export default function GuidesIndex() {
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
        <button className="blog-nav-btn" onClick={() => navigate('/')}>← Home</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <button className="blog-nav-btn" onClick={() => navigate('/support')}>Support</button>
      </header>

      <div className="blog-index-hero">
        <div className="blog-eyebrow">Help &amp; Guides</div>
        <h1 className="blog-index-title">How can we help?</h1>
        <p className="blog-index-sub">Guides for getting the most out of PreFlight 107.</p>
      </div>

      <div className="blog-controls">
        <div className="blog-filters" role="tablist" aria-label="Filter guides by section">
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
                {s}
                <span className="blog-filter-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="blog-search-wrap">
          <input
            type="search"
            className="blog-search"
            placeholder="Search help…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search help guides"
          />
        </div>
      </div>

      <div className="blog-grid-container">
        {filtered.length === 0 ? (
          <div className="blog-empty">
            <p>No guides match your search.</p>
            <button className="blog-clear-btn" onClick={() => { setFilter('All'); setQuery(''); }}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map(guide => (
              <article
                key={guide.slug}
                className="blog-card"
                onClick={() => navigate(`/help/${guide.slug}`)}
                role="link"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/help/${guide.slug}`); }}
              >
                <div className="blog-card-meta">
                  <span className="blog-card-category">{guide.section}</span>
                </div>
                <h2 className="blog-card-title">{guide.title}</h2>
                <p className="blog-card-excerpt">{guide.excerpt}</p>
                <span className="blog-card-cta">Read guide →</span>
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
          <p className="blog-footer-tagline">Fly safe out there.</p>
          <div className="blog-footer-links">
            <a href="/privacy" onClick={e => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a>
            <span>·</span>
            <a href="/terms" onClick={e => { e.preventDefault(); navigate('/terms'); }}>Terms</a>
            <span>·</span>
            <a href="/support" onClick={e => { e.preventDefault(); navigate('/support'); }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
