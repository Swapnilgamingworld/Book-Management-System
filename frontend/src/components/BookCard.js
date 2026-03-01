import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/bookcard.css';

const BookCard = ({ book }) => {
  return (
    <div className="book-card">
      <div className="book-image-container">
        {book.image ? (
          <img src={book.image} alt={book.title} className="book-image" />
        ) : (
          <div className="book-image-placeholder">
            <span>📚</span>
            <p>No Image</p>
          </div>
        )}
        {book.rating && (
          <div className="rating-badge">
            <span>⭐ {parseFloat(book.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="book-content">
        <h3 title={book.title}>{book.title}</h3>
        <p className="author">by {book.author}</p>
        <p className="category-tag">{book.category}</p>
        <p className="description">{book.description?.substring(0, 80)}...</p>
        <div className="book-footer">
          <span className="price">₹{parseFloat(book.price).toFixed(2)}</span>
          <span className={`stock ${book.stock > 0 ? 'available' : 'unavailable'}`}>
            {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <Link to={`/book/${book.id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
