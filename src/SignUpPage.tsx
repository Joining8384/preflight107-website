import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';

export default function SignUpPage() {
  const { user, loading, signUp } = useAuth();

  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [error,     setError]     = useState('');
  const [busy,      setBusy]      = useState(false);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      await signUp(email, password, fullName.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign-up failed. Please try again.');
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Free forever · No credit card required</p>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Pilot"
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password2">Confirm Password</label>
            <input
              id="password2"
              type="password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={busy}>
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }}>
            Sign in
          </a>
        </p>

        <p className="auth-terms">
          By creating an account you agree to our{' '}
          <a href="/terms" onClick={e => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a> and{' '}
          <a href="/privacy" onClick={e => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
