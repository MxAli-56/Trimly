import mongoose from "mongoose";
import { ALL_ROLES, ROLES } from "../config/role.js";

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
    cnic: {
  type: String,
  required: function() { return this.roles.includes(ROLES.SALON_OWNER); },
  validate: {
    validator: function(v) {
      if (!v && !this.roles.includes(ROLES.SALON_OWNER)) return true;
      return /^\d{5}-\d{7}-\d$/.test(v); 
    },
    message: 'Invalid CNIC format'
  }
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
    profilePhotoPublicId: {
      type: String,
      default: null,
    },
    roles: {
      type: [String],
      enum: ALL_ROLES,
      default: [ROLES.CUSTOMER],
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

const User = mongoose.model("User", userSchema);

export default User;
