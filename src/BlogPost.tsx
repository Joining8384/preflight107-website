import type { ReactNode } from 'react';
import { navigate } from './navigate';
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

// ── Inline markdown renderer ──────────────────────────────────────────────────
// Handles **bold**, *italic*, and `inline code` within a single line of text.
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      parts.push(<code key={key++} className="blog-inline-code">{token.slice(1, -1)}</code>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : parts;
}

// ── Block markdown renderer ───────────────────────────────────────────────────
// Handles headings, code fences, lists, horizontal rules, and paragraphs.
function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre key={key++} className="blog-pre">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // h3
    if (line.startsWith('### ')) {
      blocks.push(<h3 key={key++} className="blog-h3">{renderInline(line.slice(4))}</h3>);
      i++; continue;
    }
    // h2
    if (line.startsWith('## ')) {
      blocks.push(<h2 key={key++} className="blog-h2">{renderInline(line.slice(3))}</h2>);
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      blocks.push(<hr key={key++} className="blog-hr" />);
      i++; continue;
    }

    // Unordered list — collect consecutive list items
    if (line.startsWith('- ')) {
      const items: ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={items.length}>{renderInline(lines[i].slice(2))}</li>);
        i++;
      }
      blocks.push(<ul key={key++} className="blog-ul">{items}</ul>);
      continue;
    }

    // Empty line
    if (line.trim() === '') { i++; continue; }

    // Paragraph — collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('```') &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(<p key={key++} className="blog-p">{renderInline(paraLines.join(' '))}</p>);
    }
  }

  return blocks;
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
