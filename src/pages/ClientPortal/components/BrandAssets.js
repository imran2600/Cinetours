// BrandAssets.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import styles from './BrandAssets.module.css';
import ColorPickerPopover from './ColorPickerPopover';
import FontSelect from './FontSelect';

const safeRevoke = (url) => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    try { URL.revokeObjectURL(url); } catch {}
  }
};

const toItem = (item, prefix, i) => {
  if (!item) return null; 
  if (typeof item === 'string') {
    const ok = /^(https?:|data:|blob:)/i.test(item);
    return ok ? { id: `${prefix}-${i}`, url: item, file: null } : null;
  }
  try {
    const url = URL.createObjectURL(item);
    return { id: `${prefix}-${i}`, url, file: item };
  } catch {
    return null;
  }
};

const toItems = (arr = [], prefix) =>
  (arr || []).map((it, i) => toItem(it, prefix, i)).filter(Boolean);

export default function BrandAssets({ assets = {}, onUpdate }) {
  const [formData, setFormData] = useState(assets);

  const PREFILL_FROM_ASSETS = false;

  const [logos, setLogos] = useState(() =>
    PREFILL_FROM_ASSETS
      ? toItems(assets.logos?.length ? assets.logos : (assets.logo ? [assets.logo] : []), 'logo')
      : []
  );

  useEffect(() => () => logos.forEach((it) => safeRevoke(it?.url)), [logos]);

  const handleLogoFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const mapped = files.map((f) => ({
      id: `logo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(f),
      file: f,
    }));

    setLogos((prev) => [...prev, ...mapped]); 
  };

  const removeLogo = (id) => {
    setLogos((list) =>
      list.filter((it) => {
        if (it.id === id) safeRevoke(it?.url);
        return it.id !== id;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        logos: logos.map((it) => it.file ?? it.url), 
      };
      await onUpdate?.(payload);
      alert('Brand assets updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

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
      blur: `${rnd(0, 6).toFixed(1)}px`,
    }));
  }, []);

  return (
    <div
      className={styles.bgHost}
      style={{
        '--accent': formData.colorScheme || '#22c55e',
        fontFamily: `'${formData.font}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
      }}
    >
      <ul className={styles.bubbles} aria-hidden="true">
        {bubbles.map((b) => (
          <li
            key={b.id}
            style={{
              '--x0': b.x0, '--y0': b.y0,
              '--x1': b.x1, '--y1': b.y1,
              '--x2': b.x2, '--y2': b.y2,
              '--x3': b.x3, '--y3': b.y3,
              '--x4': b.x4, '--y4': b.y4,
              '--s': b.s, '--d': b.d,
              '--delay': b.delay, '--a': b.a, '--blur': b.blur,
            }}
          />
        ))}
      </ul>
      <div className={styles.fx} aria-hidden />
      <div className={styles.accentGlow} aria-hidden />

      <Card className={styles.portalCard}>
        <Card.Header as="h4" className={styles.cardHeader}>Brand Assets</Card.Header>
        <Card.Body className={styles.cardBody}>
          <Form onSubmit={handleSubmit} className={styles.brandForm}>

            {/* Primary Logos */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Primary Logos</legend>

              <div className={styles.thumbGrid}>
                {logos.length === 0 ? (
                  <label
                    className={styles.thumb}
                    title="Upload logo"
                    style={{ position: 'relative', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => { handleLogoFiles(e.target.files); e.target.value = ''; }}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      aria-label="Upload logo"
                    />
                    <span style={{ fontSize: 28, opacity: 0.9 }}>Logo+</span>
                  </label>
                ) : (
                  <>
                    {logos.map((it) => (
                      <figure key={it.id} className={styles.thumb}>
                        <img
                          src={it.url}
                          alt=""
                          onError={() => removeLogo(it.id)} 
                        />
                        <button
                          type="button"
                          className={styles.removeThumb}
                          onClick={() => removeLogo(it.id)}
                          aria-label="Remove logo"
                          title="Remove"
                        >
                          ×
                        </button>
                      </figure>
                    ))}

                    <label className={`${styles.thumb} ${styles.addThumb}`} title="Add logos">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => { handleLogoFiles(e.target.files); e.target.value = ''; }}
                      />
                      <span aria-hidden>＋</span>
                    </label>
                  </>
                )}
              </div>

              <small className={styles.help}>Upload one or many logos (PNG/SVG/JPG).</small>
            </fieldset>

            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Primary Color</legend>
              <ColorPickerPopover
                value={formData.colorScheme}
                onChange={(c) => setFormData({ ...formData, colorScheme: c })}
              />
            </fieldset>

            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Font Family</legend>
              <FontSelect
                value={formData.font}
                onChange={(f) => setFormData({ ...formData, font: f })}
              />
            </fieldset>

            <Button type="submit" className={styles.submitButton}>Save Changes</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
