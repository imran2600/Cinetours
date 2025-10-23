import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import styles from './styles/Admin.module.css';
import OrderList from './components/OrderManagement/OrderList';
import PromptFeedback from './components/PromptFeedback/PromptViewer';
import JobTracker from './components/LogsStatus/JobTracker';
import ClientList from './components/ClientManagement/ClientList';
import PricingEditor from './components/PricingEditor/PricingForm';
import Notifications from './components/Notifications/AlertsPanel';
// import FinalVideos from './components/FinalVideos/FinalVideos'; 

const AdminPortal = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/admin';

  const adminTiles = [
    {
      key: "orders",
      title: "Order Management",
      desc: "View and manage all customer orders.",
      icon: "bi-card-checklist",
      path: "/admin/orders",
    },
    {
      key: "prompts",
      title: "Prompt Feedback",
      desc: "Review and respond to customer prompts.",
      icon: "bi-chat-square-text",
      path: "/admin/prompts",
    },
    {
      key: "logs",
      title: "Logs & Status",
      desc: "Monitor system logs and job statuses.",
      icon: "bi-clipboard2-data",
      path: "/admin/logs",
    },
    {
      key: "clients",
      title: "Client Management",
      desc: "Manage client accounts and permissions.",
      icon: "bi-people",
      path: "/admin/clients",
    },
    {
      key: "pricing",
      title: "Pricing Editor",
      desc: "Configure service packages and pricing.",
      icon: "bi-tag",
      path: "/admin/pricing",
    },
    {
      key: "notifications",
      title: "Notifications",
      desc: "Manage system alerts and notifications.",
      icon: "bi-bell",
      path: "/admin/notifications",
    },
    // {
    //   key: "final-videos", // New Tile
    //   title: "Final Videos",
    //   desc: "Review and download generated videos.",
    //   icon: "bi-film",
    //   path: "/admin/final-videos",
    // },
  ];

  return (
    <div className={styles.adminContainer}>
      <ul className={styles.bubbles}>
        {Array.from({ length: 30 }).map((_, i) => {
          const r = Math.random();
          const variant = r < 0.45 ? "rise" : r < 0.70 ? "fall" : "float";
          const left = 3 + Math.random() * 94;
          const size = 18 + Math.random() * 64;
          const sway = 6 + Math.random() * 6;
          const delay = Math.random() * 12;

          let cls = `${styles.bubble} `;
          let style = {
            "--left": `${left}%`,
            "--size": `${size}px`,
            "--sway": `${sway}s`,
            "--delay": `-${delay}s`,
          };

          if (variant === "rise") {
            cls += styles.rise;
            style["--rise"] = `${12 + Math.random() * 10}s`;
          } else if (variant === "fall") {
            cls += styles.fall;
            style["--fall"] = `${12 + Math.random() * 10}s`;
          } else {
            cls += styles.float;
            style["--top"] = `${8 + Math.random() * 70}vh`;
            style["--drift"] = `${8 + Math.random() * 10}s`;
            style["--bob"] = `${4 + Math.random() * 6}s`;
            style["--spin"] = `${20 + Math.random() * 30}s`;
          }
          return <li key={i} className={cls} style={style} />;
        })}
      </ul>

      <div className={styles.inner}>
        {!isHomePage && (
          <Link to="/admin" className={styles.backBtn}>
            <i className="bi bi-arrow-left"></i>
            Back
          </Link>
        )}
        
        <header className={styles.header}>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.sub}>Manage your QuantumTours system</p>
        </header>

        <Routes>
          <Route 
            path="/" 
            element={
              <Container fluid>
                <Row>
                  <Col lg={12}>
                    <div className={styles.grid}>
                      {adminTiles.map(t => (
                        <article key={t.key} className={styles.tile}>
                          <div className={styles.iconWrap}>
                            <i className={`bi ${t.icon}`} />
                          </div>
                          <h3 className={styles.tileTitle}>{t.title}</h3>
                          <p className={styles.tileDesc}>{t.desc}</p>
                          <Link to={t.path} className={styles.openBtn}>
                            Open
                          </Link>
                        </article>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Container>
            } 
          />
          <Route path="orders" element={<OrderList />} />
          <Route path="prompts" element={<PromptFeedback />} />
          <Route path="logs" element={<JobTracker />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="pricing" element={<PricingEditor />} />
          <Route path="notifications" element={<Notifications />} />
          {/* <Route path="final-videos" element={<FinalVideos />} /> New Route */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminPortal;