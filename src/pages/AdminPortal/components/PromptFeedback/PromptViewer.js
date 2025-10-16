// FileName: /src/pages/AdminPortal/components/PromptFeedback/PromptViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Table, Spinner } from 'react-bootstrap';
import styles from './PromptViewer.module.css';
import { gsap } from 'gsap';

/**
 * Shows prompt and allows feedback submission
 * API: POST /admin/feedback
 */
const PromptViewer = () => {
  const [feedback, setFeedback] = useState('');
  const [regenerationResponse, setRegenerationResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardRef = useRef(null);
  const promptRef = useRef(null);
  const formRef = useRef(null);
  const responseRef = useRef(null);

  // Mock image_id for demonstration. In a real app, this would come from context or props.
  const MOCK_IMAGE_ID = 10; 
  const BASE_URL = 'https://qunatum-tour.onrender.com'; // Adjust if your backend is on a different URL

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.2)" }
      );
    }
  }, []);

  useEffect(() => {
    if (promptRef.current) {
      gsap.fromTo(promptRef.current, 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.2 }
      );
    }
  }, []);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4 }
      );
    }
  }, []);

  useEffect(() => {
    if (regenerationResponse && responseRef.current) {
      gsap.fromTo(responseRef.current, 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
      );
    }
  }, [regenerationResponse]);

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
    <Card className={styles.adminCard} ref={cardRef}>
      <Card.Header className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <h5 className={styles.headerTitle}>Prompt Management</h5>
        </div>
      </Card.Header>

      <Card.Body className={styles.cardBody}>
        <div className={styles.currentPromptContent}>
          <div className={styles.promptSection} ref={promptRef}>
            <div className={styles.sectionHeader}>
              <h6 className={styles.sectionTitle}>Original Prompt</h6>
              <div className={styles.promptMeta}>
                <span className={styles.promptId}>ID: #{MOCK_IMAGE_ID}</span>
                <span className={styles.promptStatus}>Active</span>
              </div>
            </div>
            <div className={styles.promptCard}>
              <div className={styles.promptText}>
                "Create a bright and airy video tour of this modern 3-bedroom apartment"
              </div>
              
            </div>
          </div>

          <Form onSubmit={handleSubmit} className={styles.feedbackForm} ref={formRef}>
            <div className={styles.formHeader}>
              <h6 className={styles.sectionTitle}>Request Regeneration</h6>
              <div className={styles.formHint}>
                Provide feedback to regenerate the video with improvements
              </div>
            </div>
            
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                Your Feedback & Instructions
                <span className={styles.required}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={styles.formControl}
                disabled={loading}
                placeholder="Describe what changes you'd like in the regenerated video..."
                required
              />
              <div className={styles.charCount}>
                {feedback.length}/500 characters
              </div>
            </Form.Group>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.formActions}>
              <Button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading || !feedback.trim()}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Processing...</span>
                  </>
                ) : (
                  'Request Regeneration'
                )}
              </Button>
              <div className={styles.helpText}>
                This will generate a new video based on your feedback
              </div>
            </div>
          </Form>

          {regenerationResponse && (
            <div className={styles.responseSection} ref={responseRef}>
              <div className={styles.responseHeader}>
                <h6 className={styles.sectionTitle}>Regeneration Complete</h6>
                <div className={styles.successBadge}>Success</div>
              </div>
              <div className={styles.responseCard}>
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
                                View Generated Video
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
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PromptViewer;