import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button, Image } from 'react-bootstrap';
import styles from './BrandAssets.module.css';
import ColorPickerPopover from './ColorPickerPopover';
import FontSelect from './FontSelect';

const toItems = (arr = [], prefix) =>
  (arr || []).map((url, i) => ({ id: `${prefix}-${i}`, url, file: null }));

export default function BrandAssets({ assets = {}, onUpdate }) {
  const [formData, setFormData] = useState(assets);
  const [logoPreview, setLogoPreview] = useState(assets.logo || '');
  const [hasError, setHasError] = useState(false);

  // multiple extra logos
  const [logos, setLogos] = useState(() => toItems(assets.logos || [], 'logo'));

  // 🔁 CHANGE: single profile instead of headshots[]
  const [profile, setProfile] = useState(() =>
    assets.profile ? { id: 'profile-0', url: assets.profile, file: null } : null
  );

  // revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      const revoke = (list) =>
        list.forEach((it) => it.url?.startsWith('blob:') && URL.revokeObjectURL(it.url));
      revoke(logos);
      if (profile?.url?.startsWith('blob:')) URL.revokeObjectURL(profile.url);
      if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    };
  }, [logos, profile, logoPreview]);

  const addFiles = (fileList, kind) => {
    const files = Array.from(fileList || []);
    const mapped = files.map((f) => ({
      id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(f),
      file: f,
    }));
    if (kind === 'logos') setLogos((prev) => [...prev, ...mapped]);
  };

  // handlers for the single profile image
  const setProfileFromFiles = (fileList) => {
    const f = fileList?.[0];
    if (!f) return;
    if (profile?.url?.startsWith('blob:')) URL.revokeObjectURL(profile.url);
    setProfile({ id: 'profile-0', url: URL.createObjectURL(f), file: f });
  };
  const clearProfile = () => {
    if (profile?.url?.startsWith('blob:')) URL.revokeObjectURL(profile.url);
    setProfile(null);
  };

  const removeItem = (kind, id) => {
    if (kind === 'logos') {
      setLogos((list) =>
        list.filter((it) => {
          if (it.id === id && it.url?.startsWith('blob:')) URL.revokeObjectURL(it.url);
          return it.id !== id;
        })
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setHasError(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setFormData((prev) => ({ ...prev, logo: file }));
    } else {
      setHasError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        logos: logos.map((it) => it.file ?? it.url),
        // 🔁 CHANGE: single profile field
        profile: profile ? (profile.file ?? profile.url) : null,
      };
      await onUpdate?.(payload);
      alert('Brand assets updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      setHasError(true);
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

            {/* Primary logo (single) */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Primary Logo</legend>
              <div className={`${styles.logoUploadWrapper} ${hasError ? styles.isError : ''}`}>
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  className={`${styles.logoPreview} ${logoPreview ? styles.show : ''}`}
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>
            </fieldset>

            {/* Additional Logos (multiple) */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Additional Logos</legend>
              <div className={styles.thumbGrid}>
                {logos.map((it) => (
                  <figure key={it.id} className={styles.thumb}>
                    <img src={it.url} alt="Logo" />
                    <button
                      type="button"
                      className={styles.removeThumb}
                      onClick={() => removeItem('logos', it.id)}
                      aria-label="Remove logo"
                      title="Remove"
                    >
                      ×
                    </button>
                  </figure>
                ))}
                <label className={`${styles.thumb} ${styles.addThumb}`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => addFiles(e.target.files, 'logos')}
                  />
                  <span>＋</span>
                </label>
              </div>
              <small className={styles.help}>PNG/SVG/JPG, up to ~5MB each.</small>
            </fieldset>

            {/* 🔁 Profile Photo (single) */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Profile Photo</legend>
              <div className={styles.thumbGrid}>
                {profile ? (
                  <figure className={styles.thumb}>
                    <img src={profile.url} alt="Profile" />
                    <button
                      type="button"
                      className={styles.removeThumb}
                      onClick={clearProfile}
                      aria-label="Remove profile photo"
                      title="Remove"
                    >
                      ×
                    </button>
                  </figure>
                ) : (
                  <label className={`${styles.thumb} ${styles.addThumb}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileFromFiles(e.target.files)}
                    />
                    <span>＋</span>
                  </label>
                )}
              </div>
              <small className={styles.help}>Square photos work best (e.g., 800×800).</small>
            </fieldset>

            {/* Color + Font */}
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
