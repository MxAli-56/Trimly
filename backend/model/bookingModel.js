import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    appointmentCode: {
      type: String,
      required: [true, "Appointment code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer reference is required"],
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Barber reference is required"],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch reference is required"],
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: [true, "Status reference is required"],
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please enter a valid time format (HH:MM)",
      ],
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
    services: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
        name: String,
        price: Number,
        durationMinutes: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    depositAmount: {
      type: Number,
      required: [true, "Deposit amount is required"],
      min: [0, "Deposit amount cannot be negative"],
    },
    isOffPeakBooking: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
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
  },
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ barberId: 1, bookingDate: 1 });
bookingSchema.index({ branchId: 1 });
bookingSchema.index({ appointmentCode: 1 });
bookingSchema.index({ holdExpiresAt: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;