import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import styles from "./DownloadCenter.module.css";
import { gsap } from "gsap";

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://quantum-tour-backend.onrender.com';

const DownloadCenter = ({ userId, onDownload }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const gridRef = useRef(null);
  const headerRef = useRef(null);

  // GSAP animations
  useLayoutEffect(() => {
    if (!gridRef.current || videos.length === 0) return;
    const cards = gridRef.current.querySelectorAll(`.${styles.videoCard}`);

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { 
        opacity: 0, 
        y: -20, 
        duration: 0.6, 
        ease: "power2.out" 
      });
      
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        scale: 0.9,
        rotationY: 10,
        duration: 0.8,
        ease: "power3.out",
        stagger: {
          amount: 0.4,
          from: "random"
        },
        delay: 0.2,
        onComplete: () => {
          gsap.set(cards, { clearProps: "all" });
        }
      });
    }, gridRef);

    return () => ctx.revert();
  }, [videos]);

  // Mouse move 3D effect
  const handleCardMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = -(y - 0.5) * 6;
    const ry = (x - 0.5) * 8;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--tz", `8px`);
    el.style.setProperty("--glow", `1`);
  };

  const handleCardLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--tz", `0px`);
    el.style.setProperty("--glow", `0`);
  };

  // Refresh token helper
  async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return false;

    const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    if (!data.access_token) return false;

    localStorage.setItem("access_token", data.access_token);
    return true;
  }

  // Fetch client orders with videos
  const fetchClientOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Missing access token — please log in again.");
        setLoading(false);
        return;
      }

      console.log("Fetching client downloads...");

      let res = await fetch(`${BASE_URL}/api/client/download-center`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // retry after refresh
      if (res.status === 401 || res.status === 403) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const newToken = localStorage.getItem("access_token");
          res = await fetch(`${BASE_URL}/api/client/download-center`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          localStorage.clear();
          window.location.href = "/portal";
          return;
        }
      }

      if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`);

      const data = await res.json();
      console.log("Download center response:", data);

      // Process the actual API response structure
      const allVideos = [];
      if (data.downloads && Array.isArray(data.downloads)) {
        data.downloads.forEach((video) => {
          allVideos.push({
            id: video.video_id.toString(),
            name: video.filename || `Video ${video.video_id}`,
            downloadUrl: video.url,
            orderId: video.video_id,
            created: video.created_at || new Date().toISOString(),
            status: "completed",
          });
        });
      }

      setVideos(allVideos);
    } catch (err) {
      console.error("Error fetching client downloads:", err);
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
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Optional: Track download success
      if (onDownload) {
        onDownload(videoId, videoName);
      }

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
    const mk = () => `${rnd(0, 100).toFixed(5)}vw`;
    const mky = () => `${rnd(0, 100).toFixed(5)}vh`;
    return Array.from({ length: N }, (_, i) => {
      return {
        id: i,
        x0: mk(), y0: mky(),
        x1: mk(), y1: mky(),
        x2: mk(), y2: mky(),
        x3: mk(), y3: mky(),
        x4: mk(), y4: mky(),
        s: rnd(0.7, 1.4),
        d: `${rnd(16, 28).toFixed(2)}s`,
        delay: `${rnd(-28, 0).toFixed(2)}s`,
        a: rnd(0.16, 0.28),
        blur: `${rnd(0, 6).toFixed(1)}px`
      };
    });
  }, []);

  const palettes = [styles.palettePurple, styles.paletteBlue, styles.paletteTeal];

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
      {/* floating bubbles */}
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
        <header className={styles.header} ref={headerRef}>
          <h1 className={styles.title}>Your Videos</h1>
          
        </header>

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
            <div className={styles.videoGrid} ref={gridRef}>
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`${styles.videoCard} ${palettes[index % palettes.length]}`}
                  onMouseMove={handleCardMove}
                  onMouseLeave={handleCardLeave}
                >
                  <div className={styles.videoTop}>
                    <h3 className={styles.videoName}>Video #{video.orderId}</h3>
                    <span className={styles.videoDate}>
                      {new Date(video.created).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.videoMid}>
                    <div className={styles.videoInfoSection}>
                      <span className={styles.videoInfoLabel}>Video Name</span>
                      <span className={styles.videoId}>{video.name}</span>
                    </div>

                    <button
                      type="button"
                      className={styles.downloadBtn}
                      onClick={() => handleDownload(video.id, video.name)}
                      disabled={downloadingId === video.id}
                    >
                      {downloadingId === video.id ? (
                        <>
                          <span className={styles.downloadSpinner}></span>
                          Downloading…
                        </>
                      ) : (
                        'Video Link'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DownloadCenter;
