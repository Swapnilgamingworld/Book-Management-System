import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import BookCard from '../components/BookCard';
import '../styles/home.css';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll(page, 10, category || undefined, search || undefined);
      setBooks(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>Book Store</h1>
      
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select value={category} onChange={(e) => {
          setCategory(e.target.value);
          setPage(1);
        }}>
          <option value="">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Technology">Technology</option>
          <option value="Self-Help">Self-Help</option>
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading">Loading books...</p>}

      <div className="books-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {!loading && books.length === 0 && <p className="no-books">No books found</p>}
    </div>
  );
};

export default Home;
