import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: [true, "Status reference is required"],
    },
    paymentGateway: {
      type: String,
      required: [true, "Payment gateway is required"],
      enum: ["JAZZCASH", "EASYPAISA", "CASH"],
      uppercase: true,
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    rawGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;