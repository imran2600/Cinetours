import React, { useEffect, useState } from 'react';
import { Card, Table, Spinner, Badge } from 'react-bootstrap';
import styles from './Notifications.module.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/api/admin/notifications`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
          <p className={styles.errorMessage}>{error}</p>
        ) : notifications.length === 0 ? (
          <p className={styles.noData}>No notifications available.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <Table hover responsive className={styles.notificationsTable}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id}>
                    <td>
                      <Badge
                        className={`${styles.statusBadge} ${
                          notif.status ? styles[notif.status.toLowerCase()] : ''
                        }`}
                      >
                        {notif.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td>{notif.title || '-'}</td>
                    <td>{notif.message || '-'}</td>
                    <td>{new Date(notif.created_at).toLocaleString() || '-'}</td>
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