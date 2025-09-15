import { useState, useEffect } from 'react';

const BASE_URL = 'http://localhost:8000'; // adjust if backend is hosted elsewhere

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/admin/orders`);
      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (imageId, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/orders/${imageId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update order status: ${res.status}`);
      }

      const result = await res.json();

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === imageId
            ? {
                ...order,
                status: newStatus,
                videoUrl: result.video_url || order.videoUrl,
              }
            : order
        )
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  // Upload final rendered video
  const uploadFinalVideo = async (imageId, file) => {
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch(`${BASE_URL}/admin/orders/${imageId}/final-video`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`Failed to upload final video: ${res.status}`);
      }

      const result = await res.json();

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === imageId
            ? {
                ...order,
                status: result.status || order.status,
                finalVideoUrl: result.local_url || order.finalVideoUrl,
              }
            : order
        )
      );

      return result;
    } catch (err) {
      console.error('Failed to upload final video:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, fetchOrders, updateOrderStatus, uploadFinalVideo };
}
