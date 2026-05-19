import { useMemo, useState } from 'react';
import { navigate } from './navigate';
import { posts, formatDate, ALL_CATEGORIES, type PostCategory } from './posts/index';

type Filter = 'All' | PostCategory;

const POSTS_PER_PAGE = 12;

export default function BlogIndex() {
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
  }, [filter, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length };
    for (const c of ALL_CATEGORIES) counts[c] = 0;
    for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, []);

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
        <button className="blog-nav-btn" onClick={() => navigate('/')}>← Home</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <button className="blog-nav-btn" onClick={() => navigate('/support')}>Support</button>
      </header>

      <div className="blog-index-hero">
        <div className="blog-eyebrow">From the Team</div>
        <h1 className="blog-index-title">PreFlight 107 Blog</h1>
        <p className="blog-index-sub">Tips, tutorials, and insights for drone pilots.</p>
      </div>

      <div className="blog-controls">
        <div className="blog-filters" role="tablist" aria-label="Filter posts by category">
          {(['All', ...ALL_CATEGORIES] as Filter[]).map(c => {
            const count = countByCategory[c] ?? 0;
            if (c !== 'All' && count === 0) return null;
            const active = filter === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                className={`blog-filter-chip${active ? ' is-active' : ''}`}
                onClick={() => applyFilter(c)}
              >
                {c}
                <span className="blog-filter-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="blog-search-wrap">
          <input
            type="search"
            className="blog-search"
            placeholder="Search articles…"
            value={query}
            onChange={e => applyQuery(e.target.value)}
            aria-label="Search articles"
          />
        </div>
      </div>

      <div className="blog-grid-container">
        {filtered.length === 0 ? (
          <div className="blog-empty">
            <p>No articles match that filter.</p>
            <button className="blog-clear-btn" onClick={() => { applyFilter('All'); applyQuery(''); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {visible.map(post => (
                <article
                  key={post.slug}
                  className="blog-card"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(`/blog/${post.slug}`); }}
                >
                  <div className="blog-card-meta">
                    <span className="blog-card-category">{post.category}</span>
                    <span className="blog-card-sep">·</span>
                    <span className="blog-card-date">{formatDate(post.date)}</span>
                    <span className="blog-card-sep">·</span>
                    <span className="blog-card-read-time">{post.readTime}</span>
                  </div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-cta">Read article →</span>
                </article>
              ))}
            </div>
            {hasMore && (
              <div className="blog-load-more-row">
                <button
                  className="blog-load-more-btn"
                  onClick={() => setVisibleCount(c => c + POSTS_PER_PAGE)}
                >
                  Load more articles ({filtered.length - visibleCount} remaining)
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
