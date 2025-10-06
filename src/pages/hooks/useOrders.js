// src/hooks/useOrders.js
import { useState, useEffect } from "react";
import portalApi from "../../services/portalApi";

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!userId) { setOrders([]); return; }
      const data = await portalApi.getDownloads(userId); // GET /api/client/download-center?user_id=...
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [userId]);

  return { orders, loading, error, fetchOrders };
}
