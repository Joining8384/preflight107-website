import React, { useEffect, useState } from 'react';
import './App.css';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';
import { withLang } from './lang';
import type { Lang } from './lang';
import { T } from './homeCopy';
import LanguageToggle from './LanguageToggle';

function App({ lang = 'en' }: { lang?: Lang }) {
  const { user, signOut } = useAuth();
  const c = T[lang];
  // Internal-link helper: in Spanish, keep navigation in-language (/es/…).
  const L = (href: string) => withLang(href, lang);

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [menuOpen, setMenuOpen] = useState(false);
  const [androidEmail, setAndroidEmail] = useState('');
  const [androidStatus, setAndroidStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [betaOpen, setBetaOpen]     = useState(false);
  const [betaName, setBetaName]     = useState('');
  const [betaEmail, setBetaEmail]   = useState('');
  const [betaStatus, setBetaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [briefingHelpOpen, setBriefingHelpOpen] = useState(false);

  const BREVO_URL =
    'https://db0a234c.sibforms.com/serve/MUIFAERwrnycogWcTeXCk-WX-03RO6ZjUHkjIAdE_NwNNAWyQWiJ_t3_rnHHdvQRQPKQv3yZATdR1w6nH5Kp3Lv4kGi3Lw0TWVt5Ux1lh5zSq4Bqan98KbfGT3aWlbqrqnCb3hV6d9m6LRDaA-Hl03qGwwBgla5-vS7yjP2fIJ1AMP7sHoq6vtkChyF61S5Pi8w7uHKmJmwm9b8m';
  const BETA_BREVO_URL = 'https://db0a234c.sibforms.com/serve/MUIFACJte8IZE6oqdY2AVPhUu5HAldkQTf5T32EO-fy17ZXlMQ0hfhDxPH89D7-mAUDE_JMPwKwCQ0oHJFdA8fE_5IT5t8arz78N-iXg4JFn7yXRx-xvUnt9pLSYCHbAoeDP0CAM3hZ8ZdVbrj0AzADJtH-nM9pp7x0wByBYNixkb9Tzm1Pmr-gSPalmZy29biI03dpWfoCuwzcK';

  useEffect(() => {
    if (!betaOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setBetaOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [betaOpen]);

  useEffect(() => {
    if (!briefingHelpOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setBriefingHelpOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [briefingHelpOpen]);

  function openBeta() {
    setBetaStatus('idle');
    setBetaName('');
    setBetaEmail('');
    setBetaOpen(true);
  }

  async function handleBetaSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!betaEmail.includes('@')) return;
    setBetaStatus('loading');
    try {
      const body = `FIRSTNAME=${encodeURIComponent(betaName)}&EMAIL=${encodeURIComponent(betaEmail)}&PLATFORM=iOS&email_address_check=&locale=${lang}`;
      // Brevo's sibforms endpoint sends no CORS headers, so a normal fetch
      // rejects on the response read even though the signup succeeds
      // server-side. no-cors submits the simple POST and returns an opaque
      // response we can't inspect — so we report success optimistically.
      // Genuine network failures (offline) still hit the catch below.
      await fetch(BETA_BREVO_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      setBetaStatus('success');
      setTimeout(() => { setBetaOpen(false); setBetaStatus('idle'); }, 2500);
    } catch {
      setBetaStatus('error');
    }
  }

  async function handleAndroidSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!androidEmail.includes('@')) return;
    setAndroidStatus('loading');
    try {
      const body = `EMAIL=${encodeURIComponent(androidEmail)}&PLATFORM=Android&email_address_check=&locale=${lang}`;
      // no-cors: Brevo's endpoint sends no CORS headers so a normal fetch
      // rejects on the response read despite the signup succeeding. The simple
      // POST still submits; opaque response can't be inspected → optimistic
      // success. Network failures (offline) still hit the catch.
      await fetch(BREVO_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      setAndroidStatus('success');
    } catch {
      setAndroidStatus('error');
    }
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    await signOut();
    // stay on the marketing page after sign-out
  }

  // ── Feature comparison rows (data-driven so labels localize cleanly) ──
  type CmpCell = 'y' | 'n' | 'yp' | { text: string; pro?: boolean };
  const compareRows: Array<{ label: string; cells: [CmpCell, CmpCell, CmpCell]; tier?: 'pro' | 'proplus' }> = [
    { label: c.cmp_airspace,     cells: ['y', 'y', 'y'] },
    { label: c.cmp_weather,      cells: ['y', 'y', 'y'] },
    { label: c.cmp_forecast24,   cells: ['y', 'y', 'y'] },
    { label: c.cmp_laancStatus,  cells: ['y', 'y', 'y'] },
    { label: c.cmp_adsb,         cells: ['y', 'y', 'y'] },
    { label: c.cmp_cine,         cells: ['y', 'y', 'y'] },
    { label: c.cmp_compliance,   cells: ['y', 'y', 'y'] },
    { label: c.cmp_logs,         cells: [{ text: c.cmp_logs3 }, { text: c.cmp_unlimited, pro: true }, { text: c.cmp_unlimited, pro: true }] },
    { label: c.cmp_metar,        tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_forecast15,   tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_wind,         tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_laancGrid,    tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_wallet,       tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_profile,      tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_pdfExport,    tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_insights,     tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_bundle,       tier: 'pro',     cells: ['n', 'y', 'y'] },
    { label: c.cmp_briefings,    tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_tamper,       tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_decode,       tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_whitelabel,   tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_recurring,    tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_morning,      tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_observer,     tier: 'proplus', cells: ['n', 'n', 'yp'] },
    { label: c.cmp_priority,     tier: 'proplus', cells: ['n', 'n', 'yp'] },
  ];
  function renderCmpCell(cell: CmpCell): { tdClass?: string; content: React.ReactNode } {
    if (cell === 'y')  return { content: <span className="ci ci--yes">✓</span> };
    if (cell === 'n')  return { content: <span className="ci ci--no">—</span> };
    if (cell === 'yp') return { content: <span className="ci ci--yes ci--proplus">✓</span> };
    return { tdClass: 'ci-text' + (cell.pro ? ' ci-text--pro' : ''), content: cell.text };
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">✈</span> PreFlight 107
          </div>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={c.nav_toggleAria}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
            <li><a href="#features" onClick={() => setMenuOpen(false)}>{c.nav_features}</a></li>
            <li><a href="#logs" onClick={() => setMenuOpen(false)}>{c.nav_logs}</a></li>
            <li><a href="#pricing" onClick={() => setMenuOpen(false)}>{c.nav_pricing}</a></li>
            <li><a href={L('/compare')} onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/compare')); }}>{c.nav_compare}</a></li>
            <li><a href={L('/flyable')} onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/flyable')); }}>{c.nav_flyable}</a></li>
            <li><a href={L('/blog')} onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/blog')); }}>{c.nav_blog}</a></li>
            <li><a href={L('/help')} onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/help')); }}>{c.nav_help}</a></li>
            <li><a href={L('/support')} onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/support')); }}>{c.nav_support}</a></li>
            <li><a href="#download" className="nav-cta" onClick={() => setMenuOpen(false)}>{c.nav_downloadFree}</a></li>
            {user ? (
              <>
                <li>
                  <a
                    href={L('/dashboard')}
                    className="nav-auth-link"
                    onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/dashboard')); }}
                  >
                    {c.nav_dashboard}
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-auth-link nav-signout" onClick={e => { setMenuOpen(false); handleSignOut(e); }}>
                    {c.nav_signOut}
                  </a>
                </li>
              </>
            ) : (
              <li>
                <a
                  href={L('/login')}
                  className="nav-login-btn"
                  onClick={e => { e.preventDefault(); setMenuOpen(false); navigate(L('/login')); }}
                >
                  {c.nav_logIn}
                </a>
              </li>
            )}
            <li className="nav-lang"><LanguageToggle /></li>
          </ul>
        </div>
      </nav>

      <main id="main-content">

        {/* ── Hero ── */}
        <section className="hero" id="download">
          <div className="hero-content">
            <div className="hero-badge">{c.hero_badge}</div>
            <h1 className="hero-title">{c.hero_title}</h1>
            <p style={{ color: '#06B6D4', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.95rem', margin: '0.25rem 0 1.1rem' }}>Plan it. Fly it. Prove it.</p>
            <p className="hero-subtitle">
              {c.hero_subtitle}
              <span className="hero-subtitle-rec">{c.hero_subtitleRec}</span>
            </p>
            <div className="hero-actions">
              <a
                className="cta-button cta-button--download"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="cta-button-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.953 4.45z" />
                </svg>
                {c.hero_ctaDownload}
              </a>
              <button
                className="cta-button-secondary"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {c.hero_ctaTrial}
              </button>
            </div>
            <div className="hero-store-badges">
              <button className="cta-button" onClick={openBeta}>{c.hero_joinBeta}</button>
              <a
                className="store-badge store-badge--android-soon"
                href="#android"
                aria-label={c.hero_androidSoonAria}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.523 15.343a1.04 1.04 0 1 1 0-2.08 1.04 1.04 0 0 1 0 2.08m-11.046 0a1.04 1.04 0 1 1 0-2.08 1.04 1.04 0 0 1 0 2.08m11.42-6.034 2.073-3.59a.43.43 0 0 0-.745-.43l-2.099 3.636A12.97 12.97 0 0 0 12 7.79c-1.85 0-3.604.408-5.126 1.135L4.775 5.289a.43.43 0 1 0-.745.43l2.073 3.59C2.535 11.241.42 14.474 0 18.27h24c-.42-3.796-2.535-7.029-6.103-8.961" />
                </svg>
                <span className="store-badge-text">
                  <span className="store-badge-eyebrow">{c.hero_comingSoon}</span>
                  <span className="store-badge-name">{c.hero_onAndroid}</span>
                </span>
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gradient-orb"></div>
            <div className="hero-stat-cards">
              <div className="stat-card"><span className="stat-value">{c.hero_statBriefingsValue}</span><span className="stat-label">{c.hero_statBriefingsLabel}</span></div>
              <div className="stat-card"><span className="stat-value">{c.hero_statAdsbValue}</span><span className="stat-label">{c.hero_statAdsbLabel}</span></div>
              <div className="stat-card"><span className="stat-value">{c.hero_statCardValue}</span><span className="stat-label">{c.hero_statCardLabel}</span></div>
            </div>
          </div>
        </section>

        {/* ── Mission Briefings (flagship) ── */}
        <section className="briefings-section" id="briefings">
          <div className="briefings-inner">
            <div className="briefings-text">
              <div className="briefings-eyebrow-row">
                <span className="section-eyebrow">{c.brf_eyebrow}</span>
                <button
                  type="button"
                  className="briefings-help-btn"
                  onClick={() => setBriefingHelpOpen(true)}
                  aria-label={c.brf_helpAria}
                  title={c.brf_helpAria}
                >
                  <span className="briefings-help-icon">?</span>
                  <span className="briefings-help-label">{c.brf_helpLabel}</span>
                </button>
              </div>
              <h2>{c.brf_title}</h2>
              <p className="briefings-lede">
                {c.brf_lede}
              </p>
              <ul className="briefings-checklist">
                <li><span className="check">✓</span> {c.brf_check1}</li>
                <li><span className="check">✓</span> {c.brf_check2a} <code>/verify</code> {c.brf_check2b}</li>
                <li><span className="check">✓</span> {c.brf_check3}</li>
                <li><span className="check">✓</span> {c.brf_check4}</li>
                <li><span className="check">✓</span> {c.brf_check5}</li>
              </ul>
              <div className="briefings-actions">
                <a className="cta-button" href="#pricing">{c.brf_ctaPlans}</a>
                <a
                  className="cta-button-secondary"
                  href={L('/blog/what-is-a-mission-briefing-drone-pilots')}
                  onClick={e => { e.preventDefault(); navigate(L('/blog/what-is-a-mission-briefing-drone-pilots')); }}
                >
                  {c.brf_ctaReadPost}
                </a>
              </div>
            </div>
            <div className="briefings-visual">
              <div className="briefing-doc-preview">
                <div className="briefing-doc-header">
                  <span className="briefing-doc-eyebrow">{c.brf_docEyebrow}</span>
                  <span className="briefing-doc-code">MB-XKA5RC</span>
                </div>
                <div className="briefing-doc-meta">
                  <div><strong>{c.brf_docPilot}</strong> J. Doe · Part 107 #4117XXX</div>
                  <div><strong>{c.brf_docSite}</strong> 43.2342° N · 86.2484° W</div>
                  <div><strong>{c.brf_docWindow}</strong> {c.brf_docWindowVal}</div>
                </div>
                <div className="briefing-doc-section">
                  <div className="briefing-doc-row"><span className="bd-label">METAR</span><span className="bd-val bd-val--ok">VFR · 8 kt</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">TAF</span><span className="bd-val bd-val--ok">{c.brf_docTafVal}</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">SIGMETs</span><span className="bd-val">{c.brf_docSigmetVal}</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">NOTAMs</span><span className="bd-val">{c.brf_docNotamVal}</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">LAANC</span><span className="bd-val bd-val--ok">{c.brf_docLaancVal}</span></div>
                </div>
                <div className="briefing-doc-footer">
                  <span className="bd-hash">SHA-256 · 7f3a…b9e1</span>
                  <span className="bd-verify">{c.brf_docVerify}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Plan · Fly · Prove ── */}
        <section className="features" id="features">
          <h2>Plan it. Fly it. Prove it.</h2>
          <p className="features-subtitle">{c.feat_subtitle}</p>

          {/* PLAN bucket */}
          <div className="bucket-heading">
            <span className="bucket-pill bucket-pill--plan">{c.feat_bucketPlan}</span>
            <h3 className="bucket-title">{c.feat_bucketPlanTitle}</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card feature-card--ar">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">📄</div>
              <h3>{c.feat_briefingsTitle}</h3>
              <p>{c.feat_briefingsDesc}</p>
              <span className="feature-tag feature-tag--proplus">{c.tag_proplus}</span>
            </div>
            <div className="feature-card feature-card--forecast">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🛰️</div>
              <h3>{c.feat_metarTitle}</h3>
              <p>{c.feat_metarDesc}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">📅</div>
              <h3>{c.feat_recurringTitle}</h3>
              <p>{c.feat_recurringDesc}</p>
              <span className="feature-tag feature-tag--proplus">{c.tag_proplus}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🗺️</div>
              <h3>{c.feat_laancTitle}</h3>
              <p>{c.feat_laancDesc}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
          </div>

          {/* FLY bucket */}
          <div className="bucket-heading">
            <span className="bucket-pill bucket-pill--fly">{c.feat_bucketFly}</span>
            <h3 className="bucket-title">{c.feat_bucketFlyTitle}</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🎯</div>
              <h3>{c.feat_scoreTitle}</h3>
              <p>{c.feat_scoreDesc}</p>
              <span className="feature-tag feature-tag--free">{c.tag_free}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🏔️</div>
              <h3>{c.feat_densityTitle}</h3>
              <p>{c.feat_densityDesc}</p>
              <span className="feature-tag feature-tag--free">{c.tag_free}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">🤖</div>
              <h3>{c.feat_aiTitle}</h3>
              <p>{c.feat_aiDesc}</p>
              <span className="feature-tag feature-tag--proplus">{c.tag_proplus}</span>
            </div>
            <div className="feature-card feature-card--radar">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">📡</div>
              <h3>{c.feat_radarTitle}</h3>
              <p>{c.feat_radarDesc}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
            <div className="feature-card feature-card--forecast">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🌬️</div>
              <h3>{c.feat_windTitle}</h3>
              <p>{c.feat_windDesc}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🌤️</div>
              <h3>{c.feat_forecastTitle}</h3>
              <p>{c.feat_forecastDesc}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">🗺️</div>
              <h3>{c.feat_airspaceTitle}</h3>
              <p>{c.feat_airspaceDesc}</p>
              <span className="feature-tag feature-tag--free">{c.tag_free}</span>
            </div>
          </div>

          {/* PROVE bucket */}
          <div className="bucket-heading">
            <span className="bucket-pill bucket-pill--prove">{c.feat_bucketProve}</span>
            <h3 className="bucket-title">{c.feat_bucketProveTitle}</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🪪</div>
              <h3>{c.feat_walletTitle}</h3>
              <p>{c.feat_walletDesc}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🔗</div>
              <h3>{c.feat_profileTitle}</h3>
              <p>{c.feat_profileDescA} <code>/pilot/[code]</code> {c.feat_profileDescB}</p>
              <span className="feature-tag feature-tag--pro">{c.tag_pro}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🏢</div>
              <h3>{c.feat_whitelabelTitle}</h3>
              <p>{c.feat_whitelabelDesc}</p>
              <span className="feature-tag feature-tag--proplus">{c.tag_proplus}</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">🔐</div>
              <h3>{c.feat_tamperTitle}</h3>
              <p>{c.feat_tamperDescA} <code>preflight107.com/verify</code>.</p>
              <span className="feature-tag feature-tag--proplus">{c.tag_proplus}</span>
            </div>
          </div>
        </section>

        {/* ── Flight Logs ── */}
        <section className="logs-section" id="logs">
          <div className="logs-inner">
            <div className="logs-text">
              <span className="section-eyebrow">{c.logs_eyebrow}</span>
              <h2>{c.logs_title}</h2>
              <p>{c.logs_body}</p>
              <ul className="logs-checklist">
                <li><span className="check">✓</span> {c.logs_check1}</li>
                <li><span className="check">✓</span> {c.logs_check2}</li>
                <li><span className="check">✓</span> {c.logs_check3}</li>
                <li><span className="check">✓</span> {c.logs_check4}</li>
                <li><span className="check">✓</span> {c.logs_check5}</li>
                <li><span className="check check--free">✓</span> {c.logs_check6}</li>
              </ul>
            </div>
            <div className="logs-visual">
              <div className="log-card-preview">
                <div className="log-card-header">
                  <span className="log-icon">📋</span>
                  <div>
                    <div className="log-title">{c.logs_cardTitle}</div>
                    <div className="log-date">{c.logs_cardDate}</div>
                  </div>
                  <span className="log-status">VFR</span>
                </div>
                <div className="log-stats">
                  <div className="log-stat"><span className="log-stat-val">18 min</span><span className="log-stat-label">{c.logs_statDuration}</span></div>
                  <div className="log-stat"><span className="log-stat-val">72°F</span><span className="log-stat-label">{c.logs_statTemp}</span></div>
                  <div className="log-stat"><span className="log-stat-val">6 mph</span><span className="log-stat-label">{c.logs_statWind}</span></div>
                </div>
                <div className="log-drone-row">DJI Mini 4 Pro · Muskegon, MI</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="pricing-section" id="pricing">
          <h2>{c.pr_title}</h2>
          <p className="features-subtitle">{c.pr_subtitle}</p>

          <div className="billing-toggle">
            <button
              className={`billing-btn${billing === 'monthly' ? ' billing-btn--active' : ''}`}
              onClick={() => setBilling('monthly')}
            >{c.pr_monthly}</button>
            <button
              className={`billing-btn${billing === 'annual' ? ' billing-btn--active' : ''}`}
              onClick={() => setBilling('annual')}
            >{c.pr_annual} <span className="billing-save">{c.pr_save}</span></button>
          </div>

          <div className="pricing-grid pricing-grid--triple">

            {/* Free tier */}
            <div className="pricing-card pricing-card--free">
              <div className="pricing-tier">{c.pr_freeTier}</div>
              <div className="pricing-price">
                <span className="price-amount">{c.pr_freePrice}</span>
              </div>
              <p className="pricing-desc">{c.pr_freeDesc}</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> {c.pr_free1}</li>
                <li><span className="pi pi--yes">✓</span> {c.pr_free2}</li>
                <li><span className="pi pi--yes">✓</span> {c.pr_free3}</li>
                <li><span className="pi pi--yes">✓</span> {c.pr_free4}</li>
                <li><span className="pi pi--yes">✓</span> {c.pr_free5}</li>
                <li><span className="pi pi--yes">✓</span> {c.pr_free6}</li>
                <li><span className="pi pi--yes">✓</span> {c.pr_free7}</li>
              </ul>
              <a
                className="pricing-btn pricing-btn--free"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.pr_freeBtn}
              </a>
            </div>

            {/* Pro tier */}
            <div className="pricing-card pricing-card--pro">
              <div className="pricing-badge-pro">{c.pr_popular}</div>
              <div className="pricing-tier pricing-tier--pro">{c.pr_proTier}</div>
              <div className="pricing-price">
                {billing === 'monthly' ? (
                  <>
                    <span className="price-amount">$9.99</span>
                    <span className="price-period">{c.pr_perMo}</span>
                  </>
                ) : (
                  <>
                    <span className="price-amount">$79.99</span>
                    <span className="price-period">{c.pr_perYr}</span>
                    <span className="price-monthly-equiv">{c.pr_moEquivPro}</span>
                  </>
                )}
              </div>
              <p className="pricing-desc">{c.pr_proDesc}</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> {c.pr_pro1}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro2}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro3}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro4}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro5}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro6}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro7}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro8}</li>
                <li><span className="pi pi--yes pi--accent">✓</span> {c.pr_pro9}</li>
              </ul>
              <a
                className="pricing-btn pricing-btn--pro"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.pr_proBtn}
              </a>
            </div>

            {/* Pro+ tier */}
            <div className="pricing-card pricing-card--proplus">
              <div className="pricing-badge-proplus">{c.pr_proplusBadge}</div>
              <div className="pricing-tier pricing-tier--proplus">{c.pr_proplusTier}</div>
              <div className="pricing-price">
                {billing === 'monthly' ? (
                  <>
                    <span className="price-amount">$19.99</span>
                    <span className="price-period">{c.pr_perMo}</span>
                  </>
                ) : (
                  <>
                    <span className="price-amount">$159.99</span>
                    <span className="price-period">{c.pr_perYr}</span>
                    <span className="price-monthly-equiv">{c.pr_moEquivProPlus}</span>
                  </>
                )}
              </div>
              <p className="pricing-desc">{c.pr_proplusDesc}</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> {c.pr_pp1}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp2}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp3}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp4}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp5}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp6}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp7}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp8}</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> {c.pr_pp9}</li>
              </ul>
              <a
                className="pricing-btn pricing-btn--proplus"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.pr_proplusBtn}
              </a>
            </div>

          </div>

          <p className="pricing-fineprint">
            {c.pr_fineprint}
          </p>

          {/* Comparison table */}
          <div className="compare-wrap compare-wrap--triple">
            <h3 className="compare-title">{c.cmp_title}</h3>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{c.cmp_hFeature}</th>
                  <th>{c.cmp_hBasic}</th>
                  <th className="th-pro">{c.cmp_hPro}</th>
                  <th className="th-proplus">{c.cmp_hProplus}</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={row.tier === 'pro' ? 'compare-row--pro' : row.tier === 'proplus' ? 'compare-row--proplus' : undefined}
                  >
                    <td>{row.label}</td>
                    {row.cells.map((cell, ci) => {
                      const r = renderCmpCell(cell);
                      return <td key={ci} className={r.tdClass}>{r.content}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Android Early Access */}
        <section className="android-section" id="android">
          <div className="android-inner">
            <div className="android-play-badge">
              <svg className="android-play-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 20.5v-17c0-.83 1.01-1.3 1.63-.75L19.4 11.25a1 1 0 0 1 0 1.5L4.63 21.25C4.01 21.8 3 21.33 3 20.5z" />
              </svg>
              <span className="android-play-label">
                <span className="android-play-get">{c.and_badge}</span>
                <span className="android-play-store">Google Play</span>
              </span>
            </div>
            <h2 className="android-title">{c.and_title}</h2>
            <p className="android-sub">
              {c.and_sub}
            </p>
            {androidStatus === 'success' ? (
              <div className="android-success">
                <span className="android-success-icon">✓</span>
                {c.and_success}
              </div>
            ) : (
              <form className="android-form" onSubmit={handleAndroidSignup}>
                <input
                  className="android-email-input"
                  type="email"
                  placeholder={c.and_emailPlaceholder}
                  value={androidEmail}
                  onChange={e => setAndroidEmail(e.target.value)}
                  required
                  disabled={androidStatus === 'loading'}
                />
                <button
                  className="android-submit-btn"
                  type="submit"
                  disabled={androidStatus === 'loading'}
                >
                  {androidStatus === 'loading' ? c.and_sending : c.and_notify}
                </button>
              </form>
            )}
            {androidStatus === 'error' && (
              <p className="android-error">{c.and_error}</p>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="section-title">{c.faq_title}</h2>
          <div className="faq-list">
            {c.faq.map((item, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-question">{item.q}</summary>
                <p className="faq-answer" dangerouslySetInnerHTML={{ __html: item.a }} />
              </details>
            ))}
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><span style={{color: 'var(--accent)'}}>✈</span> PreFlight 107</div>
          <p className="footer-tagline">{c.ft_tagline}</p>
          <div className="footer-social">
            <a
              className="footer-social-link"
              href="https://x.com/PreFlight107"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.ft_ariaX}
            >
              <svg className="footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
            </a>
            <a
              className="footer-social-link"
              href="https://www.facebook.com/share/14dxM5aBE87/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.ft_ariaFb}
            >
              <svg className="footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
            <a
              className="footer-social-link"
              href="https://www.reddit.com/r/PreFlight107/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.ft_ariaReddit}
            >
              <svg className="footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12c-.688 0-1.25.561-1.25 1.25 0 .687.562 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </a>
            <a
              className="footer-social-link"
              href="https://www.instagram.com/preflight107/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.ft_ariaIg}
            >
              <svg className="footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
          <div className="footer-legal-links">
            <a href={L('/privacy')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/privacy')); }}>{c.ft_privacy}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/terms')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/terms')); }}>{c.ft_terms}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/support')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/support')); }}>{c.ft_support}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/delete-account')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/delete-account')); }}>{c.ft_delete}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/blog')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/blog')); }}>{c.ft_blog}</a>
            <a href={L('/help')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/help')); }}>{c.ft_help}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/flyable')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/flyable')); }}>{c.ft_flyable}</a>
          </div>
          <p className="footer-copy">{c.ft_copy}</p>
        </div>
      </footer>

      {briefingHelpOpen && (
        <div
          className="brief-help-backdrop"
          onClick={() => setBriefingHelpOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={c.brf_helpAria}
        >
          <div className="brief-help-sheet" onClick={e => e.stopPropagation()}>
            <header className="brief-help-header">
              <div>
                <h2 className="brief-help-title">{c.bh_title}</h2>
                <p className="brief-help-subtitle">{c.bh_subtitle}</p>
              </div>
              <button className="brief-help-close" onClick={() => setBriefingHelpOpen(false)} aria-label={c.bh_close}>✕</button>
            </header>

            <div className="brief-help-scroll">
              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--gold">?</span>
                  <h3 className="brief-help-section-title">{c.bh_s1Title}</h3>
                </div>
                <p className="brief-help-body">
                  {c.bh_s1Body}
                </p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--green">✓</span>
                  <h3 className="brief-help-section-title">{c.bh_s2Title}</h3>
                </div>
                <ul className="brief-help-list">
                  <li><span className="bh-yes">✓</span> {c.bh_s2a}</li>
                  <li><span className="bh-yes">✓</span> {c.bh_s2b}</li>
                  <li><span className="bh-yes">✓</span> {c.bh_s2c}</li>
                  <li><span className="bh-no">✗</span> {c.bh_s2d}</li>
                </ul>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--blue">🕒</span>
                  <h3 className="brief-help-section-title">{c.bh_s3Title}</h3>
                </div>
                <p className="brief-help-body">
                  {c.bh_s3Body}
                </p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--gold">📍</span>
                  <h3 className="brief-help-section-title">{c.bh_s4Title}</h3>
                </div>
                <ol className="brief-help-steps">
                  <li dangerouslySetInnerHTML={{ __html: c.bh_s4step1 }} />
                  <li dangerouslySetInnerHTML={{ __html: c.bh_s4step2 }} />
                  <li dangerouslySetInnerHTML={{ __html: c.bh_s4step3 }} />
                </ol>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--green">🔒</span>
                  <h3 className="brief-help-section-title">{c.bh_s5Title}</h3>
                </div>
                <p className="brief-help-body">
                  {c.bh_s5Body1}
                </p>
                <p className="brief-help-body">
                  {c.bh_s5Body2}
                </p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--blue">⇄</span>
                  <h3 className="brief-help-section-title">{c.bh_s6Title}</h3>
                </div>
                <p className="brief-help-body">
                  {c.bh_s6Body}
                </p>
                <div className="brief-help-compare">
                  <div className="brief-help-compare-col">
                    <div className="brief-help-compare-h" dangerouslySetInnerHTML={{ __html: c.bh_s6ColAh }} />
                    <ul>
                      <li>{c.bh_s6ColA1}</li>
                      <li>{c.bh_s6ColA2}</li>
                      <li>{c.bh_s6ColA3}</li>
                    </ul>
                  </div>
                  <div className="brief-help-compare-col">
                    <div className="brief-help-compare-h" dangerouslySetInnerHTML={{ __html: c.bh_s6ColBh }} />
                    <ul>
                      <li>{c.bh_s6ColB1}</li>
                      <li>{c.bh_s6ColB2}</li>
                      <li>{c.bh_s6ColB3}</li>
                    </ul>
                  </div>
                </div>
                <p className="brief-help-body">{c.bh_s6Footer}</p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--muted">⚙</span>
                  <h3 className="brief-help-section-title">{c.bh_s7Title}</h3>
                </div>
                <p className="brief-help-body">
                  {c.bh_s7Body}
                </p>
              </section>
            </div>

            <footer className="brief-help-footer">
              <button className="brief-help-cta" onClick={() => setBriefingHelpOpen(false)}>{c.bh_cta}</button>
            </footer>
          </div>
        </div>
      )}

      {betaOpen && (
        <div
          className="beta-modal-backdrop"
          onClick={() => setBetaOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={c.beta_ariaLabel}
        >
          <div className="beta-modal-card" onClick={e => e.stopPropagation()}>
            <button className="beta-modal-close" onClick={() => setBetaOpen(false)} aria-label={c.bh_close}>✕</button>
            {betaStatus === 'success' ? (
              <div className="beta-modal-success">
                <span className="beta-modal-success-icon">✓</span>
                {c.beta_success}
              </div>
            ) : (
              <>
                <div className="android-play-badge" style={{ margin: '0 auto 1rem' }}>
                  <svg className="android-play-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                  <span className="android-play-label">
                    <span className="android-play-get">{c.beta_earlyAccess}</span>
                    <span className="android-play-store">{c.beta_iosBeta}</span>
                  </span>
                </div>
                <h2 className="beta-modal-title">{c.beta_title}</h2>
                <p className="beta-modal-sub">
                  {c.beta_sub}
                </p>
                <form className="beta-modal-form" onSubmit={handleBetaSignup}>
                  <input
                    className="android-email-input"
                    type="text"
                    placeholder={c.beta_namePlaceholder}
                    value={betaName}
                    onChange={e => setBetaName(e.target.value)}
                    required
                    disabled={betaStatus === 'loading'}
                    autoFocus
                  />
                  <input
                    className="android-email-input"
                    type="email"
                    placeholder={c.beta_emailPlaceholder}
                    value={betaEmail}
                    onChange={e => setBetaEmail(e.target.value)}
                    required
                    disabled={betaStatus === 'loading'}
                  />
                  <button
                    className="android-submit-btn"
                    type="submit"
                    disabled={betaStatus === 'loading'}
                  >
                    {betaStatus === 'loading' ? c.beta_sending : c.beta_request}
                  </button>
                </form>
                {betaStatus === 'error' && (
                  <p className="android-error">{c.beta_error}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
