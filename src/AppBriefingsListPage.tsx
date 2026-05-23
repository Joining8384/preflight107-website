// /app/briefings — My Briefings list (web)
//
// Mirrors the in-app My Briefings list. Reads the same `briefings` table the
// iOS app uses (RLS scopes to the logged-in user). Shows status, mission name,
// generation time, and links to the generated PDF.
//
// Tier gate: only Pro+ accounts can CREATE briefings; everyone can SEE their
// existing ones. The "New Briefing" button is gated on tier.

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';
import { SUPABASE_URL, fetchTable } from './supabase';

interface Briefing {
  id: string;
  status: 'draft' | 'generated' | 'archived';
  mission_name: string | null;
  client_name: string | null;
  launch_address: string | null;
  planned_departure_at: string | null;
  briefing_code: string | null;
  tamper_hash: string | null;
  client_mode_enabled: boolean;
  generated_at: string | null;
  created_at: string;
}

type Tier = 'free' | 'pro' | 'pro_plus';

async function fetchTier(accessToken: string, userId: string): Promise<Tier> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_tier`, {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON as string,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid: userId }),
    });
    if (!res.ok) return 'free';
    const data = await res.json();
    return (data as Tier) ?? 'free';
  } catch {
    return 'free';
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function StatusPill({ status }: { status: Briefing['status'] }) {
  const cls =
    status === 'generated' ? 'app-pill app-pill--gen' :
    status === 'archived'  ? 'app-pill app-pill--arch' :
                             'app-pill app-pill--draft';
  return <span className={cls}>{status}</span>;
}

export default function AppBriefingsListPage() {
  const { session, user } = useAuth();
  const [briefings, setBriefings] = useState<Briefing[] | null>(null);
  const [tier, setTier] = useState<Tier>('free');
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!session?.access_token || !user?.id) {
      navigate('/login');
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const [rows, t] = await Promise.all([
          fetchTable<Briefing>('briefings', session.access_token, {
            select: 'id,status,mission_name,client_name,launch_address,planned_departure_at,briefing_code,tamper_hash,client_mode_enabled,generated_at,created_at',
            order: 'created_at.desc',
          }),
          fetchTier(session.access_token, user.id),
        ]);
        if (cancelled) return;
        setBriefings(rows);
        setTier(t);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
      }
    })();

    return () => { cancelled = true; };
  }, [session?.access_token, user?.id]);

  const visible = useMemo(() => {
    if (!briefings) return [];
    return showArchived ? briefings : briefings.filter(b => b.status !== 'archived');
  }, [briefings, showArchived]);

  const canCreate = tier === 'pro_plus';

  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <button className="app-shell-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <div className="app-shell-title">My Briefings</div>
        <button
          className="app-shell-cta"
          onClick={() => canCreate ? navigate('/app/briefings/new') : navigate('/#pricing')}
          disabled={!session}
          title={canCreate ? 'Create a new Mission Briefing' : 'Pro+ required to create briefings'}
        >
          {canCreate ? '+ New Briefing' : 'Upgrade to Pro+'}
        </button>
      </header>

      <main className="app-shell-main">
        {!canCreate && (
          <div className="app-tier-banner">
            <strong>Mission Briefings are a Pro+ feature.</strong>{' '}
            Upgrade in the iOS app or <a href="/#pricing" onClick={e => { e.preventDefault(); navigate('/#pricing'); }}>see plans</a> to start generating tamper-evident briefing PDFs from the web.
            {briefings && briefings.length > 0 && ' You can still view and download your existing briefings below.'}
          </div>
        )}

        {error && (
          <div className="app-error">Failed to load briefings: {error}</div>
        )}

        {briefings === null && !error && (
          <div className="app-loading">Loading…</div>
        )}

        {briefings && briefings.length === 0 && (
          <div className="app-empty">
            <h2>No briefings yet</h2>
            <p>
              {canCreate
                ? 'Tap "+ New Briefing" above to generate your first Mission Briefing PDF — same tamper-evident, FAA-style document the iOS app produces.'
                : 'When you create your first Mission Briefing in the iOS app or after upgrading to Pro+, it\'ll appear here.'}
            </p>
            {canCreate && (
              <button className="app-shell-cta" onClick={() => navigate('/app/briefings/new')}>
                + Create your first briefing
              </button>
            )}
          </div>
        )}

        {briefings && briefings.length > 0 && (
          <>
            <div className="app-filter-row">
              <label className="app-toggle">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={e => setShowArchived(e.target.checked)}
                />
                <span>Show archived ({briefings.filter(b => b.status === 'archived').length})</span>
              </label>
            </div>

            <div className="app-briefing-list">
              {visible.map(b => (
                <button
                  key={b.id}
                  className="app-briefing-card"
                  onClick={() => navigate(`/app/briefings/${b.id}`)}
                >
                  <div className="app-briefing-card-head">
                    <div className="app-briefing-card-title">
                      {b.mission_name || <em className="muted">Untitled mission</em>}
                      {b.client_mode_enabled && (
                        <span className="app-cm-badge" title="Client mode (white-label)">CM</span>
                      )}
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="app-briefing-card-meta">
                    {b.briefing_code && <span className="app-code">{b.briefing_code}</span>}
                    {b.client_name && <span>· {b.client_name}</span>}
                    {b.launch_address && <span>· {b.launch_address}</span>}
                  </div>
                  <div className="app-briefing-card-meta app-briefing-card-meta--muted">
                    {b.status === 'generated' && b.generated_at
                      ? `Generated ${formatDateTime(b.generated_at)}`
                      : `Created ${formatDateTime(b.created_at)}`}
                    {b.planned_departure_at && ` · Window ${formatDateTime(b.planned_departure_at)}`}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
