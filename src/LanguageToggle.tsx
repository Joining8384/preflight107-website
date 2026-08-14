import { getLang, withLang } from './lang';

/**
 * Compact EN | ES language switch for the site header.
 *
 * Derives everything from the current URL: it computes the counterpart address
 * for the page you're on (e.g. /blog ⇄ /es/blog) so switching language keeps
 * you on the same page. Real <a href> links, so they're crawlable and each
 * language has a distinct, indexable URL.
 */
export default function LanguageToggle() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const active = getLang(path);
  const enHref = withLang(path, 'en');
  const esHref = withLang(path, 'es');

  const base: React.CSSProperties = {
    padding: '0.15rem 0.4rem',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'inherit',
    opacity: 0.6,
  };
  const activeStyle: React.CSSProperties = {
    ...base,
    opacity: 1,
    fontWeight: 800,
    textDecoration: 'underline',
  };

  return (
    <div
      className="lang-toggle"
      aria-label="Language"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem' }}
    >
      <a href={enHref} aria-current={active === 'en' ? 'true' : undefined} style={active === 'en' ? activeStyle : base}>
        EN
      </a>
      <span aria-hidden="true" style={{ opacity: 0.4 }}>|</span>
      <a href={esHref} aria-current={active === 'es' ? 'true' : undefined} style={active === 'es' ? activeStyle : base}>
        ES
      </a>
    </div>
  );
}
