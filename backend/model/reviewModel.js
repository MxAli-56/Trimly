import mongoose from "mongoose";
import { ALL_SENTIMENTS, SENTIMENTS } from "../config/sentiment.js";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
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
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    aiSentiment: {
      type: String,
      enum: ALL_SENTIMENTS,
      default: SENTIMENTS.PENDING,
      uppercase: true,
    },
    aiConfidence: {
      type: Number,
      default: null,
      min: [0, "Confidence cannot be less than 0"],
      max: [1, "Confidence cannot be more than 1"],
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

reviewSchema.index({ barberId: 1 });
reviewSchema.index({ branchId: 1 });
reviewSchema.index({ customerId: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;