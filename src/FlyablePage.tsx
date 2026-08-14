import { useEffect, useState } from 'react';
import { navigate } from './navigate';
import citiesRaw from './cityData.json';
import LanguageToggle from './LanguageToggle';
import { withLang } from './lang';
import type { Lang } from './lang';

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
//
// Localized EN/ES: the `lang` prop selects copy from the bilingual T dict.
// City/state/airport names + numbers come from cityData.json unchanged;
// aviation acronyms (FAA, Part 107, LAANC, TFR, Class C/G, VFR…), the brand
// "PreFlight 107", and its tagline are never translated.

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

// ── Bilingual copy ───────────────────────────────────────────────────────────
// City data is interpolated via template expressions / function args so proper
// names + numbers pass through untouched; segments with <strong> are returned
// as JSX so the bold spans survive translation.
const en = {
  // meta
  metaTitleCity: (c: City) => `Can I Fly a Drone in ${c.city}, ${c.state}? Live Conditions | PreFlight 107`,
  metaDescCity: (c: City) => `Live weather flyability for ${c.city}, ${c.state}, plus ${c.airspaceClass} airspace, LAANC, and TFR facts you need before you fly. PreFlight 107 runs the full airspace + weather check in one tap.`,
  metaTitleIndex: 'Can I Fly a Drone Today? Live Conditions by City | PreFlight 107',
  metaDescIndex: 'Live weather flyability by city, plus the airspace, LAANC, and TFR facts you need before you fly. PreFlight 107 runs the full check in one tap.',

  // nav
  navHome: '← Home',
  navBlog: 'Blog',
  navAllCities: '← All cities',
  navHomePlain: 'Home',

  eyebrow: 'Drone Flying Conditions',

  // verdict card
  verdict: {
    good:    { label: 'Weather Looks Good', line: 'Winds and precipitation are within typical limits for most consumer drones right now.' },
    caution: { label: 'Marginal — Fly With Caution', line: 'Winds or gusts are getting strong. Smaller drones may struggle; check your aircraft’s limits.' },
    poor:    { label: 'Not Ideal Right Now', line: 'Winds, gusts, or precipitation are beyond comfortable limits for most drones.' },
  } as Record<Verdict, { label: string; line: string }>,

  // widget
  checkingLive: (c: City) => `Checking live conditions for ${c.city}…`,
  loadError: 'Couldn’t load live weather right now. Open PreFlight 107 for current conditions.',
  liveConditions: (c: City) => `Live conditions · ${c.city}, ${c.state}`,
  statWind: 'Wind',
  statGusts: 'Gusts',
  statPrecip: 'Precip',
  statVisibility: 'Visibility',
  precipNone: 'None',
  widgetWarning: (): React.ReactNode => (
    <>⚠️ This is a weather snapshot only — <strong>not a clearance to fly</strong>. You still must check airspace authorization (LAANC), TFRs, and local rules. PreFlight 107 runs the full check in one tap.</>
  ),

  // index
  indexTitle: 'Can I Fly a Drone Today? Live Conditions by City',
  indexIntro: 'Pick your city for live weather conditions and the airspace you need to know about before you fly. Every page checks current wind, gusts, and precipitation — then PreFlight 107 handles the full airspace, LAANC, and TFR check.',
  indexLink: (c: City) => `Can I fly a drone in ${c.city}, ${c.state}?`,

  // not found
  notFound: 'We don’t have a conditions page for that city yet.',
  seeAllCities: 'See all cities',

  // city page
  cityTitle: (c: City) => `Can I Fly a Drone in ${c.city}, ${c.state}?`,
  cityIntro: (c: City): React.ReactNode => (
    <>The short answer for {c.city}: <strong>it depends on where you launch and what the airspace says</strong> — and right now, on the weather. Here’s the live picture, plus the airspace you need to clear first.</>
  ),
  airspaceH2: (c: City) => `${c.city} Airspace — What You Need to Know`,
  airspaceP1: (c: City): React.ReactNode => (
    <>{c.city}’s airspace is dominated by <strong>{c.airspaceClass}</strong> around {c.facility}. In controlled airspace like this, both Part 107 and recreational drone pilots need<strong> LAANC authorization</strong> before flying — and in many spots that authorization caps your altitude well below the standard 400 feet. Closer to the airport, the LAANC ceiling can be 0 feet, meaning no flight without a manual waiver.</>
  ),
  airspaceP2: (c: City): React.ReactNode => (
    <>Outside the controlled rings, parts of the {c.city} metro fall under Class G (uncontrolled) airspace where no authorization is required — but you can’t eyeball the boundary. You have to check your exact launch point against the FAA’s UAS Facility Map, because the line between "free to fly" and "need authorization" can run right down the middle of a park.</>
  ),
  checklistH2: (c: City) => `Before You Fly in ${c.city} — The Real Checklist`,
  checklistIntro: 'Weather is only the first gate. Before every flight here you should confirm:',
  checklist1: (<><strong>Airspace + LAANC</strong> — is your exact spot controlled, and what’s the ceiling?</>) as React.ReactNode,
  checklist2: (<><strong>TFRs</strong> — temporary flight restrictions (stadium events, VIP movement, wildfires) can make a legal field illegal overnight.</>) as React.ReactNode,
  checklist3: (<><strong>Weather at altitude</strong> — wind is stronger at 100 ft than at the ground.</>) as React.ReactNode,
  checklist4: (<><strong>Your certification</strong> — recreational (TRUST) or Part 107, current and on you.</>) as React.ReactNode,
  oneTap: (c: City) => `PreFlight 107 runs all of that in one tap for ${c.city} — live LAANC grid, real-time TFR alerts, hyperlocal wind and gusts, and a tamper-evident flight record if you fly commercially.`,
  ctaText: (c: City) => `Get the full ${c.city} airspace + weather check, free:`,
  ctaButton: 'Download Free for iPhone',
};

const es: typeof en = {
  // meta
  metaTitleCity: (c: City) => `¿Puedo volar un dron en ${c.city}, ${c.state}? Condiciones en vivo | PreFlight 107`,
  metaDescCity: (c: City) => `Aptitud para volar según el clima en vivo en ${c.city}, ${c.state}, además del espacio aéreo ${c.airspaceClass}, LAANC y TFR que necesitas conocer antes de volar. PreFlight 107 realiza la verificación completa de espacio aéreo + clima con un solo toque.`,
  metaTitleIndex: '¿Puedo volar un dron hoy? Condiciones en vivo por ciudad | PreFlight 107',
  metaDescIndex: 'Aptitud para volar según el clima en vivo por ciudad, además del espacio aéreo, LAANC y TFR que necesitas conocer antes de volar. PreFlight 107 realiza la verificación completa con un solo toque.',

  // nav
  navHome: '← Inicio',
  navBlog: 'Blog',
  navAllCities: '← Todas las ciudades',
  navHomePlain: 'Inicio',

  eyebrow: 'Condiciones para volar drones',

  // verdict card
  verdict: {
    good:    { label: 'El clima se ve bien', line: 'Los vientos y la precipitación están dentro de los límites típicos para la mayoría de los drones de consumo en este momento.' },
    caution: { label: 'Marginal — Vuela con precaución', line: 'Los vientos o las ráfagas están aumentando. Los drones más pequeños pueden tener dificultades; revisa los límites de tu aeronave.' },
    poor:    { label: 'No es ideal en este momento', line: 'Los vientos, las ráfagas o la precipitación superan los límites cómodos para la mayoría de los drones.' },
  },

  // widget
  checkingLive: (c: City) => `Consultando las condiciones en vivo de ${c.city}…`,
  loadError: 'No se pudo cargar el clima en vivo en este momento. Abre PreFlight 107 para ver las condiciones actuales.',
  liveConditions: (c: City) => `Condiciones en vivo · ${c.city}, ${c.state}`,
  statWind: 'Viento',
  statGusts: 'Ráfagas',
  statPrecip: 'Precip.',
  statVisibility: 'Visibilidad',
  precipNone: 'Ninguna',
  widgetWarning: (): React.ReactNode => (
    <>⚠️ Esto es solo una instantánea del clima — <strong>no es una autorización para volar</strong>. Aún debes verificar la autorización del espacio aéreo (LAANC), los TFR y las reglas locales. PreFlight 107 realiza la verificación completa con un solo toque.</>
  ),

  // index
  indexTitle: '¿Puedo volar un dron hoy? Condiciones en vivo por ciudad',
  indexIntro: 'Elige tu ciudad para ver las condiciones climáticas en vivo y el espacio aéreo que debes conocer antes de volar. Cada página consulta el viento, las ráfagas y la precipitación actuales — luego PreFlight 107 se encarga de la verificación completa de espacio aéreo, LAANC y TFR.',
  indexLink: (c: City) => `¿Puedo volar un dron en ${c.city}, ${c.state}?`,

  // not found
  notFound: 'Todavía no tenemos una página de condiciones para esa ciudad.',
  seeAllCities: 'Ver todas las ciudades',

  // city page
  cityTitle: (c: City) => `¿Puedo volar un dron en ${c.city}, ${c.state}?`,
  cityIntro: (c: City): React.ReactNode => (
    <>La respuesta corta para {c.city}: <strong>depende de dónde despegues y de lo que diga el espacio aéreo</strong> — y, en este momento, del clima. Aquí tienes el panorama en vivo, además del espacio aéreo que debes despejar primero.</>
  ),
  airspaceH2: (c: City) => `Espacio aéreo de ${c.city} — Lo que debes saber`,
  airspaceP1: (c: City): React.ReactNode => (
    <>El espacio aéreo de {c.city} está dominado por <strong>{c.airspaceClass}</strong> alrededor de {c.facility}. En un espacio aéreo controlado como este, tanto los pilotos de la Part 107 como los recreativos necesitan<strong> autorización LAANC</strong> antes de volar — y en muchos puntos esa autorización limita tu altitud muy por debajo de los 400 pies estándar. Cerca del aeropuerto, el techo de LAANC puede ser de 0 pies, lo que significa que no se puede volar sin una exención manual.</>
  ),
  airspaceP2: (c: City): React.ReactNode => (
    <>Fuera de los anillos controlados, partes del área metropolitana de {c.city} caen bajo espacio aéreo Class G (no controlado), donde no se requiere autorización — pero no puedes calcular el límite a simple vista. Debes verificar tu punto exacto de despegue en el UAS Facility Map de la FAA, porque la línea entre "libre para volar" y "necesitas autorización" puede pasar justo por la mitad de un parque.</>
  ),
  checklistH2: (c: City) => `Antes de volar en ${c.city} — La verdadera lista de verificación`,
  checklistIntro: 'El clima es solo la primera barrera. Antes de cada vuelo aquí deberías confirmar:',
  checklist1: (<><strong>Espacio aéreo + LAANC</strong> — ¿tu punto exacto está en zona controlada y cuál es el techo?</>),
  checklist2: (<><strong>TFR</strong> — las restricciones temporales de vuelo (eventos en estadios, movimiento de personas VIP, incendios forestales) pueden volver ilegal un campo legal de la noche a la mañana.</>),
  checklist3: (<><strong>Clima en altura</strong> — el viento es más fuerte a 100 ft que a nivel del suelo.</>),
  checklist4: (<><strong>Tu certificación</strong> — recreativa (TRUST) o Part 107, vigente y contigo.</>),
  oneTap: (c: City) => `PreFlight 107 hace todo eso con un solo toque para ${c.city} — cuadrícula LAANC en vivo, alertas de TFR en tiempo real, viento y ráfagas hiperlocales, y un registro de vuelo a prueba de manipulaciones si vuelas comercialmente.`,
  ctaText: (c: City) => `Obtén la verificación completa de espacio aéreo + clima de ${c.city}, gratis:`,
  ctaButton: 'Descarga gratis para iPhone',
};

const T = { en, es };

// Verdict colors are language-independent.
const VERDICT_COLOR: Record<Verdict, string> = {
  good: '#10B981', caution: '#D97706', poor: '#EF4444',
};

// Set <title> + meta description for this page (bilingual, SEO).
function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', 'description');
      document.head.appendChild(m);
    }
    m.setAttribute('content', description);
  }, [title, description]);
}

function FlyWidget({ city, lang }: { city: City; lang: Lang }) {
  const t = T[lang];
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
    return <div style={card}><p style={{ color: '#9CA3AF', margin: 0 }}>{t.checkingLive(city)}</p></div>;
  }
  if (state === 'error' || !cond) {
    return <div style={card}><p style={{ color: '#9CA3AF', margin: 0 }}>{t.loadError}</p></div>;
  }
  const label = t.verdict[cond.verdict].label;
  const line = t.verdict[cond.verdict].line;
  const color = VERDICT_COLOR[cond.verdict];
  return (
    <div style={{ ...card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9CA3AF' }}>
        {t.liveConditions(city)}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, margin: '8px 0 4px' }}>{label}</div>
      <p style={{ color: '#374151', margin: '0 0 14px', lineHeight: 1.5 }}>{line}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
        <Stat label={t.statWind} value={`${cond.windMph} mph`} />
        <Stat label={t.statGusts} value={`${cond.gustMph} mph`} />
        <Stat label={t.statPrecip} value={cond.precip > 0 ? `${cond.precip}"` : t.precipNone} />
        {cond.visibilityMi != null && <Stat label={t.statVisibility} value={`${cond.visibilityMi} mi`} />}
      </div>
      <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#9A3412', lineHeight: 1.5 }}>
        {t.widgetWarning()}
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
function FlyableIndex({ lang }: { lang: Lang }) {
  const t = T[lang];
  const link = (p: string) => withLang(p, lang);
  useMeta(t.metaTitleIndex, t.metaDescIndex);
  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate(link('/'))}>{t.navHome}</button>
        <div className="blog-logo-link"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
        <button className="blog-nav-btn" onClick={() => navigate(link('/blog'))}>{t.navBlog}</button>
        <LanguageToggle />
      </header>
      <article className="blog-article">
        <div className="blog-article-eyebrow">{t.eyebrow}</div>
        <h1 className="blog-article-title">{t.indexTitle}</h1>
        <div className="blog-article-divider" />
        <div className="blog-article-body">
          <p className="blog-p">{t.indexIntro}</p>
          <ul className="blog-ul">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <a href={link(`/flyable/${c.slug}`)} onClick={(e) => { e.preventDefault(); navigate(link(`/flyable/${c.slug}`)); }}>
                  {t.indexLink(c)}
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
export default function FlyablePage({ citySlug, lang = 'en' }: { citySlug?: string; lang?: Lang }) {
  if (!citySlug) return <FlyableIndex lang={lang} />;
  return <FlyableCity citySlug={citySlug} lang={lang} />;
}

function FlyableCity({ citySlug, lang }: { citySlug: string; lang: Lang }) {
  const t = T[lang];
  const link = (p: string) => withLang(p, lang);
  const city = CITIES.find((c) => c.slug === citySlug);
  useMeta(
    city ? t.metaTitleCity(city) : t.metaTitleIndex,
    city ? t.metaDescCity(city) : t.metaDescIndex,
  );

  if (!city) {
    return (
      <div className="blog-page">
        <header className="blog-header">
          <button className="blog-nav-btn" onClick={() => navigate(link('/flyable'))}>{t.navAllCities}</button>
          <div className="blog-logo-link"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
          <button className="blog-nav-btn" onClick={() => navigate(link('/'))}>{t.navHomePlain}</button>
          <LanguageToggle />
        </header>
        <div className="blog-not-found">
          <p>{t.notFound}</p>
          <button className="cta-button" onClick={() => navigate(link('/flyable'))}>{t.seeAllCities}</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="blog-header">
        <button className="blog-nav-btn" onClick={() => navigate(link('/flyable'))}>{t.navAllCities}</button>
        <div className="blog-logo-link"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
        <button className="blog-nav-btn" onClick={() => navigate(link('/'))}>{t.navHomePlain}</button>
        <LanguageToggle />
      </header>

      <article className="blog-article">
        <div className="blog-article-eyebrow">{t.eyebrow}</div>
        <h1 className="blog-article-title">{t.cityTitle(city)}</h1>
        <div className="blog-article-divider" />

        <div className="blog-article-body">
          <p className="blog-p">{t.cityIntro(city)}</p>

          <FlyWidget city={city} lang={lang} />

          <h2 className="blog-h2">{t.airspaceH2(city)}</h2>
          <p className="blog-p">{t.airspaceP1(city)}</p>
          <p className="blog-p">{t.airspaceP2(city)}</p>

          <h2 className="blog-h2">{t.checklistH2(city)}</h2>
          <p className="blog-p">{t.checklistIntro}</p>
          <ul className="blog-ul">
            <li>{t.checklist1}</li>
            <li>{t.checklist2}</li>
            <li>{t.checklist3}</li>
            <li>{t.checklist4}</li>
          </ul>
          <p className="blog-p">{t.oneTap(city)}</p>

          <div className="blog-article-cta">
            <p className="blog-cta-text">{t.ctaText(city)}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a className="cta-button" href={APP_STORE} target="_blank" rel="noopener noreferrer">{t.ctaButton}</a>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
