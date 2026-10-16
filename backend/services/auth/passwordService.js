import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../../model/userModel.js";

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email, deletedAt: null });
  if (!user) {
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  return {
    email: user.email,
    resetToken,
  };
};

export const verifyResetTokenService = async (token) => {
  const user = await User.findOne({ resetToken: token, deletedAt: null });

  if (!user) {
    return { valid: false, message: "Invalid or expired reset token" };
  }

  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return { valid: false, message: "Reset token has expired" };
  }

  return { valid: true };
};

export const resetPasswordWithToken = async (token, newPassword) => {
  const user = await User.findOne({ resetToken: token, deletedAt: null });

  if (
    !user ||
    !user.resetTokenExpiry ||
    new Date(user.resetTokenExpiry) < new Date()
  ) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  return { success: true };
};

export const updateUserPassword = async (userId, newPassword) => {
  const user = await User.findById(userId);

  if (!user || user.deletedAt !== null) {
    throw new Error("USER_NOT_FOUND");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return { success: true };
};