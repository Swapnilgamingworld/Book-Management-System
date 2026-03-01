import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/orders');
      if (response.data.success) {
        const allOrders = response.data.data;
        const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
        const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
        const shippedOrders = allOrders.filter((o) => o.status === 'shipped').length;

        setStats({
          totalOrders: allOrders.length,
          totalRevenue: totalRevenue.toFixed(2),
          pendingOrders,
          shippedOrders,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to admin dashboard');
      newSocket.emit('admin_dashboard', user?.id);
    });

    newSocket.on('new_order', (orderData) => {
      console.log('New order received:', orderData);
      setOrders((prev) => [orderData, ...prev]);
      loadStats();
    });

    newSocket.on('order_status_updated', (data) => {
      console.log('Order status updated:', data);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
      loadStats();
    });

    return () => {
      newSocket.emit('admin_leave', user?.id);
      newSocket.disconnect();
    };
  }, [user, loadStats]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders', {
        params: filterStatus !== 'all' ? { status: filterStatus } : {},
      });
      console.log('Orders response:', response.data);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [filterStatus, loadOrders, loadStats]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        loadStats();
      }
    } catch (error) {
      alert('Failed to update order status');
      console.error(error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-container">
        <h2>Access Denied</h2>
        <p>Only admins can access this dashboard</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-value">{stats.pendingOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Shipped Orders</h3>
          <p className="stat-value">{stats.shippedOrders}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h2>Orders</h2>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#ffe0e0', padding: '15px', borderRadius: '5px', marginBottom: '20px', color: '#d32f2f' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table">
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{order.User?.name || 'N/A'}</td>
                  <td>₹{parseFloat(order.totalPrice).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
