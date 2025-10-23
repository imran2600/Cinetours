import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { gsap } from "gsap";

export default function UserAvatar({ size = 32, withMenu = true }) {
  const { user, updateProfilePhoto, removeProfilePhoto } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const letter = (user?.name?.[0] || user?.email?.[0] || "?").toUpperCase();

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(
      menuRef.current,
      { opacity: 0, scale: 0.92, y: -6 },
      { opacity: 1, scale: 1, y: 0, duration: 0.18 }
    );
    return () => tl.kill();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!menuRef.current || !btnRef.current) {
        setOpen(false);
        return;
      }
      if (
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onPick = async (e) => {
    const f = e.target.files?.[0];
    if (f) {
      await updateProfilePhoto(f);
      setOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={btnRef}
        className="avatar-chip"
        onClick={() => withMenu && setOpen((s) => !s)}
        title={user?.name || user?.email || "Account"}
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          padding: 0,
          border: "1px solid rgba(255,255,255,.22)",
          background: "linear-gradient(180deg,#0f1217,#0b0e12)",
          display: "grid",
          placeItems: "center",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)",
        }}
      >
        {user.profileUrl ? (
          <img
            src={user.profileUrl}
            alt="avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {letter}
          </span>
        )}
      </button>

      {withMenu && open && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: size + 10,
            right: 0,
            minWidth: 190,
            background: "rgba(16,19,25,.98)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,.4)",
            padding: 10,
            zIndex: 1000,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#fff",
              padding: "8px 10px",
              borderRadius: 8,
              cursor: "pointer",
              background: "linear-gradient(180deg,#11161d,#0a0f15)",
              border: "1px solid rgba(255,255,255,.1)",
              marginBottom: 6,
            }}
          >
            <input type="file" accept="image/*" onChange={onPick} hidden />
            <span>Upload photo…</span>
          </label>

          {user.profileUrl && (
            <button
              type="button"
              onClick={() => {
                removeProfilePhoto();
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#ffb4b4",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,150,150,.18)",
                background: "linear-gradient(180deg,#1b1212,#130d0d)",
                width: "100%",
              }}
            >
              Remove photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
