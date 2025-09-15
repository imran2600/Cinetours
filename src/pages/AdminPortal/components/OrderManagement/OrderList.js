import React, { useState } from 'react';
import { Card, Table, Button, Badge, Spinner, Dropdown, Modal, Form, ProgressBar } from 'react-bootstrap';
import { motion } from 'framer-motion';
import styles from './OrderList.module.css';
import { useOrders } from '../../../hooks/useOrders';

/**
 * Enhanced Order Management - Admin Portal
 * Shows all orders with status management and video upload capability
 */
const OrderList = () => {
  const { orders, updateOrderStatus, uploadOrderVideo } = useOrders();
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  const handleStatusUpdate = async (orderId, newStatus) => {
    setProcessingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUploadClick = (order) => {
    setSelectedOrder(order);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !selectedOrder) return;

    setLoading(true);
    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) clearInterval(interval);
          return prev + 5;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 2000));
      await uploadOrderVideo(selectedOrder.id, videoFile);

      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadProgress(0);
        setVideoFile(null);
      }, 500);
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className={styles.invoiceCard}>
          <Card.Header as="h4" className={styles.invoiceHeader}>
            Order Management
          </Card.Header>
          <Card.Body className={`p-0 ${styles.invoiceBody}`}>
            {loading ? (
              <div className={`text-center py-4 ${styles.loadingContainer}`}>
                <Spinner animation="border" className={styles.loadingSpinner} />
              </div>
            ) : (
              <div className={styles.invoiceTableWrapper}>
                <Table className={`mb-0 ${styles.invoiceTable}`}>
                  <thead className={styles.invoiceTableHead}>
                    <tr>
                      <th className={styles.invoiceTableHeading}>Order ID</th>
                      <th className={styles.invoiceTableHeading}>Client</th>
                      <th className={styles.invoiceTableHeading}>Package</th>
                      <th className={styles.invoiceTableHeading}>Photos</th>
                      <th className={styles.invoiceTableHeading}>Status</th>
                      <th className={styles.invoiceTableHeading}>Video</th>
                      <th className={styles.invoiceTableHeading}>Date</th>
                      <th className={styles.invoiceTableHeading}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={styles.invoiceTableBody}>
                    {orders.map((order) => {
                      const currentStatus = statusOptions.find(s => s.value === order.status);
                      return (
                        <tr key={order.id} className={styles.invoiceRow}>
                          <td data-label="Order ID" className={styles.invoiceCell}>
                            {order.id}
                          </td>
                          <td data-label="Client" className={styles.invoiceCell}>
                            {order.client}
                          </td>
                          <td data-label="Package" className={styles.invoiceCell}>
                            {order.package}
                          </td>
                          <td data-label="Photos" className={styles.invoiceCell}>
                            {order.photos}
                          </td>
                          <td data-label="Status" className={styles.invoiceCell}>
                            <Badge className={`${styles.invoiceStatus} ${styles[`status_${order.status}`]}`}>
                              {currentStatus?.label || order.status}
                            </Badge>
                          </td>
                          <td data-label="Video" className={styles.invoiceCell}>
                            {order.videoUrl ? (
                              <a href={order.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Badge className={`${styles.invoiceStatus} ${styles.status_paid}`}>View Video</Badge>
                              </a>
                            ) : (
                              <Badge className={`${styles.invoiceStatus} ${styles.status_pending}`}>Pending</Badge>
                            )}
                          </td>
                          <td data-label="Date" className={styles.invoiceCell}>
                            {order.date}
                          </td>
                          <td data-label="Actions" className={`d-flex gap-2 ${styles.invoiceCell}`}>
                            <Dropdown className={styles.statusDropdown}>
                              <Dropdown.Toggle
                                size="sm"
                                disabled={processingId === order.id}
                                className={styles.invoiceDownloadBtn}
                              >
                                {processingId === order.id ? (
                                  <Spinner animation="border" size="sm" className={styles.statusSpinner} />
                                ) : 'Status'}
                              </Dropdown.Toggle>
                              <Dropdown.Menu className={styles.statusDropdownMenu}>
                                {statusOptions.map((status) => (
                                  <Dropdown.Item
                                    key={status.value}
                                    onClick={() => handleStatusUpdate(order.id, status.value)}
                                    disabled={order.status === status.value}
                                    className={styles.statusDropdownItem}
                                  >
                                    <span className={`${styles.invoiceStatus} ${styles[`status_${status.value}`]}`}>
                                      {status.label}
                                    </span>
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>

                            {order.status === 'completed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUploadClick(order)}
                                disabled={processingId === order.id}
                                className={styles.invoiceDownloadBtn}
                              >
                                {order.videoUrl ? 'Replace Video' : 'Upload Video'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Video Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} className={styles.uploadModal}>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            Upload Video for Order #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <Form className={styles.uploadForm}>
            <Form.Group className={styles.uploadFormGroup}>
              <Form.Label className={styles.uploadLabel}>Select Video File</Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={loading}
                className={styles.uploadInput}
              />
              <Form.Text className={styles.uploadHint}>
                Upload the final rendered video (MP4 format recommended)
              </Form.Text>
            </Form.Group>

            {uploadProgress > 0 && (
              <div className={styles.uploadProgressContainer}>
                <div className={styles.uploadProgressHeader}>
                  <span>Upload Progress:</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar now={uploadProgress} animated className={styles.uploadProgressBar} />
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            onClick={() => {
              setShowUploadModal(false);
              setUploadProgress(0);
            }}
            disabled={loading}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVideoUpload}
            disabled={!videoFile || loading}
            className={styles.invoiceDownloadBtn}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className={styles.uploadSpinner} />
                Uploading...
              </>
            ) : 'Upload Video'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderList;
