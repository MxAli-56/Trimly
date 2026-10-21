import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as authTokenRepository from "../../repository/authTokenRepository.js";

export const generateAuthTokens = async (user, reqDetails = {}) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      roles: user.roles,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY },
  );

  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  const expiryDays = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS);
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  await authTokenRepository.createAuthToken({
    userId: user._id,
    refreshTokenHash,
    ipAddress: reqDetails.ip || null,
    userAgent: reqDetails.userAgent || null,
    deviceFcmToken: reqDetails.deviceFcmToken || null,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
  };
};