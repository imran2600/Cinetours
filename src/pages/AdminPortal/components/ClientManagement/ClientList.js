import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import styles from './ClientManagement.module.css';

/**
 * Displays client list with usage stats
 * API: GET /admin/clients
 */
const ClientList = () => {
  const clients = [
    {
      id: 'cl_123',
      name: 'John Doe',
      email: 'john@example.com',
      joined: '2023-01-15',
      orders: 12
    }
  ];

  return (
    <Card className={styles.adminCard}>
      {/* Header */}
      <Card.Header className={styles.cardHeader}>
        <div className={styles.headerContainer}>
          <h5 className={styles.headerTitle}>Client Management</h5>
          <Button size="sm" className={styles.exportButton}>
            Export
          </Button>
        </div>
      </Card.Header>

      {/* Body */}
      <Card.Body className={styles.cardBody}>
        <div className={styles.tableWrapper}>
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
      </Card.Body>
    </Card>
  );
};

export default ClientList;