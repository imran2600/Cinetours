// src/hooks/useOrders.js
import { useState, useEffect } from "react";
import portalApi from "../../services/portalApi";

const BASE_URL = "https://qunatum-tour.onrender.com";

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching orders from:", `${BASE_URL}/api/Admin/order_management`);

      const res = await fetch(`${BASE_URL}/api/Admin/order_management`);

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Received data:", data);

      let ordersArray = [];

      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data && typeof data === "object") {
        if (Array.isArray(data.orders)) ordersArray = data.orders;
        else if (Array.isArray(data.data)) ordersArray = data.data;
        else if (Array.isArray(data.items)) ordersArray = data.items;
        else if (Array.isArray(data.results)) ordersArray = data.results;
        else if (data.order_id) ordersArray = [data];
        else {
          const values = Object.values(data);
          const arrayValues = values.filter((val) => Array.isArray(val));
          if (arrayValues.length > 0) ordersArray = arrayValues[0];
          else throw new Error("Invalid data format");
        }
      } else {
        throw new Error(`Unexpected data type: ${typeof data}`);
      }

      const transformedOrders = ordersArray.map((order, index) => ({
        id: order.order_id || order.id || `order-${index}`,
        status: order.status || "unknown",
        package: order.package || "Unknown",
        photos: order.photos || 0,
        date: order.date || new Date().toISOString(),
        videoUrl: order.videos?.[0]?.url || null,
        finalVideoUrl: null,
        videos: order.videos || [],
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Data Error: ${err.message}`);
      if (!userId) {
        setOrders([]);
        return;
      }
      const data = await portalApi.getDownloads(userId);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`Failed to update order status: ${res.status}`);

      const result = await res.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                videoUrl: result.video_url || order.videoUrl,
              }
            : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      throw err;
    }
  };

  const uploadFinalVideo = async (orderId, file) => {
    try {
      console.log("Uploading file for order:", orderId);

      const formData = new FormData();
      formData.append("file", file);

      const url = `${BASE_URL}/api/admin/orders/${orderId}/final-video?order_id=${orderId}`;

      const res = await fetch(url, { method: "POST", body: formData });

      if (!res.ok) {
        let errorMessage = `Failed to upload final video: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch {
          errorMessage += ` - ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Upload successful, response:", result);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: result.status || order.status,
                finalVideoUrl:
                  result.final_video_url ||
                  result.video_url ||
                  result.local_url ||
                  result.url ||
                  order.finalVideoUrl,
              }
            : order
        )
      );

      return result;
    } catch (err) {
      console.error("Failed to upload final video:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  return { orders, loading, error, fetchOrders, updateOrderStatus, uploadFinalVideo };
}
