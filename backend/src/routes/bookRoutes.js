const express = require('express');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByCategory,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/category/:category', getBooksByCategory);

// Admin routes
router.post('/', protect, authorize('admin'), createBook);
router.patch('/:id', protect, authorize('admin'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
