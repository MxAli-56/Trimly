import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment reference is required'],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Status',
      required: [true, 'Status reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: [0, 'Refund amount cannot be negative'],
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      trim: true,
    },
    refundTransactionId: {
      type: String,
      default: null,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

refundSchema.index({ paymentId: 1 });
refundSchema.index({ bookingId: 1 });

const Refund = mongoose.model('Refund', refundSchema);

export default Refund;