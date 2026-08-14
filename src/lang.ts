// Website localization core (English + Spanish).
//
// Language is DERIVED FROM THE URL so every page has a real, crawlable address:
//   English  → /blog/foo        Spanish → /es/blog/foo
//   English  → /  (home)        Spanish → /es
// This keeps SEO clean (distinct URLs + hreflang pairs) rather than a cookie/JS
// toggle that serves two languages at one URL.

export type Lang = 'en' | 'es';

/** Active language from a path (defaults to the current location). */
export function getLang(path: string = window.location.pathname): Lang {
  return path === '/es' || path.startsWith('/es/') ? 'es' : 'en';
}

/** Strip the /es prefix to get the canonical (English-space) path for routing. */
export function stripLang(path: string): string {
  if (path === '/es' || path === '/es/') return '/';
  if (path.startsWith('/es/')) return path.slice(3); // '/es/blog' -> '/blog'
  return path;
}

/** Build the URL for `path` (any language) rendered in `lang`. */
export function withLang(path: string, lang: Lang): string {
  const bare = stripLang(path); // always English-space, leading '/'
  if (lang === 'en') return bare;
  return bare === '/' ? '/es' : '/es' + bare;
}

/**
 * Keep <html lang> and the hreflang alternate links in sync with the current
 * path. Call on every route change. Search engines read these to serve the
 * right language and avoid duplicate-content penalties across en/es.
 */
export function syncLangHead(path: string = window.location.pathname): void {
  const lang = getLang(path);
  const bare = stripLang(path);
  document.documentElement.lang = lang;

  const origin = window.location.origin;
  const enUrl = origin + bare;
  const esUrl = origin + (bare === '/' ? '/es' : '/es' + bare);

  const alts: Array<[string, string]> = [
    ['en', enUrl],
    ['es', esUrl],
    ['x-default', enUrl],
  ];

  // Remove any alternates we previously injected, then re-add for this path.
  document.querySelectorAll('link[rel="alternate"][data-i18n]').forEach((n) => n.remove());
  for (const [hreflang, href] of alts) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute('data-i18n', '1');
    document.head.appendChild(link);
  }
}
