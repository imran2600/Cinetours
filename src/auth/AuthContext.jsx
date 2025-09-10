import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const KEY_USER = "qt_user";       // legacy single account
const KEY_USERS = "qt_users";     // new array of accounts
const KEY_SESSION = "qt_session"; // active session

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore session on load
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
    if (session?.email) setUser(session);
  }, []);

  const getAllUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    } catch {
      return [];
    }
  };
  const saveAllUsers = (arr) =>
    localStorage.setItem(KEY_USERS, JSON.stringify(arr));

  const signUp = async ({ name, email, password }) => {
    let users = getAllUsers();

    // duplicate check
    if (users.find((u) => u.email === email)) {
      throw new Error("You already have an account. Please sign in.");
    }

    const record = { name, email, password };
    users.push(record);
    saveAllUsers(users);

    // legacy for backward compatibility
    localStorage.setItem(KEY_USER, JSON.stringify(record));

    const session = { name, email };
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    setUser(session);
  };

  const signIn = async ({ email, password }) => {
    let users = getAllUsers();
    let found = users.find((u) => u.email === email && u.password === password);

    if (!found) {
      // fallback to legacy
      const saved = JSON.parse(localStorage.getItem(KEY_USER) || "null");
      if (saved && saved.email === email && saved.password === password) {
        found = saved;
      }
    }

    if (!found) throw new Error("Invalid email or password.");

    const session = { name: found.name, email: found.email };
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    setUser(session);
  };

  const signInWithGoogle = async () => {
    const fakeGoogleUser = {
      name: "Google User",
      email: "google.user@example.com",
      provider: "google",
    };
    localStorage.setItem(KEY_SESSION, JSON.stringify(fakeGoogleUser));
    setUser(fakeGoogleUser);
  };

  const signInAsGuest = () => {
    const guest = { name: "Guest", email: "guest@quantum", guest: true };
    localStorage.setItem(KEY_SESSION, JSON.stringify(guest));
    setUser(guest);
  };

  const signOut = () => {
    localStorage.removeItem(KEY_SESSION);
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
