import React, { useState } from 'react';
import { useOrders } from '../../../hooks/useOrders.js';


const OrderList = () => {
  const { orders, loading, error, updateOrderStatus, uploadFinalVideo } = useOrders();
  const [uploading, setUploading] = useState({}); // track uploading per order

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    }
  };

  const handleFinalVideoUpload = async (orderId, file) => {
    try {
      setUploading(prev => ({ ...prev, [orderId]: true }));
      await uploadFinalVideo(orderId, file);
      alert('Final video uploaded successfully!');
    } catch (err) {
      alert('Error uploading final video: ' + err.message);
    } finally {
      setUploading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Order List</h2>
      {orders.length === 0 ? (
        <p>No orders available</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Preview Video</th>
              <th>Final Video</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.status}</td>
                <td>
                  {order.videoUrl ? (
                    <video width="200" controls>
                      <source src={`https://qunatum-tour.onrender.com${order.videoUrl}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    'Not available'
                  )}
                </td>
                <td>
                  {order.finalVideoUrl ? (
                    <video width="200" controls>
                      <source src={`https://qunatum-tour.onrender.com${order.finalVideoUrl}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    'Not uploaded'
                  )}
                </td>
                <td>
                  <button onClick={() => handleStatusChange(order.id, 'processing')}>
                    Mark Processing
                  </button>
                  <button onClick={() => handleStatusChange(order.id, 'completed')}>
                    Mark Completed
                  </button>
                  {order.status === 'completed' && (
                    <div>
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={e =>
                          e.target.files[0] && handleFinalVideoUpload(order.id, e.target.files[0])
                        }
                        disabled={uploading[order.id]}
                      />
                      {uploading[order.id] && <p>Uploading...</p>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;
