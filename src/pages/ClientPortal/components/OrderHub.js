
import React from "react";
import styles from "./OrderHub.module.css";

export default function OrderHub({ onGo, onStartOrder }) {
  const tiles = [
    {
      key: "downloads",
      title: "Download Center",
      desc: "Grab your delivered videos.",
      icon: "bi-cloud-arrow-down",
      on: () => onGo?.("downloads"),
      ctaLabel: "Open",
    },
    {
      key: "status",
      title: "Order Status",
      desc: "Track progress in real-time.",
      icon: "bi-clock-history",
      on: () => onGo?.("status"),
      ctaLabel: "Open",
    },
    {
      key: "invoices",
      title: "Invoices",
      desc: "View and download receipts.",
      icon: "bi-receipt",
      on: () => onGo?.("invoices"),
      ctaLabel: "Open",
    },
    {
      key: "reorder",
      title: "Re-order",
      desc: "Duplicate a previous order.",
      icon: "bi-arrow-repeat",
      on: () => onGo?.("reorder"),
      ctaLabel: "Open",
    },
    {
      key: "branding",
      title: "Brand Assets",
      desc: "Manage your logo & colors.",
      icon: "bi-palette",
      on: () => onGo?.("branding"),
      ctaLabel: "Open",
    },
    {
      key: "new",
      title: "New Order",
      desc: "Choose a package and upload photos.",
      icon: "bi-plus-circle",
      on: () => onStartOrder?.(),
      ctaLabel: "Start",
    },
  ];

  return (
    <div className={styles.wrap}>
      <ul className={styles.bubbles}>
        {Array.from({ length: 30 }).map((_, i) => {
          const r = Math.random();
          const variant = r < 0.45 ? "rise" : r < 0.70 ? "fall" : "float";
          const left = 3 + Math.random() * 94;
          const size = 18 + Math.random() * 64;
          const sway = 6 + Math.random() * 6;
          const delay = Math.random() * 12;

          let cls = `${styles.bubble} `;
          let style = {
            "--left": `${left}%`,
            "--size": `${size}px`,
            "--sway": `${sway}s`,
            "--delay": `-${delay}s`,
          };

          if (variant === "rise") {
            cls += styles.rise;
            style["--rise"] = `${12 + Math.random() * 10}s`;
          } else if (variant === "fall") {
            cls += styles.fall;
            style["--fall"] = `${12 + Math.random() * 10}s`;
          } else {
            cls += styles.float;
            style["--top"] = `${8 + Math.random() * 70}vh`;
            style["--drift"] = `${8 + Math.random() * 10}s`;
            style["--bob"] = `${4 + Math.random() * 6}s`;
            style["--spin"] = `${20 + Math.random() * 30}s`;
          }
          return <li key={i} className={cls} style={style} />;
        })}
      </ul>

      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Order Submitted <span>🎉</span></h1>
          <p className={styles.sub}>What would you like to do next?</p>
        </header>

        <div className={styles.grid}>
          {tiles.map(t => (
            <article key={t.key} className={styles.tile}>
              <div className={styles.iconWrap}>
                <i className={`bi ${t.icon}`} />
              </div>
              <h3 className={styles.tileTitle}>{t.title}</h3>
              <p className={styles.tileDesc}>{t.desc}</p>
              <button className={styles.openBtn} onClick={t.on}>
                {t.ctaLabel || "Open"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
