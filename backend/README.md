# Book Management System - Backend API

## Overview
REST API for a complete Book Management System built with Node.js, Express, and MongoDB.

## Features
- **Book Management**: Create, read, update, delete books
- **User Authentication**: User registration and login with JWT
- **Order Management**: Create orders, track order status
- **Inventory Management**: Track book stock
- **Role-based Access**: Admin and user roles
- **Search & Filter**: Search books by title, author, category

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   Edit `.env` file with your configurations:
   ```
   MONGODB_URI=mongodb://localhost:27017/book-management
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Books
- `GET /api/books` - Get all books (with pagination, search, filter)
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/category/:category` - Get books by category
- `POST /api/books` - Create new book (Admin only)
- `PATCH /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/user/:userId` - Get user orders
- `PATCH /api/orders/:id/status` - Update order status (Admin only)
- `PATCH /api/orders/:id/cancel` - Cancel order

## Database Models

### Book
- title, author, isbn, description
- category, price, stock
- publisher, publishedDate, rating
- image, timestamps

### User
- name, email, password, role
- phone, address, timestamps

### Order
- user, books, totalPrice, status
- shippingAddress, paymentMethod, notes
- timestamps

## Authentication
Use JWT tokens for authentication. Include token in request header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Error Handling
All endpoints return JSON responses with success status and message.

Success response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description"
}
```

## License
ISC
