import React, { useState } from 'react';
import { Card, Form, Button, Tab, Tabs } from 'react-bootstrap';
import styles from './PromptViewer.module.css';

/**
 * Shows prompt and allows feedback submission
 * API: POST /admin/feedback
 */
const PromptViewer = () => {
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('current');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedback);
  };

  return (
    <Card className={styles.adminCard}>
      <Card.Header className={styles.cardHeader}>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className={styles.tabsWrapper}
        >
          <Tab eventKey="current" title="Current Prompt" tabClassName={styles.tabItem} />
          <Tab eventKey="history" title="Version History" tabClassName={styles.tabItem} />
        </Tabs>
      </Card.Header>

      <Card.Body className={styles.cardBody}>
        {activeTab === 'current' ? (
          <>
            <div className={styles.promptSection}>
              <h6 className={styles.promptTitle}>Original Prompt:</h6>
              <p className={styles.promptText}>
                "Create a bright and airy video tour of this modern 3-bedroom apartment"
              </p>
            </div>

            <Form onSubmit={handleSubmit} className={styles.feedbackForm}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Your Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className={styles.formControl}
                />
              </Form.Group>
              <Button type="submit" className={styles.submitButton}>
                Request Regeneration
              </Button>
            </Form>
          </>
        ) : (
          <div className={styles.historySection}>Version history will appear here</div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PromptViewer;