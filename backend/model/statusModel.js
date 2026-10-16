import mongoose from "mongoose";
import { ALL_STATUS_TYPES } from "../config/status.js";

const statusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Status name is required"],
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, "Status type is required"],
      enum: ALL_STATUS_TYPES,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
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