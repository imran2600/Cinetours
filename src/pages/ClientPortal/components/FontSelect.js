// src/pages/ClientPortal/components/FontSelect.jsx
import React, { useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./FontSelect.module.css";

// Fonts you offer
const FONTS = ["Montserrat", "Roboto", "Open Sans", "Playfair Display", "Inter", "Poppins"];

// quick helper to load a Google font for preview
function ensureGoogleFont(name) {
  const id = "gf-" + name.replace(/\s+/g, "-").toLowerCase();
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

export default function FontSelect({ value, onChange }) {
  // load all so the list previews look correct
  useEffect(() => { FONTS.forEach(ensureGoogleFont); }, []);

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={styles.trigger} aria-label="Font family">
        <Select.Value />
        <span className={styles.chev}>▾</span>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={8}>
          <Select.Viewport className={styles.viewport}>
            {FONTS.map((f) => (
              <Select.Item key={f} value={f} className={styles.item}>
                <Select.ItemText>
                  <span className={styles.itemName}>{f}</span>
                  <span className={styles.sample} style={{ fontFamily: `'${f}', sans-serif` }}>
                    Aa Bb Cc
                  </span>
                </Select.ItemText>
                <Select.ItemIndicator className={styles.check}>✓</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
