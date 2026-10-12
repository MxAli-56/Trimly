import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Branch owner reference is required"],
    },
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      default: "Karachi",
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    avgRating: {
      type: Number,
      default: 0.0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    ratingCount: {
      type: Number,
      default: 0,
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

branchSchema.index({ ownerId: 1 });
branchSchema.index({ area: 1, city: 1 });

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;