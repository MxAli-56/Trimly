import AuthToken from "../model/authTokenModel.js";

export const createAuthToken = async (tokenData) => {
  return await AuthToken.create(tokenData);
};

export const revokeAuthToken = async (refreshTokenHash) => {
  return await AuthToken.updateOne(
    {
      refreshTokenHash,
      isRevoked: false,
      deletedAt: null,
    },
    {
      $set: { isRevoked: true },
    },
  );
};