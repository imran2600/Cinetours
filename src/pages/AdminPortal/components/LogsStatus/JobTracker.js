import React, { useEffect, useState, useRef } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import styles from './JobTracker.module.css';
import { gsap } from 'gsap';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://qunatum-tour.onrender.com';

const JobTracker = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  const pageSize = 8;

  const cardsRef = useRef([]);
  const statusRef = useRef(null);
  const paginationRef = useRef(null);
  const hasInitialLoad = useRef(false);

  const fetchLogsStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/logs-status`);
      const json = await res.json();
      
      // Transform backend data to frontend format
      const transformedData = {
        logs: [
          ...(json.details?.queued || []).map(log => ({ ...log, status: 'queued' })),
          ...(json.details?.processing || []).map(log => ({ ...log, status: 'processing' })),
          ...(json.details?.succeeded || []).map(log => ({ ...log, status: 'succeeded' })),
          ...(json.details?.failed || []).map(log => ({ ...log, status: 'failed' }))
        ],
        status: {
          queued: json.details?.queued?.length || 0,
          processing: json.details?.processing?.length || 0,
          succeeded: json.details?.succeeded?.length || 0,
          failed: json.details?.failed?.length || 0
        }
      };
      
      setData(transformedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching log_status:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsStatus();
    const interval = setInterval(fetchLogsStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data?.logs && data.logs.length > 0 && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
      
      // Animate status badges
      if (statusRef.current) {
        gsap.fromTo(statusRef.current.children, 
          { 
            opacity: 0, 
            scale: 0.8,
            y: 20
          },
          { 
            opacity: 1, 
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)"
          }
        );
      }

      const tl = gsap.timeline();
      tl.fromTo(cardsRef.current, 
        { 
          opacity: 0, 
          x: -50,
          rotationY: 90
        },
        { 
          opacity: 1, 
          x: 0,
          rotationY: 0,
          duration: 0.8,
          stagger: {
            amount: 0.6,
            from: "random"
          },
          ease: "power3.out"
        }
      );

      if (paginationRef.current) {
        gsap.fromTo(paginationRef.current, 
          { 
            opacity: 0, 
            y: 30 
          },
          { 
            opacity: 1, 
            y: 0,
            duration: 0.6,
            delay: 0.5,
            ease: "power2.out"
          }
        );
      }
    }
  }, [data?.logs]);

  const totalLogs = data?.logs?.length || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const handlePageChange = (page) => {
    gsap.to(cardsRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setCurrentPage(page);
        setExpandedPrompt(null);
        setTimeout(() => {
          gsap.fromTo(cardsRef.current, 
            { 
              opacity: 0, 
              y: -20 
            },
            { 
              opacity: 1, 
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out"
            }
          );
        }, 50);
      }
    });
  };

  const paginatedLogs = data?.logs
    ? data.logs.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'queued': return styles.queued;
      case 'processing': return styles.processing;
      case 'completed':
      case 'succeeded': return styles.success;
      case 'failed':
      case 'error': return styles.error;
      default: return styles.queued;
    }
  };

  const truncatePrompt = (prompt, length = 80) => {
    if (!prompt) return 'N/A';
    return prompt.length > length ? prompt.substring(0, length) + '...' : prompt;
  };

  const togglePromptExpand = (logId) => {
    setExpandedPrompt(expandedPrompt === logId ? null : logId);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.pulseSpinner}></div>
        <span className={styles.loadingText}>Loading logs...</span>
      </div>
    );
  }

  return (
    <Card className={styles.jobTrackerCard}>
      <Card.Header className={styles.jobTrackerHeader}>
        <div className={styles.headerContent}>
          <h5 className={styles.jobTrackerTitle}>
            Job Status Monitor
          </h5>
          <div className={styles.lastUpdate}>
            Real-time updates • Auto-refresh every 5s
          </div>
        </div>
      </Card.Header>
      
      <Card.Body className={styles.jobTrackerBody}>
        {data && (
          <div className={styles.simpleStatusSummary} ref={statusRef}>
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

        <div className={styles.logsTimeline}>
          {paginatedLogs.length > 0 ? (
            paginatedLogs.map((log, index) => {
              const logId = `${log.video_id}-${index}`;
              const isExpanded = expandedPrompt === logId;
              return (
                <div 
                  key={logId} 
                  className={styles.timelineItem}
                  ref={el => cardsRef.current[index] = el}
                >
                  <div className={styles.timelineConnector}></div>
                  
                  <div className={styles.logNode}>
                    {/* Header Section - Updated */}
                    <div className={styles.cardHeader}>
                      <div className={styles.headerMain}>
                        <Badge className={`${styles.statusIndicator} ${getStatusColor(log.status)}`}>
                          {log.status}
                        </Badge>
                        <div className={styles.jobInfo}>
                          <div className={styles.jobIds}>
                            <div className={styles.jobIdItem}>
                              <span className={styles.jobIdLabel}>Video ID:</span>
                              <span className={styles.jobIdValue}>{log.video_id || 'N/A'}</span>
                            </div>
                            <div className={styles.jobIdItem}>
                              <span className={styles.jobIdLabel}>Order ID:</span>
                              <span className={styles.jobIdValue}>{log.order_id || 'N/A'}</span>
                            </div>
                            {log.runwayjob_id && (
                              <div className={styles.jobIdItem}>
                                <span className={styles.jobIdLabel}>Runway Job:</span>
                                <span className={styles.jobIdValue}>{log.runwayjob_id}</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.clientInfo}>
                            <div className={styles.clientItem}>
                              <span className={styles.jobIdLabel}>Client:</span>
                              <span className={styles.jobIdValue}>{log.client_name || 'N/A'}</span>
                            </div>
                            <div className={styles.clientItem}>
                              <span className={styles.jobIdLabel}>ID:</span>
                              <span className={styles.jobIdValue}>{log.client_id || 'N/A'}</span>
                            </div>
                            <div className={styles.clientItem}>
                              <span className={styles.jobIdLabel}>Email:</span>
                              <span className={styles.jobIdValue}>{log.client_email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.packageTag}>{log.package || 'Standard'}</div>
                    </div>

                    {/* Main Content Grid */}
                    <div className={styles.cardContent}>
                      {/* Left Column */}
                      <div className={styles.contentColumn}>
                        <div className={styles.contentItem}>
                          <span className={styles.contentLabel}>Username</span>
                          <span className={styles.contentValue}>{log.username || 'Guest'}</span>
                        </div>
                        <div className={styles.contentItem}>
                          <span className={styles.contentLabel}>Date Created</span>
                          <span className={styles.contentValue}>
                            {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className={styles.contentColumn}>
                        <div className={styles.contentItem}>
                          <span className={styles.contentLabel}>Status Details</span>
                          <span className={styles.contentValue}>
                            {log.status === 'processing' ? 'Currently processing...' :
                             log.status === 'queued' ? 'Waiting in queue' :
                             log.status === 'succeeded' ? 'Completed successfully' :
                             log.status === 'failed' ? 'Failed - check logs' : 'Unknown'}
                          </span>
                        </div>
                        <div className={styles.contentItem}>
                          <span className={styles.contentLabel}>Package Type</span>
                          <span className={styles.contentValue}>{log.package || 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Section - Improved */}
                    <div className={styles.promptSection}>
                      <div className={styles.promptHeader}>
                        <span className={styles.promptLabel}>Prompt</span>
                        {log.prompt && log.prompt.length > 80 && (
                          <button 
                            className={styles.seeMoreBtn}
                            onClick={() => togglePromptExpand(logId)}
                          >
                            {isExpanded ? 'See Less' : 'See More'}
                          </button>
                        )}
                      </div>
                      <div className={`${styles.promptText} ${isExpanded ? styles.expanded : ''}`}>
                        {log.prompt || 'No prompt provided'}
                      </div>
                    </div>

                    {/* Video URL Section - Improved */}
                    {log.video_url && (
                      <div className={styles.videoUrlSection}>
                        <span className={styles.contentLabel}>Generated Video</span>
                        <a 
                          href={log.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.videoLink}
                        >
                          View Video
                        </a>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className={styles.progressBar}>
                      <div 
                        className={`${styles.progressFill} ${getStatusColor(log.status)}`}
                        style={{
                          width: log.status === 'completed' || log.status === 'succeeded' ? '100%' :
                                 log.status === 'processing' ? '60%' :
                                 log.status === 'failed' || log.status === 'error' ? '100%' : '30%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.noLogs}>
              <span className={styles.noLogsText}>No logs available</span>
              <span className={styles.noLogsSubtext}>Logs will appear here as jobs are processed</span>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationContainer} ref={paginationRef}>
            <div className={styles.paginationWrapper}>
              <button
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationArrow}
              >
                ‹
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`${styles.paginationItem} ${
                    i + 1 === currentPage ? styles.paginationItemActive : ''
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationArrow}
              >
                ›
              </button>
            </div>
            
            <div className={styles.pageInfo}>
              Page {currentPage} of {totalPages} • Showing {paginatedLogs.length} of {totalLogs} logs
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default JobTracker;