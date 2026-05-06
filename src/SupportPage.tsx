import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';
import { SUPABASE_ANON, SUPABASE_URL } from './supabase';

const SUPABASE_FUNCTIONS_URL =
  `${SUPABASE_URL}/functions/v1/send-support-email`;

const TOPICS = [
  'General Question',
  'Bug Report',
  'Billing / Subscription',
  'Feature Request',
  'Map / Airspace Issue',
  'Account / Login Issue',
  'Other',
];

export default function SupportPage() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [responseTime, setResponseTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill email if logged in
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(SUPABASE_FUNCTIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          accountNumber: accountNumber.trim() || null,
          topic,
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed');

      setResponseTime(json.responseTime || '');
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="app">
      {/* Nav */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">✈</span> PreFlight 107
          </div>
          <ul className="nav-links">
            <li>
              <a
                href="/"
                onClick={e => { e.preventDefault(); navigate('/'); }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="nav-auth-link"
                style={{ color: 'var(--accent)' }}
              >
                Support
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main style={{ minHeight: '80vh', padding: '60px 20px 80px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Contact Support</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Have a question, spotted a bug, or need help with your account?<br />
              Fill out the form below and we'll get back to you.
            </p>
          </div>

          {/* Response time info cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ color: '#FBBF24', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>⭐ Pro Subscribers</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Priority response within <strong>24–48 hours</strong></div>
            </div>
            <div style={{
              background: 'rgba(156,163,175,0.08)',
              border: '1px solid rgba(156,163,175,0.2)',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>📋 Free Accounts</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Standard response within <strong>3–5 business days</strong></div>
            </div>
          </div>

          {status === 'success' ? (
            <div style={{
              textAlign: 'center',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 16,
              padding: '40px 24px',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ marginBottom: 12 }}>Message Sent!</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Your request has been received. We'll respond to <strong>{email}</strong> within{' '}
                <strong style={{ color: '#10B981' }}>{responseTime || '3–5 business days'}</strong>.
              </p>
              <button
                className="cta-button"
                style={{ marginTop: 24 }}
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Name */}
                <div className="support-field">
                  <label className="support-label">NAME *</label>
                  <input
                    className="support-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                {/* Email */}
                <div className="support-field">
                  <label className="support-label">EMAIL ADDRESS *</label>
                  <input
                    className="support-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Account Number */}
              <div className="support-field">
                <label className="support-label">ACCOUNT NUMBER <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="support-input"
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. PFAB12CD89"
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                />
                <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '4px 0 0' }}>
                  Find your account number in the app under Settings → Account. Pro subscribers are verified automatically — submitting without one defaults to free-tier response time.
                </p>
              </div>

              {/* Topic */}
              <div className="support-field">
                <label className="support-label">TOPIC *</label>
                <select
                  className="support-input"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                >
                  {TOPICS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="support-field">
                <label className="support-label">MESSAGE *</label>
                <textarea
                  className="support-input"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in as much detail as possible..."
                  rows={6}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {status === 'error' && (
                <p style={{ color: '#F85149', fontSize: 13, margin: 0 }}>
                  ⚠️ {errorMsg || 'Something went wrong. Please try again or email support@preflight107.com directly.'}
                </p>
              )}

              <button
                type="submit"
                className="cta-button"
                disabled={status === 'submitting'}
                style={{ opacity: status === 'submitting' ? 0.6 : 1, cursor: status === 'submitting' ? 'not-allowed' : 'pointer' }}
              >
                {status === 'submitting' ? 'Sending…' : 'Send Message →'}
              </button>

              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', margin: 0 }}>
                Or email us directly at{' '}
                <a href="mailto:support@preflight107.com" style={{ color: 'var(--accent)' }}>
                  support@preflight107.com
                </a>
              </p>
            </form>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><span style={{ color: 'var(--accent)' }}>✈</span> PreFlight 107</div>
          <p className="footer-tagline">Fly safe out there.</p>
          <div className="footer-legal-links">
            <a href="/privacy" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
            <span className="footer-legal-sep">·</span>
            <a href="/terms" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
            <span className="footer-legal-sep">·</span>
            <a href="/support" className="footer-legal-link" onClick={e => { e.preventDefault(); navigate('/support'); }}>Support</a>
          </div>
          <p className="footer-copy">&copy; 2026 PreFlight 107. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
