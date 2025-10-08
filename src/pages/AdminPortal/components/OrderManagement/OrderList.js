import React, { useState } from 'react';
import { useOrders } from '../../../hooks/useOrders.js';

const OrderList = () => {
  const { orders, loading, error, fetchOrders, updateOrderStatus, uploadFinalVideo } = useOrders();
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

  const handleRetry = () => {
    fetchOrders();
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p>Loading orders...</p>
    </div>
  );
  
  if (error) return (
    <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
      <h3>Error Loading Orders</h3>
      <p>{error}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Data format issue. Please check:
      </p>
      <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '14px', color: '#666' }}>
        <li>Backend response format</li>
        <li>Check browser console for details</li>
        <li>Backend server status</li>
      </ul>
      <button 
        onClick={handleRetry}
        style={{ 
          marginTop: '10px', 
          padding: '8px 16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>Order List</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={fetchOrders}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No orders available</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            There are currently no orders in the system.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="8" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th>ID</th>
                <th>Package</th>
                <th>Photos</th>
                <th>Status</th>
                <th>Date</th>
                <th>Preview Videos</th>
                <th>Final Video</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                  <td>{order.package}</td>
                  <td>{order.photos}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        order.status === 'completed' ? '#d4edda' :
                        order.status === 'processing' ? '#fff3cd' :
                        order.status === 'submitted' ? '#cce7ff' :
                        '#f8d7da',
                      color: 
                        order.status === 'completed' ? '#155724' :
                        order.status === 'processing' ? '#856404' :
                        order.status === 'submitted' ? '#004085' :
                        '#721c24'
                    }}>
                      {order.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {order.videoUrl || (order.videos && order.videos.length > 0) ? (
                      <div>
                        {order.videoUrl && (
                          <video width="200" controls style={{ maxWidth: '100%', marginBottom: '10px' }}>
                            <source src={order.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {order.videos && order.videos.length > 0 ? (
                            <div>
                              <strong>{order.videos.length}</strong> video(s) available
                              {order.videos.length > 1 && (
                                <div style={{ marginTop: '5px' }}>
                                  {order.videos.slice(0, 3).map((video, index) => (
                                    <div key={index} style={{ fontSize: '10px', marginBottom: '2px' }}>
                                      • {video.filename || `Video ${index + 1}`}
                                    </div>
                                  ))}
                                  {order.videos.length > 3 && (
                                    <div style={{ fontSize: '10px' }}>
                                      • ...and {order.videos.length - 3} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : 'Preview available'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#6c757d', fontStyle: 'italic' }}>No preview</span>
                    )}
                  </td>
                  <td>
                    {order.finalVideoUrl ? (
                      <div>
                        <video width="200" controls style={{ maxWidth: '100%' }}>
                          <source src={order.finalVideoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                          ✓ Final video uploaded
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Not uploaded</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                      <button 
                        onClick={() => handleStatusChange(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: order.status === 'processing' ? '#6c757d' : '#ffc107',
                          color: order.status === 'processing' ? '#fff' : '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: order.status === 'processing' ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {order.status === 'processing' ? 'Processing...' : 'Mark Processing'}
                      </button>
                      
                      <button 
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        disabled={order.status === 'completed'}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: order.status === 'completed' ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: order.status === 'completed' ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {order.status === 'completed' ? 'Completed' : 'Mark Completed'}
                      </button>
                      
                      {order.status === 'completed' && (
                        <div style={{ marginTop: '10px', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            Upload Final Video:
                          </label>
                          <input
                            type="file"
                            accept="video/mp4,.mp4"
                            onChange={e =>
                              e.target.files[0] && handleFinalVideoUpload(order.id, e.target.files[0])
                            }
                            disabled={uploading[order.id]}
                            style={{ 
                              fontSize: '11px',
                              width: '100%',
                              padding: '4px'
                            }}
                          />
                          {uploading[order.id] && (
                            <p style={{ 
                              fontSize: '11px', 
                              margin: '5px 0', 
                              color: '#007bff',
                              textAlign: 'center'
                            }}>
                              ⏳ Uploading...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
        Total Orders: {orders.length}
      </div>
    </div>
  );
};

export default OrderList;