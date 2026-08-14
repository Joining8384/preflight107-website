// Public comparison page positioning PreFlight 107 against other
// drone airspace / LAANC apps. URL: /compare
//
// Conservative editorial stance: we mark ✓ only where the competitor
// publicly markets a comparable feature. "—" means not marketed (not
// "absent"). A disclaimer at the bottom notes this reflects public
// information at time of publication.

import { navigate } from './navigate';
import { withLang } from './lang';
import type { Lang } from './lang';
import LanguageToggle from './LanguageToggle';

interface Row {
  feature: string;
  featureEs: string;
  preflight: 'yes' | 'limited' | 'no';
  b4ufly: 'yes' | 'limited' | 'no';
  airmap: 'yes' | 'limited' | 'no';
  aloft: 'yes' | 'limited' | 'no';
  note?: string;
}

const ROWS: Row[] = [
  // Airspace / authorization
  { feature: 'FAA airspace map',                    featureEs: 'Mapa de espacio aéreo FAA',                       preflight: 'yes', b4ufly: 'yes',     airmap: 'yes',     aloft: 'yes' },
  { feature: 'LAANC status lookup',                 featureEs: 'Consulta de estado LAANC',                        preflight: 'yes', b4ufly: 'limited', airmap: 'yes',     aloft: 'yes' },
  { feature: 'LAANC grid overlays',                 featureEs: 'Cuadrículas LAANC superpuestas',                  preflight: 'yes', b4ufly: 'no',      airmap: 'yes',     aloft: 'yes' },

  // Weather
  { feature: 'Current weather conditions',          featureEs: 'Condiciones meteorológicas actuales',             preflight: 'yes', b4ufly: 'limited', airmap: 'limited', aloft: 'yes' },
  { feature: 'Aviation METAR / TAF',                featureEs: 'METAR / TAF de aviación',                         preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'SIGMETs, AIRMETs, PIREPs',            featureEs: 'SIGMET, AIRMET y PIREP',                          preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Plain-English weather decode',        featureEs: 'Decodificación del clima en lenguaje sencillo',   preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: '15-day forecast',                     featureEs: 'Pronóstico de 15 días',                           preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'limited' },
  { feature: '3D wind tower at altitude',           featureEs: 'Torre de viento 3D por altitud',                  preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Fly Now Score (0–100 go/no-go)',      featureEs: 'Fly Now Score (0–100 vuela/no vuela)',            preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Density altitude performance alerts', featureEs: 'Alertas de rendimiento por altitud de densidad',  preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'AI risk assessment',                  featureEs: 'Evaluación de riesgo con IA',                     preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'AI morning flight brief',             featureEs: 'Resumen de vuelo matutino con IA',                preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },

  // Awareness
  { feature: 'Live ADS-B manned traffic',           featureEs: 'Tráfico tripulado ADS-B en vivo',                 preflight: 'yes', b4ufly: 'no',      airmap: 'limited', aloft: 'no' },

  // Records & deliverables
  { feature: 'Cloud-synced flight logs',            featureEs: 'Bitácoras de vuelo sincronizadas en la nube',     preflight: 'yes', b4ufly: 'no',      airmap: 'yes',     aloft: 'yes' },
  { feature: 'PDF flight log exports',              featureEs: 'Exportación de bitácoras en PDF',                 preflight: 'yes', b4ufly: 'no',      airmap: 'limited', aloft: 'yes' },
  { feature: 'Personal flying analytics',           featureEs: 'Analíticas personales de vuelo',                  preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'FAA-style Mission Briefing PDFs',     featureEs: 'PDFs de Mission Briefing estilo FAA',             preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Per-job client report bundle',        featureEs: 'Paquete de informe para el cliente por trabajo',  preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'SHA-256 tamper-evident briefings',    featureEs: 'Informes a prueba de manipulación con SHA-256',   preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Public /verify page for clients',     featureEs: 'Página pública /verify para clientes',            preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Apple Wallet pilot card',             featureEs: 'Tarjeta de piloto para Apple Wallet',             preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Public verifiable pilot profile',     featureEs: 'Perfil de piloto público y verificable',          preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'White-label / client-mode PDFs',      featureEs: 'PDFs de marca blanca / modo cliente',             preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
  { feature: 'Recurring scheduled briefings',       featureEs: 'Informes programados recurrentes',                preflight: 'yes', b4ufly: 'no',      airmap: 'no',      aloft: 'no' },
];

// Bilingual copy dictionary. `es` is typed against `en` so the two stay in lockstep.
const en = {
  navHome: '← Home',
  navSupport: 'Support',
  eyebrow: 'Side-by-Side',
  title: 'How PreFlight 107 stacks up',
  sub: 'Most drone apps focus on airspace authorization. PreFlight 107 layers in real aviation weather, live ADS-B traffic, and tamper-evident Mission Briefings — the things commercial Part 107 pilots actually need to plan, fly, and prove a flight.',

  diffsH2: 'Four reasons pilots switch',
  diff1Title: 'FAA-Style Mission Briefings',
  diff1Body: 'Tamper-evident PDF briefings with weather, hazards, NOTAMs, LAANC status, and your pilot/aircraft block — generated in seconds and verifiable on the web by anyone you share it with.',
  diff2Title: 'Real Aviation Weather',
  diff2Body: 'METAR, TAF, SIGMETs, AIRMETs, and PIREPs — the same products manned pilots use, with plain-English decodes alongside. Not just "partly cloudy" — you see flight category, ceiling, visibility, wind shear.',
  diff3Title: 'Live ADS-B Traffic',
  diff3Body: 'Real-time manned aircraft positions on your map with proximity warnings. See every plane around you, live, before you take off — not just airspace boundaries.',
  diff4Title: 'Verifiable Pilot Card',
  diff4Body: 'An Apple Wallet credential + public profile page clients can open in any browser. Hand a client your phone and they see your Part 107 status without installing anything.',

  tableH2: 'Feature comparison',
  legendAvailable: 'available',
  legendPartial: 'partial / limited',
  legendNot: 'not marketed',
  thFeature: 'Feature',
  markLimitedTitle: 'Partial / limited',
  disclaimer: "Based on publicly available information from each provider's website and app store listings at the time of publication. Competitor capabilities evolve — visit their official sites for current feature lists. We try to be fair: a \"—\" mark means a feature isn't publicly marketed, not that it's absent. Trademark and product names belong to their respective owners.",

  ctaH2: 'See it for yourself',
  ctaBody: "The free tier covers airspace, current weather, and 3 flight logs — no card required. Upgrade to Pro Pilot or Pro+ Operator when you're ready.",
  ctaAppStore: 'Download on the App Store',
  ctaFullList: 'See full feature list →',

  footerSupport: 'Support',
  footerPrivacy: 'Privacy',
  footerTerms: 'Terms',
};

const es: typeof en = {
  navHome: '← Inicio',
  navSupport: 'Soporte',
  eyebrow: 'Lado a lado',
  title: 'Cómo se compara PreFlight 107',
  sub: 'La mayoría de las apps para drones se enfocan en la autorización del espacio aéreo. PreFlight 107 suma clima de aviación real, tráfico ADS-B en vivo y Mission Briefings a prueba de manipulación: lo que los pilotos comerciales Part 107 realmente necesitan para planear, volar y comprobar un vuelo.',

  diffsH2: 'Cuatro razones por las que los pilotos se cambian',
  diff1Title: 'Mission Briefings estilo FAA',
  diff1Body: 'Informes en PDF a prueba de manipulación con clima, peligros, NOTAM, estado LAANC y tu bloque de piloto/aeronave: generados en segundos y verificables en la web por cualquier persona con quien los compartas.',
  diff2Title: 'Clima de aviación real',
  diff2Body: 'METAR, TAF, SIGMET, AIRMET y PIREP: los mismos productos que usan los pilotos tripulados, con decodificaciones en lenguaje sencillo al lado. No solo "parcialmente nublado": ves categoría de vuelo, techo, visibilidad y cizalladura del viento.',
  diff3Title: 'Tráfico ADS-B en vivo',
  diff3Body: 'Posiciones de aeronaves tripuladas en tiempo real en tu mapa, con avisos de proximidad. Mira cada avión a tu alrededor, en vivo, antes de despegar; no solo los límites del espacio aéreo.',
  diff4Title: 'Tarjeta de piloto verificable',
  diff4Body: 'Una credencial de Apple Wallet + una página de perfil pública que los clientes pueden abrir en cualquier navegador. Entrégale tu teléfono a un cliente y verá tu estado Part 107 sin instalar nada.',

  tableH2: 'Comparación de funciones',
  legendAvailable: 'disponible',
  legendPartial: 'parcial / limitado',
  legendNot: 'no promocionado',
  thFeature: 'Función',
  markLimitedTitle: 'Parcial / limitado',
  disclaimer: 'Basado en información disponible públicamente en el sitio web de cada proveedor y en sus fichas de tienda de aplicaciones al momento de la publicación. Las capacidades de la competencia evolucionan: visita sus sitios oficiales para ver las listas de funciones actuales. Intentamos ser justos: una marca "—" significa que una función no se promociona públicamente, no que esté ausente. Las marcas registradas y los nombres de productos pertenecen a sus respectivos dueños.',

  ctaH2: 'Compruébalo tú mismo',
  ctaBody: 'El plan gratuito cubre espacio aéreo, clima actual y 3 bitácoras de vuelo: sin tarjeta. Mejora a Pro Pilot o Pro+ Operator cuando estés listo.',
  ctaAppStore: 'Descárgala en el App Store',
  ctaFullList: 'Ver la lista completa de funciones →',

  footerSupport: 'Soporte',
  footerPrivacy: 'Privacidad',
  footerTerms: 'Términos',
};

const T = { en, es };

function Mark({ value, limitedTitle }: { value: 'yes' | 'limited' | 'no'; limitedTitle: string }) {
  if (value === 'yes') return <span className="cmp-yes">✓</span>;
  if (value === 'limited') return <span className="cmp-limited" title={limitedTitle}>◐</span>;
  return <span className="cmp-no">—</span>;
}

export default function ComparePage({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  // Route internal links through the active language so navigation stays under /es/…
  const link = (href: string) => withLang(href, lang);

  return (
    <div className="compare-page">
      <header className="compare-page-header">
        <button className="compare-page-nav-btn" onClick={() => navigate(link('/'))}>{t.navHome}</button>
        <div className="compare-page-logo">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <div className="compare-page-header-right">
          <LanguageToggle />
          <button className="compare-page-nav-btn" onClick={() => navigate(link('/support'))}>{t.navSupport}</button>
        </div>
      </header>

      <main className="compare-page-main">
        <section className="compare-page-hero">
          <div className="compare-page-eyebrow">{t.eyebrow}</div>
          <h1 className="compare-page-title">{t.title}</h1>
          <p className="compare-page-sub">{t.sub}</p>
        </section>

        {/* Differentiator cards */}
        <section className="compare-page-diffs">
          <h2 className="compare-page-h2">{t.diffsH2}</h2>
          <div className="compare-page-diffgrid">
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">📄</div>
              <h3>{t.diff1Title}</h3>
              <p>{t.diff1Body}</p>
            </div>
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">🛰️</div>
              <h3>{t.diff2Title}</h3>
              <p>{t.diff2Body}</p>
            </div>
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">📡</div>
              <h3>{t.diff3Title}</h3>
              <p>{t.diff3Body}</p>
            </div>
            <div className="compare-page-diffcard">
              <div className="compare-page-difficon">🪪</div>
              <h3>{t.diff4Title}</h3>
              <p>{t.diff4Body}</p>
            </div>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="compare-page-tablewrap">
          <h2 className="compare-page-h2">{t.tableH2}</h2>
          <p className="compare-page-tablesub">
            <span className="cmp-yes">✓</span> {t.legendAvailable} · <span className="cmp-limited">◐</span> {t.legendPartial} · <span className="cmp-no">—</span> {t.legendNot}
          </p>
          <div className="compare-page-tablescroll">
            <table className="compare-page-table">
              <thead>
                <tr>
                  <th>{t.thFeature}</th>
                  <th className="compare-page-th-self">PreFlight 107</th>
                  <th>B4UFLY</th>
                  <th>AirMap</th>
                  <th>Aloft</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td>{lang === 'es' ? row.featureEs : row.feature}</td>
                    <td className="compare-page-td-self"><Mark value={row.preflight} limitedTitle={t.markLimitedTitle} /></td>
                    <td><Mark value={row.b4ufly} limitedTitle={t.markLimitedTitle} /></td>
                    <td><Mark value={row.airmap} limitedTitle={t.markLimitedTitle} /></td>
                    <td><Mark value={row.aloft} limitedTitle={t.markLimitedTitle} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="compare-page-disclaimer">{t.disclaimer}</p>
        </section>

        {/* CTA */}
        <section className="compare-page-cta">
          <h2 className="compare-page-h2">{t.ctaH2}</h2>
          <p>{t.ctaBody}</p>
          <div className="compare-page-ctaactions">
            <a
              className="cta-button"
              href="https://apps.apple.com/app/preflight-107/id6760437132"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ctaAppStore}
            </a>
            <button
              className="cta-button-secondary"
              onClick={() => navigate(link('/'))}
            >
              {t.ctaFullList}
            </button>
          </div>
        </section>

        <footer className="compare-page-footer">
          <a href={link('/')} onClick={(e) => { e.preventDefault(); navigate(link('/')); }}>preflight107.com</a>
          <span>·</span>
          <a href={link('/support')} onClick={(e) => { e.preventDefault(); navigate(link('/support')); }}>{t.footerSupport}</a>
          <span>·</span>
          <a href={link('/privacy')} onClick={(e) => { e.preventDefault(); navigate(link('/privacy')); }}>{t.footerPrivacy}</a>
          <span>·</span>
          <a href={link('/terms')} onClick={(e) => { e.preventDefault(); navigate(link('/terms')); }}>{t.footerTerms}</a>
        </footer>
      </main>
    </div>
  );
}
