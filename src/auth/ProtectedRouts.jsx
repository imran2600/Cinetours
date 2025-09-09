// src/auth/ProtectedRouts.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { signedIn } = useAuth();
  const location = useLocation();

  if (!signedIn) {
    // Remember the route the user tried to access
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  return children;
}
