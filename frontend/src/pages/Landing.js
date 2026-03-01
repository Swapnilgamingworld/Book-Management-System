import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/api';
import BookCard from '../components/BookCard';
import '../styles/landing.css';

const Landing = () => {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll(1, 100);
      if (response.data.success) {
        const allBooks = response.data.data;
        setBooks(allBooks.slice(0, 6)); // Show first 6 books

        // Calculate stats
        const categories = [...new Set(allBooks.map((b) => b.category))];
        setStats({
          totalBooks: allBooks.length,
          categories: categories,
        });
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Book Store</h1>
          <p>Discover your next favorite book from our extensive collection</p>
          <Link to="/books" className="cta-button">
            Explore Books Now
          </Link>
        </div>
        <div className="hero-background">📚</div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <h2>About Our Store</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Welcome to the ultimate online destination for book lovers! Our Book Store offers
                a curated collection of books across multiple genres and categories. Whether you're
                looking for gripping fiction, insightful non-fiction, scientific breakthroughs, or
                self-help guides, we have something for everyone.
              </p>
              <p>
                We believe that books have the power to transform lives, inspire minds, and
                open new worlds of imagination. Our mission is to make quality literature accessible
                to everyone, anytime, anywhere.
              </p>
            </div>
            <div className="about-features">
              <div className="feature">
                <h3>📖 Wide Selection</h3>
                <p>Browse {stats.totalBooks} books across {stats.categories.length} different categories</p>
              </div>
              <div className="feature">
                <h3>🚚 Fast Shipping</h3>
                <p>Quick and reliable delivery to your doorstep</p>
              </div>
              <div className="feature">
                <h3>💳 Easy Payment</h3>
                <p>Multiple payment options for your convenience</p>
              </div>
              <div className="feature">
                <h3>⭐ Quality Assured</h3>
                <p>All books are carefully selected and verified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalBooks}+</h3>
            <p>Books Available</p>
          </div>
          <div className="stat-card">
            <h3>{stats.categories.length}</h3>
            <p>Categories</p>
          </div>
          <div className="stat-card">
            <h3>1000+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Our Categories</h2>
        <div className="categories-grid">
          {stats.categories.map((category) => (
            <Link
              to={`/books?category=${category}`}
              key={category}
              className="category-card"
            >
              <span className="category-icon">📚</span>
              <span className="category-name">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-section">
        <h2>Featured Books</h2>
        <p className="section-subtitle">Check out some of our most popular books</p>

        {loading ? (
          <p className="loading">Loading books...</p>
        ) : (
          <div className="featured-books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        <div className="view-all-container">
          <Link to="/books" className="view-all-button">
            View All Books →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Shop With Us?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Curated Selection</h3>
            <p>
              Our team personally selects each book to ensure quality and relevance.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>
              Competitive pricing with regular discounts and special offers.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📦</div>
            <h3>Secure Packaging</h3>
            <p>
              Every book is carefully packaged to arrive in perfect condition.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔄</div>
            <h3>Easy Returns</h3>
            <p>
              Hassle-free returns within 30 days if you're not satisfied.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Payment</h3>
            <p>
              Your payment information is protected with the latest encryption.
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">👥</div>
            <h3>Community</h3>
            <p>
              Join thousands of book lovers in our growing community.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Reading?</h2>
        <p>Browse our collection and find your next favorite book today!</p>
        <div className="cta-buttons">
          <Link to="/books" className="cta-button-primary">
            Start Shopping
          </Link>
          <Link to="/register" className="cta-button-secondary">
            Create Account
          </Link>
        </div>
      </section>

      {/* Footer Info */}
      <section className="footer-info">
        <div className="footer-content">
          <h3>Contact Us</h3>
          <p>Email: support@bookstore.com</p>
          <p>Phone: 1-800-BOOKS-123</p>
          <p>Address: 123 Book Street, Library City, LC 12345</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
