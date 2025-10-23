
import React, { useState } from 'react';
import styles from "./ClientPortalGate.module.css"


export default function ClientPortalGate({ packages, onContinue }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.gateWrap}>
      <ul className={styles.bubbles}>
  {Array.from({ length: 28 }).map((_, i) => {
    const isFloat = Math.random() < 0.4;                 
    const left = 3 + Math.random() * 94;                 
    const size = 18 + Math.random() * 64;                
    const rise = 18 + Math.random() * 14;            
    const sway = 6 + Math.random() * 6;                 
    const delay = Math.random() * 12;                    
    const top = 12 + Math.random() * 58;

    return (
      <li
        key={i}
        className={`${styles.bubble} ${isFloat ? styles.float : styles.rise}`}
        style={{
          '--left': `${left}%`,
          '--size': `${size}px`,
          '--rise': `${rise}s`,
          '--sway': `${sway}s`,
          '--delay': `-${delay}s`,
          '--top': `${top}vh`
        }}
      />
    );
  })}
</ul>


      <div className={styles.inner}>
        <h1 className={styles.title}>Choose a Package</h1>
        <p className={styles.subtitle}>
          Pick the plan that fits your shoot. 
        </p>

        <div className={styles.cards}>
          {packages.map((p) => {
            const active = selected === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.plan} ${active ? styles.active : ""}`}
                onClick={() => setSelected(p.id)}
                aria-pressed={active}
              >
                <div className={styles.planHeader}>{p.name}</div>
                <div className={styles.planPhotos}>{p.photos} photos</div>
                <div className={styles.planPrice}>${p.price}</div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`${styles.nextBtn} ${selected ? styles.nextEnabled : styles.nextDisabled}`}
          disabled={!selected}
          onClick={() => onContinue?.(selected)}
        >
          Next
        </button>
      </div>
    </div>
  );
}