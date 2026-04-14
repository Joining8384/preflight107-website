import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './AuthContext.tsx';
import Dashboard from './Dashboard.tsx';
import './index.css';
import LoginPage from './LoginPage.tsx';
import PrivacyPage from './PrivacyPage.tsx';
import SignUpPage from './SignUpPage.tsx';
import TermsPage from './TermsPage.tsx';

// ── Path-based Router ─────────────────────────────────────────────────────────
// Listens to popstate so navigate() / replace() from navigate.ts
// cause re-renders without a full page reload.
function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function onPop() { setPath(window.location.pathname); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (path.startsWith('/dashboard')) return <Dashboard />;
  if (path.startsWith('/login'))     return <LoginPage />;
  if (path.startsWith('/signup'))    return <SignUpPage />;
  if (path.startsWith('/terms'))     return <TermsPage />;
  if (path.startsWith('/privacy'))   return <PrivacyPage />;
  return <App />;
}

// ── App root ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>,
);
