import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import styles from './FinalVideos.module.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000'; // Ensure this matches your backend URL

const FinalVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/admin/videos`); // Your specified endpoint
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
                <th className={styles.tableHeading}>Video ID</th>
                <th className={styles.tableHeading}>Order ID</th>
                <th className={styles.tableHeading}>Client Email</th>
                <th className={styles.tableHeading}>Status</th>
                <th className={styles.tableHeading}>Prompt</th>
                <th className={styles.tableHeading}>Preview</th>
                <th className={styles.tableHeading}>Source Image</th>
                <th className={styles.tableHeading}>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {videos.length > 0 ? (
                videos.map((video) => (
                  <tr key={video.video_id} className={styles.tableRow}>
                    <td data-label="Video ID" className={styles.tableCell}>{video.video_id}</td>
                    <td data-label="Order ID" className={styles.tableCell}>{video.image_id}</td> {/* Assuming image_id is related to order */}
                    <td data-label="Client Email" className={styles.tableCell}>{video.client_id}</td> {/* Placeholder, replace with actual client email if available */}
                    <td data-label="Status" className={styles.tableCell}>
                      <Badge className={`${styles.statusBadge} ${styles[video.status]}`}>
                        {video.status}
                      </Badge>
                    </td>
                    <td data-label="Prompt" className={styles.tableCell}>{video.prompt}</td>
                    <td data-label="Preview" className={styles.tableCell}>
                      {video.local_url ? (
                        <video width="150" controls muted className={styles.videoPreview}>
                          <source src={`${BASE_URL}${video.local_url}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td data-label="Source Image" className={styles.tableCell}>
                      {video.image_url ? (
                        <a href={`${BASE_URL}${video.image_url}`} target="_blank" rel="noopener noreferrer">
                          <img src={`${BASE_URL}${video.image_url}`} alt="Source" className={styles.imagePreview} />
                        </a>
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No final videos available.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FinalVideos;