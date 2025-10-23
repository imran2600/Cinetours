
// src/pages/Auth/SetNewPassword.jsx
import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import base from "./AuthMake.module.css"; 
import styles from "./SetNewPassword.module.css";

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

export default function SetNewPassword() {
  const [params] = useSearchParams();
  const token = params.get("token"); 

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const valid = useMemo(() => {
    if (pw.length < 8) return false;       
    if (pw !== pw2) return false;
    return true;
  }, [pw, pw2]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    if (!token) return setErr("Reset link is invalid or expired.");
    if (!valid) return setErr("Please meet the password rules.");

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 900));
      setOk("Your password has been updated. You can now sign in.");
    } catch (e2) {
      setErr(e2.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={base.authShell}>
      <div className={base.formPane}>
        <div className={base.formCard}>
          <h1 className={base.title}>Set new password</h1>
          <div className={base.divider}>Choose a strong password</div>

          {err && <div className={base.error}>{err}</div>}
          {ok && (
            <div className={styles.okBox}>
              <strong>Done!</strong> {ok} <br/>
              <Link className={styles.signinLink} to="/signin">Back to sign in →</Link>
            </div>
          )}

          {!ok && (
            <form className={base.form} onSubmit={onSubmit}>
              <label className={base.label}>New password</label>
              <div className={base.pwWrap}>
                <input
                  className={base.input}
                  type={show1 ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  minLength={8}
                  required
                  aria-invalid={pw.length>0 && pw.length<8}
                />
                <button
                  type="button"
                  className={base.eyeBtn}
                  onClick={() => setShow1(s => !s)}
                  aria-label={show1 ? "Hide password" : "Show password"}
                >
                  {show1 ? <EyeOff className={base.eyeIcon}/> : <Eye className={base.eyeIcon}/>}
                </button>
              </div>

              <label className={base.label}>Confirm password</label>
              <div className={base.pwWrap}>
                <input
                  className={base.input}
                  type={show2 ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  minLength={8}
                  required
                  aria-invalid={pw2.length>0 && pw!==pw2}
                />
                <button
                  type="button"
                  className={base.eyeBtn}
                  onClick={() => setShow2(s => !s)}
                  aria-label={show2 ? "Hide password" : "Show password"}
                >
                  {show2 ? <EyeOff className={base.eyeIcon}/> : <Eye className={base.eyeIcon}/>}
                </button>
              </div>

              <p className={styles.help}>
                Password must be at least <b>8 characters</b>. 
              </p>

              <button className={base.submit} disabled={loading || !valid}>
                {loading ? "Saving…" : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>

      <aside className={base.brandPane}>
        <div className={base.brandLogo}>QuantumTours</div>
        <div className={base.aurora} aria-hidden />
        <div className={base.hero}>
          <h2 className={base.heroTitle}>Reset & get back in <span>#withQuantum</span></h2>
        </div>
        <div className={base.waves} />
      </aside>
    </section>
  );
}
