import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Book services
export const bookService = {
  getAll: (page = 1, limit = 10, category = null, search = null) => {
    let url = `/books?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.patch(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  getByCategory: (category) => api.get(`/books/category/${category}`),
};

// User services
export const userService = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Order services
export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (page = 1, limit = 10, status = null) => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/orders/${id}`),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};

// Review services
export const reviewService = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getBookReviews: (bookId, page = 1, limit = 10) => 
    api.get(`/reviews/book/${bookId}?page=${page}&limit=${limit}`),
  getUserReviews: (page = 1, limit = 10) => 
    api.get(`/reviews/user/my-reviews?page=${page}&limit=${limit}`),
  update: (id, reviewData) => api.patch(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.patch(`/reviews/${id}/helpful`),
};

// Payment services
export const paymentService = {
  createIntent: (orderId) => api.post('/payments/intent', { orderId }),
  confirmPayment: (orderId, paymentIntentId) => 
    api.post('/payments/confirm', { orderId, paymentIntentId }),
  getStatus: (paymentIntentId) => api.get(`/payments/status/${paymentIntentId}`),
};

export default api;
