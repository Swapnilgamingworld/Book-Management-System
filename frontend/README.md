# Book Management System - Frontend

React-based user interface for the Book Management System REST API.

## Features
- Browse and search books
- User authentication (Register/Login)
- View book details
- Place orders
- Track order history
- Admin dashboard (for admin users)

## Prerequisites
- Node.js (v14 or higher)
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

3. **Configure environment variables** (if needed)
   The default API URL is `http://localhost:5000/api`

## Running the Application

### Development Mode
```bash
npm start
```
Application runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Project Structure
```
src/
├── components/        # Reusable React components
├── pages/            # Page components
├── services/         # API service calls
├── context/          # React context (Auth)
├── styles/           # CSS files
└── App.js           # Main app component
```

## Main Components
- **Navbar**: Navigation and user authentication UI
- **BookCard**: Display individual book information
- **Home**: Browse and search books
- **Login/Register**: User authentication pages

## API Integration
The app uses axios to communicate with the backend API at `/api`:
- `/api/books` - Book management
- `/api/users` - User authentication
- `/api/orders` - Order management

JWT tokens are automatically attached to requests after login.

## Styling
- CSS Flexbox and Grid for responsive layouts
- Mobile-first responsive design
- Color scheme: Professional blues and greens

## Required Backend
This frontend requires the backend API to be running at `http://localhost:5000`

See Backend README for setup instructions.
