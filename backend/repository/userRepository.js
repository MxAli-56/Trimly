import User from "../model/userModel.js";

export const findById = async (userId) => {
  return await User.findById(userId);
};

export const findByIdSelect = async (userId, selectFields) => {
  return await User.findById(userId).select(selectFields);
};

export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findByPhone = async (phone) => {
  return await User.findOne({ phone });
};

export const findByEmailOrPhone = async (loginQuery) => {
  return await User.findOne({
    $or: [{ email: loginQuery.toLowerCase() }, { phone: loginQuery }],
    deletedAt: null,
  }).select("+password");
};

export const findByEmailNotDeleted = async (email) => {
  return await User.findOne({ email, deletedAt: null });
};

export const findByResetToken = async (token) => {
  return await User.findOne({ resetToken: token, deletedAt: null });
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const updateUserById = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};