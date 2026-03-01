const socketIO = require('socket.io');

let io;

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Store connected admin users
  const adminUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Admin joins dashboard
    socket.on('admin_dashboard', (adminId) => {
      adminUsers.set(adminId, socket.id);
      socket.join('admin_dashboard');
      console.log(`Admin ${adminId} joined dashboard`);
    });

    // Admin leaves dashboard
    socket.on('admin_leave', (adminId) => {
      adminUsers.delete(adminId);
      socket.leave('admin_dashboard');
      console.log(`Admin ${adminId} left dashboard`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove from admin users if present
      for (let [adminId, socketId] of adminUsers.entries()) {
        if (socketId === socket.id) {
          adminUsers.delete(adminId);
        }
      }
    });
  });

  return io;
};

// Broadcast new order to admin dashboard
const broadcastNewOrder = (orderData) => {
  if (io) {
    io.to('admin_dashboard').emit('new_order', orderData);
  }
};

// Broadcast order status update
const broadcastOrderStatusUpdate = (orderId, status) => {
  if (io) {
    io.to('admin_dashboard').emit('order_status_updated', { orderId, status });
  }
};

// Broadcast new review to admin dashboard
const broadcastNewReview = (reviewData) => {
  if (io) {
    io.to('admin_dashboard').emit('new_review', reviewData);
  }
};

// Broadcast real-time sales stats
const broadcastSalesStats = (stats) => {
  if (io) {
    io.to('admin_dashboard').emit('sales_stats_update', stats);
  }
};

module.exports = {
  initializeSocket,
  broadcastNewOrder,
  broadcastOrderStatusUpdate,
  broadcastNewReview,
  broadcastSalesStats,
};
