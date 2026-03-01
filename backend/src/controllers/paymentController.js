let stripe;

// Initialize Stripe only if key is provided and valid
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('xxx')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const Order = require('../models/Order');
const User = require('../models/User');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured. Please add Stripe API key.',
      });
    }

    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this order',
      });
    }

    const user = await User.findByPk(userId);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(order.totalPrice) * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: order.id,
        userId: userId,
      },
      description: `Payment for Order #${order.id}`,
      customer: user.stripeCustomerId || undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured. Please add Stripe API key.',
      });
    }

    const { orderId, paymentIntentId } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this order',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status to confirmed
      await order.update({ status: 'confirmed' });

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Webhook to handle Stripe events
exports.handleStripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        const order = await Order.findByPk(paymentIntentSucceeded.metadata.orderId);
        if (order && order.status === 'pending') {
          await order.update({ status: 'confirmed' });
          console.log(`Order ${order.id} confirmed via webhook`);
        }
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object;
        console.log(`Payment failed for order: ${paymentIntentFailed.metadata.orderId}`);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
