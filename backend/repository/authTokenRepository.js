import AuthToken from "../model/authTokenModel.js";

export const createAuthToken = async (tokenData) => {
  return await AuthToken.create(tokenData);
};