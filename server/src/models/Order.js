const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderType: { type: String, enum: ['course', 'package', 'event'], required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },

    // Razorpay
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    amount: { type: Number, required: true }, // in paise (INR smallest unit)
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded', 'free'],
      default: 'created',
    },
    isFree: { type: Boolean, default: false },
    paidAt: { type: Date },

    // Receipt/invoice
    receiptId: { type: String },

    // For event bookings
    ticketId: { type: String },
    attendeeName: { type: String },
    attendeeEmail: { type: String },
    attendeePhone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
