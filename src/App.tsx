import React from 'react'
import './App.css'
import { useAuth } from './AuthContext'
import { navigate } from './navigate'

function App() {
  const { user, signOut } = useAuth();

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
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#logs">Flight Logs</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#download" className="nav-cta">Download Free</a></li>
            {user ? (
              <>
                <li>
                  <a
                    href="/dashboard"
                    className="nav-auth-link"
                    onClick={e => { e.preventDefault(); navigate('/dashboard'); }}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-auth-link nav-signout" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </>
            ) : (
              <li>
                <a
                  href="/login"
                  className="nav-login-btn"
                  onClick={e => { e.preventDefault(); navigate('/login'); }}
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
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">For Drone Pilots</div>
            <h1 className="hero-title">Fly with Total Airspace Awareness</h1>
            <p className="hero-subtitle">
              PreFlight 107 gives drone pilots real-time weather, live airspace data,
              and AR-powered situational awareness — everything you need before and during every flight.
            </p>
            <div className="hero-actions">
              <button className="cta-button">Download Free</button>
              <button className="cta-button-secondary">Explore Pro →</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gradient-orb"></div>
            <div className="hero-stat-cards">
              <div className="stat-card"><span className="stat-value">168hr</span><span className="stat-label">Forecast Range</span></div>
              <div className="stat-card"><span className="stat-value">Live</span><span className="stat-label">ADS-B Traffic</span></div>
              <div className="stat-card"><span className="stat-value">AR</span><span className="stat-label">Airspace View</span></div>
            </div>
          </div>
        </section>

        {/* ── Pro Features ── */}
        <section className="features" id="features">
          <h2>Built for the Skies</h2>
          <p className="features-subtitle">Three tools that change how you plan, check, and fly.</p>
          <div className="features-grid">
            <div className="feature-card feature-card--ar">
              <div className="feature-accent-bar feature-accent-bar--yellow"></div>
              <div className="feature-icon">🌐</div>
              <h3>AR Airspace View</h3>
              <p>See controlled airspace boundaries projected in augmented reality through your camera. Know exactly where restricted zones begin before you ever take off.</p>
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
              <div className="feature-icon">📅</div>
              <h3>7-Day Forecast</h3>
              <p>Full 168-hour Go/No-Go weather planning with custom drone safety limits. Plan your shoot days a week out with confidence.</p>
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
                <li><span className="pi pi--no">✗</span> AR Airspace View</li>
                <li><span className="pi pi--no">✗</span> Live ADS-B Radar</li>
                <li><span className="pi pi--no">✗</span> 168-hr Forecast</li>
                <li><span className="pi pi--no">✗</span> Unlimited Flight Logs</li>
              </ul>
              <button className="pricing-btn pricing-btn--free">Download Free</button>
            </div>

            {/* Pro tier */}
            <div className="pricing-card pricing-card--pro">
              <div className="pricing-badge-pro">Most Popular</div>
              <div className="pricing-tier pricing-tier--pro">Pro Pilot</div>
              <div className="pricing-price">
                <span className="price-amount">$9.99</span>
                <span className="price-period">/mo</span>
              </div>
              <p className="pricing-desc">Everything a professional pilot needs. One subscription, zero limits.</p>
              <ul className="pricing-list">
                <li><span className="pi pi--yes">✓</span> Everything in Basic</li>
                <li><span className="pi pi--yes pi--accent">✓</span> AR Airspace View</li>
                <li><span className="pi pi--yes pi--accent">✓</span> Live ADS-B Radar</li>
                <li><span className="pi pi--yes pi--accent">✓</span> 168-hr Forecast</li>
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
                <tr className="compare-row--pro"><td>AR Airspace View</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>Live ADS-B Radar</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>168-hr Forecast</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>3D Wind Tower</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>METAR / TAF</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>PDF Log Exports</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
                <tr className="compare-row--pro"><td>LAANC Grid Overlays</td><td><span className="ci ci--no">—</span></td><td><span className="ci ci--yes">✓</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><span style={{color: 'var(--accent)'}}>✈</span> PreFlight 107</div>
          <p className="footer-tagline">Fly safe out there.</p>
          <p className="footer-copy">&copy; 2026 PreFlight 107. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
