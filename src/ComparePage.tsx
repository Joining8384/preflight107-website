// Public comparison page positioning PreFlight 107 against other
// drone airspace / LAANC apps. URL: /compare
//
// Conservative editorial stance: we mark ✓ only where the competitor
// publicly markets a comparable feature. "—" means not marketed (not
// "absent"). A disclaimer at the bottom notes this reflects public
// information at time of publication.

import { navigate } from './navigate';

interface Row {
  feature: string;
  preflight: 'yes' | 'limited' | 'no';
  b4ufly: 'yes' | 'limited' | 'no';
  airmap: 'yes' | 'limited' | 'no';
  aloft: 'yes' | 'limited' | 'no';
  note?: string;
}

const ROWS: Row[] = [
  // Airspace / authorization
  { feature: 'FAA airspace map',                    preflight: 'yes', b4ufly: 'yes',     airmap: 'yes',     aloft: 'yes' },
  { feature: 'LAANC status lookup',                 preflight: 'yes', b4ufly: 'limited', airmap: 'yes',     aloft: 'yes' },
  { feature: 'LAANC grid overlays',                 preflight: 'yes', b4ufly: 'no',      airmap: 'yes',     aloft: 'yes' },

  // Weather
  { feature: 'Current weather conditions',          preflight: 'yes', b4ufly: 'limited', airmap: 'limited', aloft: 'yes' },
  { feature: 'Aviation METAR / TAF',                preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'SIGMETs, AIRMETs, PIREPs',            preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Plain-English weather decode',        preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: '15-day forecast',                     preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'limited' },
  { feature: '3D wind tower at altitude',           preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Fly Now Score (0–100 go/no-go)',      preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Density altitude performance alerts', preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'AI risk assessment',                  preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },

  // Awareness
  { feature: 'Live ADS-B manned traffic',           preflight: 'yes', b4ufly: 'no',      airmap: 'limited', aloft: 'no' },

  // Records & deliverables
  { feature: 'Cloud-synced flight logs',            preflight: 'yes', b4ufly: 'no',      airmap: 'yes',     aloft: 'yes' },
  { feature: 'PDF flight log exports',              preflight: 'yes', b4ufly: 'no',      airmap: 'limited', aloft: 'yes' },
  { feature: 'FAA-style Mission Briefing PDFs',     preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'SHA-256 tamper-evident briefings',    preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Public /verify page for clients',     preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Apple Wallet pilot card',             preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Public verifiable pilot profile',     preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'White-label / client-mode PDFs',      preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Recurring scheduled briefings',       preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
];

function Mark({ value }: { value: 'yes' | 'limited' | 'no' }) {
  if (value === 'yes') return <span className="cmp-yes">✓</span>;
  if (value === 'limited') return <span className="cmp-limited" title="Partial / limited">◐</span>;
  return <span className="cmp-no">—</span>;
}

export default function ComparePage() {
  return (
    <div className="compare-page">
      <header className="compare-page-header">
        <button className="compare-page-nav-btn" onClick={() => navigate('/')}>← Home</button>
        <div className="compare-page-logo">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <button className="compare-page-nav-btn" onClick={() => navigate('/support')}>Support</button>
      </header>

      <main className="compare-page-main">
        <section className="compare-page-hero">
          <div className="compare-page-eyebrow">Side-by-Side</div>
          <h1 className="compare-page-title">How PreFlight 107 stacks up</h1>
          <p className="compare-page-sub">
            Most drone apps focus on airspace authorization. PreFlight 107 layers in real
            aviation weather, live ADS-B traffic, and tamper-evident Mission Briefings —
            the things commercial Part 107 pilots actually need to plan, fly, and prove a flight.
          </p>
        </section>

        {/* Differentiator cards */}
        <section className="compare-page-diffs">
          <h2 className="compare-page-h2">Four reasons pilots switch</h2>
          <div className="compare-page-diffgrid">
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">📄</div>
              <h3>FAA-Style Mission Briefings</h3>
              <p>Tamper-evident PDF briefings with weather, hazards, NOTAMs, LAANC status, and your pilot/aircraft block — generated in seconds and verifiable on the web by anyone you share it with.</p>
            </div>
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">🛰️</div>
              <h3>Real Aviation Weather</h3>
              <p>METAR, TAF, SIGMETs, AIRMETs, and PIREPs — the same products manned pilots use, with plain-English decodes alongside. Not just "partly cloudy" — you see flight category, ceiling, visibility, wind shear.</p>
            </div>
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">📡</div>
              <h3>Live ADS-B Traffic</h3>
              <p>Real-time manned aircraft positions on your map with proximity warnings. See every plane around you, live, before you take off — not just airspace boundaries.</p>
            </div>
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">🪪</div>
              <h3>Verifiable Pilot Card</h3>
              <p>An Apple Wallet credential + public profile page clients can open in any browser. Hand a client your phone and they see your Part 107 status without installing anything.</p>
            </div>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="compare-page-tablewrap">
          <h2 className="compare-page-h2">Feature comparison</h2>
          <p className="compare-page-tablesub">
            <span className="cmp-yes">✓</span> available · <span className="cmp-limited">◐</span> partial / limited · <span className="cmp-no">—</span> not marketed
          </p>
          <div className="compare-page-tablescroll">
            <table className="compare-page-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="compare-page-th-self">PreFlight 107</th>
                  <th>B4UFLY</th>
                  <th>AirMap</th>
                  <th>Aloft</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td className="compare-page-td-self"><Mark value={row.preflight} /></td>
                    <td><Mark value={row.b4ufly} /></td>
                    <td><Mark value={row.airmap} /></td>
                    <td><Mark value={row.aloft} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="compare-page-disclaimer">
            Based on publicly available information from each provider's website and app store
            listings at the time of publication. Competitor capabilities evolve — visit
            their official sites for current feature lists. We try to be fair: a "—" mark
            means a feature isn't publicly marketed, not that it's absent. Trademark and
            product names belong to their respective owners.
          </p>
        </section>

        {/* CTA */}
        <section className="compare-page-cta">
          <h2 className="compare-page-h2">See it for yourself</h2>
          <p>
            The free tier covers airspace, current weather, and 3 flight logs — no card required.
            Upgrade to Pro Pilot or Pro+ Operator when you're ready.
          </p>
          <div className="compare-page-ctaactions">
            <a
              className="cta-button"
              href="https://apps.apple.com/app/preflight-107/id6760437132"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download on the App Store
            </a>
            <button
              className="cta-button-secondary"
              onClick={() => navigate('/')}
            >
              See full feature list →
            </button>
          </div>
        </section>

        <footer className="compare-page-footer">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>preflight107.com</a>
          <span>·</span>
          <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>Support</a>
          <span>·</span>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a>
          <span>·</span>
          <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms</a>
        </footer>
      </main>
    </div>
  );
}
