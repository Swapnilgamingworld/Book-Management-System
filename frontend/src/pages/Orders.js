import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import '../styles/orders.css';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders(user.id);
      if (response.data.success) {
        setOrders(response.data.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter
    ? orders.filter((order) => order.status === filter)
    : orders;

  if (!user) {
    return (
      <div className="orders-container">
        <p className="error">Please login to view your orders</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      <div className="filter-section">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading">Loading orders...</p>}

      {!loading && filteredOrders.length === 0 ? (
        <p className="no-orders">No orders found</p>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.substring(0, 8)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>

              <div className="order-details">
                <p>
                  <strong>Shipping Address:</strong> {order.shippingAddress}
                </p>
                <p>
                  <strong>Payment Method:</strong> {order.paymentMethod.replace('_', ' ')}
                </p>
                <p>
                  <strong>Books Ordered:</strong> {order.books?.length || 0}
                </p>
              </div>

              <div className="order-books">
                <h4>Items:</h4>
                {order.books && order.books.length > 0 ? (
                  <ul>
                    {order.books.map((item, index) => (
                      <li key={index}>
                        Book ID: {item.book} | Quantity: {item.quantity} | Price: ₹
                        {parseFloat(item.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items in this order</p>
                )}
              </div>

              <div className="order-footer">
                <span className="total">
                  <strong>Total: ₹{parseFloat(order.totalPrice).toFixed(2)}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
