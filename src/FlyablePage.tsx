import { useEffect, useState } from 'react';
import { navigate } from './navigate';
import citiesRaw from './cityData.json';

// ── Programmatic-SEO "Can I fly a drone in <city>?" pages ────────────────────
// One page per city at /flyable/<slug>. Each targets the long-tail search
// "can i fly a drone in <city>". The page bakes in city-specific airspace
// facts (what Google indexes + ranks) and a LIVE weather widget that fetches
// current conditions for the city center on mount, then nudges the visitor to
// download the app for the full airspace + TFR check.
//
// IMPORTANT — the live verdict is WEATHER-ONLY and intentionally hedged. It is
// NOT a legal clearance to fly. Airspace authorization (LAANC), TFRs, and
// local rules require the full check in the app. Every verdict says so.

const APP_STORE = 'https://apps.apple.com/app/preflight-107/id6760437132';
// Android is still in closed testing — no public Play Store listing yet, so no
// Android download CTA on the site. Re-add when the public listing goes live.

interface City {
  slug: string; city: string; state: string;
  lat: number; lng: number; airspaceClass: string; facility: string;
}
const CITIES = citiesRaw as City[];

type Verdict = 'good' | 'caution' | 'poor';

interface Conditions {
  windMph: number; gustMph: number; precip: number; visibilityMi: number | null;
  verdict: Verdict;
}

function computeVerdict(windMph: number, gustMph: number, precip: number): Verdict {
  // Weather-only flyability. Thresholds mirror the app's conservative defaults.
  if (gustMph >= 30 || windMph >= 25 || precip > 0.02) return 'poor';
  if (gustMph >= 20 || windMph >= 15) return 'caution';
  return 'good';
}

const VERDICT_COPY: Record<Verdict, { label: string; color: string; line: string }> = {
  good:    { label: 'Weather Looks Good', color: '#10B981', line: 'Winds and precipitation are within typical limits for most consumer drones right now.' },
  caution: { label: 'Marginal — Fly With Caution', color: '#D97706', line: 'Winds or gusts are getting strong. Smaller drones may struggle; check your aircraft’s limits.' },
  poor:    { label: 'Not Ideal Right Now', color: '#EF4444', line: 'Winds, gusts, or precipitation are beyond comfortable limits for most drones.' },
};

function FlyWidget({ city }: { city: City }) {
  const [state, setState] = useState<'loading' | 'error' | 'ok'>('loading');
  const [cond, setCond] = useState<Conditions | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}` +
      `&current=wind_speed_10m,wind_gusts_10m,precipitation,visibility&temperature_unit=fahrenheit` +
      `&wind_speed_unit=mph&precipitation_unit=inch`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const c = j.current || {};
        const windMph = Math.round(c.wind_speed_10m ?? 0);
        const gustMph = Math.round(c.wind_gusts_10m ?? 0);
        const precip = c.precipitation ?? 0;
        const visibilityMi = c.visibility != null ? Math.round((c.visibility / 1609) * 10) / 10 : null;
        setCond({ windMph, gustMph, precip, visibilityMi, verdict: computeVerdict(windMph, gustMph, precip) });
        setState('ok');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [city.lat, city.lng]);

  if (state === 'loading') {
    return <div style={card}><p style={{ color: '#9CA3AF', margin: 0 }}>Checking live conditions for {city.city}…</p></div>;
  }
  if (state === 'error' || !cond) {
    return <div style={card}><p style={{ color: '#9CA3AF', margin: 0 }}>Couldn’t load live weather right now. Open PreFlight 107 for current conditions.</p></div>;
  }
  const v = VERDICT_COPY[cond.verdict];
  return (
    <div style={{ ...card, borderTop: `4px solid ${v.color}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9CA3AF' }}>
        Live conditions · {city.city}, {city.state}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: v.color, margin: '8px 0 4px' }}>{v.label}</div>
      <p style={{ color: '#374151', margin: '0 0 14px', lineHeight: 1.5 }}>{v.line}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
        <Stat label="Wind" value={`${cond.windMph} mph`} />
        <Stat label="Gusts" value={`${cond.gustMph} mph`} />
        <Stat label="Precip" value={cond.precip > 0 ? `${cond.precip}"` : 'None'} />
        {cond.visibilityMi != null && <Stat label="Visibility" value={`${cond.visibilityMi} mi`} />}
      </div>
      <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#9A3412', lineHeight: 1.5 }}>
        ⚠️ This is a weather snapshot only — <strong>not a clearance to fly</strong>. You still must check airspace authorization (LAANC), TFRs, and local rules. PreFlight 107 runs the full check in one tap.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{value}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
  padding: 20, margin: '24px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

// ── Index mode: list every city ─────────────────────────────────────────────
function FlyableIndex() {
  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate('/')}>← Home</button>
        <div className="blog-logo-link"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
        <button className="blog-nav-btn" onClick={() => navigate('/blog')}>Blog</button>
      </header>
      <article className="blog-article">
        <div className="blog-article-eyebrow">Drone Flying Conditions</div>
        <h1 className="blog-article-title">Can I Fly a Drone Today? Live Conditions by City</h1>
        <div className="blog-article-divider" />
        <div className="blog-article-body">
          <p className="blog-p">Pick your city for live weather conditions and the airspace you need to know about before you fly. Every page checks current wind, gusts, and precipitation — then PreFlight 107 handles the full airspace, LAANC, and TFR check.</p>
          <ul className="blog-ul">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <a href={`/flyable/${c.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/flyable/${c.slug}`); }}>
                  Can I fly a drone in {c.city}, {c.state}?
                </a>
              </li>
            ))}
          </ul>
        </div>
      </article>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="blog-footer">
      <div className="blog-footer-inner">
        <span className="blog-footer-logo"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</span>
        <p className="blog-footer-tagline">Plan it. Fly it. Prove it.</p>
      </div>
    </footer>
  );
}

// ── Per-city page ────────────────────────────────────────────────────────────
export default function FlyablePage({ citySlug }: { citySlug?: string }) {
  if (!citySlug) return <FlyableIndex />;
  const city = CITIES.find((c) => c.slug === citySlug);

  if (!city) {
    return (
      <div className="blog-page">
        <header className="blog-header">
          <button className="blog-nav-btn" onClick={() => navigate('/flyable')}>← All cities</button>
          <div className="blog-logo-link"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
          <button className="blog-nav-btn" onClick={() => navigate('/')}>Home</button>
        </header>
        <div className="blog-not-found">
          <p>We don’t have a conditions page for that city yet.</p>
          <button className="cta-button" onClick={() => navigate('/flyable')}>See all cities</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate('/flyable')}>← All cities</button>
        <div className="blog-logo-link"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
        <button className="blog-nav-btn" onClick={() => navigate('/')}>Home</button>
      </header>

      <article className="blog-article">
        <div className="blog-article-eyebrow">Drone Flying Conditions</div>
        <h1 className="blog-article-title">Can I Fly a Drone in {city.city}, {city.state}?</h1>
        <div className="blog-article-divider" />

        <div className="blog-article-body">
          <p className="blog-p">
            The short answer for {city.city}: <strong>it depends on where you launch and what the airspace says</strong> —
            and right now, on the weather. Here’s the live picture, plus the airspace you need to clear first.
          </p>

          <FlyWidget city={city} />

          <h2 className="blog-h2">{city.city} Airspace — What You Need to Know</h2>
          <p className="blog-p">
            {city.city}’s airspace is dominated by <strong>{city.airspaceClass}</strong> around {city.facility}.
            In controlled airspace like this, both Part 107 and recreational drone pilots need
            <strong> LAANC authorization</strong> before flying — and in many spots that authorization caps your
            altitude well below the standard 400 feet. Closer to the airport, the LAANC ceiling can be 0 feet,
            meaning no flight without a manual waiver.
          </p>
          <p className="blog-p">
            Outside the controlled rings, parts of the {city.city} metro fall under Class G (uncontrolled) airspace
            where no authorization is required — but you can’t eyeball the boundary. You have to check your exact
            launch point against the FAA’s UAS Facility Map, because the line between "free to fly" and "need
            authorization" can run right down the middle of a park.
          </p>

          <h2 className="blog-h2">Before You Fly in {city.city} — The Real Checklist</h2>
          <p className="blog-p">Weather is only the first gate. Before every flight here you should confirm:</p>
          <ul className="blog-ul">
            <li><strong>Airspace + LAANC</strong> — is your exact spot controlled, and what’s the ceiling?</li>
            <li><strong>TFRs</strong> — temporary flight restrictions (stadium events, VIP movement, wildfires) can make a legal field illegal overnight.</li>
            <li><strong>Weather at altitude</strong> — wind is stronger at 100 ft than at the ground.</li>
            <li><strong>Your certification</strong> — recreational (TRUST) or Part 107, current and on you.</li>
          </ul>
          <p className="blog-p">
            PreFlight 107 runs all of that in one tap for {city.city} — live LAANC grid, real-time TFR alerts,
            hyperlocal wind and gusts, and a tamper-evident flight record if you fly commercially.
          </p>

          <div className="blog-article-cta">
            <p className="blog-cta-text">Get the full {city.city} airspace + weather check, free:</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a className="cta-button" href={APP_STORE} target="_blank" rel="noopener noreferrer">Download Free for iPhone</a>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
