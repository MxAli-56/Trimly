import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    refreshTokenHash: {
      type: String,
      required: [true, "Refresh token hash is required"],
    },
    deviceFcmToken: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
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

authTokenSchema.index({ userId: 1 });
authTokenSchema.index({ refreshTokenHash: 1 });
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthToken = mongoose.model("AuthToken", authTokenSchema);

export default AuthToken;