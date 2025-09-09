import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function UserAvatar() {
  const { user } = useAuth();
  if (!user) return null;

  const letter =
    user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?";

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#22c55e",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
      }}
    >
      {letter}
    </div>
  );
}
