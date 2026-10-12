import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [
        /^[a-zA-Z\s'-]+$/,
        "Name can only contain alphabets, spaces, hyphens, and apostrophes",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    roles: {
      type: [String],
      enum: ["CUSTOMER", "BARBER", "SALON_OWNER", "ADMIN"],
      default: ["CUSTOMER"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    favorites: {
      branches: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
        },
      ],
      barbers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
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

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

const User = mongoose.model("User", userSchema);

export default User;