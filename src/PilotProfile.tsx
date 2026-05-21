// Public Pilot Profile page.
// URL: https://preflight107.com/pilot/<account_number>
//
// Anyone (no login) can land here from a scanned Apple Wallet pilot card
// QR code. Shows the pilot's PUBLIC info — name, Part 107 cert, business
// branding, contact, insurance summary, briefing count — backed by the
// SECURITY DEFINER RPC `get_public_pilot_profile` which controls exactly
// which fields are exposed.
//
// Pilots opt in to having a public profile by signing up + setting up
// their business profile in the app. The URL is shared via the Apple
// Wallet pass's QR code; nothing else publicly indexes the page.

import { useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON } from './supabase';
import { navigate } from './navigate';

interface PilotProfile {
  account_number: string;
  full_name: string | null;
  faa_certificate: string | null;
  certificate_type: string | null;
  business_name: string | null;
  business_contact: string | null;
  business_address: string | null;
  business_brand_color: string | null;
  business_logo_url: string | null;
  insurance_provider: string | null;
  insurance_type: string | null;
  has_part107: boolean;
  briefing_count: number;
}

async function fetchProfile(accountNumber: string): Promise<PilotProfile | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_pilot_profile`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_no: accountNumber }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0] as PilotProfile;
  } catch {
    return null;
  }
}

// Sanity-check the account number shape before hitting Supabase — saves a
// round-trip when someone hand-types a malformed URL.
function isValidAccountNumber(s: string): boolean {
  return /^PF[0-9A-F]{8}$/i.test(s);
}

function isValidHexColor(s: string | null): boolean {
  return !!s && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);
}

// Tap-to-call/email: detect whether contact line looks like a phone number
// or an email so we can render the right href. Pilots type whatever in the
// Business Settings field, so we sniff at render time.
function formatContact(contact: string): { href: string; label: string; kind: 'phone' | 'email' | 'other' } {
  const trimmed = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { href: `mailto:${trimmed}`, label: trimmed, kind: 'email' };
  }
  // Strip everything except digits + leading +; if 7+ digits remain, treat as phone
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.replace(/^\+/, '').length >= 7) {
    return { href: `tel:${digits}`, label: trimmed, kind: 'phone' };
  }
  return { href: '#', label: trimmed, kind: 'other' };
}

export default function PilotProfile() {
  const accountNumber = window.location.pathname.replace(/^\/pilot\//, '').toUpperCase();
  const [profile, setProfile] = useState<PilotProfile | null | 'loading' | 'not_found' | 'invalid'>('loading');

  useEffect(() => {
    if (!isValidAccountNumber(accountNumber)) {
      setProfile('invalid');
      return;
    }
    void (async () => {
      const result = await fetchProfile(accountNumber);
      setProfile(result ?? 'not_found');
    })();
  }, [accountNumber]);

  // ─── States: invalid URL / not found / loading ───────────────────────
  if (profile === 'invalid') {
    return (
      <ProfileShell>
        <div className="pilot-empty">
          <div className="pilot-empty-icon">⚠️</div>
          <h1>Invalid pilot link</h1>
          <p>The URL doesn't look like a PreFlight 107 pilot card. Profiles look like <code>/pilot/PFXXXXXXXX</code>.</p>
          <button className="pilot-cta" onClick={() => navigate('/')}>Go to homepage</button>
        </div>
      </ProfileShell>
    );
  }
  if (profile === 'not_found') {
    return (
      <ProfileShell>
        <div className="pilot-empty">
          <div className="pilot-empty-icon">🔍</div>
          <h1>Pilot not found</h1>
          <p>This profile doesn't exist or has been deactivated.</p>
          <button className="pilot-cta" onClick={() => navigate('/')}>Go to homepage</button>
        </div>
      </ProfileShell>
    );
  }
  if (profile === 'loading') {
    return (
      <ProfileShell>
        <div className="pilot-empty">
          <p style={{ opacity: 0.6 }}>Loading pilot profile…</p>
        </div>
      </ProfileShell>
    );
  }

  // ─── Found — render the profile ──────────────────────────────────────
  const p = profile;
  const brandColor = isValidHexColor(p.business_brand_color) ? p.business_brand_color! : '#0D1117';
  const displayName = p.full_name?.trim() || 'PreFlight 107 Pilot';
  const businessName = p.business_name?.trim() || null;
  const contactInfo = p.business_contact?.trim() ? formatContact(p.business_contact) : null;
  const insuranceLine = p.insurance_provider?.trim()
    ? (p.insurance_type?.trim() ? `${p.insurance_provider} — ${p.insurance_type}` : p.insurance_provider)
    : null;

  return (
    <ProfileShell>
      {/* Hero — brand-colored card */}
      <section className="pilot-hero" style={{ background: brandColor }}>
        {businessName && (
          <div className="pilot-hero-business">{businessName}</div>
        )}
        <h1 className="pilot-hero-name">{displayName}</h1>
        {p.has_part107 && (
          <div className="pilot-hero-badge">
            <span className="pilot-hero-badge-check">✓</span>
            Verified FAA Part 107 Pilot
          </div>
        )}
      </section>

      {/* Credentials block */}
      <section className="pilot-section">
        <div className="pilot-section-label">CREDENTIALS</div>
        <div className="pilot-row">
          <span className="pilot-row-label">Pilot ID</span>
          <span className="pilot-row-value pilot-row-mono">{p.account_number}</span>
        </div>
        {p.faa_certificate && (
          <div className="pilot-row">
            <span className="pilot-row-label">Part 107 Cert #</span>
            <span className="pilot-row-value pilot-row-mono">{p.faa_certificate}</span>
          </div>
        )}
        {p.faa_certificate && (
          <a
            className="pilot-verify-link"
            href="https://amsrvs.registry.faa.gov/airmeninquiry"
            target="_blank"
            rel="noopener noreferrer"
          >
            Independently verify this cert at the FAA Airman Registry →
          </a>
        )}
      </section>

      {/* Contact block */}
      {(contactInfo || p.business_address) && (
        <section className="pilot-section">
          <div className="pilot-section-label">CONTACT</div>
          {contactInfo && (
            <a className="pilot-row pilot-row-clickable" href={contactInfo.href}>
              <span className="pilot-row-label">
                {contactInfo.kind === 'email' ? 'Email' : contactInfo.kind === 'phone' ? 'Phone' : 'Contact'}
              </span>
              <span className="pilot-row-value pilot-row-link">{contactInfo.label}</span>
            </a>
          )}
          {p.business_address && (
            <div className="pilot-row">
              <span className="pilot-row-label">Address</span>
              <span className="pilot-row-value">{p.business_address}</span>
            </div>
          )}
        </section>
      )}

      {/* Insurance block — credibility signal */}
      {insuranceLine && (
        <section className="pilot-section">
          <div className="pilot-section-label">INSURANCE</div>
          <div className="pilot-row">
            <span className="pilot-row-label">Coverage</span>
            <span className="pilot-row-value">{insuranceLine}</span>
          </div>
        </section>
      )}

      {/* Activity block — soft proof-of-work */}
      <section className="pilot-section">
        <div className="pilot-section-label">ACTIVITY</div>
        <div className="pilot-row">
          <span className="pilot-row-label">Mission briefings generated</span>
          <span className="pilot-row-value">{p.briefing_count}</span>
        </div>
        {p.briefing_count > 0 && (
          <p className="pilot-section-note">
            Each briefing is a tamper-verified pre-flight planning document. You can verify any briefing's
            integrity at <a href="/verify" onClick={(e) => { e.preventDefault(); navigate('/verify'); }}>preflight107.com/verify</a>.
          </p>
        )}
      </section>

      {/* Footer */}
      <section className="pilot-footer">
        <p>
          <strong>Powered by PreFlight 107</strong> — the pre-flight planning + flight-log app for
          FAA Part 107 remote pilots.
        </p>
        <p>
          Self-reported credentials. Verify Part 107 status independently at the FAA Airman Registry.
          Insurance details are reported by the pilot and not independently verified by PreFlight 107.
        </p>
        <button className="pilot-cta-secondary" onClick={() => navigate('/')}>
          Learn more about PreFlight 107
        </button>
      </section>
    </ProfileShell>
  );
}

function ProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pilot-page">
      <header className="pilot-page-header">
        <button className="pilot-nav-btn" onClick={() => navigate('/')}>← Home</button>
        <div className="pilot-page-logo">
          <span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107
        </div>
        <div style={{ width: 70 }} />
      </header>
      <main className="pilot-page-main">
        {children}
      </main>
    </div>
  );
}
