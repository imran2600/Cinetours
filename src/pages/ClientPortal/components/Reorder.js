//  Reorder
import React from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import styles from './Reorder.module.css';
import portalApi from '../../../services/portalApi';



/**
 * Displays past orders for reordering
 * @component
 * @param {Array} pastOrders - Completed orders
 * 
 * Backend Integration:
 * - Expects orders array with:
 *   - id: string
 *   - date: string
 *   - package: string
 *   - photos: number
 * - Clicking "Reorder" should POST to /api/orders/{orderId}/reorder
 */

const Reorder = ({ pastOrders }) => {
  const handleReorder = async (orderId) => {
    try {
      await portalApi.reorder(orderId);
      alert(`Order #${orderId} has been recreated!`);
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  return (
    <Card className={styles.reorderCard}>
      <Card.Header as="h4" className={styles.reorderHeader}>Past Orders</Card.Header>
      <Card.Body className={styles.reorderBody}>
        <div className={styles.responsiveTableContainer}>
          <Table className={styles.reorderTable}>
            <thead className={styles.tableHeader}>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeaderCell}>Order ID</th>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Package</th>
                <th className={styles.tableHeaderCell}>Photos</th>
                <th className={styles.tableHeaderCell}>Action</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {pastOrders.map(order => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.tableCell} data-label="Order ID">#{order.id}</td>
                  <td className={styles.tableCell} data-label="Date">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className={styles.tableCell} data-label="Package">
                    <Badge className={styles.packageBadge}>{order.package}</Badge>
                  </td>
                  <td className={styles.tableCell} data-label="Photos">{order.photos}</td>
                  <td className={styles.tableCell} data-label="Action">
                    <Button
                      onClick={() => handleReorder(order.id)}
                      className={`${styles.reorderButton} w-100`}
                    >
                      Reorder
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

export default Reorder;