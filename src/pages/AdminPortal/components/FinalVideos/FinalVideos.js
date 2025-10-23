import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import styles from './FinalVideos.module.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com';

const FinalVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPrompts, setExpandedPrompts] = useState({});
  const [modalVideo, setModalVideo] = useState(null); 

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/api/admin/videos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (e) {
        console.error("Failed to fetch final videos:", e);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const togglePrompt = (videoId) => {
    setExpandedPrompts((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  const openModal = (videoUrl, videoId) => {
    setModalVideo({ videoUrl, videoId });
  };

  const closeModal = () => {
    setModalVideo(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner animation="border" variant="light" />
        <span className={styles.loadingText}>Loading final videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.adminCard}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.headerTitle}>Final Videos</h5>
        </Card.Header>
        <Card.Body className={styles.cardBody}>
          <p className={styles.errorMessage}>{error}</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className={styles.adminCard}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.headerTitle}>Final Videos</h5>
          <Button size="sm" className={styles.exportButton}>
            Export
          </Button>
        </Card.Header>

        <Card.Body className={styles.cardBody}>
          <div className={styles.tableWrapper}>
            <Table hover responsive className={styles.videosTable}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableRowHead}>
                  <th className={styles.tableHeading}>Status</th>
                  <th className={styles.tableHeading}>Video ID</th>
                  <th className={styles.tableHeading}>Prompt</th>
                  <th className={styles.tableHeading}>Source Image</th>
                  <th className={styles.tableHeading}>Preview</th>
                  <th className={styles.tableHeading}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {videos.length > 0 ? (
                  videos.map((video) => {
                    const isExpanded = expandedPrompts[video.video_id] || false;
                    const promptTooLong = video.prompt && video.prompt.length > 150;
                    return (
                      <tr key={video.video_id} className={styles.tableRow}>
                        <td data-label="Status" className={styles.tableCell}>
                          <Badge className={`${styles.statusBadge} ${styles[video.status]}`}>
                            {video.status}
                          </Badge>
                        </td>
                        <td data-label="Video ID" className={styles.tableCell}>
                          {video.video_id}
                        </td>
                        <td data-label="Prompt" className={styles.tableCell}>
                          <div
                            className={`${styles.promptText} ${
                              isExpanded ? styles.expandedPrompt : ''
                            }`}
                            title={isExpanded ? '' : video.prompt}
                          >
                            {video.prompt}
                          </div>
                          {promptTooLong && (
                            <button
                              type="button"
                              className={styles.readMoreBtn}
                              onClick={() => togglePrompt(video.video_id)}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? 'Read less' : 'Read more'}
                            </button>
                          )}
                        </td>
                        <td data-label="Source Image" className={styles.tableCell}>
                          {video.image_url ? (
                            <a href={`${BASE_URL}${video.image_url}`} target="_blank" rel="noopener noreferrer">
                              <img
                                src={`${BASE_URL}${video.image_url}`}
                                alt="Source"
                                className={styles.imagePreview}
                              />
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td data-label="Preview" className={styles.tableCell}>
                          {video.local_url ? (
                            <img
                              src={
                                video.thumbnail_url
                                  ? `${BASE_URL}${video.thumbnail_url}`
                                  : 'https://via.placeholder.com/150x100?text=No+Thumbnail'
                              }
                              alt="Video Thumbnail"
                              className={styles.videoThumbnail}
                              onClick={() => openModal(`${BASE_URL}${video.local_url}`, video.video_id)}
                            />
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td data-label="Actions" className={styles.tableCell}>
                          {video.download_url && (
                            <Button
                              size="sm"
                              className={styles.downloadButton}
                              href={`${BASE_URL}${video.download_url}`}
                              download={video.filename || `video_${video.video_id}.mp4`}
                            >
                              Download
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No final videos available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {modalVideo && (
        <div className={styles.modalOverlay} onClick={closeModal} role="dialog" aria-modal="true">
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={closeModal} aria-label="Close video preview">
              &times;
            </button>
            <video
              src={modalVideo.videoUrl}
              controls
              autoPlay
              className={styles.modalVideo}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default FinalVideos;