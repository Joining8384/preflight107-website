import React, { useEffect, useState } from 'react';
import './App.css';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';

function App() {
  const { user, signOut } = useAuth();
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
      const body = `FIRSTNAME=${encodeURIComponent(betaName)}&EMAIL=${encodeURIComponent(betaEmail)}&PLATFORM=iOS&email_address_check=&locale=en`;
      const res = await fetch(BETA_BREVO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (res.status < 400) {
        setBetaStatus('success');
        setTimeout(() => { setBetaOpen(false); setBetaStatus('idle'); }, 2500);
      } else {
        setBetaStatus('error');
      }
    } catch {
      setBetaStatus('error');
    }
  }

  async function handleAndroidSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!androidEmail.includes('@')) return;
    setAndroidStatus('loading');
    try {
      const body = `EMAIL=${encodeURIComponent(androidEmail)}&PLATFORM=Android&email_address_check=&locale=en`;
      const res = await fetch(BREVO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      setAndroidStatus(res.status < 400 ? 'success' : 'error');
    } catch {
      setAndroidStatus('error');
    }
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    await signOut();
    // stay on the marketing page after sign-out
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
            aria-label="Toggle navigation"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
            <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li><a href="#logs" onClick={() => setMenuOpen(false)}>Flight Logs</a></li>
            <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
            <li><a href="/compare" onClick={e => { e.preventDefault(); setMenuOpen(false); navigate('/compare'); }}>Compare</a></li>
            <li><a href="/blog" onClick={e => { e.preventDefault(); setMenuOpen(false); navigate('/blog'); }}>Blog</a></li>
            <li><a href="/support" onClick={e => { e.preventDefault(); setMenuOpen(false); navigate('/support'); }}>Support</a></li>
            <li><a href="#download" className="nav-cta" onClick={() => setMenuOpen(false)}>Download Free</a></li>
            {user ? (
              <>
                <li>
                  <a
                    href="/dashboard"
                    className="nav-auth-link"
                    onClick={e => { e.preventDefault(); setMenuOpen(false); navigate('/dashboard'); }}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-auth-link nav-signout" onClick={e => { setMenuOpen(false); handleSignOut(e); }}>
                    Sign Out
                  </a>
                </li>
              </>
            ) : (
              <li>
                <a
                  href="/login"
                  className="nav-login-btn"
                  onClick={e => { e.preventDefault(); setMenuOpen(false); navigate('/login'); }}
                >
                  Log In
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <main id="main-content">

        {/* ── Hero ── */}
        <section className="hero" id="download">
          <div className="hero-content">
            <div className="hero-badge">For Part 107 Pilots</div>
            <h1 className="hero-title">Plan it. Fly it. Prove it.</h1>
            <p className="hero-subtitle">
              The Part 107 operations platform — file FAA-style Mission Briefings, fly with
              live ADS-B and aviation weather, and share a verifiable digital pilot card with every client.
            </p>
            <div className="hero-actions">
              <a
                className="cta-button"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Free
              </a>
              <button
                className="cta-button-secondary"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Pro →
              </button>
            </div>
            <div className="hero-store-badges">
              <a
                className="store-badge store-badge--apple"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download PreFlight 107 on the App Store"
              >
                <img src="/app-store-badge.svg" alt="Download on the App Store" />
              </a>
              <button className="cta-button" onClick={openBeta}>Join iOS Beta</button>
              <a
                className="store-badge store-badge--android-soon"
                href="#android"
                aria-label="Android version coming soon — join the waitlist"
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
                  <span className="store-badge-eyebrow">Coming Soon</span>
                  <span className="store-badge-name">on Android</span>
                </span>
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gradient-orb"></div>
            <div className="hero-stat-cards">
              <div className="stat-card"><span className="stat-value">FAA-Style</span><span className="stat-label">Mission Briefings</span></div>
              <div className="stat-card"><span className="stat-value">Live</span><span className="stat-label">ADS-B Traffic</span></div>
              <div className="stat-card"><span className="stat-value">Verifiable</span><span className="stat-label">Pilot Card</span></div>
            </div>
          </div>
        </section>

        {/* ── Mission Briefings (flagship) ── */}
        <section className="briefings-section" id="briefings">
          <div className="briefings-inner">
            <div className="briefings-text">
              <div className="briefings-eyebrow-row">
                <span className="section-eyebrow">New · Pro+</span>
                <button
                  type="button"
                  className="briefings-help-btn"
                  onClick={() => setBriefingHelpOpen(true)}
                  aria-label="How Mission Briefings work"
                  title="How Mission Briefings work"
                >
                  <span className="briefings-help-icon">?</span>
                  <span className="briefings-help-label">How does this work?</span>
                </button>
              </div>
              <h2>FAA-Style Mission Briefings</h2>
              <p className="briefings-lede">
                One tap generates a tamper-evident, multi-page Pre-Flight Briefing PDF — the same kind
                of document manned-aviation flight departments file. Live METAR/TAF, SIGMETs, AIRMETs,
                PIREPs, NOTAMs, sun &amp; civil twilight times, LAANC status, and your full pilot/aircraft block.
              </p>
              <ul className="briefings-checklist">
                <li><span className="check">✓</span> Plain-English weather decode alongside the raw codes</li>
                <li><span className="check">✓</span> SHA-256 tamper hash + public <code>/verify</code> page</li>
                <li><span className="check">✓</span> White-label "Client Mode" — your logo, your branding</li>
                <li><span className="check">✓</span> Recurring briefings on schedule (Pro+)</li>
                <li><span className="check">✓</span> Public profile link clients can verify in any browser</li>
              </ul>
              <div className="briefings-actions">
                <a className="cta-button" href="#pricing">See Pro+ Plans →</a>
                <a
                  className="cta-button-secondary"
                  href="/blog/what-is-a-mission-briefing-drone-pilots"
                  onClick={e => { e.preventDefault(); navigate('/blog/what-is-a-mission-briefing-drone-pilots'); }}
                >
                  Read the briefing post
                </a>
              </div>
            </div>
            <div className="briefings-visual">
              <div className="briefing-doc-preview">
                <div className="briefing-doc-header">
                  <span className="briefing-doc-eyebrow">PRE-FLIGHT MISSION BRIEFING</span>
                  <span className="briefing-doc-code">MB-XKA5RC</span>
                </div>
                <div className="briefing-doc-meta">
                  <div><strong>Pilot:</strong> J. Doe · Part 107 #4117XXX</div>
                  <div><strong>Site:</strong> 43.2342° N · 86.2484° W</div>
                  <div><strong>Window:</strong> 14:00–16:30 local</div>
                </div>
                <div className="briefing-doc-section">
                  <div className="briefing-doc-row"><span className="bd-label">METAR</span><span className="bd-val bd-val--ok">VFR · 8 kt</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">TAF</span><span className="bd-val bd-val--ok">VFR window</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">SIGMETs</span><span className="bd-val">None active</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">NOTAMs</span><span className="bd-val">2 reviewed</span></div>
                  <div className="briefing-doc-row"><span className="bd-label">LAANC</span><span className="bd-val bd-val--ok">Auto-approve</span></div>
                </div>
                <div className="briefing-doc-footer">
                  <span className="bd-hash">SHA-256 · 7f3a…b9e1</span>
                  <span className="bd-verify">verify at /verify</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Plan · Fly · Prove ── */}
        <section className="features" id="features">
          <h2>Plan it. Fly it. Prove it.</h2>
          <p className="features-subtitle">Everything a commercial Part 107 operation needs, in one app.</p>

          {/* PLAN bucket */}
          <div className="bucket-heading">
            <span className="bucket-pill bucket-pill--plan">Plan</span>
            <h3 className="bucket-title">Pre-flight, briefings, and authorization</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card feature-card--ar">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">📄</div>
              <h3>Mission Briefings</h3>
              <p>Tamper-evident PDF briefings with weather, hazards, NOTAMs, LAANC status, and pilot block — generated in seconds and verifiable by anyone.</p>
              <span className="feature-tag feature-tag--proplus">Pro+</span>
            </div>
            <div className="feature-card feature-card--forecast">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🛰️</div>
              <h3>METAR / TAF / SIGMET</h3>
              <p>Full aviation weather product suite with decoded plain-English versions alongside the raw codes — the same intel manned pilots use.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">📅</div>
              <h3>Recurring Briefings</h3>
              <p>Schedule a daily or weekly briefing for a recurring site (inspection routes, surveys, real-estate beats). Delivered automatically.</p>
              <span className="feature-tag feature-tag--proplus">Pro+</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🗺️</div>
              <h3>LAANC Grid Overlays</h3>
              <p>UAS facility map overlays show ceiling limits and authorization status before you ever open the LAANC portal.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
          </div>

          {/* FLY bucket */}
          <div className="bucket-heading">
            <span className="bucket-pill bucket-pill--fly">Fly</span>
            <h3 className="bucket-title">In-flight awareness and weather</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card feature-card--radar">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">📡</div>
              <h3>Live ADS-B Radar</h3>
              <p>Real-time manned aircraft tracking on your map with proximity warnings. Never share airspace unexpectedly — see every plane around you, live.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
            <div className="feature-card feature-card--forecast">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🌬️</div>
              <h3>3D Wind Tower</h3>
              <p>Visualize wind speed and direction at multiple altitudes in a 3D tower view. Know what the wind is doing at 50ft, 100ft, and 400ft before you climb.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🌤️</div>
              <h3>15-Day Forecast</h3>
              <p>High-resolution atmospheric model data extended out two weeks. Plan job windows around the weather you'll actually have.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">🗺️</div>
              <h3>Live Airspace Map</h3>
              <p>Class B/C/D/E airspace, restricted zones, TFRs, and your current position — included free, forever.</p>
              <span className="feature-tag feature-tag--free">Free</span>
            </div>
          </div>

          {/* PROVE bucket */}
          <div className="bucket-heading">
            <span className="bucket-pill bucket-pill--prove">Prove</span>
            <h3 className="bucket-title">Records, credentials, and client deliverables</h3>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🪪</div>
              <h3>Apple Wallet Pilot Card</h3>
              <p>A real PassKit card with your Part 107 number, account code, and a tap-to-verify link. Hand a client your phone and they see your credentials.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--green"></div>
              <div className="feature-icon">🔗</div>
              <h3>Public Pilot Profile</h3>
              <p>A shareable web profile at <code>/pilot/[code]</code> any client can open in any browser. Verified Part 107 badge, flight history, hour count.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🏢</div>
              <h3>White-Label Client Mode</h3>
              <p>Swap PreFlight 107 branding for your own business logo on briefing PDFs. Hand clients a polished deliverable that looks like your company.</p>
              <span className="feature-tag feature-tag--proplus">Pro+</span>
            </div>
            <div className="feature-card">
              <div className="feature-accent-bar feature-accent-bar--purple"></div>
              <div className="feature-icon">🔐</div>
              <h3>Tamper-Evident PDFs</h3>
              <p>Every briefing carries a SHA-256 hash and a unique briefing code. Anyone can verify authenticity at <code>preflight107.com/verify</code>.</p>
              <span className="feature-tag feature-tag--proplus">Pro+</span>
            </div>
          </div>
        </section>

        {/* ── Flight Logs ── */}
        <section className="logs-section" id="logs">
          <div className="logs-inner">
            <div className="logs-text">
              <span className="section-eyebrow">Cloud-Synced</span>
              <h2>Your Flight Logbook, Always with You</h2>
              <p>Tap "Log Flight" when you're done in the field and PreFlight 107 does the heavy lifting. Your GPS coordinates, drone model, live wind speed, temperature, and insurance details are all pre-filled automatically — you just add your flight time, mission notes, and you're done.</p>
              <ul className="logs-checklist">
                <li><span className="check">✓</span> GPS coordinates auto-filled at log time</li>
                <li><span className="check">✓</span> Live wind speed &amp; temperature pulled from weather data</li>
                <li><span className="check">✓</span> Active drone model pre-populated automatically</li>
                <li><span className="check">✓</span> Insurance details synced from your pilot profile</li>
                <li><span className="check">✓</span> Export any log as a shareable PDF report</li>
                <li><span className="check check--free">✓</span> 3 free logs — unlimited with Pro</li>
              </ul>
            </div>
            <div className="logs-visual">
              <div className="log-card-preview">
                <div className="log-card-header">
                  <span className="log-icon">📋</span>
                  <div>
                    <div className="log-title">Flight Log #047</div>
                    <div className="log-date">Mar 24, 2026 · 9:41 AM</div>
                  </div>
                  <span className="log-status">VFR</span>
                </div>
                <div className="log-stats">
                  <div className="log-stat"><span className="log-stat-val">18 min</span><span className="log-stat-label">Duration</span></div>
                  <div className="log-stat"><span className="log-stat-val">72°F</span><span className="log-stat-label">Temp</span></div>
                  <div className="log-stat"><span className="log-stat-val">6 mph</span><span className="log-stat-label">Wind</span></div>
                </div>
                <div className="log-drone-row">DJI Mini 4 Pro · Muskegon, MI</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="pricing-section" id="pricing">
          <h2>Choose Your Plan</h2>
          <p className="features-subtitle">Start free. Upgrade when you're ready to fly further.</p>

          <div className="billing-toggle">
            <button
              className={`billing-btn${billing === 'monthly' ? ' billing-btn--active' : ''}`}
              onClick={() => setBilling('monthly')}
            >Monthly</button>
            <button
              className={`billing-btn${billing === 'annual' ? ' billing-btn--active' : ''}`}
              onClick={() => setBilling('annual')}
            >Annual <span className="billing-save">Save 33%</span></button>
          </div>

          <div className="pricing-grid pricing-grid--triple">

            {/* Free tier */}
            <div className="pricing-card pricing-card--free">
              <div className="pricing-tier">Basic</div>
              <div className="pricing-price">
                <span className="price-amount">Free</span>
              </div>
              <p className="pricing-desc">Everything you need to get up in the air.</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> Live Airspace Map (Class B/C/D/E)</li>
                <li><span className="pi pi--yes">✓</span> Live ADS-B Radar</li>
                <li><span className="pi pi--yes">✓</span> Current Weather Dashboard</li>
                <li><span className="pi pi--yes">✓</span> 24-hr Forecast</li>
                <li><span className="pi pi--yes">✓</span> LAANC Status Lookup</li>
                <li><span className="pi pi--yes">✓</span> Cinematographer's Forecast</li>
                <li><span className="pi pi--yes">✓</span> 3 Flight Logs</li>
              </ul>
              <a
                className="pricing-btn pricing-btn--free"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Free
              </a>
            </div>

            {/* Pro tier */}
            <div className="pricing-card pricing-card--pro">
              <div className="pricing-badge-pro">Most Popular</div>
              <div className="pricing-tier pricing-tier--pro">Pro Pilot</div>
              <div className="pricing-price">
                {billing === 'monthly' ? (
                  <>
                    <span className="price-amount">$9.99</span>
                    <span className="price-period">/mo</span>
                  </>
                ) : (
                  <>
                    <span className="price-amount">$79.99</span>
                    <span className="price-period">/yr</span>
                    <span className="price-monthly-equiv">$6.67/mo</span>
                  </>
                )}
              </div>
              <p className="pricing-desc">For the working Part 107 pilot. Unlimited flying, full aviation weather, verified pilot card.</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> Everything in Basic</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Live ADS-B Radar</li>
                <li><span className="pi pi--yes pi--accent">✓</span> METAR / TAF / SIGMET</li>
                <li><span className="pi pi--yes pi--accent">✓</span> 15-Day Forecast</li>
                <li><span className="pi pi--yes pi--accent">✓</span> 3D Wind Tower</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Unlimited Flight Logs</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Apple Wallet Pilot Card</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Public Pilot Profile</li>
              </ul>
              <a
                className="pricing-btn pricing-btn--pro"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Pro Pilot →
              </a>
            </div>

            {/* Pro+ tier */}
            <div className="pricing-card pricing-card--proplus">
              <div className="pricing-badge-proplus">For Commercial Ops</div>
              <div className="pricing-tier pricing-tier--proplus">Pro+ Operator</div>
              <div className="pricing-price">
                {billing === 'monthly' ? (
                  <>
                    <span className="price-amount">$19.99</span>
                    <span className="price-period">/mo</span>
                  </>
                ) : (
                  <>
                    <span className="price-amount">$159.99</span>
                    <span className="price-period">/yr</span>
                    <span className="price-monthly-equiv">$13.33/mo</span>
                  </>
                )}
              </div>
              <p className="pricing-desc">For pilots who deliver to clients. Mission Briefings, white-label PDFs, and recurring schedules.</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> Everything in Pro Pilot</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> FAA-Style Mission Briefings</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> Tamper-Evident PDFs + /verify</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> Plain-English Weather Decode</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> White-Label Client Mode</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> Recurring Briefings</li>
                <li><span className="pi pi--yes pi--proplus">✓</span> Priority Support</li>
              </ul>
              <a
                className="pricing-btn pricing-btn--proplus"
                href="https://apps.apple.com/app/preflight-107/id6760437132"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Pro+ Operator →
              </a>
            </div>

          </div>

          <p className="pricing-fineprint">
            Subscriptions are managed inside the app via your Apple ID — tap a plan to download, then pick your tier on the in-app paywall. Cancel anytime in Settings.
          </p>

          {/* Comparison table */}
          <div className="compare-wrap compare-wrap--triple">
            <h3 className="compare-title">Full Feature Comparison</h3>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Basic</th>
                  <th className="th-pro">Pro Pilot</th>
                  <th className="th-proplus">Pro+ Operator</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Live Airspace Map</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Current Weather</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>24-hr Forecast</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>LAANC Status Lookup</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Live ADS-B Radar</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Cinematographer's Forecast</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Flight Logs</td><td className="ci-text">3 logs</td><td className="ci-text ci-text--pro">Unlimited</td><td className="ci-text ci-text--pro">Unlimited</td></tr>
                <tr className="compare-row--pro"><td>METAR / TAF / SIGMET</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>15-Day Forecast</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>3D Wind Tower</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>LAANC Grid Overlays</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>Apple Wallet Pilot Card</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>Public Pilot Profile</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>PDF Log Exports</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--proplus"><td>Mission Briefings (PDF)</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes ci--proplus">✓</span></td></tr>
                <tr className="compare-row--proplus"><td>Tamper Hash + /verify</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes ci--proplus">✓</span></td></tr>
                <tr className="compare-row--proplus"><td>Plain-English Decode</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes ci--proplus">✓</span></td></tr>
                <tr className="compare-row--proplus"><td>White-Label Client Mode</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes ci--proplus">✓</span></td></tr>
                <tr className="compare-row--proplus"><td>Recurring Briefings</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes ci--proplus">✓</span></td></tr>
                <tr className="compare-row--proplus"><td>Priority Support</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes ci--proplus">✓</span></td></tr>
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
                <span className="android-play-get">Available Soon on</span>
                <span className="android-play-store">Google Play</span>
              </span>
            </div>
            <h2 className="android-title">Android Early Access</h2>
            <p className="android-sub">
              Android support is actively in development. Drop your email and you'll be the first to know when we launch.
            </p>
            {androidStatus === 'success' ? (
              <div className="android-success">
                <span className="android-success-icon">✓</span>
                You're on the list! We'll notify you as soon as the Android version takes flight.
              </div>
            ) : (
              <form className="android-form" onSubmit={handleAndroidSignup}>
                <input
                  className="android-email-input"
                  type="email"
                  placeholder="your@email.com"
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
                  {androidStatus === 'loading' ? 'Sending…' : 'Notify Me'}
                </button>
              </form>
            )}
            {androidStatus === 'error' && (
              <p className="android-error">Something went wrong — please try again.</p>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary className="faq-question">Do I need an FAA Part 107 certificate to use this?</summary>
              <p className="faq-answer">No certificate required to use the app. PreFlight 107 is free to download and use by anyone. An FAA Part 107 Remote Pilot Certificate is required only if you fly commercially — the app simply helps you fly smarter, whether you're recreational or certified.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Is the app free?</summary>
              <p className="faq-answer">Yes. The core features — airspace map, basic weather, and LAANC status — are completely free. <strong>Pro Pilot</strong> ($9.99/month or $79.99/year) unlocks ADS-B live traffic radar, METAR/TAF briefings, 3D Wind Tower, the Apple Wallet pilot card, and unlimited flight logs. <strong>Pro+ Operator</strong> ($19.99/month or $159.99/year) adds FAA-style Mission Briefings, tamper-evident PDFs, white-label client mode, and recurring briefings.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What is a Mission Briefing?</summary>
              <p className="faq-answer">A Mission Briefing is a multi-page, FAA-style pre-flight PDF generated by the app in seconds. It pulls live METAR/TAF, SIGMETs, AIRMETs, PIREPs, NOTAMs, sun &amp; civil twilight times, and LAANC status for your site and combines it with your pilot/aircraft block. Every briefing carries a SHA-256 tamper hash and a unique briefing code, so anyone can verify it at <a href="/verify">preflight107.com/verify</a>. It's a Pro+ feature designed for commercial pilots who need to hand clients real documentation.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What is White-Label Client Mode?</summary>
              <p className="faq-answer">Pro+ subscribers can upload a business logo and toggle "Client Mode" on any Mission Briefing. The output PDF swaps PreFlight 107 branding for yours, so the deliverable your client receives looks like it came from your company — not from an app. Great for inspection, real-estate, mapping, and survey operators who bill clients directly.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Can clients verify a briefing or pilot card I share?</summary>
              <p className="faq-answer">Yes. Every Mission Briefing PDF includes a briefing code (like MB-XKA5RC) and a SHA-256 hash. Anyone can paste those into <a href="/verify">preflight107.com/verify</a> in a browser and confirm the briefing is authentic and unmodified. Your Apple Wallet pilot card and public profile (<code>preflight107.com/pilot/[code]</code>) are also verifiable — clients can open the link without installing anything.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What is LAANC?</summary>
              <p className="faq-answer">LAANC (Low Altitude Authorization and Notification Capability) is the FAA's automated system for granting near-real-time airspace authorization to drone pilots. Instead of waiting days for manual approval, LAANC lets you get cleared to fly in controlled airspace in seconds — directly inside PreFlight 107.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What is ADS-B?</summary>
              <p className="faq-answer">ADS-B (Automatic Dependent Surveillance–Broadcast) is a technology that lets aircraft broadcast their position, altitude, speed, and tail number in real time. PreFlight 107 Pro pulls live ADS-B data so you can see manned aircraft sharing your airspace before you take off.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Does it work on Android?</summary>
              <p className="faq-answer">PreFlight 107 is currently available on iOS (iPhone and iPad). Android support is actively in development — sign up in the section above to be the first to know when we launch.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">How do I sign up?</summary>
              <p className="faq-answer">Download PreFlight 107 free from the App Store, then create an account directly in the app. Pro upgrades are handled through your Apple ID — no separate billing account needed.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Can I use it offline?</summary>
              <p className="faq-answer">The base map tiles are cached for offline viewing. Live features — ADS-B radar, real-time weather, and LAANC authorization — require an active internet connection.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Where does your weather data come from?</summary>
              <p className="faq-answer">PreFlight 107 pulls aviation weather directly from the National Weather Service (NWS) and NOAA data feeds — the same sources used by professional aviation weather services. METARs and TAFs are sourced from official ASOS/AWOS stations, and the 15-day extended forecast uses high-resolution atmospheric model data.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Where does ADS-B data come from?</summary>
              <p className="faq-answer">Live ADS-B data is sourced from a network of ground-based receivers that collect aircraft transponder broadcasts in real time. The data is aggregated from FAA and community ADS-B networks, giving you comprehensive manned traffic awareness across most of the United States.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Is my flight data private?</summary>
              <p className="faq-answer">Yes. Your flight logs are stored securely in your account and are never shared with third parties, the FAA, or anyone else. You control your data — logs are only visible to you unless you choose to export or share them. See our Privacy Policy for full details.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Do flight logs help with FAA record-keeping?</summary>
              <p className="faq-answer">Yes. Part 107 commercial pilots are expected to maintain records of their operations. PreFlight 107's cloud-synced flight logs let you record location, date, duration, drone details, and notes in one place — making it straightforward to stay organized and retrieve records when needed.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">How is this different from AirMap or Aloft?</summary>
              <p className="faq-answer">PreFlight 107 is built around the full preflight intelligence workflow: real aviation weather (METAR, TAF, PIREPs), live ADS-B traffic, 3D wind analysis, and cloud-synced flight logs — all in one place. Where other tools focus primarily on airspace authorization, PreFlight 107 layers in the weather and situational awareness data that professional pilots actually depend on before and during every flight.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Can I share flight logs with clients?</summary>
              <p className="faq-answer">Pro subscribers can export flight logs as professional PDF reports — including weather conditions at flight time, drone details, flight duration, and location. These are ideal for sharing with clients as proof of flight, for insurance documentation, or for project records.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Can I access my data on the web?</summary>
              <p className="faq-answer">Yes — PreFlight 107 has a web dashboard you can access right from this site. Create an account or log in and you'll be able to view your saved flight logs, drone info, and account details from any browser, synced with what's in the app.</p>
            </details>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><span style={{color: 'var(--accent)'}}>✈</span> PreFlight 107</div>
          <p className="footer-tagline">Fly safe out there.</p>
          <div className="footer-social">
            <a
              className="footer-social-link"
              href="https://x.com/PreFlight107"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow PreFlight 107 on X"
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
              aria-label="Follow PreFlight 107 on Facebook"
            >
              <svg className="footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          </div>
          <div className="footer-legal-links">
            <a href="/privacy" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
            <span className="footer-legal-sep">·</span>
            <a href="/terms" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
            <span className="footer-legal-sep">·</span>
            <a href="/support" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/support'); }}>Support</a>
            <span className="footer-legal-sep">·</span>
            <a href="/delete-account" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/delete-account'); }}>Delete Account</a>
            <span className="footer-legal-sep">·</span>
            <a href="/blog" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/blog'); }}>Blog</a>
          </div>
          <p className="footer-copy">&copy; 2026 PreFlight 107. All rights reserved.</p>
        </div>
      </footer>

      {briefingHelpOpen && (
        <div
          className="brief-help-backdrop"
          onClick={() => setBriefingHelpOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="How Mission Briefings work"
        >
          <div className="brief-help-sheet" onClick={e => e.stopPropagation()}>
            <header className="brief-help-header">
              <div>
                <h2 className="brief-help-title">How Mission Briefings work</h2>
                <p className="brief-help-subtitle">The plan side of your paper trail</p>
              </div>
              <button className="brief-help-close" onClick={() => setBriefingHelpOpen(false)} aria-label="Close">✕</button>
            </header>

            <div className="brief-help-scroll">
              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--gold">?</span>
                  <h3 className="brief-help-section-title">What is a Mission Briefing?</h3>
                </div>
                <p className="brief-help-body">
                  It's the document you create BEFORE you fly — your written plan.
                  It proves to a client, the FAA, or an insurance adjuster that you
                  did your homework: weather forecast, airspace check, NOTAMs, risk
                  assessment, crew, emergency contacts, landowner permission, the works.
                </p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--green">✓</span>
                  <h3 className="brief-help-section-title">Who needs one?</h3>
                </div>
                <ul className="brief-help-list">
                  <li><span className="bh-yes">✓</span> Commercial Part 107 pilots taking paid jobs</li>
                  <li><span className="bh-yes">✓</span> Complex missions (BVLOS, multi-aircraft, dense airspace)</li>
                  <li><span className="bh-yes">✓</span> Recurring inspections — pair with the briefing scheduler</li>
                  <li><span className="bh-no">✗</span> Casual hobby flights at the local park don't need one.</li>
                </ul>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--blue">🕒</span>
                  <h3 className="brief-help-section-title">When do I create one?</h3>
                </div>
                <p className="brief-help-body">
                  Any time before takeoff — minutes ahead, days ahead, weeks ahead.
                  The form asks WHEN you plan to fly, and the weather section pulls the
                  FORECAST for that exact time (NWS gridded data covers ~10 days out).
                  If you're flying tomorrow at 9am, you get tomorrow's 9am forecast —
                  not today's METAR.
                </p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--gold">📍</span>
                  <h3 className="brief-help-section-title">How the workflow goes</h3>
                </div>
                <ol className="brief-help-steps">
                  <li>
                    <strong>PLAN</strong> — Create a Mission Briefing. You get a code
                    (MB-XXXXXX), a tamper-verified 6-page PDF, and a row in 'My Briefings.'
                  </li>
                  <li>
                    <strong>FLY</strong> — On the Dashboard, tap Start Flight. The app asks
                    "Link this flight to MB-XXXXXX?" — tap Yes.
                  </li>
                  <li>
                    <strong>DOCUMENT</strong> — After landing, your flight log card shows
                    three buttons: Flight Log, FAA Evidence, and Mission Brief. The Evidence
                    PDF footer references your briefing code, tying the plan to what actually
                    happened.
                  </li>
                </ol>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--green">🔒</span>
                  <h3 className="brief-help-section-title">Why briefings are locked once generated</h3>
                </div>
                <p className="brief-help-body">
                  Every generated briefing carries a SHA-256 tamper hash. That hash is
                  what makes it admissible as evidence — change one character and the
                  hash mismatches. So we don't let you edit a briefing after generation.
                </p>
                <p className="brief-help-body">
                  If forecast was wrong on flight day, don't edit — tap "Update" on the
                  briefing card. We clone it, you tweak weather + risks, and you get
                  a fresh briefing (e.g. MB-8L4K2M — updated from MB-7K3F9P). Both stay
                  in your list, so your paper trail shows you reassessed when conditions
                  changed. That's STRONGER legally, not weaker.
                </p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--blue">⇄</span>
                  <h3 className="brief-help-section-title">Mission Briefing vs. FAA Evidence</h3>
                </div>
                <p className="brief-help-body">
                  Two different documents, both per-flight, both important:
                </p>
                <div className="brief-help-compare">
                  <div className="brief-help-compare-col">
                    <div className="brief-help-compare-h">Mission Briefing <em>(the PLAN)</em></div>
                    <ul>
                      <li>Forecast weather, planned crew, intended mitigations</li>
                      <li>Pre-flight, locked, anti-falsification</li>
                      <li>Shows due diligence</li>
                    </ul>
                  </div>
                  <div className="brief-help-compare-col">
                    <div className="brief-help-compare-h">FAA Evidence Packet <em>(the RECORD)</em></div>
                    <ul>
                      <li>Realtime METAR, server-stamped GPS + timestamps</li>
                      <li>Captured at Depart, locked at Land</li>
                      <li>Shows what was actually true at takeoff</li>
                    </ul>
                  </div>
                </div>
                <p className="brief-help-body">Together they tell the complete story.</p>
              </section>

              <section className="brief-help-section">
                <div className="brief-help-section-head">
                  <span className="brief-help-chip brief-help-chip--muted">⚙</span>
                  <h3 className="brief-help-section-title">Briefing Defaults (Settings)</h3>
                </div>
                <p className="brief-help-body">
                  Tired of re-typing your business contact, default crew, and emergency
                  contacts every time? Set them once in Settings → Briefing Defaults and
                  they pre-fill every new briefing. You can still override per-mission.
                </p>
              </section>
            </div>

            <footer className="brief-help-footer">
              <button className="brief-help-cta" onClick={() => setBriefingHelpOpen(false)}>Got it</button>
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
          aria-label="Join the Beta"
        >
          <div className="beta-modal-card" onClick={e => e.stopPropagation()}>
            <button className="beta-modal-close" onClick={() => setBetaOpen(false)} aria-label="Close">✕</button>
            {betaStatus === 'success' ? (
              <div className="beta-modal-success">
                <span className="beta-modal-success-icon">✓</span>
                You're on the list! We'll be in touch when beta access opens.
              </div>
            ) : (
              <>
                <div className="android-play-badge" style={{ margin: '0 auto 1rem' }}>
                  <svg className="android-play-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                  <span className="android-play-label">
                    <span className="android-play-get">Early Access</span>
                    <span className="android-play-store">iOS Beta</span>
                  </span>
                </div>
                <h2 className="beta-modal-title">Join the iOS Beta</h2>
                <p className="beta-modal-sub">
                  Get early access to PreFlight 107 on iOS before public launch. Drop your info and we'll reach out when a spot opens up.
                </p>
                <form className="beta-modal-form" onSubmit={handleBetaSignup}>
                  <input
                    className="android-email-input"
                    type="text"
                    placeholder="Your name"
                    value={betaName}
                    onChange={e => setBetaName(e.target.value)}
                    required
                    disabled={betaStatus === 'loading'}
                    autoFocus
                  />
                  <input
                    className="android-email-input"
                    type="email"
                    placeholder="your@email.com"
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
                    {betaStatus === 'loading' ? 'Sending…' : 'Request Beta Access'}
                  </button>
                </form>
                {betaStatus === 'error' && (
                  <p className="android-error">Something went wrong — please try again.</p>
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
