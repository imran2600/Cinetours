// Order Status
import React from 'react';
import { Card, ProgressBar, Spinner } from 'react-bootstrap';
import styles from './OrderStatus.module.css';
import { useMemo } from 'react';

const STATUS = {
  submitted:  { label: 'Submitted',  variant: 'info',    percent: 30 },
  processing: { label: 'Processing', variant: 'warning', percent: 65 },
  completed:  { label: 'Completed',  variant: 'success', percent: 100 },
};

const OrderStatus = ({ orders, loading }) => {

  
    const bubbles = useMemo(() => {
      const N = 18;
      const rnd = (min, max) => Math.random() * (max - min) + min;
      const vw = () => `${rnd(0, 100).toFixed(2)}vw`;
      const vh = () => `${rnd(0, 100).toFixed(2)}vh`;
  
      return Array.from({ length: N }, (_, i) => ({
        id: i,
        x0: vw(), y0: vh(),
        x1: vw(), y1: vh(),
        x2: vw(), y2: vh(),
        x3: vw(), y3: vh(),
        x4: vw(), y4: vh(),
        s: rnd(0.75, 1.25),
        d: `${rnd(16, 28).toFixed(2)}s`,
        delay: `${rnd(-28, 0).toFixed(2)}s`,
        a: rnd(0.16, 0.28),
        blur: `${rnd(0, 6).toFixed(1)}px`
      }));
    }, []);

  return (
    <div>
            <ul className={styles.bubbles} aria-hidden="true">
        {bubbles.map(b => (
          <li
            key={b.id}
            style={{
              "--x0": b.x0, "--y0": b.y0,
              "--x1": b.x1, "--y1": b.y1,
              "--x2": b.x2, "--y2": b.y2,
              "--x3": b.x3, "--y3": b.y3,
              "--x4": b.x4, "--y4": b.y4,
              "--s": b.s,
              "--d": b.d,
              "--delay": b.delay,
              "--a": b.a,
              "--blur": b.blur,
            }}
          />
        ))}
      </ul>
      <Card className={`${styles.portalCard} ${styles.orderCard}`}>
      <Card.Header as="h4" className={styles.orderHeader}>
        Your Orders
      </Card.Header>

      <Card.Body className={styles.orderBody}>
        {loading ? (
          <div className={`text-center ${styles.loadingContainer}`}>
            <Spinner animation="border" className={styles.loadingSpinner} />
          </div>
        ) : (
          orders.map((order) => {
            const key = String(order.status || '').toLowerCase();
            const state = STATUS[key] || STATUS.submitted;

            return (
              <div key={order.id} className={`mb-4 ${styles.orderItem}`}>
                <div className={`d-flex justify-content-between mb-2 ${styles.orderTop}`}>
                  <h5 className={styles.orderId}>Order #{order.id}</h5>
                  <span className={styles.orderDate}>{order.date}</span>
                </div>

                {/* Single bar whose color & fill depend on status */}
                <ProgressBar
                  className={`mb-2 ${styles.orderProgress}`}
                  now={state.percent}
                  variant={state.variant}
                />

                <div className={`d-flex justify-content-between ${styles.orderDetails}`}>
                  <span className={styles.orderPackage}>{order.package} Package</span>

                  {/* Status pill (replaces "1 photos") */}
                  <span
                    className={`${styles.orderStatus} ${styles[`status_${key || 'submitted'}`]}`}
                  >
                    {state.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </Card.Body>
    </Card>
    </div>
  );
};

export default OrderStatus;
