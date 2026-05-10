import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';
import { SUPABASE_ANON, SUPABASE_URL } from './supabase';

const ADMIN_EMAIL = 'support@preflight107.com';

type GrantMode = 'lifetime' | 'days' | 'fromDate';

interface UserStatus {
  found: boolean;
  subscription_status: string | null;
  is_lifetime_pro: boolean | null;
  pro_override_until: string | null;
  effective_tier: string | null;
}

async function callRpc(fnName: string, args: Record<string, unknown>, accessToken: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message || `RPC ${fnName} failed`);
  return data;
}

export default function AdminPage() {
  const { user, session, signOut } = useAuth();

  const [lookupEmail, setLookupEmail] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [grantMode, setGrantMode] = useState<GrantMode>('days');
  const [days, setDays] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultOk, setResultOk] = useState(true);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={styles.gate}>
        <p style={styles.gateText}>Access denied.</p>
        <button style={styles.backBtn} onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  async function lookupUser() {
    const email = lookupEmail.trim().toLowerCase();
    if (!email || !session) return;
    setLookingUp(true);
    setUserStatus(null);
    setResultMsg('');
    try {
      const data = await callRpc('admin_get_user_status', { user_email: email }, session.access_token);
      const row = Array.isArray(data) ? data[0] : data;
      setUserStatus(row ?? { found: false, subscription_status: null, is_lifetime_pro: null, pro_override_until: null, effective_tier: null });
    } catch (e: any) {
      setResultMsg('Error: ' + e.message);
      setResultOk(false);
    }
    setLookingUp(false);
  }

  async function grantPro() {
    const email = lookupEmail.trim().toLowerCase();
    if (!email || !session) return;
    setBusy(true);
    setResultMsg('');
    try {
      let result: string;
      if (grantMode === 'lifetime') {
        result = await callRpc('admin_grant_lifetime_pro', { user_email: email }, session.access_token);
      } else if (grantMode === 'days') {
        const d = parseInt(days, 10);
        if (!d || d <= 0) { alert('Enter a valid number of days'); setBusy(false); return; }
        result = await callRpc('admin_grant_pro_days', { user_email: email, days: d }, session.access_token);
      } else {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) { alert('Enter start date as YYYY-MM-DD'); setBusy(false); return; }
        const d = parseInt(days, 10);
        if (!d || d <= 0) { alert('Enter a valid number of days'); setBusy(false); return; }
        result = await callRpc('admin_grant_pro_from_date', { user_email: email, start_date: startDate, days: d }, session.access_token);
      }
      setResultMsg(result ?? 'Done');
      setResultOk(true);
      lookupUser();
    } catch (e: any) {
      setResultMsg('Error: ' + e.message);
      setResultOk(false);
    }
    setBusy(false);
  }

  async function revokePro() {
    const email = lookupEmail.trim().toLowerCase();
    if (!email || !session) return;
    if (!window.confirm(`Remove all pro overrides for ${email}?`)) return;
    setBusy(true);
    setResultMsg('');
    try {
      const result = await callRpc('admin_revoke_pro', { user_email: email }, session.access_token);
      setResultMsg(result ?? 'Done');
      setResultOk(true);
      lookupUser();
    } catch (e: any) {
      setResultMsg('Error: ' + e.message);
      setResultOk(false);
    }
    setBusy(false);
  }

  function tierLabel(tier: string | null) {
    switch (tier) {
      case 'lifetime_override': return { label: 'Lifetime Pro (override)', color: '#A78BFA' };
      case 'timed_override':    return { label: 'Timed Pro (override)',    color: '#60A5FA' };
      case 'paid':              return { label: 'Pro (paid via RevenueCat)', color: '#34D399' };
      default:                  return { label: 'Free',                    color: '#9CA3AF' };
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backLink} onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <div>
            <h1 style={styles.title}>Admin Panel</h1>
            <p style={styles.subtitle}>Signed in as {user.email}</p>
          </div>
          <button style={styles.signOutBtn} onClick={() => { signOut(); navigate('/'); }}>Sign Out</button>
        </div>

        {/* User Lookup */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>USER LOOKUP</h2>
          <div style={styles.row}>
            <input
              style={styles.emailInput}
              type="email"
              placeholder="user@example.com"
              value={lookupEmail}
              onChange={e => setLookupEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupUser()}
            />
            <button style={styles.lookupBtn} onClick={lookupUser} disabled={lookingUp}>
              {lookingUp ? 'Looking up…' : 'Look Up'}
            </button>
          </div>

          {userStatus && (
            <div style={styles.statusCard}>
              {!userStatus.found ? (
                <p style={styles.notFound}>No account found for that email.</p>
              ) : (
                <>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Current Tier</span>
                    <span style={{ ...styles.tierBadge, color: tierLabel(userStatus.effective_tier).color }}>
                      {tierLabel(userStatus.effective_tier).label}
                    </span>
                  </div>
                  {userStatus.subscription_status && (
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>RC Status</span>
                      <span style={styles.statusValue}>{userStatus.subscription_status}</span>
                    </div>
                  )}
                  {userStatus.pro_override_until && (
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Override Expires</span>
                      <span style={styles.statusValue}>
                        {new Date(userStatus.pro_override_until).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        {/* Grant Access */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>GRANT ACCESS</h2>

          {/* Lifetime */}
          <label style={{ ...styles.modeCard, ...(grantMode === 'lifetime' ? styles.modeCardActive : {}) }}>
            <input type="radio" name="mode" checked={grantMode === 'lifetime'} onChange={() => setGrantMode('lifetime')} style={{ marginRight: 10 }} />
            <span style={styles.modeText}>Lifetime Pro</span>
          </label>

          {/* Timed */}
          <label style={{ ...styles.modeCard, ...(grantMode === 'days' ? styles.modeCardActive : {}) }}>
            <input type="radio" name="mode" checked={grantMode === 'days'} onChange={() => setGrantMode('days')} style={{ marginRight: 10 }} />
            <span style={styles.modeText}>Timed — </span>
            <input
              style={styles.smallInput}
              type="number"
              min="1"
              value={days}
              onChange={e => setDays(e.target.value)}
              onClick={() => setGrantMode('days')}
            />
            <span style={styles.modeText}> days from today</span>
          </label>

          {/* From date */}
          <label style={{ ...styles.modeCard, ...(grantMode === 'fromDate' ? styles.modeCardActive : {}) }}>
            <input type="radio" name="mode" checked={grantMode === 'fromDate'} onChange={() => setGrantMode('fromDate')} style={{ marginRight: 10 }} />
            <span style={styles.modeText}>From date — </span>
            <input
              style={{ ...styles.smallInput, width: 130 }}
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              onClick={() => setGrantMode('fromDate')}
            />
            <span style={styles.modeText}> for </span>
            <input
              style={styles.smallInput}
              type="number"
              min="1"
              value={days}
              onChange={e => setDays(e.target.value)}
              onClick={() => setGrantMode('fromDate')}
            />
            <span style={styles.modeText}> days</span>
          </label>

          <div style={styles.actionRow}>
            <button style={styles.grantBtn} onClick={grantPro} disabled={busy}>
              {busy ? 'Working…' : 'Grant Pro'}
            </button>
            <button style={styles.revokeBtn} onClick={revokePro} disabled={busy}>
              Revoke
            </button>
          </div>

          {resultMsg && (
            <div style={{ ...styles.resultBox, ...(resultOk ? styles.resultOk : styles.resultError) }}>
              {resultMsg}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:            { minHeight: '100vh', backgroundColor: '#0D1117', color: '#C9D1D9', fontFamily: 'system-ui, sans-serif' },
  container:       { maxWidth: 640, margin: '0 auto', padding: '40px 20px' },
  header:          { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  backLink:        { background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14 },
  title:           { margin: 0, fontSize: 24, fontWeight: 800, color: '#FFFFFF', textAlign: 'center' },
  subtitle:        { margin: '4px 0 0', fontSize: 12, color: '#6B7280', textAlign: 'center' },
  signOutBtn:      { background: 'none', border: '1px solid #30363D', borderRadius: 8, color: '#9CA3AF', cursor: 'pointer', fontSize: 13, padding: '6px 12px' },
  section:         { marginBottom: 36 },
  sectionTitle:    { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#6B7280', marginBottom: 12 },
  row:             { display: 'flex', gap: 8, alignItems: 'center' },
  emailInput:      { flex: 1, backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: 10, padding: '11px 14px', color: '#FFFFFF', fontSize: 15, outline: 'none' },
  lookupBtn:       { backgroundColor: '#FBBF24', border: 'none', borderRadius: 10, padding: '11px 20px', color: '#0D1117', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' },
  statusCard:      { backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: 16, marginTop: 12 },
  notFound:        { color: '#9CA3AF', textAlign: 'center', margin: 0 },
  statusRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #21262D' },
  statusLabel:     { color: '#6B7280', fontSize: 13 },
  statusValue:     { color: '#C9D1D9', fontSize: 13, fontWeight: 600 },
  tierBadge:       { fontSize: 14, fontWeight: 700 },
  modeCard:        { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: 12, padding: '12px 16px', marginBottom: 10, cursor: 'pointer' },
  modeCardActive:  { borderColor: '#FBBF24' },
  modeText:        { color: '#C9D1D9', fontSize: 14 },
  smallInput:      { backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: 8, padding: '5px 10px', color: '#FFFFFF', fontSize: 14, width: 60, textAlign: 'center', outline: 'none' },
  actionRow:       { display: 'flex', gap: 10, marginTop: 20 },
  grantBtn:        { flex: 1, backgroundColor: '#FBBF24', border: 'none', borderRadius: 12, padding: '13px 0', color: '#0D1117', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  revokeBtn:       { flex: 1, backgroundColor: '#1F2937', border: '1px solid #EF4444', borderRadius: 12, padding: '13px 0', color: '#EF4444', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  resultBox:       { borderRadius: 10, padding: 14, marginTop: 14, fontSize: 13, lineHeight: 1.5 },
  resultOk:        { backgroundColor: '#052E16', border: '1px solid #16A34A', color: '#86EFAC' },
  resultError:     { backgroundColor: '#450A0A', border: '1px solid #DC2626', color: '#FCA5A5' },
  gate:            { minHeight: '100vh', backgroundColor: '#0D1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  gateText:        { color: '#9CA3AF', fontSize: 16 },
  backBtn:         { backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: 10, padding: '10px 20px', color: '#C9D1D9', cursor: 'pointer', fontSize: 14 },
};
