// src/pages/Auth/SignIn.js
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import styles from "./AuthMake.module.css";
import ForgotPasswordLink from "./ForgotPasswordLink";

const Eye = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 .001-10.001A5 5 0 0 1 12 17Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="#2e2e2e"/>
  </svg>
);
const EyeOff = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="m2 4.27 1.28-1.27 18 18L20 21.27l-3.17-3.17A11.8 11.8 0 0 1 12 19C7 19 2.73 15.89 1 12a12.41 12.41 0 0 1 4.13-5.18L2 4.27Zm6.46 6.45A3.5 3.5 0 0 0 12 15.5c.45 0 .88-.09 1.27-.25l-4.81-4.53ZM12 5c3.33 0 6.54 1.61 8.64 4.36.53.67.96 1.34 1.36 1.99-.52.96-1.2 1.95-2.08 2.86l-1.46-1.46c.67-.74 1.2-1.49 1.58-2.17C18.44 8.36 15.39 7 12 7c-1.04 0-2.05.16-2.99.45L7.41 6.02C8.86 5.34 10.41 5 12 5Z" fill="#2e2e2e"/>
  </svg>
);

export default function SignIn() {
  const { signIn, signInAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = location.state?.from;
 const nextUrl = fromLocation
   ? `${fromLocation.pathname}${fromLocation.search || ""}`
   : "/portal";
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      await signIn({ email, password: pw }); 
      navigate(nextUrl, { replace: true });
    } catch (e2) {
      setErr(e2.message || "Could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setErr("");
    try {
      await signInAsGuest();
      const guestNext = fromLocation
       ? `${fromLocation.pathname}${fromLocation.search || ""}`
       : "/portal?new=1";
     navigate(guestNext, { replace: true });
    } catch (e2) {
      setErr(e2.message || "Guest sign-in failed.");
    }
  };

  return (
    <section className={styles.authShell}>
      <div className={styles.formPane}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Sign in</h1>

          <div className={styles.divider}>Sign in with email</div>

          {err && <div className={styles.error}>{err}</div>}

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />

            <label className={styles.label}>Password</label>
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className={styles.eyeIcon}/> : <Eye className={styles.eyeIcon}/>}
              </button>
            </div>

            <ForgotPasswordLink initialEmail={email} />

            <button className={styles.submit} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className={styles.guestRow}>
            <button type="button" className={styles.guestBtn} onClick={handleGuest}>
              Continue as guest
            </button>
          </div>

          <p className={styles.alt}>
            No account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <aside className={styles.brandPane}>
        <div className={styles.brandLogo}>QuantumTours</div>
        <div className={styles.aurora} aria-hidden />
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>
            Make every photo a tour <span>#withQuantumTours</span>
          </h2>
          <p className={styles.heroSub}>
            We turn your stills into smooth, on-brand walkthroughs. Fast turnaround. Budget-friendly.
          </p>
        </div>
        <div className={styles.waves} />
      </aside>
    </section>
  );
}
