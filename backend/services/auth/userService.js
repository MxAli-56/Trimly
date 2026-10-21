import * as userRepository from "../../repository/userRepository.js";

export const getUserProfile = async (userId) => {
  const user = await userRepository.findByIdSelect(
    userId,
    "-resetToken -resetTokenExpiry",
  );

  if (!user || user.deletedAt !== null) {
    return null;
  }

  return user;
};