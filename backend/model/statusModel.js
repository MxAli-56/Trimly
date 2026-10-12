import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Status name is required"],
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Status type is required"],
      enum: ["BOOKING", "PAYMENT", "REFUND"],
      uppercase: true,
    },
    displayLabel: {
      type: String,
      required: [true, "Display label is required"],
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

statusSchema.index({ name: 1, type: 1 }, { unique: true });

const Status = mongoose.model("Status", statusSchema);

export default Status;