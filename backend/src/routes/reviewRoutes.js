const express = require('express');
const {
  createReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/book/:bookId', getBookReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/user/my-reviews', protect, getUserReviews);
router.patch('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.patch('/:id/helpful', markHelpful);

module.exports = router;
