import React, { useEffect, useState } from 'react';
import { Card, Table, Spinner, Badge } from 'react-bootstrap';
import styles from './Notifications.module.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://quantum-tour-backend.onrender.com';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching from:', `${BASE_URL}/api/admin/notifications`);
        
        const response = await fetch(`${BASE_URL}/api/admin/notifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
        
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
        
        if (e.name === 'TypeError' && e.message.includes('Failed to fetch')) {
          setError("Network error: Unable to connect to server. Please check your connection.");
        } else {
          setError(e.message || "Failed to load notifications. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getCategoryBadgeClass = (category) => {
    if (!category) return styles.statusBadge;
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('completed') || categoryLower.includes('success')) {
      return `${styles.statusBadge} ${styles.success}`;
    } else if (categoryLower.includes('processing') || categoryLower.includes('pending')) {
      return `${styles.statusBadge} ${styles.warning}`;
    } else if (categoryLower.includes('error') || categoryLower.includes('failed')) {
      return `${styles.statusBadge} ${styles.error}`;
    } else {
      return `${styles.statusBadge} ${styles.info}`;
    }
  };

  const formatCategory = (category) => {
    if (!category) return 'Unknown';
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className={styles.adminCard}>
      <Card.Header className={styles.cardHeader}>
        <h5 className={styles.headerTitle}>Notifications</h5>
      </Card.Header>
      <Card.Body className={styles.cardBody}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spinner animation="border" variant="light" />
            <span className={styles.loadingText}>Loading notifications...</span>
          </div>
        ) : error ? (
          <div className={styles.errorWrapper}>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <p className={styles.noData}>No notifications available.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <Table hover responsive className={styles.notificationsTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Message</th>
                  <th>Video ID</th>
                  <th>Image ID</th>
                  <th>Order ID</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif, index) => (
                  <tr key={notif.id || notif._id || index}>
                    <td data-label="Category">
                      <Badge className={getCategoryBadgeClass(notif.category)}>
                        {formatCategory(notif.category)}
                      </Badge>
                    </td>
                    <td data-label="Message" className={styles.messageCell}>
                      {notif.message || '-'}
                    </td>
                    <td data-label="Video ID">
                      {notif.video_id || '-'}
                    </td>
                    <td data-label="Image ID">
                      {notif.image_id || '-'}
                    </td>
                    <td data-label="Order ID">
                      {notif.order_id ? `#${notif.order_id}` : '-'}
                    </td>
                    <td data-label="User">
                      <div className={styles.userInfo}>
                        <div className={styles.userId}>ID: {notif.user_id || '-'}</div>
                        <div className={styles.userEmail}>{notif.user_email || '-'}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Notifications;