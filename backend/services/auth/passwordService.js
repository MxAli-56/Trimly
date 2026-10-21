import crypto from "crypto";
import bcrypt from "bcrypt";
import * as userRepository from "../../repository/userRepository.js";

export const requestPasswordReset = async (email) => {
  const user = await userRepository.findByEmailNotDeleted(email);
  if (!user) {
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await userRepository.updateUserById(user._id, {
    resetToken,
    resetTokenExpiry,
  });

  return {
    email: user.email,
    resetToken,
  };
};

export const verifyResetTokenService = async (token) => {
  const user = await userRepository.findByResetToken(token);

  if (!user) {
    return { valid: false, message: "Invalid or expired reset token" };
  }

  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return { valid: false, message: "Reset token has expired" };
  }

  return { valid: true };
};

export const resetPasswordWithToken = async (token, newPassword) => {
  const user = await userRepository.findByResetToken(token);

  if (
    !user ||
    !user.resetTokenExpiry ||
    new Date(user.resetTokenExpiry) < new Date()
  ) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userRepository.updateUserById(user._id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return { success: true };
};

export const updateUserPassword = async (userId, newPassword) => {
  const user = await userRepository.findById(userId);

  if (!user || user.deletedAt !== null) {
    throw new Error("USER_NOT_FOUND");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userRepository.updateUserById(userId, {
    password: hashedPassword,
  });

  return { success: true };
};