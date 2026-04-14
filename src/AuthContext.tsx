import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  refreshSession,
  signIn   as apiSignIn,
  signOut  as apiSignOut,
  signUp   as apiSignUp,
  upsertProfile,
  SupabaseSession,
} from './supabase';

// ── Storage key ───────────────────────────────────────────────────────────────
const SESSION_KEY = 'pf107_session';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id:    string;
  email: string;
}

interface AuthContextType {
  user:    AuthUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  signIn:  (email: string, password: string) => Promise<void>;
  signUp:  (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user:    null,
  session: null,
  loading: true,
  signIn:  async () => {},
  signUp:  async () => {},
  signOut: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Persist to sessionStorage + update state
  const persist = useCallback((s: SupabaseSession | null) => {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else   sessionStorage.removeItem(SESSION_KEY);
    setSession(s);
  }, []);

  // ── On mount: restore session from storage, silently refresh the token ─────
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) { setLoading(false); return; }

      try {
        const stored: SupabaseSession = JSON.parse(raw);
        // Use the refresh token to get a fresh access token
        const fresh = await refreshSession(stored.refresh_token);
        if (!cancelled) persist(fresh); // fresh is null if token expired → logs out
      } catch {
        if (!cancelled) persist(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();

    // Sync sign-in / sign-out across browser tabs
    function onStorage(e: StorageEvent) {
      if (e.key !== SESSION_KEY) return;
      setSession(e.newValue ? JSON.parse(e.newValue) : null);
    }
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, [persist]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const s = await apiSignIn(email, password);
    persist(s);
  }, [persist]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const s = await apiSignUp(email, password);
    persist(s);
    // Save full_name to public.profiles immediately after account creation
    if (s.user?.id) {
      await upsertProfile(s.user.id, fullName, s.access_token);
    }
  }, [persist]);

  const signOut = useCallback(async () => {
    if (session) await apiSignOut(session.access_token).catch(() => {});
    persist(null);
  }, [session, persist]);

  return (
    <AuthContext.Provider value={{
      user:    session?.user ?? null,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}
