// Thin Supabase REST + Auth client — no npm dependency needed.
// Talks directly to PostgREST and the Supabase Auth HTTP API.

export const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON as string;

export interface SupabaseSession {
  access_token:  string;
  refresh_token: string;
  user: { id: string; email: string };
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function authHeaders(extra: Record<string, string> = {}) {
  return { 'Content-Type': 'application/json', apikey: SUPABASE_ANON, ...extra };
}
function restHeaders(accessToken: string) {
  return {
    apikey:          SUPABASE_ANON,
    Authorization:   `Bearer ${accessToken}`,
    'Content-Type':  'application/json',
    Prefer:          'return=representation',
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<SupabaseSession> {
  const res  = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Sign-in failed');
  return data as SupabaseSession;
}

export async function signUp(email: string, password: string): Promise<SupabaseSession> {
  const res  = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Sign-up failed');
  // Supabase returns the session directly when email confirmation is disabled
  if (!data.access_token) {
    throw new Error('Account created — please check your email to confirm before signing in.');
  }
  return data as SupabaseSession;
}

export async function signOut(accessToken: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method:  'POST',
    headers: authHeaders({ Authorization: `Bearer ${accessToken}` }),
  });
}

// Silently refresh the access token using a stored refresh token.
// Returns null if the refresh token is expired or invalid.
export async function refreshSession(refreshToken: string): Promise<SupabaseSession | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.access_token ? (data as SupabaseSession) : null;
}

// ── Profile ───────────────────────────────────────────────────────────────────
// Upserts the public.profiles row after sign-up.
export async function upsertProfile(
  userId: string,
  fullName: string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method:  'POST',
    headers: { ...restHeaders(accessToken), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body:    JSON.stringify({
      id:         userId,
      full_name:  fullName,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Failed to save profile');
  }
}

// ── REST query helpers ────────────────────────────────────────────────────────
export async function fetchTable<T>(
  table:       string,
  accessToken: string,
  params:      Record<string, string> = {},
): Promise<T[]> {
  const qs  = new URLSearchParams({ select: '*', order: 'created_at.desc', ...params });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: restHeaders(accessToken),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `Failed to fetch ${table}`);
  }
  return res.json();
}

export async function insertRow<T>(
  table:       string,
  data:        Record<string, unknown>,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  'POST',
    headers: restHeaders(accessToken),
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `Failed to insert into ${table}`);
  }
  const result = await res.json();
  // PostgREST with Prefer:return=representation returns an array
  return Array.isArray(result) ? result[0] : result;
}

export async function deleteRow(
  table:       string,
  id:          string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:  'DELETE',
    headers: restHeaders(accessToken),
  });
  if (!res.ok) throw new Error('Delete failed');
}

export async function updateRow<T>(
  table:       string,
  id:          string,
  data:        Record<string, unknown>,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method:  'PATCH',
    headers: restHeaders(accessToken),
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `Failed to update ${table}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result[0] : result;
}

// ── Identity Linking ──────────────────────────────────────────────────────────
export interface Identity {
  id:             string;
  user_id:        string;
  provider:       string;
  identity_data?: Record<string, unknown>;
  created_at?:    string;
}

// Returns the list of OAuth providers currently linked to the signed-in user.
export async function fetchUserIdentities(accessToken: string): Promise<Identity[]> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: authHeaders({ Authorization: `Bearer ${accessToken}` }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.identities as Identity[]) ?? [];
}

// Returns the OAuth redirect URL for linking an additional identity provider.
// Uses skip_http_redirect=true so Supabase returns the target URL as JSON
// rather than issuing a 302, which lets us navigate programmatically.
export async function getLinkIdentityUrl(
  provider: 'google' | 'apple',
  accessToken: string,
  redirectTo: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    provider,
    redirect_to:        redirectTo,
    skip_http_redirect: 'true',
  });
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/user/identities/authorize?${params}`,
    { headers: authHeaders({ Authorization: `Bearer ${accessToken}` }) },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.url as string) ?? null;
}
