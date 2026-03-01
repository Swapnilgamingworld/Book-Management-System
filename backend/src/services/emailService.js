const nodemailer = require('nodemailer');

// Create transporter (using Gmail or custom SMTP)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

// Email templates
const templates = {
  orderConfirmation: (orderData) => {
    const { orderId, customerName, books, totalPrice, shippingAddress, paymentMethod } = orderData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .order-details { margin: 20px 0; }
            .book-item { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="order-details">
              <p>Dear ${customerName},</p>
              <p>Thank you for your order! Your order has been successfully placed.</p>
              
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              
              <h3>Books Ordered:</h3>
              ${books.map(item => `
                <div class="book-item">
                  <p><strong>${item.title}</strong></p>
                  <p>Quantity: ${item.quantity} | Price: ₹${item.price}</p>
                </div>
              `).join('')}
              
              <div class="total">
                Total: ₹${totalPrice}
              </div>
              
              <h3>Shipping Address:</h3>
              <p>${shippingAddress}</p>
              
              <h3>Payment Method:</h3>
              <p>${paymentMethod.replace(/_/g, ' ').toUpperCase()}</p>
              
              <p style="margin-top: 30px;">We will notify you once your order is shipped.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with Book Management System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  orderShipped: (orderData) => {
    const { orderId, customerName } = orderData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Shipped</h1>
            </div>
            <p>Dear ${customerName},</p>
            <p>Great news! Your order #${orderId} has been shipped.</p>
            <p>You will receive your books soon. Thank you for your patience!</p>
          </div>
        </body>
      </html>
    `;
  },

  orderDelivered: (orderData) => {
    const { orderId, customerName } = orderData;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Delivered</h1>
            </div>
            <p>Dear ${customerName},</p>
            <p>Your order #${orderId} has been delivered!</p>
            <p>Thank you for your purchase. We hope you enjoy your books!</p>
          </div>
        </body>
      </html>
    `;
  },
};

module.exports = { sendEmail, templates };
