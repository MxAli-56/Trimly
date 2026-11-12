
import crypto from "crypto";
import * as authTokenRepository from "../../repository/authTokenRepository.js";

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_REQUIRED");
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await authTokenRepository.revokeAuthToken(refreshTokenHash);
};
