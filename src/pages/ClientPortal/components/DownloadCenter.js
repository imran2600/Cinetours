import React, { useState, useEffect, useMemo } from "react";
import styles from "./DownloadCenter.module.css";
import portalApi from "../../../services/portalApi";

<<<<<<< HEAD
const DownloadCenter = ({ videos = [], onDownload ,userId}) => {
  const [downloadingId, setDownloadingId] = useState(null);
=======
const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com';

const DownloadCenter = ({ userId, onDownload }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
>>>>>>> 819d09c370c812ef8c4343aace0d962fee36c470
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch client orders with videos
  const fetchClientOrders = async () => {
    try {
<<<<<<< HEAD
      
=======
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      console.log('Fetching client orders for user:', userId);
      
      const res = await fetch(`${BASE_URL}/client/orders?user_id=${userId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const data = await res.json();
      console.log('Client orders response:', data);

      // Extract videos from orders
      const allVideos = [];
      
      if (data.orders && Array.isArray(data.orders)) {
        data.orders.forEach(order => {
          if (order.videos && Array.isArray(order.videos)) {
            order.videos.forEach(video => {
              if (video.url && order.status === 'completed') {
                allVideos.push({
                  id: `${order.order_id}-${video.filename || 'video'}`,
                  name: video.filename || `Order ${order.order_id} Video`,
                  downloadUrl: video.url,
                  orderId: order.order_id,
                  created: order.date || new Date().toISOString(),
                  status: 'completed'
                });
              }
            });
          }
        });
      }

      console.log('Extracted videos:', allVideos);
      setVideos(allVideos);
      
    } catch (err) {
      console.error('Error fetching client orders:', err);
      setError(`Failed to load videos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle download with proper error handling
  const handleDownload = async (videoId, videoName) => {
    try {
      setDownloadingId(videoId);
      setError(null);

      const video = videos.find((v) => v.id === videoId);
      if (!video?.downloadUrl) {
        setError("No download URL available for this video");
        return;
      }

      // Create a temporary anchor element to trigger download
      const a = document.createElement("a");
      a.href = video.downloadUrl;
      a.download = `${videoName}.mp4`;
      a.target = "_blank"; // Open in new tab for better UX
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Optional: Track download success
      if (onDownload) {
        onDownload(videoId, videoName);
      }

>>>>>>> 819d09c370c812ef8c4343aace0d962fee36c470
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download video. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Fetch orders when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchClientOrders();
    }
  }, [userId]);

  const bubbles = useMemo(() => {
    const N = 18;
    const rnd = (min, max) => Math.random() * (max - min) + min;
    return Array.from({ length: N }, (_, i) => {
      const mk = () => `${rnd(0, 100).toFixed(5)}vw`;
      const mky = () => `${rnd(0, 100).toFixed(5)}vh`;
      return {
        id: i,
        x0: mk(),  y0: mky(),
        x1: mk(),  y1: mky(),
        x2: mk(),  y2: mky(),
        x3: mk(),  y3: mky(),
        x4: mk(),  y4: mky(),
        s:  rnd(0.7, 1.4),             
        d:  `${rnd(16, 28).toFixed(2)}s`,
        delay: `${rnd(-28, 0).toFixed(2)}s`,
        a:  rnd(0.16, 0.28),
        blur: `${rnd(0, 6).toFixed(1)}px`
      };
    });
  }, []);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your videos...</p>
        </div>
      </div>
    );
  }

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
          <button 
            onClick={fetchClientOrders}
            className={styles.refreshButton}
            disabled={loading}
          >
            Refresh
          </button>
        </header>

        <section className={styles.panel}>
          {error && (
            <div className={styles.alert}>
              {error}
              <button onClick={() => setError(null)} className={styles.alertClose}>×</button>
            </div>
          )}

          {videos.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎬</div>
              <div className={styles.emptyTitle}>No completed videos yet</div>
              <div className={styles.emptySub}>
                When your orders are finished, your download links will appear here.
                {!userId && " Please make sure you're logged in."}
              </div>
              {!userId && (
                <div className={styles.emptyAction}>
                  Please log in to view your videos
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.stats}>
                Found {videos.length} video{videos.length !== 1 ? 's' : ''} ready for download
              </div>
              <ul className={styles.list}>
                {videos.map((v) => (
                  <li key={v.id} className={styles.item}>
                    <div className={styles.main}>
                      <div className={styles.name}>{v.name}</div>
                      <div className={styles.meta}>
                        <span className={styles.tag}>Order #{v.orderId}</span>
                        <span className={styles.dot} />
                        <span className={styles.date}>
                          {new Date(v.created).toLocaleDateString()}
                        </span>
                        <span className={styles.dot} />
                        <span className={styles.status}>{v.status}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.downloadBtn}
                      onClick={() => handleDownload(v.id, v.name)}
                      disabled={downloadingId === v.id}
                    >
                      {downloadingId === v.id ? (
                        <>
                          <span className={styles.downloadSpinner}></span>
                          Downloading…
                        </>
                      ) : (
                        'Download'
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default DownloadCenter;