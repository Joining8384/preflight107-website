import { navigate } from './navigate';
import { renderMarkdown } from './markdown';
import { getPost } from './posts/index';
import type { Lang } from './lang';
import { withLang } from './lang';
import LanguageToggle from './LanguageToggle';

// ── Bilingual strings ─────────────────────────────────────────────────────────
const en = {
  backBlog: '← Blog',
  navHome: 'Home',
  eyebrow: 'Drone Pilot Guides',
  notFound: 'Post not found',
  backToBlog: 'Back to Blog',
  ctaText: 'Get real-time METARs, TAFs, and ADS-B data in one app — free to download.',
  ctaButton: 'Download PreFlight 107 Free',
  footerTagline: 'Fly safe out there.',
  privacy: 'Privacy',
  terms: 'Terms',
  support: 'Support',
};

const es: typeof en = {
  backBlog: '← Blog',
  navHome: 'Inicio',
  eyebrow: 'Guías para Pilotos de Drones',
  notFound: 'Publicación no encontrada',
  backToBlog: 'Volver al Blog',
  ctaText: 'Obtén METARs, TAFs y datos ADS-B en tiempo real en una sola app — descarga gratis.',
  ctaButton: 'Descarga PreFlight 107 Gratis',
  footerTagline: 'Vuela seguro por ahí.',
  privacy: 'Privacidad',
  terms: 'Términos',
  support: 'Soporte',
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


// ── Component ─────────────────────────────────────────────────────────────────
interface BlogPostProps {
  slug: string;
  lang?: Lang;
}

export default function BlogPost({ slug, lang = 'en' }: BlogPostProps) {
  const t = T[lang];
  const post = getPost(slug, lang);

  if (!post) {
    return (
      <div className="blog-page">
        <header className="blog-header">
          <button className="blog-nav-btn" onClick={() => navigate(withLang('/blog', lang))}>{t.backBlog}</button>
          <div className="blog-logo-link">
            <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
          </div>
          <LanguageToggle />
        </header>
        <div className="blog-not-found">
          <h1>{t.notFound}</h1>
          <button className="cta-button" onClick={() => navigate(withLang('/blog', lang))}>{t.backToBlog}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate(withLang('/blog', lang))}>{t.backBlog}</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <LanguageToggle />
        <button className="blog-nav-btn" onClick={() => navigate(withLang('/', lang))}>{t.navHome}</button>
      </header>

      <article className="blog-article">
        <div className="blog-article-eyebrow">{t.eyebrow}</div>
        <h1 className="blog-article-title">{post.title}</h1>
        <div className="blog-article-meta">
          <span>{fmtDate(post.date, lang)}</span>
          <span className="blog-meta-sep">·</span>
          <span>{post.readTime}</span>
        </div>
        <div className="blog-article-divider" />
        <div className="blog-article-body">
          {renderMarkdown(post.content)}
        </div>
        <div className="blog-article-cta">
          <p className="blog-cta-text">
            {t.ctaText}
          </p>
          <button className="cta-button" onClick={() => navigate(withLang('/', lang))}>
            {t.ctaButton}
          </button>
        </div>
      </article>

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
