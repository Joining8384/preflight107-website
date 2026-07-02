// Public read-only page for a shared drone launch link.
// URL pattern: https://preflight107.com/launch/{token}
//
// Backed by the SECURITY DEFINER RPC `get_shared_launch(token_key)` which
// filters out expired and ended links automatically. No auth required.

import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON } from './supabase';
import { navigate } from './navigate';

const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) ?? '';

interface LaunchSnapshot {
  pilotName?: string;
  droneModel?: string | null;
  tempF?: number | null;
  windMph?: number | null;
  gustMph?: number | null;
  visMiles?: string | number | null;
  clouds?: string | null;
  ceiling?: number | null;
  flightCategory?: string | null;
  airspaceLabel?: string | null;
  airspaceCeiling?: number | null;
  airspaceWarning?: string | null;
  tfrs?: Array<{ title: string; contains?: boolean }> | null;
}

interface LaunchData {
  token: string;
  lat: number;
  lng: number;
  location_name: string | null;
  snapshot: LaunchSnapshot;
  note: string | null;
  expected_minutes: number | null;
  created_at: string;
  expires_at: string;
  is_live?: boolean;
  updated_at?: string | null;
}

function timeAgo(iso: string | null | undefined, nowMs: number): string {
  if (!iso) return '';
  const s = Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

async function fetchLaunch(token: string): Promise<LaunchData | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_shared_launch`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token_key: token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0] as LaunchData;
  } catch {
    return null;
  }
}

function buildStaticMapUrl(lat: number, lng: number): string | null {
  if (!MAPBOX_TOKEN) return null;
  const marker = `pin-l-airport+06b6d4(${lng.toFixed(6)},${lat.toFixed(6)})`;
  const center = `${lng.toFixed(6)},${lat.toFixed(6)},13`;
  return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${marker}/${center}/640x360@2x?access_token=${MAPBOX_TOKEN}`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function categoryColor(cat?: string | null): string {
  switch ((cat || '').toUpperCase()) {
    case 'VFR': return '#10B981';
    case 'MVFR': return '#3B82F6';
    case 'IFR': return '#F59E0B';
    case 'LIFR': return '#EF4444';
    default: return '#8B949E';
  }
}

export default function LaunchSharePage({ token }: { token: string }) {
  const [data, setData] = useState<LaunchData | null | undefined>(undefined);
  const [now, setNow] = useState<number>(() => Date.now());

  // Fetch once; for LIVE links, re-fetch every 25s so the map pin + conditions
  // follow the pilot. Snapshots never change, so we don't poll them.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      const result = await fetchLaunch(token);
      if (cancelled) return;
      setData(result);
      if (result?.is_live) timer = setTimeout(load, 25_000);
    };
    load();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [token]);

  // Tick every second so "updated Ns ago" counts up smoothly on live links.
  useEffect(() => {
    if (!data?.is_live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [data?.is_live]);

  if (data === undefined) {
    return (
      <div className="launch-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#8B949E' }}>Loading launch info…</div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="launch-page" style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✈️</div>
          <h1 style={{ ...titleStyle, marginBottom: 8 }}>Flight Ended</h1>
          <p style={subtitleStyle}>
            This launch link has expired or been deactivated. The pilot may have ended their flight, or the link is older than 24 hours.
          </p>
          <button onClick={() => navigate('/')} style={ctaStyle}>
            Get PreFlight 107
          </button>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(data.expires_at);
  const startedAt = new Date(data.created_at);
  const expectedLanding = data.expected_minutes
    ? new Date(startedAt.getTime() + data.expected_minutes * 60_000)
    : null;
  const mapUrl = buildStaticMapUrl(data.lat, data.lng);
  const snap = data.snapshot || {};
  const pilotName = snap.pilotName || 'A drone pilot';
  const fc = snap.flightCategory;

  return (
    <div className="launch-page" style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 26 }}>✈️</span>
          <span style={{ color: 'var(--accent, #06B6D4)', fontWeight: 700, fontSize: 14, letterSpacing: 0.4 }}>
            PREFLIGHT 107
          </span>
          {data.is_live ? (
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              LIVE
            </span>
          ) : (
            <span style={{ marginLeft: 'auto', color: '#8B949E', fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>SNAPSHOT</span>
          )}
        </div>

        <h1 style={titleStyle}>{pilotName} is flying now</h1>
        {data.location_name && (
          <p style={{ ...subtitleStyle, marginBottom: data.is_live ? 4 : 16 }}>{data.location_name}</p>
        )}
        {data.is_live && (
          <p style={{ color: '#10B981', fontSize: 12, fontWeight: 600, margin: '0 0 16px' }}>
            Tracking live · updated {timeAgo(data.updated_at || data.created_at, now)}
          </p>
        )}

        {mapUrl && (
          <img
            src={mapUrl}
            alt="Launch site map"
            style={{ width: '100%', borderRadius: 12, marginBottom: 16, display: 'block' }}
          />
        )}
        {!mapUrl && (
          <div style={{ background: '#161B22', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 16, color: '#8B949E', fontSize: 13 }}>
            📍 {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={statStyle}>
            <div style={statLabelStyle}>Started</div>
            <div style={statValueStyle}>{formatTime(data.created_at)}</div>
            <div style={{ ...statLabelStyle, fontSize: 11 }}>{formatDate(data.created_at)}</div>
          </div>
          {expectedLanding ? (
            <div style={statStyle}>
              <div style={statLabelStyle}>Active until</div>
              <div style={statValueStyle}>{formatTime(expectedLanding.toISOString())}</div>
              <div style={{ ...statLabelStyle, fontSize: 11 }}>{data.expected_minutes} min session</div>
            </div>
          ) : (
            <div style={statStyle}>
              <div style={statLabelStyle}>Active until</div>
              <div style={statValueStyle}>{formatTime(data.expires_at)}</div>
              <div style={{ ...statLabelStyle, fontSize: 11 }}>{formatDate(data.expires_at)}</div>
            </div>
          )}
        </div>

        {(snap.tempF != null || snap.windMph != null || snap.visMiles != null || snap.clouds || fc || snap.droneModel) && (
          <div style={{ background: '#161B22', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#C9D1D9', fontSize: 13, fontWeight: 600 }}>Launch Conditions</span>
              {fc && (
                <span style={{ background: categoryColor(fc) + '22', color: categoryColor(fc), padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  {fc}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, color: '#F0F6FC' }}>
              {snap.tempF != null && <div>🌡️ {Math.round(snap.tempF)}°F</div>}
              {snap.windMph != null && (
                <div>🌬️ {Math.round(snap.windMph)} mph{snap.gustMph != null ? ` · gusts ${Math.round(snap.gustMph)}` : ''}</div>
              )}
              {snap.visMiles != null && <div>👁️ Visibility {snap.visMiles} mi</div>}
              {snap.clouds && <div>☁️ {snap.clouds}</div>}
              {snap.ceiling != null && <div>📐 Ceiling {snap.ceiling.toLocaleString()} ft</div>}
              {snap.droneModel && <div>🚁 {snap.droneModel}</div>}
            </div>
          </div>
        )}

        {(snap.airspaceLabel || snap.airspaceWarning) && (
          <div style={{
            background: snap.airspaceWarning ? 'rgba(239,68,68,0.15)' : '#161B22',
            border: snap.airspaceWarning ? '1px solid #EF4444' : '1px solid transparent',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}>
            <div style={{ color: '#C9D1D9', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Airspace</div>
            <div style={{ color: snap.airspaceWarning ? '#EF4444' : '#F0F6FC', fontSize: 14, fontWeight: snap.airspaceWarning ? 700 : 500 }}>
              {snap.airspaceWarning ? '⛔ ' : '🛡️ '}{snap.airspaceLabel}
            </div>
            {snap.airspaceCeiling != null && (
              <div style={{ color: '#8B949E', fontSize: 12, marginTop: 4 }}>
                LAANC ceiling: {snap.airspaceCeiling.toLocaleString()} ft AGL
              </div>
            )}
          </div>
        )}

        {Array.isArray(snap.tfrs) && snap.tfrs.length > 0 && (
          <div style={{
            background: snap.tfrs.some(t => t.contains) ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${snap.tfrs.some(t => t.contains) ? '#EF4444' : '#F59E0B'}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}>
            <div style={{ color: '#C9D1D9', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Temporary Flight Restrictions
            </div>
            {snap.tfrs.map((t, i) => (
              <div key={i} style={{ color: t.contains ? '#EF4444' : '#F59E0B', fontSize: 13, fontWeight: t.contains ? 700 : 500, marginTop: i === 0 ? 0 : 4 }}>
                {t.contains ? '⛔ Over launch site — ' : '⚠️ Nearby — '}{t.title}
              </div>
            ))}
          </div>
        )}

        {data.note && (
          <div style={{ background: '#0D1117', border: '1px solid #21262D', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ color: '#6E7681', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>NOTE FROM PILOT</div>
            <div style={{ color: '#F0F6FC', fontSize: 14, lineHeight: 1.4 }}>{data.note}</div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <p style={{ color: '#6E7681', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
            Real-time weather, airspace, ADS-B traffic, and flight logging for drone pilots.
          </p>
          <button onClick={() => navigate('/')} style={ctaStyle}>
            Get PreFlight 107
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </div>
  );
}

// ── Inline styles (matches existing legal/marketing page tone) ───────────────
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0A0E13',
  padding: '24px 16px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
};
const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 460,
  background: '#0D1117',
  border: '1px solid #21262D',
  borderRadius: 16,
  padding: 20,
};
const titleStyle: React.CSSProperties = { color: '#F0F6FC', fontSize: 22, fontWeight: 700, margin: 0 };
const subtitleStyle: React.CSSProperties = { color: '#8B949E', fontSize: 14, margin: '4px 0 0' };
const statStyle: React.CSSProperties = { background: '#161B22', borderRadius: 10, padding: '12px 14px' };
const statLabelStyle: React.CSSProperties = { color: '#6E7681', fontSize: 11, fontWeight: 700, letterSpacing: 0.4 };
const statValueStyle: React.CSSProperties = { color: '#F0F6FC', fontSize: 18, fontWeight: 700, margin: '4px 0' };
const ctaStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
  color: '#FFFFFF',
  border: 'none',
  padding: '12px 24px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};
