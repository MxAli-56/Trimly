import mongoose from "mongoose";

const barberProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch reference is required"],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    isAvailable: {
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

barberProfileSchema.index({ userId: 1 });
barberProfileSchema.index({ branchId: 1 });

const BarberProfile = mongoose.model("BarberProfile", barberProfileSchema);

export default BarberProfile;