// Brand Assets
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button, Image } from 'react-bootstrap';
import styles from './BrandAssets.module.css';

const BrandAssets = ({ assets, onUpdate }) => {
  const [formData, setFormData] = useState(assets);
  const [logoPreview, setLogoPreview] = useState(assets.logo);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    return () => { if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview); };
  }, [logoPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setHasError(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setFormData({ ...formData, logo: file });
    } else {
      setHasError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
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
        blur: `${rnd(0, 6).toFixed(1)}px`
      }));
  }, []);

  return (
    <div className={styles.bgHost} style={{ '--accent': formData.colorScheme || '#22c55e' }}>

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
      <div className={styles.fx} aria-hidden />
      <div className={styles.accentGlow} aria-hidden />

      <Card className={styles.portalCard}>
        <Card.Header as="h4" className={styles.cardHeader}>Brand Assets</Card.Header>
        <Card.Body className={styles.cardBody}>
          <Form onSubmit={handleSubmit} className={styles.brandForm}>

            {/* Company Logo */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Company Logo</legend>
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

            {/* Primary Color */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Primary Color</legend>
              <Form.Control
                type="color"
                value={formData.colorScheme}
                onChange={(e) => setFormData({ ...formData, colorScheme: e.target.value })}
                className={styles.colorPicker}
              />
            </fieldset>

            {/* Font Family */}
            <fieldset className={styles.groupCard}>
              <legend className={styles.groupTitle}>Font Family</legend>
              <Form.Select
                value={formData.font}
                onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                className={styles.fontSelect}
              >
                <option>Montserrat</option>
                <option>Roboto</option>
                <option>Open Sans</option>
                <option>Playfair Display</option>
                <option>Inter</option>
                <option>Poppins</option>
              </Form.Select>
            </fieldset>

            <Button type="submit" className={styles.submitButton}>Save Changes</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BrandAssets;
