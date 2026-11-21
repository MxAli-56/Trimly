import mongoose from "mongoose";

const bookingQueueSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    promotedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

bookingQueueSchema.index({
  barberId: 1,
  bookingDate: 1,
  startTime: 1,
  statusId: 1,
});
bookingQueueSchema.index({ customerId: 1, statusId: 1 });

const BookingQueue = mongoose.model("BookingQueue", bookingQueueSchema);

export default BookingQueue;