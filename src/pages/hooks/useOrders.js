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
      console.log('Data type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      console.log('Data keys:', Object.keys(data));
      
      // Handle different response formats
      let ordersArray = [];
      
      if (Array.isArray(data)) {
        // Case 1: Data is directly an array
        ordersArray = data;
        console.log('Data is direct array with', ordersArray.length, 'items');
      } else if (data && typeof data === 'object') {
        // Case 2: Data is an object - check common properties
        if (Array.isArray(data.orders)) {
          ordersArray = data.orders;
          console.log('Found orders array with', ordersArray.length, 'items');
        } else if (Array.isArray(data.data)) {
          ordersArray = data.data;
          console.log('Found data array with', ordersArray.length, 'items');
        } else if (Array.isArray(data.items)) {
          ordersArray = data.items;
          console.log('Found items array with', ordersArray.length, 'items');
        } else if (Array.isArray(data.results)) {
          ordersArray = data.results;
          console.log('Found results array with', ordersArray.length, 'items');
        } else if (data.order_id) {
          // Case 3: Single order object
          ordersArray = [data];
          console.log('Single order object found');
        } else {
          // Case 4: Try to extract array from object values
          const values = Object.values(data);
          const arrayValues = values.filter(val => Array.isArray(val));
          if (arrayValues.length > 0) {
            ordersArray = arrayValues[0];
            console.log('Extracted array from object with', ordersArray.length, 'items');
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
        id: order.order_id || order.id || `order-${index}`,
        status: order.status || 'unknown',
        package: order.package || 'Unknown',
        photos: order.photos || 0,
        date: order.date || new Date().toISOString(),
        // Use the first video URL as preview video
        videoUrl: order.videos && order.videos.length > 0 ? order.videos[0].url : null,
        // For final video, you might need to adjust based on your backend
        finalVideoUrl: null,
        videos: order.videos || []
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
      const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/status`, {
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
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  // Upload final rendered video - FIXED VERSION
  const uploadFinalVideo = async (orderId, file) => {
    try {
      console.log('Uploading file for order:', orderId);
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const formData = new FormData();
      formData.append('video', file); // Try 'video' as field name
      formData.append('file', file);  // Also try 'file' as field name
      formData.append('order_id', orderId.toString());

      console.log('Sending request to:', `${BASE_URL}/api/admin/orders/${orderId}/final-video`);
      
      const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/final-video`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      console.log('Upload response status:', res.status);
      
      if (!res.ok) {
        // Try to get more detailed error message
        let errorMessage = `Failed to upload final video: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If no JSON response, use status text
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
                finalVideoUrl: result.final_video_url || result.video_url || result.local_url || order.finalVideoUrl,
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


