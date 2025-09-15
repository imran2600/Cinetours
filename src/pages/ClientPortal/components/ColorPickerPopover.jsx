import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import gsap from "gsap";
import styles from "./ColorPickerPopover.module.css";

export default function ColorPickerPopover({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  // open animation
  useEffect(() => {
    if (!open) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    gsap.set(panelRef.current, { y: 16, opacity: 0, scale: 0.96, filter: "blur(6px)" });
    gsap.set(overlayRef.current, { opacity: 0 });

    tl.to(overlayRef.current, { opacity: 1, duration: 0.2 })
      .to(panelRef.current, { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.25 }, "<");

    const onEsc = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const close = () => {
    const tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => setOpen(false),
    });
    tl.to(panelRef.current, { y: 8, opacity: 0, scale: 0.96, duration: 0.18 })
      .to(overlayRef.current, { opacity: 0, duration: 0.15 }, "<");
  };

  return (
    <div className={styles.wrap}>
      {/* clickable swatch + hex text */}
      <button
        type="button"
        className={styles.swatch}
        style={{ background: value }}
        aria-label="Choose color"
        onClick={() => setOpen(true)}
      />
      <span className={styles.hex}>{value}</span>

      {open && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          onMouseDown={(e) => e.target === overlayRef.current && close()}
        >
          <div ref={panelRef} className={styles.popover} role="dialog" aria-modal="true">
            <HexColorPicker color={value} onChange={onChange} />
            <div className={styles.controls}>
              <HexColorInput color={value} onChange={onChange} prefixed className={styles.input} />
              <button type="button" className={styles.done} onClick={close}>Done</button>
            </div>

            {/* quick swatches */}
            <div className={styles.swatches}>
              {["#22c55e","#a855f7","#0ea5e9","#f59e0b","#ef4444","#14b8a6"].map((c) => (
                <button key={c} className={styles.swatchSmall} style={{ background: c }} onClick={() => onChange(c)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
