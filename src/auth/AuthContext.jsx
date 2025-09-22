// src/auth/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { apiSignup, apiSignin, apiForgotPassword, apiGuest } from "../services/authApi";

const KEY_TOKEN = "access_token";
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Normalize + store session from backend payload
  const setSessionFromApi = (payload, nameOverride) => {
    if (payload?.access_token) localStorage.setItem(KEY_TOKEN, payload.access_token);
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

  // Backend-only auth
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
    // optionally call a backend /auth/logout here
    localStorage.removeItem(KEY_TOKEN);
    setUser(null);
  };

  const requestPasswordReset = async (email) => apiForgotPassword(email);

  const value = useMemo(
    () => ({
      user,
      signedIn: !!user,
      signUp,
      signIn,
      signInAsGuest,
      signOut,
      requestPasswordReset,
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
