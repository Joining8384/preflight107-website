import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { navigate } from './navigate';
import { SUPABASE_ANON, SUPABASE_URL } from './supabase';
import LanguageToggle from './LanguageToggle';
import { withLang } from './lang';
import type { Lang } from './lang';

const SUPABASE_FUNCTIONS_URL =
  `${SUPABASE_URL}/functions/v1/send-support-email`;

// Canonical English topic values — submitted to the backend unchanged.
// Display labels are localized via T[lang].topicLabels below.
const TOPICS = [
  'General Question',
  'Bug Report',
  'Billing / Subscription',
  'Feature Request',
  'Map / Airspace Issue',
  'Account / Login Issue',
  'Other',
];

const en = {
  navHome: 'Home',
  navSupport: 'Support',

  title: 'Contact Support',
  introLine1: 'Have a question, spotted a bug, or need help with your account?',
  introLine2: "Fill out the form below and we'll get back to you.",

  proTitle: '⭐ Pro Subscribers',
  proBody1: 'Priority response within ',
  proBody2: '24–48 hours',
  freeTitle: '📋 Free Accounts',
  freeBody1: 'Standard response within ',
  freeBody2: '3–5 business days',

  successTitle: 'Message Sent!',
  successBody1: 'Your request has been received. We\'ll respond to ',
  successBody2: ' within ',
  successFallbackTime: '3–5 business days',
  backToHome: 'Back to Home',

  labelName: 'NAME *',
  phName: 'Your full name',
  labelEmail: 'EMAIL ADDRESS *',
  phEmail: 'your@email.com',
  labelAccount: 'ACCOUNT NUMBER ',
  optional: '(optional)',
  phAccount: 'e.g. PFAB12CD89',
  accountHelp:
    'Find your account number in the app under Settings → Account. Pro subscribers are verified automatically — submitting without one defaults to free-tier response time.',
  labelTopic: 'TOPIC *',
  labelMessage: 'MESSAGE *',
  phMessage: 'Describe your issue or question in as much detail as possible...',

  errorFallback:
    'Something went wrong. Please try again or email support@preflight107.com directly.',
  sending: 'Sending…',
  sendMessage: 'Send Message →',
  orEmail: 'Or email us directly at ',

  footerTagline: 'Fly safe out there.',
  footerPrivacy: 'Privacy Policy',
  footerTerms: 'Terms of Service',
  footerSupport: 'Support',
  footerCopy: '© 2026 PreFlight 107. All rights reserved.',

  topicLabels: {
    'General Question': 'General Question',
    'Bug Report': 'Bug Report',
    'Billing / Subscription': 'Billing / Subscription',
    'Feature Request': 'Feature Request',
    'Map / Airspace Issue': 'Map / Airspace Issue',
    'Account / Login Issue': 'Account / Login Issue',
    'Other': 'Other',
  } as Record<string, string>,
};

const es: typeof en = {
  navHome: 'Inicio',
  navSupport: 'Soporte',

  title: 'Contactar Soporte',
  introLine1: '¿Tienes una pregunta, encontraste un error o necesitas ayuda con tu cuenta?',
  introLine2: 'Completa el formulario a continuación y te responderemos.',

  proTitle: '⭐ Suscriptores Pro',
  proBody1: 'Respuesta prioritaria en un plazo de ',
  proBody2: '24–48 horas',
  freeTitle: '📋 Cuentas gratuitas',
  freeBody1: 'Respuesta estándar en un plazo de ',
  freeBody2: '3–5 días hábiles',

  successTitle: '¡Mensaje enviado!',
  successBody1: 'Tu solicitud ha sido recibida. Te responderemos a ',
  successBody2: ' en un plazo de ',
  successFallbackTime: '3–5 días hábiles',
  backToHome: 'Volver al inicio',

  labelName: 'NOMBRE *',
  phName: 'Tu nombre completo',
  labelEmail: 'CORREO ELECTRÓNICO *',
  phEmail: 'tu@correo.com',
  labelAccount: 'NÚMERO DE CUENTA ',
  optional: '(opcional)',
  phAccount: 'ej. PFAB12CD89',
  accountHelp:
    'Encuentra tu número de cuenta en la app, en Configuración → Cuenta. Los suscriptores Pro se verifican automáticamente; enviar sin uno usa el tiempo de respuesta del nivel gratuito.',
  labelTopic: 'TEMA *',
  labelMessage: 'MENSAJE *',
  phMessage: 'Describe tu problema o pregunta con el mayor detalle posible...',

  errorFallback:
    'Algo salió mal. Inténtalo de nuevo o escríbenos directamente a support@preflight107.com.',
  sending: 'Enviando…',
  sendMessage: 'Enviar mensaje →',
  orEmail: 'O escríbenos directamente a ',

  footerTagline: 'Vuela seguro.',
  footerPrivacy: 'Política de privacidad',
  footerTerms: 'Términos del servicio',
  footerSupport: 'Soporte',
  footerCopy: '© 2026 PreFlight 107. Todos los derechos reservados.',

  topicLabels: {
    'General Question': 'Pregunta general',
    'Bug Report': 'Reporte de error',
    'Billing / Subscription': 'Facturación / Suscripción',
    'Feature Request': 'Solicitud de función',
    'Map / Airspace Issue': 'Problema de mapa / espacio aéreo',
    'Account / Login Issue': 'Problema de cuenta / inicio de sesión',
    'Other': 'Otro',
  },
};

const T = { en, es };

export default function SupportPage({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  const L = (href: string) => withLang(href, lang);

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
                href={L('/')}
                onClick={e => { e.preventDefault(); navigate(L('/')); }}
              >
                {t.navHome}
              </a>
            </li>
            <li>
              <a
                href={L('/support')}
                className="nav-auth-link"
                style={{ color: 'var(--accent)' }}
              >
                {t.navSupport}
              </a>
            </li>
            <li className="nav-lang"><LanguageToggle /></li>
          </ul>
        </div>
      </nav>

      <main style={{ minHeight: '80vh', padding: '60px 20px 80px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>{t.title}</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {t.introLine1}<br />
              {t.introLine2}
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
              <div style={{ color: '#FBBF24', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{t.proTitle}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.proBody1}<strong>{t.proBody2}</strong></div>
            </div>
            <div style={{
              background: 'rgba(156,163,175,0.08)',
              border: '1px solid rgba(156,163,175,0.2)',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{t.freeTitle}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.freeBody1}<strong>{t.freeBody2}</strong></div>
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
              <h2 style={{ marginBottom: 12 }}>{t.successTitle}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {t.successBody1}<strong>{email}</strong>{t.successBody2}
                <strong style={{ color: '#10B981' }}>{responseTime || t.successFallbackTime}</strong>.
              </p>
              <button
                className="cta-button"
                style={{ marginTop: 24 }}
                onClick={() => navigate(L('/'))}
              >
                {t.backToHome}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Name */}
                <div className="support-field">
                  <label className="support-label">{t.labelName}</label>
                  <input
                    className="support-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t.phName}
                    required
                  />
                </div>
                {/* Email */}
                <div className="support-field">
                  <label className="support-label">{t.labelEmail}</label>
                  <input
                    className="support-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.phEmail}
                    required
                  />
                </div>
              </div>

              {/* Account Number */}
              <div className="support-field">
                <label className="support-label">{t.labelAccount}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t.optional}</span></label>
                <input
                  className="support-input"
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.toUpperCase())}
                  placeholder={t.phAccount}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                />
                <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '4px 0 0' }}>
                  {t.accountHelp}
                </p>
              </div>

              {/* Topic */}
              <div className="support-field">
                <label className="support-label">{t.labelTopic}</label>
                <select
                  className="support-input"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                >
                  {TOPICS.map(tt => (
                    <option key={tt} value={tt}>{t.topicLabels[tt]}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="support-field">
                <label className="support-label">{t.labelMessage}</label>
                <textarea
                  className="support-input"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t.phMessage}
                  rows={6}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {status === 'error' && (
                <p style={{ color: '#F85149', fontSize: 13, margin: 0 }}>
                  ⚠️ {errorMsg || t.errorFallback}
                </p>
              )}

              <button
                type="submit"
                className="cta-button"
                disabled={status === 'submitting'}
                style={{ opacity: status === 'submitting' ? 0.6 : 1, cursor: status === 'submitting' ? 'not-allowed' : 'pointer' }}
              >
                {status === 'submitting' ? t.sending : t.sendMessage}
              </button>

              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', margin: 0 }}>
                {t.orEmail}
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
          <p className="footer-tagline">{t.footerTagline}</p>
          <div className="footer-legal-links">
            <a href={L('/privacy')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/privacy')); }}>{t.footerPrivacy}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/terms')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/terms')); }}>{t.footerTerms}</a>
            <span className="footer-legal-sep">·</span>
            <a href={L('/support')} className="footer-legal-link" onClick={e => { e.preventDefault(); navigate(L('/support')); }}>{t.footerSupport}</a>
          </div>
          <p className="footer-copy">{t.footerCopy}</p>
        </div>
      </footer>
    </div>
  );
}
