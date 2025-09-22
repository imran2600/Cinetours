import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Spinner } from 'react-bootstrap';
import styles from './Notifications.module.css';

const AlertsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/admin/notifications`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderExtraDetails = (notification) => {
    switch (notification.category) {
      case 'user_activity':
        return (
          <div className={styles.extraDetails}>
            {notification.email && <p>Email: {notification.email}</p>}
            {notification.user_id && <p>User ID: {notification.user_id}</p>}
            {notification.timestamp && <p>Time: {new Date(notification.timestamp).toLocaleString()}</p>}
          </div>
        );
      case 'video_processing':
        return (
          <div className={styles.extraDetails}>
            {notification.video_id && <p>Video ID: {notification.video_id}</p>}
            {notification.video_path && <p>Path: {notification.video_path}</p>}
          </div>
        );
      case 'system_stats':
        return (
          <div className={styles.extraDetails}>
            <p>Users: {notification.stats?.users}</p>
            <p>Orders: {notification.stats?.orders}</p>
            <p>Videos: {notification.stats?.videos}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={styles.notificationCard}>
      <Card.Header className={styles.notificationHeader}>
        <h4 className={styles.notificationTitle}>Admin Notifications</h4>
      </Card.Header>
      <Card.Body className={styles.notificationBody}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Spinner animation="border" variant="light" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <p className={styles.noNotifications}>No notifications available.</p>
        ) : (
          <ListGroup className={styles.notificationListGroup}>
            {notifications.map((n, index) => (
              <ListGroup.Item
                key={index}
                className={`${styles.notificationListItem} ${styles[n.type]}`}
              >
                <div>
                  <p className={styles.notificationMessage}>{n.message}</p>
                  {renderExtraDetails(n)}
                </div>
                <span className={styles.notificationType}>{n.type.toUpperCase()}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default AlertsPanel;
