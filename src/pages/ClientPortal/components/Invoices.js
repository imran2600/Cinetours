import React, { useEffect, useRef } from "react";
import { Button, Badge } from "react-bootstrap";
import { gsap } from "gsap";
import styles from "./Invoices.module.css";

const Invoices = ({ invoices, onBack }) => {
  const containerRef = useRef();

  useEffect(() => {
    gsap.set(`.${styles.invoiceRow}`, { opacity: 1, y: 0 }); 
    gsap.from(`.${styles.invoiceRow}`, {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [invoices]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.invoiceCard}`, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from(`.${styles.invoiceRow}`, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "");

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.headerBar}>
        <h2 className={styles.title}>Invoice History</h2>
      </div>

      <div className={styles.invoiceCard}>
        <div className={styles.tableHeader}>
          <div>Invoice ID</div>
          <div>Date</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        <div className={styles.invoiceList}>
          {invoices.map((inv) => (
            <div key={inv.id} className={styles.invoiceRow}>
              <div>#{inv.id}</div>
              <div>{formatDate(inv.date)}</div>
              <div>${inv.amount?.toFixed(2) || "0.00"}</div>
              <div>
                <Badge
                  className={
                    inv.is_paid
                      ? styles.status_paid
                      : styles.status_pending
                  }
                >
                  {inv.is_paid ? "Paid" : "Pending"}
                </Badge>
              </div>
              <div>
                <Button className={styles.invoiceDownloadBtn}>Download</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Invoices;
