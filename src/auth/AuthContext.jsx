import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { apiSignup, apiSignin, apiGuest } from "../services/authApi";

const KEY_USER = "qt_user";      
const KEY_USERS = "qt_users";     
const KEY_SESSION = "qt_session"; 
const KEY_TOKEN = "access_token"; 

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
    if (session?.email || session?.id) setUser(session);
  }, []);

  const getAllUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    } catch {
      return [];
    }
  };
  const saveAllUsers = (arr) => localStorage.setItem(KEY_USERS, JSON.stringify(arr));

  // Normalize + store session from backend payload
  const setSessionFromApi = (payload, nameOverride) => {
    if (payload?.access_token) {
      localStorage.setItem(KEY_TOKEN, payload.access_token);
    }
    const u = payload?.user || {};
    const session = {
      id: u.id,
      email: u.email ?? null,
      is_guest: !!u.is_guest,
      name:
        nameOverride ||
        u.name ||
        (u.email ? u.email.split("@")[0] : "User"),
    };
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const signUp = async ({ name, email, password }) => {
   
    try {
      const data = await apiSignup(email, password);
      setSessionFromApi(data, name);
      // Optional: keep a local record so your old flows still work
      const users = getAllUsers();
      users.push({ name, email, password });
      saveAllUsers(users);
      localStorage.setItem(KEY_USER, JSON.stringify({ name, email, password }));
      return;
    } catch (err) {
      // Fallback to legacy local behavior (unchanged)
      let users = getAllUsers();
      if (users.find((u) => u.email === email)) {
        throw new Error("You already have an account. Please sign in.");
      }
      const record = { name, email, password };
      users.push(record);
      saveAllUsers(users);
      localStorage.setItem(KEY_USER, JSON.stringify(record));
      const session = { name, email };
      localStorage.setItem(KEY_SESSION, JSON.stringify(session));
      setUser(session);
    }
  };

  const signIn = async ({ email, password }) => {
    // Try backend first
    try {
      const data = await apiSignin(email, password);
      setSessionFromApi(data);
      return;
    } catch (err) {
      // Fallback to legacy local behavior (unchanged)
      let users = getAllUsers();
      let found = users.find((u) => u.email === email && u.password === password);
      if (!found) {
        const saved = JSON.parse(localStorage.getItem(KEY_USER) || "null");
        if (saved && saved.email === email && saved.password === password) {
          found = saved;
        }
      }
      if (!found) throw new Error(err.message || "Invalid email or password.");
      const session = { name: found.name, email: found.email };
      localStorage.setItem(KEY_SESSION, JSON.stringify(session));
      setUser(session);
    }
  };

  const signInWithGoogle = async () => {
    // keep your current stub behavior
    const fakeGoogleUser = {
      name: "Google User",
      email: "google.user@example.com",
      provider: "google",
    };
    localStorage.setItem(KEY_SESSION, JSON.stringify(fakeGoogleUser));
    setUser(fakeGoogleUser);
  };

  const signInAsGuest = async () => {
    // Try backend first
    try {
      const data = await apiGuest();
      setSessionFromApi(data, "Guest");
      return;
    } catch {
      // Fallback to your current guest flow
      const guest = { name: "Guest", email: "guest@quantum", guest: true };
      localStorage.setItem(KEY_SESSION, JSON.stringify(guest));
      setUser(guest);
    }
  };

  const signOut = () => {
    localStorage.removeItem(KEY_SESSION);
    localStorage.removeItem(KEY_TOKEN);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      signedIn: !!user,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      signInAsGuest,
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
