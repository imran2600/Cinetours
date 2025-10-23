import { useState, useEffect } from 'react';

const BASE_URL = 'https://qunatum-tour.onrender.com';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching orders from:', `${BASE_URL}/api/Admin/order_management`);

      const res = await fetch(`${BASE_URL}/api/Admin/order_management`);

      console.log('Response status:', res.status);

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Received data:', data);

      // Handle different response formats
      let ordersArray = [];

      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.orders)) {
          ordersArray = data.orders;
        } else if (Array.isArray(data.data)) {
          ordersArray = data.data;
        } else if (Array.isArray(data.items)) {
          ordersArray = data.items;
        } else if (Array.isArray(data.results)) {
          ordersArray = data.results;
        } else if (data.order_id) {
          ordersArray = [data];
        } else {
          const values = Object.values(data);
          const arrayValues = values.filter(val => Array.isArray(val));
          if (arrayValues.length > 0) {
            ordersArray = arrayValues[0];
          } else {
            throw new Error(`Invalid data format. Expected array but got object with keys: ${Object.keys(data).join(', ')}`);
          }
        }
      } else {
        throw new Error(`Unexpected data type: ${typeof data}`);
      }

      console.log('Final orders array to process:', ordersArray);

      // Transform the backend data to match frontend expectations
      const transformedOrders = ordersArray.map((order, index) => ({
        id: order.client || order.order_id || order.id || `order-${index}`,
        client: order.client, // ✅ Keep the client (user_id)
        order_id: order.order_id, // ✅ Keep the real backend order ID
        status: order.status || 'unknown',
        package: order.package || 'Unknown',
        photos: order.photos || 0,
        date: order.date || new Date().toISOString(),
        videoUrl: order.videos && order.videos.length > 0 ? order.videos[0].url : null,
        finalVideoUrl: null,
        videos: order.videos || [],
        user_id: order.user_id || null
      }));

      console.log('Transformed orders:', transformedOrders);
      setOrders(transformedOrders);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Data Error: ${err.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const numericOrderId = parseInt(orderId);
      if (isNaN(numericOrderId)) {
        throw new Error(`Invalid order ID: ${orderId}. Expected a numeric ID.`);
      }

      const res = await fetch(`${BASE_URL}/api/admin/orders/${numericOrderId}/status?order_id=${numericOrderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to update order status: ${res.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await res.json();

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                videoUrl: result.video_url || order.videoUrl,
              }
            : order
        )
      );

      return result;
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  //  Upload final video (fixed for query-based user_id)
  const uploadFinalVideo = async (orderId, file) => {
    try {
      console.log('Uploading file for order:', orderId);
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Find the order to get its client (user_id)
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.client) {
        throw new Error(`No client (user_id) found for order: ${orderId}`);
      }

      //  Create form data (only file)
      const formData = new FormData();
      formData.append('file', file);

      //  Send user_id as query parameter
      const uploadUrl = `${BASE_URL}/api/admin/final-video?user_id=${order.client}`;
      console.log('Sending request to:', uploadUrl);

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', res.status);

      if (!res.ok) {
        let errorMessage = `Failed to upload final video: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          errorMessage += ` - ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log('Upload successful, response:', result);

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: result.status || order.status,
                finalVideoUrl: result.video_url || result.final_video_url || result.local_url || order.finalVideoUrl,
                videos: result.video_url ? [
                  ...(order.videos || []),
                  {
                    filename: file.name,
                    url: result.video_url,
                    status: 'completed'
                  }
                ] : order.videos
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
