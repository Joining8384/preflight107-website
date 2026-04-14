import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="auth-loading"><div className="db-spinner" /></div>;

  return (
    <div className="auth-page">
      {/* Back to home */}
      <a className="auth-back" href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
        ← PreFlight 107
      </a>

      <div className="auth-card">
        <div className="auth-logo">✈ PreFlight <span>107</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your pilot dashboard</p>

        {error && <div className="auth-alert">{error}</div>}

        {/* ── Account-linking safety tip ── */}
        <div className="auth-provider-tip">
          <span className="auth-provider-tip__icon">💡</span>
          <span>
            <strong>Pro Tip:</strong> Always use the same sign-in method (same
            email address) to ensure your Garage and Flight Logs stay synced.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="pilot@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <a href="/signup" onClick={e => { e.preventDefault(); navigate('/signup'); }}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
