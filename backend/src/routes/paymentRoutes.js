const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleStripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/status/:paymentIntentId', protect, getPaymentStatus);

// Webhook route (no auth required)
router.post('/webhook', handleStripeWebhook);

module.exports = router;
