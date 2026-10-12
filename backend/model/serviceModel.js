import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch reference is required"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    durationMinutes: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      min: [5, "Duration must be at least 5 minutes"],
    },
    isActive: {
      type: Boolean,
      default: true,
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

serviceSchema.index({ branchId: 1 });
serviceSchema.index({ categoryId: 1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;