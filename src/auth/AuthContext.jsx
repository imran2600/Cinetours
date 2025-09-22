import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { apiSignup, apiSignin, apiForgotPassword, apiGuest, apiMe } from "../services/authApi";

const KEY_TOKEN = "access_token";
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // <— important for refresh

  // On initial load, if token exists (or cookie is present), get current user
  useEffect(() => {
    (async () => {
      try {
        // If you use httpOnly cookies on the server, you can always call apiMe()
        // If you store tokens client-side, check for it:
        const token = localStorage.getItem(KEY_TOKEN);
        if (!token) {
          setAuthLoading(false);
          return;
        }
        const data = await apiMe();
        const u = data?.user ?? data;
        setUser({
          id: u?.id,
          email: u?.email ?? null,
          name: u?.name ?? (u?.email ? u.email.split("@")[0] : "User"),
          is_guest: !!u?.is_guest,
        });
      } catch {
        // token invalid / cookie expired
        localStorage.removeItem(KEY_TOKEN);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // Normalize + store session from backend payload
  const setSessionFromApi = (payload, nameOverride) => {
    // if backend uses cookies only, you can remove this line:
    if (payload?.access_token) localStorage.setItem(KEY_TOKEN, payload.access_token);

    // accept { user: {...} } or user at top-level
    const u = payload?.user ?? payload ?? {};
    const sessionUser = {
      id: u.id,
      email: u.email ?? null,
      name: nameOverride || u.name || (u.email ? u.email.split("@")[0] : "User"),
      is_guest: !!u.is_guest,
    };
    setUser(sessionUser);
    return sessionUser;
  };

  // Backend-only signup/signin/guest
  const signUp = async ({ name, email, password }) => {
    const data = await apiSignup(email, password);
    setSessionFromApi(data, name);
  };
  const signIn = async ({ email, password }) => {
    const data = await apiSignin(email, password);
    setSessionFromApi(data);
  };
  const signInAsGuest = async () => {
    const data = await apiGuest();
    setSessionFromApi(data, "Guest");
  };

  const signOut = () => {
    // If you have a backend /auth/logout that clears cookie/session, call it here.
    localStorage.removeItem(KEY_TOKEN);
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    return apiForgotPassword(email);
  };

  const value = useMemo(
    () => ({
      user,
      signedIn: !!user,
      authLoading,
      signUp,
      signIn,
      signInAsGuest,
      signOut,
      requestPasswordReset,
    }),
    [user, authLoading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
