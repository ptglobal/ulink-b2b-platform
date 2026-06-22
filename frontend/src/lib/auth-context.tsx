'use client';

/**
 * Client-side AuthProvider + useAuth.
 *
 * The provider fetches /api/auth/me on mount, exposes the current user, and
 * provides login/logout/refresh helpers. Components consume `useAuth()` to
 * know whether to show "Sign in" vs. "Account" CTAs, render route guards,
 * etc.
 *
 * NOTE: route guarding is intentionally soft (client-side redirects). The
 * Next.js middleware intentionally does not block auth pages — see
 * src/middleware.ts — so that the public marketing site remains reachable
 * for crawlers and un-authenticated visitors. Use the `<RequireAuth />`
 * component or `useAuth().status === 'authenticated'` checks inside
 * client components when you need a hard redirect.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/lib/api-error';
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type RegisterInput
} from '@/lib/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  status?: string | null;
  customer_id?: string | number | null;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  /** Re-fetch /api/auth/me. */
  refresh: () => Promise<void>;
  /** Sign in. Throws ApiError on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Register. Throws ApiError on failure. */
  register: (input: RegisterInput) => Promise<void>;
  /** Sign out and redirect to /login. */
  logout: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /** Optional initial user — pass server-side fetched value to skip the
   *  initial /api/auth/me round-trip. */
  initialUser?: AuthUser | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [status, setStatus] = useState<AuthStatus>(initialUser ? 'authenticated' : 'loading');
  const [error, setError] = useState<string | null>(null);

  // Cross-tab auth sync via BroadcastChannel. When login/logout happens in
  // one tab, other tabs pick it up immediately without a manual reload.
  const channelRef = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(async () => {
    setStatus((prev) => (prev === 'loading' ? prev : 'loading'));
    setError(null);
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (res.status === 401 || res.status === 403) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }
      if (!res.ok) {
        setUser(null);
        setStatus('error');
        setError(`auth_me_failed_${res.status}`);
        return;
      }
      const body = (await res.json()) as { data: AuthUser | null };
      setUser(body.data ?? null);
      setStatus(body.data ? 'authenticated' : 'unauthenticated');
    } catch (err) {
      setUser(null);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'network_error');
    }
  }, []);

  useEffect(() => {
    if (initialUser) return; // skip the first fetch when SSR provided a user
    refresh();
  }, [refresh, initialUser]);

  // Set up cross-tab BroadcastChannel listener
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('ulink_auth');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const msg = event.data as { type: string };
      if (msg.type === 'login') {
        // Another tab logged in — refresh to pick up the session
        refresh().then(() => router.refresh());
      } else if (msg.type === 'logout') {
        // Another tab logged out — clear state immediately
        setUser(null);
        setStatus('unauthenticated');
        setError(null);
        router.refresh();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [refresh, router]);

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    setError(null);
    try {
      await loginRequest(email, password);
      await refresh();
      // Notify other tabs that a login just happened
      channelRef.current?.postMessage({ type: 'login' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'login_failed';
      setError(message);
      throw err;
    }
  }, [refresh]);

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    setError(null);
    try {
      await registerRequest(input);
      // Most registration flows auto-login on the server, so refresh the
      // session shape and let the caller decide where to navigate.
      await refresh();
      channelRef.current?.postMessage({ type: 'login' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'register_failed';
      setError(message);
      throw err;
    }
  }, [refresh]);

  const logout = useCallback<AuthContextValue['logout']>(async (redirectTo = '/login') => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
      // Notify other tabs that a logout just happened
      channelRef.current?.postMessage({ type: 'logout' });
      router.push(redirectTo);
      router.refresh();
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    error,
    refresh,
    login,
    register,
    logout
  }), [status, user, error, refresh, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
