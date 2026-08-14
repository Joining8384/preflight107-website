import { navigate } from './navigate';
import { getGuide, type GuideSection } from './guides/index';
import { renderMarkdown } from './markdown';
import { withLang, type Lang } from './lang';
import LanguageToggle from './LanguageToggle';

interface GuidePostProps {
  slug: string;
  lang?: Lang;
}

// UI chrome only. Guide title/section/body stay English (frontmatter fallback).
const en = {
  help: '← Help',
  home: 'Home',
  notFound: 'Guide not found',
  backToHelp: 'Back to Help',
  ctaText: "Still need a hand? Email support@preflight107.com and we'll help.",
  backToAll: 'Back to all guides',
  sections: {
    'Getting Started': 'Getting Started',
    'Using the App': 'Using the App',
    'Account & Billing': 'Account & Billing',
  } as Record<GuideSection, string>,
  tagline: 'Fly safe out there.',
  privacy: 'Privacy',
  terms: 'Terms',
  support: 'Support',
};

const es: typeof en = {
  help: '← Ayuda',
  home: 'Inicio',
  notFound: 'Guía no encontrada',
  backToHelp: 'Volver a Ayuda',
  ctaText: '¿Aún necesitas ayuda? Escribe a support@preflight107.com y te echamos una mano.',
  backToAll: 'Volver a todas las guías',
  sections: {
    'Getting Started': 'Primeros pasos',
    'Using the App': 'Uso de la app',
    'Account & Billing': 'Cuenta y facturación',
  },
  tagline: 'Vuela con seguridad.',
  privacy: 'Privacidad',
  terms: 'Términos',
  support: 'Soporte',
};

const T = { en, es };

export default function GuidePost({ slug, lang = 'en' }: GuidePostProps) {
  const t = T[lang];
  const to = (path: string) => withLang(path, lang);
  const guide = getGuide(slug);

  if (!guide) {
    return (
      <div className="blog-page">
        <header className="blog-header">
          <button className="blog-nav-btn" onClick={() => navigate(to('/help'))}>{t.help}</button>
          <div className="blog-logo-link">
            <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
          </div>
          <LanguageToggle />
        </header>
        <div className="blog-not-found">
          <h1>{t.notFound}</h1>
          <button className="cta-button" onClick={() => navigate(to('/help'))}>{t.backToHelp}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate(to('/help'))}>{t.help}</button>
        <div className="blog-logo-link">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          <LanguageToggle />
          <button className="blog-nav-btn" onClick={() => navigate(to('/'))}>{t.home}</button>
        </div>
      </header>

      <article className="blog-article">
        <div className="blog-article-eyebrow">{t.sections[guide.section]}</div>
        <h1 className="blog-article-title">{guide.title}</h1>
        <div className="blog-article-divider" />
        <div className="blog-article-body">
          {renderMarkdown(guide.content)}
        </div>
        <div className="blog-article-cta">
          <p className="blog-cta-text">
            {t.ctaText}
          </p>
          <button className="cta-button" onClick={() => navigate(to('/help'))}>
            {t.backToAll}
          </button>
        </div>
      </article>

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
            <a href={to('/support')} onClick={e => { e.preventDefault(); navigate(to('/support')); }}>{t.support}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
