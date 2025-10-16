// src/auth/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { apiSignup, apiSignin, apiForgotPassword, apiGuest } from "../services/authApi";

const KEY_TOKEN = "access_token";
const KEY_USER  = "session_user";
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Normalize + store session from backend payload
  const setSessionFromApi = (payload, nameOverride) => {
    if (payload?.access_token) localStorage.setItem(KEY_TOKEN, payload.access_token);
    if (payload?.refresh_token) localStorage.setItem("refresh_token", payload.refresh_token);
    const u = payload?.user ?? payload ?? {};
    const sessionUser = {
      id: u.id,
      email: u.email ?? null,
      name: nameOverride || u.name || (u.email ? u.email.split("@")[0] : "User"),
      is_guest: !!u.is_guest,
    };
    setUser(sessionUser);
    localStorage.setItem(KEY_USER, JSON.stringify(sessionUser));
    return sessionUser;
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem(KEY_TOKEN);
      const raw = localStorage.getItem(KEY_USER);
      if (token && raw) {
        setUser(JSON.parse(raw));
      }
    } catch (_) {}
    setAuthLoading(false);
  }, []);

  // ✅ NEW — Auto logout when token expires
  useEffect(() => {
    try {
      const token = localStorage.getItem(KEY_TOKEN);
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryMs = payload.exp * 1000 - Date.now();

      // Already expired? logout immediately
      if (expiryMs <= 0) {
        localStorage.clear();
        window.location.href = "/portal";
        return;
      }

      // Logout when timer reaches expiry
      const timer = setTimeout(() => {
        localStorage.clear();
        alert("Your session expired. Please sign in again.");
        window.location.href = "/portal";
      }, expiryMs);

      // Cleanup on unmount
      return () => clearTimeout(timer);
    } catch (err) {
      console.warn("Auto-logout timer error:", err);
    }
  }, []);

  // Backend-only auth
  const signUp = async ({ name, email, password }) => {
    const data = await apiSignup(name, email, password);
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
    localStorage.removeItem(KEY_USER);
    setUser(null);
  };

  const requestPasswordReset = async (email) => apiForgotPassword(email);

const value = useMemo(
  () => ({ user, signedIn: !!user, signUp, signIn, signInAsGuest, signOut, requestPasswordReset, authLoading }),
  [user, authLoading]
);


  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
