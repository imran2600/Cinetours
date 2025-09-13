//  Download Center
import React, { useState, useMemo } from "react";
import styles from "./DownloadCenter.module.css";

const DownloadCenter = ({ videos = [], onDownload }) => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Do not change this function’s behavior
  const handleDownload = async (videoId, videoName) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video?.downloadUrl) {
      setError("No download URL available");
      return;
    }

    const a = document.createElement("a");
    a.href = video.downloadUrl;
    a.download = `${videoName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    try {
      const response = await fetch(`/api/videos/${videoId}/download-url`);
      const { url } = await response.json();

      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoName}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download video. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const bubbles = useMemo(() => {
    const N = 18; // how many
    const rnd = (min, max) => Math.random() * (max - min) + min;
    return Array.from({ length: N }, (_, i) => {
      const mk = () => `${rnd(0, 100).toFixed(5)}vw`;
      const mky = () => `${rnd(0, 100).toFixed(5)}vh`;
      return {
        id: i,
        // 5 waypoints (0 → 4) the keyframes will use
        x0: mk(),  y0: mky(),
        x1: mk(),  y1: mky(),
        x2: mk(),  y2: mky(),
        x3: mk(),  y3: mky(),
        x4: mk(),  y4: mky(),
        s:  rnd(0.7, 1.4),             
        d:  `${rnd(16, 28).toFixed(2)}s`,
        delay: `${rnd(-28, 0).toFixed(2)}s`, // negative = start mid-path
        a:  rnd(0.16, 0.28),            // opacity
        blur: `${rnd(0, 6).toFixed(1)}px`
      };
    });
  }, []);

  return (
    <div className={styles.wrap}>
      {/* floating bubbles (subtle) */}
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
        <header className={styles.header}>
          <h1 className={styles.title}>Your Videos</h1>
        </header>

        <section className={styles.panel}>
          {error && <div className={styles.alert}>{error}</div>}

          {videos.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎬</div>
              <div className={styles.emptyTitle}>No completed videos yet</div>
              <div className={styles.emptySub}>
                When your orders are finished, your download links will appear here.
              </div>
            </div>
          ) : (
            <ul className={styles.list}>
              {videos.map((v) => (
                <li key={v.id} className={styles.item}>
                  <div className={styles.main}>
                    <div className={styles.name}>{v.name}</div>
                    <div className={styles.meta}>
                      <span className={styles.tag}>#{v.orderId}</span>
                      <span className={styles.dot} />
                      <span className={styles.date}>
                        {new Date(v.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.downloadBtn}
                    onClick={() => handleDownload(v.id, v.name)}
                    disabled={downloadingId === v.id}
                  >
                    {downloadingId === v.id ? "Downloading…" : "Download"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default DownloadCenter;
