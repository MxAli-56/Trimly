import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { generateAuthTokens } from "./tokenService.js";

export const loginUser = async (credentials, reqDetails = {}) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email, deletedAt: null }).select(
    "+password",
  );
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const tokens = await generateAuthTokens(user, reqDetails);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
    },
    tokens,
  };
};