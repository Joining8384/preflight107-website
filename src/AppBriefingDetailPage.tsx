// /app/briefings/[id] — Mission Briefing detail view (web)
//
// Shows the briefing metadata, lets the owner download the generated PDF
// (via a Supabase Storage signed URL), and provides archive / verify-link
// actions. The PDF itself is rendered by the same Edge Function the iOS
// app uses, so what shows here is byte-identical to what the app produces.

import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import DashboardSidebar from './DashboardSidebar';
import { navigate } from './navigate';
import { SUPABASE_URL, fetchTable, updateRow } from './supabase';

interface Briefing {
  id: string;
  status: 'draft' | 'generated' | 'archived';
  mission_name: string | null;
  client_name: string | null;
  project_code: string | null;
  mission_objective: string | null;
  planned_departure_at: string | null;
  planned_duration_minutes: number | null;
  launch_address: string | null;
  launch_latitude: number | null;
  launch_longitude: number | null;
  briefing_code: string | null;
  tamper_hash: string | null;
  pdf_storage_path: string | null;
  pdf_size_bytes: number | null;
  pdf_page_count: number | null;
  client_mode_enabled: boolean;
  generated_at: string | null;
  created_at: string;
  pilot_name: string | null;
  pilot_part107_cert: string | null;
  drone_model: string | null;
  airspace_class: string | null;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    });
  } catch { return iso; }
}

function formatBytes(n: number | null): string {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function getSignedPdfUrl(path: string, accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/briefings/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON as string,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 3600 }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.signedURL) return null;
    return `${SUPABASE_URL}/storage/v1${data.signedURL}`;
  } catch {
    return null;
  }
}

export default function AppBriefingDetailPage({ id }: { id: string }) {
  const { session, user, signOut } = useAuth();
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) { navigate('/login'); return; }
    let cancelled = false;

    (async () => {
      try {
        const rows = await fetchTable<Briefing>('briefings', session.access_token, {
          select: '*',
          id: `eq.${id}`,
        });
        if (cancelled) return;
        if (rows.length === 0) {
          setError('Briefing not found');
          return;
        }
        const b = rows[0];
        setBriefing(b);
        if (b.pdf_storage_path && b.status === 'generated') {
          const url = await getSignedPdfUrl(b.pdf_storage_path, session.access_token);
          if (!cancelled) setSignedUrl(url);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();

    return () => { cancelled = true; };
  }, [session?.access_token, id]);

  async function handleArchive() {
    if (!session?.access_token || !briefing) return;
    if (!confirm('Archive this briefing? Archived briefings stay in your records but are hidden from the main list.')) return;
    setBusy(true);
    try {
      await updateRow('briefings', briefing.id, { status: 'archived' }, session.access_token);
      setBriefing({ ...briefing, status: 'archived' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyShareLink() {
    if (!briefing) return;
    // We share the canonical app URL — pilots can paste it anywhere and the
    // recipient (after sign-in) sees the briefing detail. Optionally we could
    // share a verify-page link prefilled with the hash for unauthenticated
    // recipients; offering both via a dropdown is post-launch polish.
    const url = `${window.location.origin}/app/briefings/${briefing.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      // Clipboard API failure (uncommon on https): fallback to prompt
      window.prompt('Copy this link to share the briefing:', url);
    }
  }

  async function handleUnarchive() {
    if (!session?.access_token || !briefing) return;
    setBusy(true);
    try {
      await updateRow('briefings', briefing.id, { status: 'generated' }, session.access_token);
      setBriefing({ ...briefing, status: 'generated' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="db-shell">
      <DashboardSidebar
        active="briefings"
        userEmail={user?.email}
        onSignOut={() => { signOut(); navigate('/'); }}
      />
      <main className="app-shell-with-sidebar">
        <header className="app-shell-header">
          <button className="app-shell-back" onClick={() => navigate('/app/briefings')}>← Briefings</button>
          <div className="app-shell-title">{briefing?.mission_name || 'Briefing'}</div>
          <div style={{ width: 80 }} />
        </header>

        <div className="app-shell-main">
        {error && <div className="app-error">{error}</div>}

        {!briefing && !error && <div className="app-loading">Loading…</div>}

        {briefing && (
          <>
            <div className="app-detail-header">
              <div>
                <div className="app-detail-code">{briefing.briefing_code || '(no code)'}</div>
                <h1 className="app-detail-title">{briefing.mission_name || 'Untitled mission'}</h1>
                <div className="app-detail-status">
                  <span className={`app-pill app-pill--${briefing.status === 'generated' ? 'gen' : briefing.status === 'archived' ? 'arch' : 'draft'}`}>
                    {briefing.status}
                  </span>
                  {briefing.client_mode_enabled && (
                    <span className="app-cm-badge" title="Client mode (white-label)">Client Mode</span>
                  )}
                </div>
              </div>

              <div className="app-detail-actions">
                {briefing.status === 'generated' && (
                  <button className="app-shell-cta-secondary" onClick={handleCopyShareLink}>
                    {copyState === 'copied' ? '✓ Link copied' : '🔗 Copy share link'}
                  </button>
                )}
                {briefing.status === 'generated' && signedUrl && (
                  <a
                    className="app-shell-cta app-shell-cta--gen"
                    href={signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download PDF ↓
                  </a>
                )}
                {briefing.status === 'generated' && !signedUrl && (
                  <button className="app-shell-cta" disabled>Preparing PDF link…</button>
                )}
                {briefing.status === 'generated' && (
                  <button className="app-shell-cta-secondary" onClick={handleArchive} disabled={busy}>Archive</button>
                )}
                {briefing.status === 'archived' && (
                  <button className="app-shell-cta-secondary" onClick={handleUnarchive} disabled={busy}>Unarchive</button>
                )}
                {briefing.tamper_hash && (
                  <a
                    className="app-shell-cta-secondary"
                    href={`/verify?hash=${briefing.tamper_hash}`}
                    onClick={e => { e.preventDefault(); navigate(`/verify?hash=${briefing.tamper_hash}`); }}
                  >
                    Verify hash →
                  </a>
                )}
              </div>
            </div>

            <section className="app-detail-section">
              <h3 className="app-detail-h">Mission</h3>
              <div className="app-detail-grid">
                <Row label="Client"        value={briefing.client_name} />
                <Row label="Project code"  value={briefing.project_code} />
                <Row label="Objective"     value={briefing.mission_objective} />
                <Row label="Departure"     value={formatDateTime(briefing.planned_departure_at)} />
                <Row label="Duration"      value={briefing.planned_duration_minutes ? `${briefing.planned_duration_minutes} min` : null} />
              </div>
            </section>

            <section className="app-detail-section">
              <h3 className="app-detail-h">Site</h3>
              <div className="app-detail-grid">
                <Row label="Address"       value={briefing.launch_address} />
                <Row label="Coordinates"   value={briefing.launch_latitude != null && briefing.launch_longitude != null ? `${briefing.launch_latitude.toFixed(4)}, ${briefing.launch_longitude.toFixed(4)}` : null} />
                <Row label="Airspace"      value={briefing.airspace_class} />
              </div>
            </section>

            <section className="app-detail-section">
              <h3 className="app-detail-h">Pilot &amp; Aircraft</h3>
              <div className="app-detail-grid">
                <Row label="Pilot"         value={briefing.pilot_name} />
                <Row label="Part 107 cert" value={briefing.pilot_part107_cert} />
                <Row label="Drone"         value={briefing.drone_model} />
              </div>
            </section>

            <section className="app-detail-section">
              <h3 className="app-detail-h">Document</h3>
              <div className="app-detail-grid">
                <Row label="Status"        value={briefing.status} />
                <Row label="Generated"     value={formatDateTime(briefing.generated_at)} />
                <Row label="Pages"         value={briefing.pdf_page_count?.toString()} />
                <Row label="Size"          value={formatBytes(briefing.pdf_size_bytes)} />
                <Row label="Tamper hash"   value={briefing.tamper_hash ? <code className="app-hash">{briefing.tamper_hash}</code> : null} />
              </div>
              {briefing.status === 'generated' && (
                <p className="app-detail-foot">
                  This briefing is locked. The SHA-256 hash above is stamped on every page of the PDF.
                  Anyone can verify the PDF hasn't been modified by pasting the hash into{' '}
                  <a href="/verify" onClick={e => { e.preventDefault(); navigate('/verify'); }}>preflight107.com/verify</a>.
                </p>
              )}
              {briefing.status === 'draft' && (
                <p className="app-detail-foot">
                  This briefing was saved but never generated to PDF. You can resume it from the iOS app, or delete it.
                </p>
              )}
            </section>
          </>
        )}
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="app-detail-row">
      <span className="app-detail-row-label">{label}</span>
      <span className="app-detail-row-value">{value || <em className="muted">—</em>}</span>
    </div>
  );
}
