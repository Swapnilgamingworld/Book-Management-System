const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!bookId || !rating || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookId, rating, and title',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      where: { userId, bookId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book',
      });
    }

    // Create review
    const review = await Review.create({
      userId,
      bookId,
      rating,
      title,
      comment,
    });

    // Update book rating
    const reviews = await Review.findAll({ where: { bookId } });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await book.update({ rating: parseFloat(avgRating.toFixed(1)) });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a book
exports.getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: { bookId },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
      limit,
      offset,
      order: [['helpful', 'DESC'], ['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: reviews.rows,
      pagination: {
        total: reviews.count,
        pages: Math.ceil(reviews.count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Book,
          attributes: ['title', 'author', 'isbn'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: reviews.rows,
      pagination: {
        total: reviews.count,
        pages: Math.ceil(reviews.count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews',
      });
    }

    await review.update({
      rating: rating || review.rating,
      title: title || review.title,
      comment: comment || review.comment,
    });

    // Update book rating
    const reviews = await Review.findAll({ where: { bookId: review.bookId } });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Book.update({ rating: parseFloat(avgRating.toFixed(1)) }, { where: { id: review.bookId } });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    const bookId = review.bookId;
    await review.destroy();

    // Update book rating
    const reviews = await Review.findAll({ where: { bookId } });
    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Book.update({ rating: parseFloat(avgRating.toFixed(1)) }, { where: { id: bookId } });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await review.update({ helpful: review.helpful + 1 });

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
