import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          📚 Book Store
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>

          {user ? (
            <>
              <span className="welcome">Welcome, {user.name}</span>
              <Link to="/orders">My Orders</Link>
              {user.role === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
