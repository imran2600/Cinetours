import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import gsap from "gsap";
import styles from "./ForgotPasswordLink.module.css";

export default function ForgotPasswordLink({ initialEmail = "" }) {
  const { requestPasswordReset } = useAuth(); 
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  const tlRef = useRef(null);
  const inputRef = useRef(null);

  const closeWithAnim = () => {
    if (!overlayRef.current || !dialogRef.current) return setOpen(false);
    const tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => setOpen(false),
    });
    tl.to(dialogRef.current, { y: 10, opacity: 0, scale: 0.96, duration: 0.22 })
      .to(
        overlayRef.current,
        { duration: 0.18, css: { backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" } },
        "<"
      )
      .to(
        overlayRef.current, 
        { opacity: 0, duration: 0.18 }, 
        "<"
      );
  };

  useEffect(() => {
    if (!open) return;

    setMsg("");
    setErr("");
    setBusy(false);

    const overlay = overlayRef.current;
    const box = dialogRef.current;
    const items = contentRef.current?.querySelectorAll("[data-stagger]");

    gsap.set(overlay, { opacity: 0 });
    overlay.style.backdropFilter = "blur(0px)";
    overlay.style.webkitBackdropFilter = "blur(0px)";

    gsap.set(box, {
      opacity: 0,
      y: 30,
      scale: 0.9,
      rotateX: -8,
      transformOrigin: "50% 20%",
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(overlay, { opacity: 1, duration: 0.35 })
      .to(
        overlay, 
        { duration: 0.35, css: { backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" } }, 
        "<"
      )
      .to(
        box,
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.40 },
        "<"
      )
      .from(items, { y: 16, opacity: 0, stagger: 0.08, duration: 0.4 }, "-=0.2");

    tlRef.current = tl;

    setTimeout(() => inputRef.current?.focus(), 0);

    const onKey = (e) => e.key === "Escape" && closeWithAnim();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await requestPasswordReset(email);
      setMsg("If that email is registered, a reset link has been sent.");
    } catch (e2) {
      setErr(e2.message || "Couldn’t send reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.linkWrap}>
        <span
          role="link"
          tabIndex={0}
          className={styles.forgotLink}
          onClick={() => setOpen(true)}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && setOpen(true)
          }
        >
          Forgot password
        </span>
      </div>

      {open && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) closeWithAnim();
          }}
        >
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true">
            <div ref={contentRef}>
              <h3 className={styles.title} data-stagger>
                Reset your password
              </h3>
              <p className={styles.sub} data-stagger>
                Enter your account email and we’ll send you a reset link.
              </p>

              {err && (
                <div className={styles.alertErr} data-stagger>
                  {err}
                </div>
              )}
              {msg ? (
                <div className={styles.alertOk} data-stagger>
                  {msg}
                </div>
              ) : (
                <form onSubmit={submit}>
                  <input
                    ref={inputRef}
                    className={styles.input}
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-stagger
                  />
                  <div className={styles.btnRow} data-stagger>
                    <button type="submit" disabled={busy} className={styles.cta}>
                      {busy ? "Sending…" : "Send link"}
                    </button>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={closeWithAnim}
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
