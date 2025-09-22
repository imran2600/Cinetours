import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Spinner, Pagination } from 'react-bootstrap';
import styles from './JobTracker.module.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';

const JobTracker = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchLogsStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/logs-status`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching logs-status:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsStatus();
    const interval = setInterval(fetchLogsStatus, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const totalLogs = data?.logs?.length || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedLogs = data?.logs
    ? data.logs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner animation="border" variant="light" />
        <span className={styles.loadingText}>Loading logs...</span>
      </div>
    );
  }

  return (
    <Card className={styles.jobTrackerCard}>
      <Card.Header className={styles.jobTrackerHeader}>
        <h5 className={styles.jobTrackerTitle}>Logs & Status (Real-time)</h5>
      </Card.Header>
      <Card.Body className={styles.jobTrackerBody}>
        {/* Status Summary */}
        {data && (
          <div className={styles.statusSummary}>
            <Badge className={`${styles.statusBadge} ${styles.queued}`}>
              Queued: {data.status?.queued || 0}
            </Badge>
            <Badge className={`${styles.statusBadge} ${styles.processing}`}>
              Processing: {data.status?.processing || 0}
            </Badge>
            <Badge className={`${styles.statusBadge} ${styles.success}`}>
              Succeeded: {data.status?.succeeded || 0}
            </Badge>
            <Badge className={`${styles.statusBadge} ${styles.error}`}>
              Failed: {data.status?.failed || 0}
            </Badge>
          </div>
        )}

        {/* Logs Table */}
        <div className="table-responsive mt-4">
          <Table bordered hover variant="dark" className={styles.logsTable}>
            <thead>
              <tr>
                <th>Video ID</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Prompt</th>
                <th>Client Email</th>
                <th>Package</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.video_id}</td>
                    <td>{log.order_id}</td>
                    <td>
                      <Badge
                        className={`${styles.logBadge} ${styles[log.status]}`}
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td>{log.stage}</td>
                    <td className={styles.promptCell}>{log.prompt}</td>
                    <td>{log.client_email}</td>
                    <td>{log.package}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{new Date(log.updated_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No logs available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination className={styles.paginationWrapper}>
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </div>

        {/* Processing Now */}
        {data?.processing_now?.length > 0 && (
          <div className="mt-4">
            <h6>Currently Processing</h6>
            <Table bordered hover variant="dark" className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Video ID</th>
                  <th>Image ID</th>
                  <th>Prompt</th>
                  <th>Runway Job ID</th>
                  <th>Started At</th>
                  <th>Elapsed (s)</th>
                </tr>
              </thead>
              <tbody>
                {data.processing_now.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.video_id}</td>
                    <td>{p.image_id}</td>
                    <td className={styles.promptCell}>{p.prompt}</td>
                    <td>{p.runway_job_id}</td>
                    <td>{new Date(p.started_at).toLocaleString()}</td>
                    <td>{p.elapsed_seconds}</td>
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

export default JobTracker;
