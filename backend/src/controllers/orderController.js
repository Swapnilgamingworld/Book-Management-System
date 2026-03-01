const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendEmail, templates } = require('../services/emailService');
const { broadcastNewOrder, broadcastOrderStatusUpdate } = require('../config/socket');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { books, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Verify user exists in database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    if (!books || books.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one book',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shipping address',
      });
    }

    let totalPrice = 0;
    const orderBooks = [];

    // Calculate total and validate books
    for (const item of books) {
      const book = await Book.findByPk(item.book);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Book with ID ${item.book} not found`,
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for book: ${book.title}`,
        });
      }

      totalPrice += parseFloat(book.price) * item.quantity;
      orderBooks.push({
        book: book.id,
        quantity: item.quantity,
        price: book.price,
      });

      // Update stock
      book.stock -= item.quantity;
      await book.save();
    }

    const order = await Order.create({
      userId,
      books: orderBooks,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
    });

    const populatedOrder = await Order.findByPk(order.id, {
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
    });

    // Send order confirmation email
    try {
      const emailData = {
        orderId: order.id,
        customerName: user.name,
        books: populatedOrder.books.map(book => ({
          title: book.title || 'Book',
          quantity: book.quantity,
          price: book.price,
        })),
        totalPrice: populatedOrder.totalPrice,
        shippingAddress,
        paymentMethod,
      };
      await sendEmail(user.email, 'Order Confirmation - Book Store', templates.orderConfirmation(emailData));
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError.message);
      // Don't fail the order if email sending fails
    }

    // Broadcast new order to admin dashboard
    try {
      broadcastNewOrder({
        orderId: order.id,
        customerName: user.name,
        totalPrice: populatedOrder.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
      });
    } catch (socketError) {
      console.error('Failed to broadcast order:', socketError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: rows.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email', 'phone', 'address'] }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.update({ status });

    const updatedOrder = await Order.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }],
    });

    // Send status update email
    try {
      const emailData = {
        orderId: order.id,
        customerName: updatedOrder.User.name,
      };
      
      if (status === 'shipped') {
        await sendEmail(updatedOrder.User.email, 'Your Order Has Shipped - Book Store', templates.orderShipped(emailData));
      } else if (status === 'delivered') {
        await sendEmail(updatedOrder.User.email, 'Your Order Has Delivered - Book Store', templates.orderDelivered(emailData));
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError.message);
    }

    // Broadcast order status update to admin dashboard
    try {
      broadcastOrderStatusUpdate(order.id, status);
    } catch (socketError) {
      console.error('Failed to broadcast order status update:', socketError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    // Restore stock
    if (order.books && Array.isArray(order.books)) {
      for (const item of order.books) {
        const book = await Book.findByPk(item.book);
        if (book) {
          book.stock += item.quantity;
          await book.save();
        }
      }
    }

    await order.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
