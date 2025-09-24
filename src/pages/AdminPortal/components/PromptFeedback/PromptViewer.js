// FileName: /src/pages/AdminPortal/components/PromptFeedback/PromptViewer.js
import React, { useState } from 'react';
import { Card, Form, Button, Tab, Tabs, Table, Spinner } from 'react-bootstrap';
import styles from './PromptViewer.module.css';

/**
 * Shows prompt and allows feedback submission
 * API: POST /admin/feedback
 */
const PromptViewer = () => {
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [regenerationResponse, setRegenerationResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock image_id for demonstration. In a real app, this would come from context or props.
  const MOCK_IMAGE_ID = 10; 
  const BASE_URL = 'https://qunatum-tour.onrender.com'; // Adjust if your backend is on a different URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegenerationResponse(null);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/orders/${MOCK_IMAGE_ID}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: feedback })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate video.');
      }

      const data = await response.json();
      setRegenerationResponse(data);
      setFeedback(''); // Clear feedback after successful submission
    } catch (err) {
      console.error('Regeneration failed:', err);
      setError(err.message || 'An unexpected error occurred during regeneration.');
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
                />
              </Form.Group>
              {error && <p className={styles.errorMessage}>{error}</p>}
              <Button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Requesting Regeneration...</span>
                  </>
                ) : (
                  'Request Regeneration'
                )}
              </Button>
            </Form>

            {regenerationResponse && (
              <div className={styles.responseSection}>
                <h6 className={styles.responseTitle}>Regeneration Response:</h6>
                <div className={styles.tableWrapper}>
                  <Table responsive className={styles.responseTable}>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(regenerationResponse).map(([key, value]) => (
                        <tr key={key}>
                          <td data-label="Field">{key.replace(/_/g, ' ')}</td>
                          <td data-label="Value">
                            {key === 'video_url' ? (
                              <a href={value} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                View Video
                              </a>
                            ) : (
                              value.toString()
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.historySection}>Version history will appear here</div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PromptViewer;