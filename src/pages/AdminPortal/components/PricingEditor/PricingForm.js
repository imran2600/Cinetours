import React, { useState } from 'react';
import { Card, Form, Button, Table } from 'react-bootstrap';
import { motion } from 'framer-motion';
import styles from './PricingForm.module.css';
import useAdminData from '../../hooks/useAdminData';

const PricingForm = () => {
  const { pricing, updatePricingLocal } = useAdminData();
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const handleEditClick = (id, currentPrice) => {
    setEditingId(id);
    setTempPrice(currentPrice);
  };

  const handleSave = (id) => {
    if (!tempPrice || isNaN(tempPrice)) {
      alert('Please enter a valid price');
      return;
    }

    updatePricingLocal(id, Number(tempPrice));
    setEditingId(null);
    setTempPrice('');
  };

  return (
    <motion.div
      className={styles.pricingFormWrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={styles.adminCard}>
        <Card.Header as="h4" className={styles.cardHeader}>
          Package Pricing Editor
        </Card.Header>
        <Card.Body className={styles.cardBody}>
          <div className={styles.tableWrapper}>
            <Table responsive className={styles.pricingTable}>
              <thead>
                <tr>
                  <th className={styles.tableHeading}>Package</th>
                  <th className={styles.tableHeading}>Photos</th>
                  <th className={styles.tableHeading}>Turnaround</th>
                  <th className={styles.tableHeading}>Price ($)</th>
                  <th className={styles.tableHeading}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((pkg) => (
                  <tr key={pkg.id} className={styles.tableRow}>
                    <td data-label="Package" className={styles.tableCell}>{pkg.name}</td>
                    <td data-label="Photos" className={styles.tableCell}>{pkg.photos}</td>
                    <td data-label="Turnaround" className={styles.tableCell}>{pkg.turnaround}</td>
                    <td data-label="Price ($)" className={styles.tableCell}>
                      {editingId === pkg.id ? (
                        <Form.Control
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          size="sm"
                          className={styles.priceInput}
                        />
                      ) : (
                        <span className={styles.priceText}>${pkg.price}</span>
                      )}
                    </td>
                    <td data-label="Actions" className={styles.tableCell}>
                      {editingId === pkg.id ? (
                        <div className={styles.actionButtons}>
                          <Button
                            size="sm"
                            className={styles.saveButton}
                            onClick={() => handleSave(pkg.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            className={styles.cancelButton}
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className={styles.editButton}
                          onClick={() => handleEditClick(pkg.id, pkg.price)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Pricing Preview */}
      <Card className={styles.adminCard}>
        <Card.Header as="h4" className={styles.cardHeader}>
          Pricing Preview
        </Card.Header>
        <Card.Body className={styles.cardBody}>
          <div className={styles.pricingPreview}>
            {pricing.map((pkg) => (
              <motion.div 
                key={pkg.id}
                className={styles.pricingCard}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h6 className={styles.packageName}>{pkg.name}</h6>
                <div className={styles.packagePrice}>${pkg.price}</div>
                <div className={styles.packageDetails}>
                  <span className={styles.packagePhotos}>{pkg.photos} photos</span>
                  <span className={styles.packageTurnaround}>{pkg.turnaround}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PricingForm;