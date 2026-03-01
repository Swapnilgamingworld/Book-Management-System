import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import api, { orderService } from '../services/api';
import '../styles/bookdetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: '',
    paymentMethod: 'cash_on_delivery',
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/books/${id}`);
        if (response.data.success) {
          setBook(response.data.data);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        setError('Failed to load book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    alert(`Added ${quantity} copy(ies) of "${book.title}" to cart`);
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please login to buy books');
      navigate('/login');
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.shippingAddress.trim()) {
      alert('Please enter shipping address');
      return;
    }

    try {
      setBuying(true);
      const orderData = {
        books: [
          {
            book: book.id,
            quantity: quantity,
          },
        ],
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
      };

      const response = await orderService.create(orderData);

      if (response.data.success) {
        alert('Order placed successfully!');
        setShowCheckout(false);
        setCheckoutData({
          shippingAddress: '',
          paymentMethod: 'cash_on_delivery',
        });
        setQuantity(1);
        navigate('/orders');
      } else {
        alert('Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error placing order');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return <div className="detail-container"><p>Loading...</p></div>;
  }

  if (error || !book) {
    return (
      <div className="detail-container">
        <p className="error">{error || 'Book not found'}</p>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Home
      </button>

      <div className="detail-content">
        <div className="detail-image">
          {book.image ? (
            <img src={book.image} alt={book.title} />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>

        <div className="detail-info">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>

          <div className="rating">
            <span className="stars">★★★★★ {book.rating || 'N/A'}</span>
          </div>

          <div className="book-meta">
            <p>
              <strong>ISBN:</strong> {book.isbn}
            </p>
            <p>
              <strong>Publisher:</strong> {book.publisher || 'N/A'}
            </p>
            <p>
              <strong>Category:</strong> {book.category}
            </p>
            <p>
              <strong>Published Date:</strong>{' '}
              {book.publishedDate
                ? new Date(book.publishedDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>

          <div className="description-section">
            <h2>Description</h2>
            <p>{book.description || 'No description available'}</p>
          </div>

          <div className="price-section">
            <span className="price">₹{parseFloat(book.price).toFixed(2)}</span>
            <span
              className={`stock-status ${
                book.stock > 0 ? 'in-stock' : 'out-of-stock'
              }`}
            >
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {book.stock > 0 && (
            <>
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={book.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="button-group">
                  <button onClick={handleAddToCart} className="add-to-cart-btn">
                    Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="buy-now-btn">
                    Buy Now
                  </button>
                </div>
              </div>

              {showCheckout && (
                <div className="checkout-modal">
                  <div className="checkout-card">
                    <h2>Checkout</h2>
                    <div className="checkout-form">
                      <div className="form-group">
                        <label htmlFor="shippingAddress">Shipping Address:</label>
                        <textarea
                          id="shippingAddress"
                          name="shippingAddress"
                          value={checkoutData.shippingAddress}
                          onChange={handleCheckoutChange}
                          placeholder="Enter your shipping address"
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="paymentMethod">Payment Method:</label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={checkoutData.paymentMethod}
                          onChange={handleCheckoutChange}
                        >
                          <option value="cash_on_delivery">Cash on Delivery</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>

                      <div className="order-summary">
                        <p>
                          <strong>Book:</strong> {book.title}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {quantity}
                        </p>
                        <p>
                          <strong>Unit Price:</strong> ${parseFloat(book.price).toFixed(2)}
                        </p>
                        <p className="total">
                          <strong>Total:</strong> ₹{(parseFloat(book.price) * quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="checkout-buttons">
                        <button
                          onClick={handlePlaceOrder}
                          disabled={buying}
                          className="place-order-btn"
                        >
                          {buying ? 'Placing Order...' : 'Place Order'}
                        </button>
                        <button
                          onClick={() => setShowCheckout(false)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Reviews Section */}
          {book && <ReviewSection bookId={book.id} />}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
