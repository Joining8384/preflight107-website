// Public Mission Briefing tamper verification page.
// URL: https://preflight107.com/verify
//
// Anyone (no login) can paste a SHA-256 tamper hash from a Mission Briefing
// PDF footer and see whether it matches a real briefing in our database.
// Returns only safe metadata — never sensitive pilot or flight details.
//
// Backed by the SECURITY DEFINER RPC `verify_briefing_hash(hash)` which
// allows anonymous + authenticated calls but returns only:
//   • status, generated_at, mission_name (unless client-mode), pilot_initials,
//     briefing_format_version, hash_algorithm

import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON } from './supabase';
import { navigate } from './navigate';

interface VerifyResult {
  found: boolean;
  status: string | null;
  generated_at: string | null;
  mission_name: string | null;
  pilot_initials: string | null;
  briefing_format_version: number | null;
  hash_algorithm: string | null;
}

async function callVerify(hash: string): Promise<VerifyResult | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_briefing_hash`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hash }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0] as VerifyResult;
  } catch {
    return null;
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

function normalizeHash(input: string): string {
  // Strip whitespace, lowercase. Accept hashes pasted with prefixes like "sha256:..."
  return input
    .replace(/^sha256:/i, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function isValidHashShape(hash: string): boolean {
  return /^[0-9a-f]{64}$/.test(hash);
}

export default function VerifyPage() {
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState<VerifyResult | null | 'pending' | 'invalid'>(null);
  const [submitting, setSubmitting] = useState(false);

  // Allow ?hash=... in the URL to auto-verify (useful for sharing verify links).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('hash');
    if (initial) {
      const normalized = normalizeHash(initial);
      setHashInput(normalized);
      if (isValidHashShape(normalized)) {
        void verify(normalized);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(hash: string) {
    setSubmitting(true);
    setResult('pending');
    const data = await callVerify(hash);
    setSubmitting(false);
    setResult(data ?? { found: false, status: null, generated_at: null, mission_name: null, pilot_initials: null, briefing_format_version: null, hash_algorithm: null });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeHash(hashInput);
    if (!isValidHashShape(normalized)) {
      setResult('invalid');
      return;
    }
    setHashInput(normalized);
    void verify(normalized);
  }

  return (
    <div className="verify-page">
      <header className="verify-header">
        <button className="verify-nav-btn" onClick={() => navigate('/')}>← Home</button>
        <div className="verify-logo">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <button className="verify-nav-btn" onClick={() => navigate('/support')}>Support</button>
      </header>

      <main className="verify-main">
        <section className="verify-hero">
          <div className="verify-eyebrow">Tamper Verification</div>
          <h1 className="verify-title">Verify a Mission Briefing</h1>
          <p className="verify-sub">
            Paste the verification hash from the footer of any PreFlight 107 Mission Briefing PDF.
            We'll confirm whether it matches a real briefing we generated, and that it hasn't been modified.
          </p>
        </section>

        <form className="verify-form" onSubmit={onSubmit}>
          <label className="verify-label" htmlFor="hash-input">
            SHA-256 Hash
          </label>
          <textarea
            id="hash-input"
            className="verify-input"
            placeholder="e.g. 7a3f9c2b1e8d… (64 hex characters)"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            rows={2}
          />
          <button type="submit" className="verify-btn" disabled={submitting || !hashInput.trim()}>
            {submitting ? 'Checking…' : 'Verify briefing'}
          </button>
        </form>

        {result === 'invalid' && (
          <div className="verify-result verify-result-invalid">
            <div className="verify-result-icon">⚠️</div>
            <div className="verify-result-title">Invalid hash format</div>
            <div className="verify-result-message">
              A valid tamper hash is exactly 64 hexadecimal characters. Try copying it again from the briefing PDF footer.
            </div>
          </div>
        )}

        {result === 'pending' && (
          <div className="verify-result verify-result-pending">
            <div className="verify-result-message">Checking…</div>
          </div>
        )}

        {result && typeof result === 'object' && (
          result.found ? (
            <div className="verify-result verify-result-ok">
              <div className="verify-result-icon">✓</div>
              <div className="verify-result-title">Verified — briefing matches our records</div>
              <div className="verify-result-message">
                This Mission Briefing was generated by PreFlight 107 and the PDF has not been modified since generation.
              </div>
              <div className="verify-meta">
                <div className="verify-meta-row">
                  <span className="verify-meta-label">Generated</span>
                  <span className="verify-meta-value">{formatDateTime(result.generated_at)}</span>
                </div>
                {result.mission_name && (
                  <div className="verify-meta-row">
                    <span className="verify-meta-label">Mission</span>
                    <span className="verify-meta-value">{result.mission_name}</span>
                  </div>
                )}
                <div className="verify-meta-row">
                  <span className="verify-meta-label">Pilot</span>
                  <span className="verify-meta-value">{result.pilot_initials ?? '—'}</span>
                </div>
                <div className="verify-meta-row">
                  <span className="verify-meta-label">Briefing format</span>
                  <span className="verify-meta-value">v{result.briefing_format_version ?? '—'}</span>
                </div>
                <div className="verify-meta-row">
                  <span className="verify-meta-label">Hash algorithm</span>
                  <span className="verify-meta-value">{(result.hash_algorithm ?? 'sha256').toUpperCase()}</span>
                </div>
              </div>
              <div className="verify-meta-note">
                Pilot identity is shown as initials only. Mission details may be hidden if the
                pilot generated the briefing in white-label client mode. To get full details,
                request a copy of the original PDF from the pilot.
              </div>
            </div>
          ) : (
            <div className="verify-result verify-result-notfound">
              <div className="verify-result-icon">✕</div>
              <div className="verify-result-title">No briefing found with this hash</div>
              <div className="verify-result-message">
                We couldn't find a briefing matching this hash. Possible reasons:
              </div>
              <ul className="verify-list">
                <li>The hash was copied incorrectly — try again, paying attention to similar characters (0/O, 1/l)</li>
                <li>The briefing was generated by a different system (not PreFlight 107)</li>
                <li>The PDF was modified after generation, changing its hash</li>
                <li>The briefing was archived and removed from our database</li>
              </ul>
            </div>
          )
        )}

        <section className="verify-info">
          <h2 className="verify-info-title">How tamper verification works</h2>
          <p>
            When PreFlight 107 generates a Mission Briefing, we compute a SHA-256 hash from the
            weather, airspace, hazards, pilot certification, and other authoritative data
            captured at generation time. The hash is printed on every page of the PDF and stored
            in our database.
          </p>
          <p>
            If anyone modifies the PDF — changes a wind speed, alters a timestamp, edits the
            pilot's signature line — the hash printed on the document no longer matches the
            hash on file. This page lets anyone verify that a PDF you've received is genuine
            and unmodified.
          </p>
          <p>
            The verification is read-only and reveals only minimal metadata. Pilot certificate
            numbers, FAA registrations, insurance policies, and detailed contents are never
            exposed by this page.
          </p>
        </section>

        <footer className="verify-footer">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>preflight107.com</a>
          <span>·</span>
          <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>Support</a>
          <span>·</span>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy</a>
        </footer>
      </main>
    </div>
  );
}
