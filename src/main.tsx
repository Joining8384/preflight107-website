import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './AuthContext.tsx';
import AdminPage from './AdminPage.tsx';
import AppBriefingDetailPage from './AppBriefingDetailPage.tsx';
import AppBriefingNewPage from './AppBriefingNewPage.tsx';
import AppBriefingsListPage from './AppBriefingsListPage.tsx';
import BlogIndex from './BlogIndex.tsx';
import BlogPost from './BlogPost.tsx';
import GuidesIndex from './GuidesIndex.tsx';
import GuidePost from './GuidePost.tsx';
import ComparePage from './ComparePage.tsx';
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
import FlyablePage from './FlyablePage.tsx';
import { getLang, stripLang, syncLangHead } from './lang';

// ── Path-based Router ─────────────────────────────────────────────────────────
// Listens to popstate so navigate() / replace() from navigate.ts
// cause re-renders without a full page reload.
//
// Localization: a leading '/es' selects Spanish. We derive `lang` from the raw
// path, strip the prefix, and route on the canonical (English-space) path —
// so /es/blog/foo and /blog/foo hit the same route with lang 'es' vs 'en'.
// Only the public marketing/content pages are localized; app/auth pages ignore
// lang and render English.
function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function onPop() { setPath(window.location.pathname); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Keep <html lang> + hreflang alternates in sync with the current URL.
  useEffect(() => { syncLangHead(path); }, [path]);

  const lang = getLang(path);
  const p = stripLang(path);

  if (p.startsWith('/admin'))      return <AdminPage />;
  if (p.startsWith('/dashboard'))  return <Dashboard />;
  if (p.startsWith('/login'))      return <LoginPage />;
  if (p.startsWith('/signup'))     return <SignUpPage />;
  if (p.startsWith('/terms'))      return <TermsPage />;
  if (p.startsWith('/privacy'))    return <PrivacyPage />;
  if (p.startsWith('/delete-account')) return <DeleteAccountPage />;
  if (p.startsWith('/launch/'))    return <LaunchSharePage token={p.slice(8)} />;
  if (p.startsWith('/support'))    return <SupportPage />;
  if (p.startsWith('/blog/'))      return <BlogPost slug={p.slice(6).replace(/\/$/, '')} />;
  if (p === '/blog' || p === '/blog/') return <BlogIndex />;
  if (p.startsWith('/help/'))      return <GuidePost slug={p.slice(6).replace(/\/$/, '')} />;
  if (p === '/help' || p === '/help/') return <GuidesIndex />;
  if (p.startsWith('/verify'))     return <VerifyPage />;
  if (p.startsWith('/compare'))    return <ComparePage />;
  if (p.startsWith('/pilot/'))     return <PilotProfile />;
  if (p.startsWith('/flyable/'))   return <FlyablePage citySlug={p.slice('/flyable/'.length).replace(/\/$/, '')} />;
  if (p === '/flyable' || p === '/flyable/') return <FlyablePage />;
  if (p === '/app/briefings/new')  return <AppBriefingNewPage />;
  if (p.startsWith('/app/briefings/')) {
    const id = p.slice('/app/briefings/'.length);
    return <AppBriefingDetailPage id={id} />;
  }
  if (p === '/app/briefings' || p === '/app/briefings/' || p === '/app' || p === '/app/') {
    return <AppBriefingsListPage />;
  }
  return <App lang={lang} />;
}

// ── App root ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>,
);
