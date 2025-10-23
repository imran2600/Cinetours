import React from "react";
import styles from "./Footer.module.css";
import { Container, Row, Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";


const Footer = () => {
  const { pathname } = useLocation();

  // Hide footer on auth routes (expand this list any time)
  const HIDE_ON = ["/signin", "/signup", "/register", "/auth", "/forgot-password", "/set-password"];
  const shouldHide = HIDE_ON.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const socialLinks = [
    { name: "Facebook",  icon: "bi bi-facebook",   url: "https://facebook.com" },
    { name: "Instagram", icon: "bi bi-instagram",  url: "https://instagram.com" },
    { name: "Twitter",   icon: "bi bi-twitter-x",  url: "https://twitter.com" },
    { name: "LinkedIn",  icon: "bi bi-linkedin",   url: "https://linkedin.com" },
  ];

  return (
    <footer className={styles.footer}>
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <div className={styles.brand}>
              <span className={styles.logo}>QuantumTours</span>
              <p className={styles.tagline}>Transforming real estate marketing</p>
            </div>
          </Col>

          <Col md={4} className="text-center mb-3 mb-md-0">
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={styles.socialIcon}
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
          </Col>

          <Col md={3} className="text-center text-md-end">
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} QuantumTours. All rights reserved.
            </p>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xs={12} className="text-center">
            <div className={styles.additionalLinks}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact Us</a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
