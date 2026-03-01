import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/reviews.css';

const ReviewSection = ({ bookId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/book/${bookId}`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadReviews();
  }, [bookId, loadReviews]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to add a review');
      return;
    }

    if (!formData.title.trim() || formData.rating < 1) {
      alert('Please provide a title and rating');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/reviews', {
        bookId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      });

      if (response.data.success) {
        alert('Review added successfully!');
        setFormData({ rating: 5, title: '', comment: '' });
        setShowForm(false);
        loadReviews();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      const response = await api.patch(`/reviews/${reviewId}/helpful`);
      if (response.data.success) {
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  return (
    <div className="review-section">
      <h2>Customer Reviews</h2>

      {user && (
        <div className="review-action">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn-add-review">
              Add Your Review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleFormChange}
                >
                  <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                  <option value="4">⭐⭐⭐⭐ - Good</option>
                  <option value="3">⭐⭐⭐ - Average</option>
                  <option value="2">⭐⭐ - Poor</option>
                  <option value="1">⭐ - Very Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Review Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Give your review a title"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Your Review:</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleFormChange}
                  placeholder="Share your thoughts about this book..."
                  rows="4"
                  maxLength={500}
                />
                <small>{formData.comment.length}/500 characters</small>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn-submit">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="reviews-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div>
                  <h4>{review.title}</h4>
                  <div className="review-meta">
                    <span className="review-author">By {review.User?.name}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}
                </div>
              </div>

              <p className="review-comment">{review.comment}</p>

              <div className="review-footer">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="btn-helpful"
                >
                  👍 Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
