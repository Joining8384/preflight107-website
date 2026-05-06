import { navigate } from './navigate';
import { posts, formatDate } from './posts/index';

export default function BlogIndex() {
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

      <div className="blog-grid-container">
        <div className="blog-grid">
          {posts.map(post => (
            <article
              key={post.slug}
              className="blog-card"
              onClick={() => navigate(`/blog/${post.slug}`)}
              role="link"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`/blog/${post.slug}`); }}
            >
              <div className="blog-card-meta">
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
