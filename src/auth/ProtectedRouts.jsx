// src/auth/ProtectedRouts.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { signedIn, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return null; // or a spinner skeleton

  if (!signedIn) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  return children;
}
