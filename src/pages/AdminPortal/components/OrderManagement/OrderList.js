import React, { useState } from 'react';
import { Card, Table, Button, Spinner, Badge, Dropdown } from 'react-bootstrap';
import styles from './OrderList.module.css';
import { useOrders } from '../../../hooks/useOrders.js';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com';

const OrderList = () => {
  const { orders, loading, error, fetchOrders, updateOrderStatus, uploadFinalVideo } = useOrders();
  const [uploading, setUploading] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [modalVideo, setModalVideo] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    }
  };

  const handleFinalVideoUpload = async (orderId, file) => {
    try {
      setUploading(prev => ({ ...prev, [orderId]: true }));
      await uploadFinalVideo(orderId, file);
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
          {/* Desktop Table Layout */}
          <div className={styles.tableWrapper}>
            <Table hover responsive className={styles.invoiceTable}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableRowHead}>
                  <th className={styles.tableHeading}>Status</th>
                  <th className={styles.tableHeading}>Order ID</th>
                  <th className={styles.tableHeading}>Package</th>
                  <th className={styles.tableHeading}>Photos</th>
                  <th className={styles.tableHeading}>Date</th>
                  <th className={styles.tableHeading}>Preview Videos</th>
                  <th className={styles.tableHeading}>Final Video</th>
                  <th className={styles.tableHeading}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const isExpanded = expandedDescriptions[order.id] || false;
                    const hasPreviewVideos = order.videoUrl || (order.videos && order.videos.length > 0);
                    
                    return (
                      <tr key={order.id} className={styles.invoiceRow}>
                        <td data-label="Status" className={styles.invoiceCell}>
                          <Badge className={`${styles.invoiceStatus} ${styles[`status_${order.status}`]}`}>
                            {order.status?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </td>
                        <td data-label="Order ID" className={styles.invoiceCell}>
                          <strong>{order.id}</strong>
                        </td>
                        <td data-label="Package" className={styles.invoiceCell}>
                          {order.package}
                        </td>
                        <td data-label="Photos" className={styles.invoiceCell}>
                          {order.photos}
                        </td>
                        <td data-label="Date" className={styles.invoiceCell}>
                          {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td data-label="Preview Videos" className={styles.invoiceCell}>
                          {hasPreviewVideos ? (
                            <div className={styles.videoSection}>
                              {order.videoUrl && (
                                <div className={styles.videoPreviewWrapper}>
                                  <video 
                                    className={styles.videoThumbnail}
                                    onClick={() => openModal(order.videoUrl, order.id)}
                                  >
                                    <source src={order.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}
                              {order.videos && order.videos.length > 0 && (
                                <div className={styles.videoCount}>
                                  <strong>{order.videos.length}</strong> video(s)
                                  {order.videos.length > 1 && (
                                    <div className={styles.videoList}>
                                      {order.videos.slice(0, 2).map((video, index) => (
                                        <div key={index} className={styles.videoItem}>
                                          • {video.filename || `Video ${index + 1}`}
                                        </div>
                                      ))}
                                      {order.videos.length > 2 && (
                                        <div className={styles.videoItem}>
                                          • ...and {order.videos.length - 2} more
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className={styles.noPreview}>No preview</span>
                          )}
                        </td>
                        <td data-label="Final Video" className={styles.invoiceCell}>
                          {order.finalVideoUrl ? (
                            <div className={styles.finalVideoSection}>
                              <video 
                                className={styles.videoThumbnail}
                                onClick={() => openModal(order.finalVideoUrl, order.id)}
                              >
                                <source src={order.finalVideoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <div className={styles.uploadSuccess}>
                                ✓ Final video uploaded
                              </div>
                            </div>
                          ) : (
                            <span className={styles.noUpload}>Not uploaded</span>
                          )}
                        </td>
                        <td data-label="Actions" className={styles.invoiceCell}>
                          <div className={styles.actionsContainer}>
                            <Dropdown className={styles.statusDropdown}>
                              <Dropdown.Toggle variant="outline-light" size="sm" className={styles.dropdownToggle}>
                                Update Status
                              </Dropdown.Toggle>
                              <Dropdown.Menu className={styles.statusDropdownMenu}>
                                <Dropdown.Item 
                                  className={styles.statusDropdownItem}
                                  onClick={() => handleStatusChange(order.id, 'processing')}
                                  disabled={order.status === 'processing'}
                                >
                                  {order.status === 'processing' ? '✓ Processing' : 'Mark Processing'}
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  className={styles.statusDropdownItem}
                                  onClick={() => handleStatusChange(order.id, 'completed')}
                                  disabled={order.status === 'completed'}
                                >
                                  {order.status === 'completed' ? '✓ Completed' : 'Mark Completed'}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>

                            {order.status === 'completed' && (
                              <div className={styles.uploadSection}>
                                <label className={styles.uploadLabel}>
                                  Upload Final Video:
                                </label>
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
                                />
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
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className={styles.noOrdersCell}>
                      No orders available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className={styles.mobileOrdersContainer}>
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className={styles.mobileOrderCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.mobileOrderId}>Order #{order.id}</div>
                    <Badge className={`${styles.mobileStatus} ${styles[`status_${order.status}`]}`}>
                      {order.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileInfoItem}>
                      <span className={styles.mobileInfoLabel}>Package</span>
                      <span className={styles.mobileInfoValue}>{order.package}</span>
                    </div>
                    
                    <div className={styles.mobileInfoItem}>
                      <span className={styles.mobileInfoLabel}>Photos</span>
                      <span className={styles.mobileInfoValue}>{order.photos}</span>
                    </div>
                    
                    <div className={styles.mobileInfoItem}>
                      <span className={styles.mobileInfoLabel}>Date</span>
                      <span className={styles.mobileInfoValue}>
                        {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className={styles.mobileVideosSection}>
                      <div className={styles.mobileVideoGrid}>
                        <div className={styles.mobileVideoItem}>
                          <span className={styles.mobileVideoLabel}>Preview Videos</span>
                          {order.videoUrl || (order.videos && order.videos.length > 0) ? (
                            <>
                              {order.videoUrl && (
                                <video 
                                  className={styles.mobileVideoThumbnail}
                                  onClick={() => openModal(order.videoUrl, order.id)}
                                >
                                  <source src={order.videoUrl} type="video/mp4" />
                                </video>
                              )}
                              {order.videos && order.videos.length > 0 && (
                                <div className={styles.videoCountMobile}>
                                  {order.videos.length} video(s) available
                                </div>
                              )}
                            </>
                          ) : (
                            <span className={styles.mobileNoVideo}>No preview</span>
                          )}
                        </div>
                        
                        <div className={styles.mobileVideoItem}>
                          <span className={styles.mobileVideoLabel}>Final Video</span>
                          {order.finalVideoUrl ? (
                            <>
                              <video 
                                className={styles.mobileVideoThumbnail}
                                onClick={() => openModal(order.finalVideoUrl, order.id)}
                              >
                                <source src={order.finalVideoUrl} type="video/mp4" />
                              </video>
                              <div className={styles.uploadSuccessMobile}>✓ Uploaded</div>
                            </>
                          ) : (
                            <span className={styles.mobileNoVideo}>Not uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.mobileActions}>
                      <div className={styles.mobileActionButtons}>
                        <button
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          disabled={order.status === 'processing'}
                          className={styles.mobileStatusButton}
                        >
                          {order.status === 'processing' ? '✓ Processing' : 'Mark Processing'}
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          disabled={order.status === 'completed'}
                          className={styles.mobileStatusButton}
                        >
                          {order.status === 'completed' ? '✓ Completed' : 'Mark Completed'}
                        </button>

                        {order.status === 'completed' && (
                          <div className={styles.mobileUploadSection}>
                            <label className={styles.mobileUploadLabel}>
                              Upload Final Video:
                            </label>
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
                                  
                                  handleFinalVideoUpload(order.id, file);
                                }
                              }}
                              disabled={uploading[order.id]}
                              className={styles.mobileUploadInput}
                            />
                            {uploading[order.id] && (
                              <div className={styles.uploadingIndicator}>
                                <Spinner animation="border" size="sm" className={styles.uploadSpinner} />
                                ⏳ Uploading...
                              </div>
                            )}
                            <div className={styles.mobileUploadHint}>
                              Max 50MB, MP4 format recommended
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noOrdersCell}>
                No orders available.
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