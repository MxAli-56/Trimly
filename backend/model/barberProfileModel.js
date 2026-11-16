import mongoose from "mongoose";

const barberProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currentBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    employmentHistory: [
      {
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
        joinedAt: { type: Date },
        leftAt: { type: Date, default: null },
        reason: { type: String },
      },
    ],

    bio: { type: String, default: "", trim: true },
    specialties: [{ type: String, trim: true }],

    isAvailable: { type: Boolean, default: false },

    avgRating: { type: Number, default: 0.0 },
    ratingCount: { type: Number, default: 0 },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

barberProfileSchema.index({ currentBranchId: 1 });

const BarberProfile = mongoose.model("BarberProfile", barberProfileSchema);
export default BarberProfile;