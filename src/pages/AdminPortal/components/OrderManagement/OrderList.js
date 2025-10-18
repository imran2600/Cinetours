import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Badge } from 'react-bootstrap';
import styles from './OrderList.module.css';
import { useOrders } from '../../../hooks/useOrders.js';
import { gsap } from 'gsap';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com';

const OrderList = () => {
  const { orders, loading, error, fetchOrders, updateOrderStatus, uploadFinalVideo } = useOrders();
  const [uploading, setUploading] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [modalVideo, setModalVideo] = useState(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (orders.length > 0 && cardsRef.current.length > 0) {
      const tl = gsap.timeline();
      tl.fromTo(cardsRef.current, 
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.2)"
        }
      );
    }
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Animate status update
      const cardIndex = orders.findIndex(order => order.id === orderId);
      if (cardIndex !== -1 && cardsRef.current[cardIndex]) {
        gsap.fromTo(cardsRef.current[cardIndex], 
          { scale: 1 },
          { 
            scale: 1.05, 
            duration: 0.3,
            yoyo: true,
            repeat: 1 
          }
        );
      }
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    }
  };

  const handleFinalVideoUpload = async (orderId, file) => {
    try {
      setUploading(prev => ({ ...prev, [orderId]: true }));
      await uploadFinalVideo(orderId, file);
      
      // Animate successful upload
      const cardIndex = orders.findIndex(order => order.id === orderId);
      if (cardIndex !== -1 && cardsRef.current[cardIndex]) {
        gsap.fromTo(cardsRef.current[cardIndex], 
          { backgroundColor: "rgba(34, 197, 94, 0.1)" },
          { 
            backgroundColor: "rgba(34, 197, 94, 0.05)",
            duration: 1,
            ease: "power2.out"
          }
        );
      }
      
      alert('Final video uploaded successfully!');
    } catch (err) {
      alert('Error uploading final video: ' + err.message);
    } finally {
      setUploading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleRetry = () => {
    fetchOrders();
  };

  const toggleDescription = (orderId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const openModal = (videoUrl, orderId) => {
    setModalVideo({ videoUrl, orderId });
  };

  const closeModal = () => {
    setModalVideo(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner animation="border" variant="light" />
        <span className={styles.loadingText}>Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.invoiceCard}>
        <Card.Header className={styles.invoiceHeader}>
          <h5 className={styles.headerTitle}>Order List</h5>
        </Card.Header>
        <Card.Body className={styles.invoiceBody}>
          <div className={styles.errorMessage}>
            <h3>Error Loading Orders</h3>
            <p>{error}</p>
            <p className={styles.errorDetails}>
              Data format issue. Please check:
            </p>
            <ul className={styles.errorList}>
              <li>Backend response format</li>
              <li>Check browser console for details</li>
              <li>Backend server status</li>
            </ul>
            <Button 
              onClick={handleRetry}
              className={styles.retryButton}
            >
              Retry
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className={styles.invoiceCard}>
        <Card.Header className={styles.invoiceHeader}>
          <h5 className={styles.headerTitle}>Order List</h5>
          <Button 
            onClick={fetchOrders}
            className={styles.refreshButton}
          >
            Refresh Orders
          </Button>
        </Card.Header>

        <Card.Body className={styles.invoiceBody}>
          {/* Card Layout - Replaced Table */}
          <div className={styles.ordersGrid}>
            {orders.length > 0 ? (
              orders.map((order, index) => {
                const hasPreviewVideos = order.videoUrl || (order.videos && order.videos.length > 0);
                const additionalVideosCount = order.videos ? order.videos.length : 0;
                
                return (
                  <div 
                    key={order.id} 
                    className={styles.orderCard}
                    ref={el => cardsRef.current[index] = el}
                  >
                    {/* Header Section */}
                    <div className={styles.cardHeader}>
                      <div className={styles.orderBasicInfo}>
                        <Badge className={`${styles.orderStatus} ${styles[`status_${order.status}`]}`}>
                          {order.status?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderId}>Client #{order.id}</span>
                          <span className={styles.orderDate}>
                            {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.packageInfo}>
                        <span className={styles.packageName}>{order.package}</span>
                        <span className={styles.photosCount}>{order.photos} photos</span>
                      </div>
                    </div>

                    {/* Main Content - Single Video Preview Section */}
                    <div className={styles.cardContent}>
                      <div className={styles.videoSection}>
                        <h4 className={styles.sectionTitle}>VIDEO PREVIEW</h4>
                        {hasPreviewVideos ? (
                          <div className={styles.videoPreviews}>
                            {order.videoUrl && (
                              <div className={styles.videoPreviewWrapper}>
                                <video 
                                  className={styles.videoPlayer}
                                  onClick={() => openModal(order.videoUrl, order.id)}
                                  controls
                                >
                                  <source src={order.videoUrl} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <div className={styles.videoOverlay} onClick={() => openModal(order.videoUrl, order.id)}>
                                  <span className={styles.playIcon}>▶</span>
                                  <span className={styles.fullscreenText}>Click for fullscreen</span>
                                </div>
                              </div>
                            )}
                            {additionalVideosCount > 0 && (
                              <div className={styles.additionalVideos}>
                                <p className={styles.videoCount}>
                                  +{additionalVideosCount} more video(s) available
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={styles.noVideoPlaceholder}>
                            <span className={styles.noVideoText}>No preview videos available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className={styles.cardActions}>
                      <div className={styles.statusActions}>
                        <h4 className={styles.sectionTitle}>UPDATE STATUS</h4>
                        <div className={styles.statusButtons}>
                          <button
                            onClick={() => handleStatusChange(order.id, 'processing')}
                            disabled={order.status === 'processing'}
                            className={`${styles.statusButton} ${order.status === 'processing' ? styles.statusActive : ''}`}
                          >
                            {order.status === 'processing' ? '✓ Processing' : 'Mark Processing'}
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(order.id, 'completed')}
                            disabled={order.status === 'completed'}
                            className={`${styles.statusButton} ${order.status === 'completed' ? styles.statusActive : ''}`}
                          >
                            {order.status === 'completed' ? '✓ Completed' : 'Mark Completed'}
                          </button>
                        </div>
                      </div>

                      {order.status === 'completed' && (
                        <div className={styles.uploadAction}>
                          <h4 className={styles.sectionTitle}>UPLOAD FINAL VIDEO</h4>
                          <div className={styles.uploadSection}>
                            <input
                              type="file"
                              accept="video/mp4,.mp4,video/*"
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.size > 50 * 1024 * 1024) {
                                    alert('File size too large. Please select a video under 50MB.');
                                    e.target.value = '';
                                    return;
                                  }
                                  
                                  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
                                  if (!file.type.startsWith('video/') && !allowedTypes.includes(file.type)) {
                                    alert('Please select a valid video file (MP4, AVI, MOV, WMV, FLV).');
                                    e.target.value = '';
                                    return;
                                  }
                                  
                                  console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
                                  handleFinalVideoUpload(order.id, file);
                                }
                              }}
                              disabled={uploading[order.id]}
                              className={styles.uploadInput}
                              id={`file-upload-${order.id}`}
                            />
                            <label htmlFor={`file-upload-${order.id}`} className={styles.uploadLabel}>
                              Choose Video File
                            </label>
                            {uploading[order.id] && (
                              <div className={styles.uploadingIndicator}>
                                <Spinner animation="border" size="sm" className={styles.uploadSpinner} />
                                ⏳ Uploading...
                              </div>
                            )}
                            <div className={styles.uploadHint}>
                              Max 50MB, MP4 format recommended
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noOrders}>
                <span className={styles.noOrdersText}>No orders available.</span>
              </div>
            )}
          </div>
          
          {orders.length > 0 && (
            <div className={styles.ordersCount}>
              Total Orders: {orders.length}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Overlay for Large Video Preview */}
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

export default OrderList;