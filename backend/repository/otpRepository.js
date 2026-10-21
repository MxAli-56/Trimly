import Otp from "../model/otpModel.js";

export const createOtp = async (otpData) => {
  return await Otp.create(otpData);
};

export const findLatestOtpByPhone = async (phone) => {
  return await Otp.findOne({ phone }).sort({ createdAt: -1 });
};

export const deleteOtpsByPhone = async (phone) => {
  return await Otp.deleteMany({ phone });
};

export const incrementAttempts = async (otpId) => {
  return await Otp.findByIdAndUpdate(otpId, { $inc: { attempts: 1 } });
};