import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import styles from './ClientManagement.module.css';

/**
 * Displays client list with usage stats
 * API: GET /admin/clientsa
 */
const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/clients');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }
      
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mobile card view component
  const MobileClientCard = ({ client }) => (
    <div className={styles.mobileCard}>
      <div className={styles.mobileCardContent}>
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileLabel}>Client:</span>
          <span className={styles.mobileValue}>{client.name}</span>
        </div>
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileLabel}>Email:</span>
          <span className={styles.mobileValue}>{client.email}</span>
        </div>
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileLabel}>Joined:</span>
          <span className={styles.mobileValue}>{client.joined}</span>
        </div>
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileLabel}>Orders:</span>
          <span className={styles.mobileValue}>{client.orders}</span>
        </div>
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileLabel}>Actions:</span>
          <Button size="sm" className={styles.viewButton}>
            View
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={styles.adminCard}>
      {/* Header */}
      <Card.Header className={styles.cardHeader}>
        <div className={styles.headerContainer}>
          <h5 className={styles.headerTitle}>Client Management</h5>
          <Button 
            size="sm" 
            className={styles.exportButton}
            onClick={fetchClients}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </Card.Header>

      <Card.Body className={styles.cardBody}>
        {error && (
          <Alert variant="danger" className={styles.alert}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="light" />
            <span className={styles.loadingText}>Loading clients...</span>
          </div>
        ) : (
          <>
            <div className={`${styles.tableWrapper} ${styles.desktopView}`}>
              <Table hover responsive className={styles.clientTable}>
                <thead className={styles.tableHead}>
                  <tr className={styles.tableRowHead}>
                    <th className={styles.tableHeading}>Client</th>
                    <th className={styles.tableHeading}>Email</th>
                    <th className={styles.tableHeading}>Joined</th>
                    <th className={styles.tableHeading}>Orders</th>
                    <th className={styles.tableHeading}>Actions</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {clients.map((client) => (
                    <tr key={client.id} className={styles.tableRow}>
                      <td data-label="Client" className={styles.tableCell}>{client.name}</td>
                      <td data-label="Email" className={styles.tableCell}>{client.email}</td>
                      <td data-label="Joined" className={styles.tableCell}>{client.joined}</td>
                      <td data-label="Orders" className={styles.tableCell}>{client.orders}</td>
                      <td data-label="Actions" className={styles.tableCell}>
                        <Button size="sm" className={styles.viewButton}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className={styles.mobileView}>
              {clients.map((client) => (
                <MobileClientCard key={client.id} client={client} />
              ))}
            </div>

            {clients.length === 0 && !loading && (
              <div className={styles.noData}>
                No clients found
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ClientList;