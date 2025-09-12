import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import styles from './JobTracker.module.css';

/**
 * Displays detailed job processing logs
 * API: GET /admin/jobs/:id/logs
 */
const JobTracker = () => {
  const logs = [
    {
      id: 1,
      timestamp: '2023-06-15 09:30:22',
      status: 'processing',
      message: 'Video generation started'
    },
    {
      id: 2,
      timestamp: '2023-06-15 09:32:45',
      status: 'success',
      message: 'AI models loaded successfully'
    }
  ];

  return (
    <Card className={styles.jobTrackerCard}>
      <Card.Header className={styles.jobTrackerHeader}>
        <h5 className={styles.jobTrackerTitle}>Job Processing Logs</h5>
      </Card.Header>
      <Card.Body className={styles.jobTrackerBody}>
        <ListGroup className={styles.jobTrackerList}>
          {logs.map((log) => (
            <ListGroup.Item key={log.id} className={styles.jobTrackerListItem}>
              <div className={styles.logItemWrapper}>
                <span className={styles.logMessageWrapper}>
                  <Badge className={`${styles.logBadge} ${styles[log.status]}`}>
                    {log.status}
                  </Badge>
                  <span className={styles.logMessage}>{log.message}</span>
                </span>
                <small className={styles.logTimestamp}>{log.timestamp}</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default JobTracker;