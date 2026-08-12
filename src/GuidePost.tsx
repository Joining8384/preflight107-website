import { navigate } from './navigate';
import { getGuide } from './guides/index';
import { renderMarkdown } from './markdown';

interface GuidePostProps {
  slug: string;
}

export default function GuidePost({ slug }: GuidePostProps) {
  const guide = getGuide(slug);

  if (!guide) {
    return (
      <div className="blog-page">
        <header className="blog-header">
          <button className="blog-nav-btn" onClick={() => navigate('/help')}>← Help</button>
          <div className="blog-logo-link">
            <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
          </div>
          <div />
        </header>
        <div className="blog-not-found">
          <h1>Guide not found</h1>
          <button className="cta-button" onClick={() => navigate('/help')}>Back to Help</button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate('/help')}>← Help</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <button className="blog-nav-btn" onClick={() => navigate('/')}>Home</button>
      </header>

      <article className="blog-article">
        <div className="blog-article-eyebrow">{guide.section}</div>
        <h1 className="blog-article-title">{guide.title}</h1>
        <div className="blog-article-divider" />
        <div className="blog-article-body">
          {renderMarkdown(guide.content)}
        </div>
        <div className="blog-article-cta">
          <p className="blog-cta-text">
            Still need a hand? Email support@preflight107.com and we'll help.
          </p>
          <button className="cta-button" onClick={() => navigate('/help')}>
            Back to all guides
          </button>
        </div>
      </article>

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
