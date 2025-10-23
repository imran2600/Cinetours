
import React from 'react';
import { Container } from 'react-bootstrap';
import UploadOrder from './UploadOrder';
import styles from './UploadScreen.module.css';

export default function UploadScreen({
  packages,
  preselectedPackageId,
  preselectedAddons,          
  onSubmitted,
  onBack
}) {
  return (
    <div className={styles.wrap}>
      <ul className={styles.bubbles}>
        {Array.from({ length: 22 }).map((_, i) => (
          <li
            key={i}
            style={{
              '--x': `${Math.random() * 100}%`,
              '--d': `${8 + Math.random() * 14}s`,
              '--s': `${0.6 + Math.random() * 1.4}`,
            }}
          />
        ))}
      </ul>

      <Container className={styles.inner}>
        <header className={styles.header}>
            <button className={styles.backBtn} onClick={onBack}>← Back</button>
            <h1 className={styles.title}>Upload Photos</h1>
        </header>

        <UploadOrder
          packages={packages}
          preselectedPackageId={preselectedPackageId}
          onSubmit={onSubmitted}
          showAddons={!preselectedAddons}
          initialAddons={preselectedAddons || null}
        />
      </Container>
    </div>
  );
}
