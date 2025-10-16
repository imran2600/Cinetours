import React from "react";
import { useState } from "react";
import styles from "./Reorder.module.css";
import portalApi from "../../../services/portalApi";

const Reorder = ({ pastOrders }) => {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const handleReorder = async (orderId) => {
    try {
      await portalApi.reorder(orderId);
      setAlertType("success");
      setAlertMessage(`✅ Order #${orderId} has been recreated successfully!`);
    } catch (error) {
      console.error("Reorder failed:", error);
      setAlertType("error");
      setAlertMessage("❌ Failed to reorder. Please try again later.");
    }
    setTimeout(() => setAlertMessage(""), 3500);
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString() : "";

  return (
    <div className={styles.wrapper}>
      {alertMessage && (
  <div
    className={`${styles.alertBox} ${
      alertType === "error"
        ? styles.error
        : alertType === "success"
        ? styles.success
        : styles.info
    }`}
  >
    {alertMessage}
  </div>
)}

      <h2 className={styles.title}>Past Orders</h2>

      <div className={styles.reorderCard}>
        <div className={styles.tableHeader}>
          <div>Order ID</div>
          <div>Date</div>
          <div>Package</div>
          <div>Photos</div>
          <div>Action</div>
        </div>

        <div className={styles.orderList}>
          {pastOrders.map((order) => (
            <div key={order.id} className={styles.orderRow}>
              <div>#{order.id}</div>
              <div>{formatDate(order.date)}</div>
              <div>
                <span className={styles.packageBadge}>
                  {order.package || "Starter"}
                </span>
              </div>
              <div>{order.photos || 0}</div>
              <div>
                <button
                  onClick={() => handleReorder(order.id)}
                  className={styles.reorderButton}
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reorder;
