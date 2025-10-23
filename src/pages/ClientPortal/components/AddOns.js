
import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./AddOns.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portalApi from "../../../services/portalApi"; 
import { getStripe } from "../../../lib/stripe";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT = {
  voiceoverAI: false,
  talkThrough: false,
  reelSplit: false,
  rush12h: false,
  premiumEdit: false,
  extraReels: 0,
  revisionRounds: 0,
  bundle: null,

  freeSoundtrack: false,
  freeBrandingOverlay: false,
  freeTitleCards: false,
  freeFormat: "",
};

const BUNDLES = {
  socialBoost: {
    label: "Social Boost Pack — $90",
    price: 90,
    includes: ["reelSplit", "voiceoverAI", "rush12h"],
    blurb: "Reel Split + Voiceover + Rush Delivery",
  },
  agentPresenter: {
    label: "Agent Presenter Pack — $150",
    price: 150,
    includes: ["talkThrough", "premiumEdit"],
    blurb: "Talk-through narration + Premium Edit",
  },
  fullMarketing: {
    label: "Full Marketing Pack — $200",
    price: 200,
    includes: ["voiceoverAI", "talkThrough", "reelSplit", "rush12h", "premiumEdit"],
    blurb: "Everything in one pack",
  },
};

const PRICES = {
  voiceoverAI: 30,
  talkThrough: 80,
  reelSplit: 50,
  extraReel: 10,
  rush12h: 50,
  revisionRound: 10,
  premiumEdit: 40,
};

function total(a) {
  let t = 0;
  if (a.bundle && BUNDLES[a.bundle]) t += BUNDLES[a.bundle].price;
  const covered = new Set(a.bundle ? BUNDLES[a.bundle].includes : []);
  if (a.voiceoverAI && !covered.has("voiceoverAI")) t += PRICES.voiceoverAI;
  if (a.talkThrough && !covered.has("talkThrough")) t += PRICES.talkThrough;
  if (a.reelSplit && !covered.has("reelSplit")) t += PRICES.reelSplit;
  if (a.rush12h && !covered.has("rush12h")) t += PRICES.rush12h;
  if (a.premiumEdit && !covered.has("premiumEdit")) t += PRICES.premiumEdit;
  if (a.extraReels > 0) t += a.extraReels * PRICES.extraReel;
  if (a.revisionRounds > 0) t += a.revisionRounds * PRICES.revisionRound;
  return t;
}


export default function AddonScreen({ onBack, onContinue, userId, selectedPackage }) {
  const [a, setA] = useState(DEFAULT);
  const rootRef = useRef(null);

  useEffect(() => {
    const wrapEl = rootRef.current;
    if (!wrapEl) return;

    const id = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray(`.${styles.card}`).forEach((card) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 80, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        gsap.from(`.${styles.header}`, {
          y: -40,
          autoAlpha: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.${styles.header}`,
            start: "top 90%",
          },
        });

        gsap.to(`.${styles.blob}`, {
          y: 120,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: wrapEl,
            scrub: true,
          },
        });
      }, wrapEl);

      return () => ctx.revert();
    });

    return () => cancelAnimationFrame(id);
  }, []);

  const covered = new Set(a.bundle ? BUNDLES[a.bundle].includes : []);
  const pick = (k) => setA({ ...a, [k]: !a[k] });
  const qty = (k, d) => setA({ ...a, [k]: Math.max(0, (a[k] || 0) + d) });
  const setBundle = (k) => setA({ ...a, bundle: a.bundle === k ? null : k });
  const pickFree = (k) => setA({ ...a, [k]: !a[k] });
  const setFreeFormat = (v) => setA({ ...a, freeFormat: v });

  const pkgPrice = selectedPackage?.price ?? 0;
  const addonsTotal = total(a);
  const grandTotal = pkgPrice + addonsTotal; 

async function handleCheckout() {
  try {
    if (grandTotal <= 0) {
      onContinue?.(a);
      return;
    }
    if (!userId) {
      alert("Please sign in again.");
      return;
    }

    const origin = window.location.origin;
    const success_url = `${origin}/portal?start=upload&paid=1&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url  = `${origin}/portal?paid=0`;

    localStorage.setItem("qt_pkgId", String(selectedPackage?.id ?? ""));
    localStorage.setItem("qt_addons", JSON.stringify(a));

    const payload = {
      user_id: userId,
      amount: Math.round(grandTotal * 100), 
      currency: "usd",
      success_url,
      cancel_url,
      addon_type: a.bundle || "custom",
      metadata: {
        package_name: selectedPackage?.name || "",
        package_price: String(pkgPrice),
        addons: JSON.stringify(a),
        addons_total: String(addonsTotal),
        grand_total: String(grandTotal),
      },
    };

    const resp = await portalApi.createCheckoutSession(payload);

    const sessionId =
      resp?.id || (resp?.url?.match(/\/(cs_[^/?#]+)/)?.[1]) || null;

    if (sessionId) {
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } else if (resp?.url) {
      window.location.href = resp.url;
    } else {
      throw new Error("Checkout session missing id/url");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to start checkout");
  }
}

  const bubbles = useMemo(() => {
    const N = 18;
    const rnd = (min, max) => Math.random() * (max - min) + min;
    const vw = () => `${rnd(0, 100).toFixed(2)}vw`;
    const vh = () => `${rnd(0, 100).toFixed(2)}vh`;

    return Array.from({ length: N }, (_, i) => ({
      id: i,
      x0: vw(), y0: vh(),
      x1: vw(), y1: vh(),
      x2: vw(), y2: vh(),
      x3: vw(), y3: vh(),
      x4: vw(), y4: vh(),
      s: rnd(0.75, 1.25),
      d: `${rnd(16, 28).toFixed(2)}s`,
      delay: `${rnd(-28, 0).toFixed(2)}s`,
      a: rnd(0.16, 0.28),
      blur: `${rnd(0, 6).toFixed(1)}px`
    }));
  }, []);

  return (
    <div ref={rootRef} className={styles.wrap}>
      <ul className={styles.bubbles} aria-hidden="true">
        {bubbles.map(b => (
          <li
            key={b.id}
            style={{
              "--x0": b.x0, "--y0": b.y0,
              "--x1": b.x1, "--y1": b.y1,
              "--x2": b.x2, "--y2": b.y2,
              "--x3": b.x3, "--y3": b.y3,
              "--x4": b.x4, "--y4": b.y4,
              "--s": b.s,
              "--d": b.d,
              "--delay": b.delay,
              "--a": b.a,
              "--blur": b.blur,
            }}
          />
        ))}
      </ul>

      <div className={styles.inner}>
        <div className={styles.fx} aria-hidden="true">
          <span className={`${styles.blob} ${styles.purple}`} />
          <span className={`${styles.blob} ${styles.green}`} />
          <span className={`${styles.blob} ${styles.cyan}`} />
        </div>

        <header className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <h1 className={styles.title}>Add-Ons</h1>
          <p className={styles.sub}>
            Enhance your QuantumTour with narration, social cuts, rush delivery, and more.
          </p>
        </header>

        <section className={styles.card}>
          <h3><span>🎤</span> Narration & Presentation</h3>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.voiceoverAI || covered.has("voiceoverAI")}
              onChange={() => pick("voiceoverAI")}
              disabled={covered.has("voiceoverAI")}
              aria-label="AI Voiceover"
            />
            <div className={styles.text}>
              <div className={styles.name}>Voiceover (AI-generated) — ${PRICES.voiceoverAI}</div>
              <div className={styles.blurb}>
                Professional AI voice reading your script or property highlights.
              </div>
            </div>
          </label>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.talkThrough || covered.has("talkThrough")}
              onChange={() => pick("talkThrough")}
              disabled={covered.has("talkThrough")}
              aria-label="Talk-through narration"
            />
            <div className={styles.text}>
              <div className={styles.name}>Talk-through narration — ${PRICES.talkThrough}</div>
              <div className={styles.blurb}>
                AI avatar or digital agent delivering a walkthrough for personality & connection.
              </div>
            </div>
          </label>
        </section>

        <section className={styles.card}>
          <h3>📱 Social Media</h3>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.reelSplit || covered.has("reelSplit")}
              onChange={() => pick("reelSplit")}
              disabled={covered.has("reelSplit")}
              aria-label="Reel Split"
            />
            <div className={styles.text}>
              <div className={styles.name}>Reel Split — ${PRICES.reelSplit}</div>
              <div className={styles.blurb}>
                Cuts your video into 3 vertical reels (10–25s). Great for TikTok, Reels, Shorts.
              </div>
            </div>

            <div className={styles.qty} role="group" aria-label="Additional reels">
              <button type="button" onClick={() => qty("extraReels", -1)} aria-label="Decrease additional reels">–</button>
              <span aria-live="polite">{a.extraReels}</span>
              <button type="button" onClick={() => qty("extraReels", 1)} aria-label="Increase additional reels">+</button>
            </div>
          </label>
        </section>

        <section className={styles.card}>
          <h3>⚡ Delivery & Edits</h3>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.rush12h || covered.has("rush12h")}
              onChange={() => pick("rush12h")}
              disabled={covered.has("rush12h")}
              aria-label="Rush delivery 12 hours"
            />
            <div className={styles.text}>
              <div className={styles.name}>Rush Delivery (12 hr) — ${PRICES.rush12h}</div>
            </div>
          </label>

          <div className={styles.row}>
            <span className={`${styles.tick} ${styles.placeholder}`} aria-hidden="true" />
            <div className={styles.text}>
              <div className={styles.name}>Revisions (per extra round) — ${PRICES.revisionRound}</div>
            </div>
            <div className={styles.qty} role="group" aria-label="Extra revision rounds">
              <button type="button" onClick={() => qty("revisionRounds", -1)} aria-label="Decrease revision rounds">–</button>
              <span aria-live="polite">{a.revisionRounds}</span>
              <button type="button" onClick={() => qty("revisionRounds", 1)} aria-label="Increase revision rounds">+</button>
            </div>
          </div>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.premiumEdit || covered.has("premiumEdit")}
              onChange={() => pick("premiumEdit")}
              disabled={covered.has("premiumEdit")}
              aria-label="Premium edit"
            />
            <div className={styles.text}>
              <div className={styles.name}>Premium Edit — ${PRICES.premiumEdit}</div>
              <div className={styles.blurb}>
                Advanced transitions, smoother pacing, cinematic polish. FREE in Pro & Ultra.
              </div>
            </div>
          </label>
        </section>

        <section className={styles.card}>
          <h3>📦 Packaged Add-On Bundles</h3>
          {Object.entries(BUNDLES).map(([k, b]) => (
            <label key={k} className={styles.bundleRow}>
              <input
                className={styles.tick}
                type="radio"
                name="bundle"
                checked={a.bundle === k}
                onChange={() => setBundle(k)}
                aria-label={b.label}
              />
              <div className={styles.text}>
                <div className={styles.name}>{b.label}</div>
                <div className={styles.blurb}>{b.blurb}</div>
              </div>
            </label>
          ))}
          <button className={styles.clear} onClick={() => setBundle(null)} disabled={!a.bundle}>
            Clear bundle
          </button>
        </section>

        <section className={styles.card}>
          <h3>✅ Free Options</h3>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.freeSoundtrack}
              onChange={() => pickFree("freeSoundtrack")}
              aria-label="Custom AI soundtrack"
            />
            <div className={styles.text}>
              <div className={styles.name}>Custom AI-generated soundtrack</div>
            </div>
          </label>

          <div className={styles.row}>
            <span className={`${styles.tick} ${styles.placeholder}`} aria-hidden="true" />
            <div className={styles.text}>
              <div className={styles.name}>Choice of format</div>
              <div className={styles.blurb}>Pick one: horizontal, vertical, or square</div>
            </div>
            <div className={styles.controlGroup} role="radiogroup" aria-label="Output format">
              <label><input type="radio" name="freeFormat" checked={a.freeFormat === "horizontal"} onChange={() => setFreeFormat("horizontal")} /> Horizontal</label>
              <label><input type="radio" name="freeFormat" checked={a.freeFormat === "vertical"} onChange={() => setFreeFormat("vertical")} /> Vertical</label>
              <label><input type="radio" name="freeFormat" checked={a.freeFormat === "square"} onChange={() => setFreeFormat("square")} /> Square</label>
            </div>
          </div>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.freeBrandingOverlay}
              onChange={() => pickFree("freeBrandingOverlay")}
              aria-label="Branding overlay"
            />
            <div className={styles.text}>
              <div className={styles.name}>Branding overlay (logos, colors, watermark)</div>
            </div>
          </label>

          <label className={styles.row}>
            <input
              className={styles.tick}
              type="checkbox"
              checked={a.freeTitleCards}
              onChange={() => pickFree("freeTitleCards")}
              aria-label="Intro/outro title cards"
            />
            <div className={styles.text}>
              <div className={styles.name}>Intro/outro title cards</div>
            </div>
          </label>
        </section>

        <footer className={styles.footer}>
          <div className={styles.total} aria-live="polite">
            Total: <strong>${grandTotal}</strong>
            <small style={{ marginLeft: 8, opacity: 0.8 }}>
              (Package ${pkgPrice} + Add-Ons ${addonsTotal})
            </small>
          </div>
          <button className={styles.next}   onClick={handleCheckout} >
            Continue to Payment
          </button>
        </footer>
      </div>
    </div>
  );
}
