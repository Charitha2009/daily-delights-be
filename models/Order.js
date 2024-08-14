// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  deliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Confirmed', 'Shopping in Progress', 'Delivered'],
    default: 'Confirmed'
  },
  transaction: {
    sessionId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentStatus: { type: String, default: 'pending' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
