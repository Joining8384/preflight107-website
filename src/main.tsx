import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './AuthContext.tsx';
import AdminPage from './AdminPage.tsx';
import BlogIndex from './BlogIndex.tsx';
import BlogPost from './BlogPost.tsx';
import Dashboard from './Dashboard.tsx';
import DeleteAccountPage from './DeleteAccountPage.tsx';
import LaunchSharePage from './LaunchSharePage.tsx';
import './index.css';
import LoginPage from './LoginPage.tsx';
import PrivacyPage from './PrivacyPage.tsx';
import SignUpPage from './SignUpPage.tsx';
import SupportPage from './SupportPage.tsx';
import TermsPage from './TermsPage.tsx';
import VerifyPage from './VerifyPage.tsx';
import PilotProfile from './PilotProfile.tsx';

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

  if (path.startsWith('/admin'))      return <AdminPage />;
  if (path.startsWith('/dashboard'))  return <Dashboard />;
  if (path.startsWith('/login'))      return <LoginPage />;
  if (path.startsWith('/signup'))     return <SignUpPage />;
  if (path.startsWith('/terms'))      return <TermsPage />;
  if (path.startsWith('/privacy'))    return <PrivacyPage />;
  if (path.startsWith('/delete-account')) return <DeleteAccountPage />;
  if (path.startsWith('/launch/'))    return <LaunchSharePage token={path.slice(8)} />;
  if (path.startsWith('/support'))    return <SupportPage />;
  if (path.startsWith('/blog/'))      return <BlogPost slug={path.slice(6)} />;
  if (path === '/blog')               return <BlogIndex />;
  if (path.startsWith('/verify'))     return <VerifyPage />;
  if (path.startsWith('/pilot/'))     return <PilotProfile />;
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
