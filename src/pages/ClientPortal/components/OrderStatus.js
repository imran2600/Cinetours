import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import styles from "./OrderStatus.module.css";
import { gsap } from "gsap";

const STATUS = {
  submitted:  { label: "Submitted"  },
  processing: { label: "Processing" },
  completed:  { label: "Completed"  },
};
const palettes = [styles.palettePurple, styles.paletteBlue, styles.paletteTeal];
const formatYMD = v => {
  const d = new Date(v);
  return Number.isNaN(+d) ? String(v || "") : d.toLocaleDateString("en-CA");
};

export default function OrderStatus({ orders, loading }) {
  const bubbles = useMemo(() => {
    const N = 18;
    const rnd = (a,b) => Math.random()*(b-a)+a;
    const vw = () => `${rnd(0,100).toFixed(2)}vw`;
    const vh = () => `${rnd(0,100).toFixed(2)}vh`;
    return Array.from({length:N},(_,i)=>({
      id:i, x0:vw(),y0:vh(),x1:vw(),y1:vh(),x2:vw(),y2:vh(),x3:vw(),y3:vh(),x4:vw(),y4:vh(),
      s:rnd(.75,1.25), d:`${rnd(16,28).toFixed(2)}s`, delay:`${rnd(-28,0).toFixed(2)}s`,
      a:rnd(.16,.28), blur:`${rnd(0,6).toFixed(1)}px`
    }));
  }, []);

  const gridRef = useRef(null);
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll(`.${styles.orderItem}`);

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { opacity:0, y:-12, duration:.4, ease:"power2.out" });
      gsap.from(items, {
        opacity:0, y:18, scale:.985, filter:"blur(6px)",
        duration:.4, ease:"power3.out", stagger:.04, delay:.05,
        onComplete: () => {
          gsap.set(items, { clearProps: "all" });
          items.forEach(item => item.style.opacity = "1");
        }
      });
    }, gridRef);

    return () => ctx.revert();
  }, [orders]);

  const handleMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = -(y - 0.5) * 8;
    const ry =  (x - 0.5) * 10;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--tz", `6px`);
    el.style.setProperty("--glow", `1`);
  };
  const handleLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--tz", `0px`);
    el.style.setProperty("--glow", `0`);
  };

  return (
    <div>
      <ul className={styles.bubbles} aria-hidden="true">
        {bubbles.map(b=>(
          <li key={b.id} style={{
            "--x0":b.x0,"--y0":b.y0,"--x1":b.x1,"--y1":b.y1,"--x2":b.x2,"--y2":b.y2,
            "--x3":b.x3,"--y3":b.y3,"--x4":b.x4,"--y4":b.y4,"--s":b.s,"--d":b.d,
            "--delay":b.delay,"--a":b.a,"--blur":b.blur
          }}/>
        ))}
      </ul>

      <Card className={`${styles.portalCard} ${styles.orderCard}`}>
        <Card.Header as="h4" className={styles.orderHeader} ref={headerRef}>
          Your Orders
        </Card.Header>

        <Card.Body className={styles.orderBody}>
          {loading ? (
            <div className={`text-center ${styles.loadingContainer}`}>
              <Spinner animation="border" className={styles.loadingSpinner} />
            </div>
          ) : (
            <div className={styles.orderGrid} ref={gridRef}>
              {orders.map((o,i) => {
                const k = String(o.status || "").toLowerCase();
                return (
                  <div
                    key={o.id}
                    className={`${styles.orderItem} ${palettes[i % palettes.length]}`}
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                  >
                    <div className={styles.orderTop}>
                      <h5 className={styles.orderId}>Order #{o.id}</h5>
                      <span className={styles.orderDate}>{formatYMD(o.date)}</span>
                    </div>

                    <div className={styles.orderMid}>
                      <div className={styles.orderPackageSection}>
                        <span className={styles.orderPackageLabel}>Package Type</span>
                        <span className={styles.orderPackage}>{o.package}</span>
                      </div>
                      
                      <span className={`${styles.orderStatus} ${styles[`status_${k || "submitted"}`]}`}>
                        {(STATUS[k] || STATUS.submitted).label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}