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

  const BREVO_URL =
    'https://db0a234c.sibforms.com/serve/MUIFAERwrnycogWcTeXCk-WX-03RO6ZjUHkjIAdE_NwNNAWyQWiJ_t3_rnHHdvQRQPKQv3yZATdR1w6nH5Kp3Lv4kGi3Lw0TWVt5Ux1lh5zSq4Bqan98KbfGT3aWlbqrqnCb3hV6d9m6LRDaA-Hl03qGwwBgla5-vS7yjP2fIJ1AMP7sHoq6vtkChyF61S5Pi8w7uHKmJmwm9b8m';
  const BETA_BREVO_URL = 'https://db0a234c.sibforms.com/serve/MUIFACJte8IZE6oqdY2AVPhUu5HAldkQTf5T32EO-fy17ZXlMQ0hfhDxPH89D7-mAUDE_JMPwKwCQ0oHJFdA8fE_5IT5t8arz78N-iXg4JFn7yXRx-xvUnt9pLSYCHbAoeDP0CAM3hZ8ZdVbrj0AzADJtH-nM9pp7x0wByBYNixkb9Tzm1Pmr-gSPalmZy29biI03dpWfoCuwzcK';

  useEffect(() => {
    if (!betaOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setBetaOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [betaOpen]);

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

      <main>

        {/* ── Hero ── */}
        <section className="hero" id="download">
          <div className="hero-content">
            <div className="hero-badge">For Drone Pilots</div>
            <h1 className="hero-title">Fly with Total Airspace Awareness</h1>
            <p className="hero-subtitle">
              PreFlight 107 gives drone pilots real-time weather, live airspace data,
              and professional aviation intelligence — everything you need before and during every flight.
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
              <div className="stat-card"><span className="stat-value">15-Day</span><span className="stat-label">Forecast Range</span></div>
              <div className="stat-card"><span className="stat-value">Live</span><span className="stat-label">ADS-B Traffic</span></div>
              <div className="stat-card"><span className="stat-value">METAR</span><span className="stat-label">Aviation Intel</span></div>
            </div>
          </div>
        </section>

        {/* ── Pro Features ── */}
        <section className="features" id="features">
          <h2>Built for the Skies</h2>
          <p className="features-subtitle">Pro features that change how you plan, check, and fly.</p>
          <div className="features-grid">
            <div className="feature-card feature-card--ar">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🛰️</div>
              <h3>METAR / TAF Briefings</h3>
              <p>Full aviation weather briefings with METARs, TAFs, and decoded PIREPs — the same intel manned pilots rely on. Know your airspace before you're in it.</p>
              <span className="feature-tag feature-tag--pro">Pro</span>
            </div>
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

          <div className="pricing-grid">

            {/* Free tier */}
            <div className="pricing-card pricing-card--free">
              <div className="pricing-tier">Basic</div>
              <div className="pricing-price">
                <span className="price-amount">Free</span>
              </div>
              <p className="pricing-desc">Everything you need to get up in the air.</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> Live Airspace Map</li>
                <li><span className="pi pi--yes">✓</span> Current Weather Dashboard</li>
                <li><span className="pi pi--yes">✓</span> Standard Maps</li>
                <li><span className="pi pi--yes">✓</span> 24-hr Forecast</li>
                <li><span className="pi pi--yes">✓</span> 3 Flight Logs</li>
                <li><span className="pi pi--no">✗</span> Live ADS-B Radar</li>
                <li><span className="pi pi--no">✗</span> 15-Day Forecast</li>
                <li><span className="pi pi--no">✗</span> Unlimited Flight Logs</li>
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
              <p className="pricing-desc">Everything a professional pilot needs. One subscription, zero limits.</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> Everything in Basic</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Live ADS-B Radar</li>
                <li><span className="pi pi--yes pi--accent">✓</span> 15-Day Forecast</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Unlimited Flight Logs</li>
                <li><span className="pi pi--yes pi--accent">✓</span> 3D Wind Tower</li>
                <li><span className="pi pi--yes pi--accent">✓</span> METAR / TAF Briefings</li>
                <li><span className="pi pi--yes pi--accent">✓</span> PDF Log Exports</li>
                <li><span className="pi pi--yes pi--accent">✓</span> LAANC Grid Overlays</li>
              </ul>
              <button className="pricing-btn pricing-btn--pro">Get Pro Pilot →</button>
            </div>

          </div>

          {/* Comparison table */}
          <div className="compare-wrap">
            <h3 className="compare-title">Full Feature Comparison</h3>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Basic</th>
                  <th className="th-pro">Pro Pilot</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Live Airspace Map</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Current Weather</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Standard Maps</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>24-hr Forecast</td><td><span className="ci ci--yes">✓</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr><td>Flight Logs</td><td className="ci-text">3 logs</td><td className="ci-text ci-text--pro">Unlimited</td></tr>
                <tr className="compare-row--pro"><td>Live ADS-B Radar</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>15-Day Forecast</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>3D Wind Tower</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>METAR / TAF</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>PDF Log Exports</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>LAANC Grid Overlays</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
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
              <p className="faq-answer">Yes. The core features — airspace map, basic weather, and LAANC status — are completely free. PreFlight 107 Pro ($9.99/month or $79.99/year) unlocks ADS-B live traffic radar, METAR/TAF briefings, 3D Wind Tower visualizations, and advanced route planning.</p>
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
