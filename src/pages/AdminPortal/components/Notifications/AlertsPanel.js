import React, { useState } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import styles from './Notifications.module.css';

/**
 * Manages notification settings
 * API: GET/PUT /admin/notifications
 */
const AlertsPanel = () => {
  const [settings, setSettings] = useState({
    orderCompleted: true,
    orderFailed: true,
    systemAlerts: false
  });

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSave = () => {
    // API: PUT /admin/notifications { settings }
    console.log('Updated settings:', settings);
  };

  return (
    <Card className={styles.notificationCard}>
      <Card.Header className={styles.notificationHeader}>
        <h4 className={styles.notificationTitle}>Notification Settings</h4>
      </Card.Header>
      <Card.Body className={styles.notificationBody}>
        <ListGroup className={styles.notificationListGroup}>
          <ListGroup.Item className={styles.notificationListItem}>
            <span className={styles.notificationLabel}>Order Completed</span>
            <Form.Check
              type="switch"
              checked={settings.orderCompleted}
              onChange={() => handleToggle('orderCompleted')}
              className={styles.notificationSwitch}
            />
          </ListGroup.Item>
          <ListGroup.Item className={styles.notificationListItem}>
            <span className={styles.notificationLabel}>Order Failed</span>
            <Form.Check
              type="switch"
              checked={settings.orderFailed}
              onChange={() => handleToggle('orderFailed')}
              className={styles.notificationSwitch}
            />
          </ListGroup.Item>
          <ListGroup.Item className={styles.notificationListItem}>
            <span className={styles.notificationLabel}>System Alerts</span>
            <Form.Check
              type="switch"
              checked={settings.systemAlerts}
              onChange={() => handleToggle('systemAlerts')}
              className={styles.notificationSwitch}
            />
          </ListGroup.Item>
        </ListGroup>
        <div className={styles.notificationButtonWrapper}>
          <Button onClick={handleSave} className={styles.notificationSaveButton}>
            Save Settings
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AlertsPanel;