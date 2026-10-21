import bcrypt from "bcrypt";
import * as otpRepository from "../../repository/otpRepository.js";
import { SMS_CONFIG } from "../../config/sms.js";
import { formatPhoneForSMS } from "../../utils/phoneFormatter.js";

export const sendOtp = async (phone) => {
  const existingOtp = await otpRepository.findLatestOtpByPhone(phone);
  if (existingOtp) {
    const timeDiff = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
    if (timeDiff < 60) {
      throw new Error("COOLDOWN_ACTIVE");
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await otpRepository.createOtp({
    phone,
    otpHash,
    expiresAt,
  });

  const formattedPhone = formatPhoneForSMS(phone);

  try {
    const response = await fetch(SMS_CONFIG.ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: SMS_CONFIG.EMAIL,
        key: SMS_CONFIG.API_KEY,
        mask: SMS_CONFIG.MASK,
        to: formattedPhone,
        message: `Your Trimly verification code is: ${otp}. Valid for ${expiryMinutes} minutes.`,
      }),
    });

    const data = await response.json();
    if (data.code !== "000" && data.code !== "100") {
      throw new Error("SMS_SEND_FAILED");
    }
  } catch (error) {
    throw new Error("SMS_SEND_FAILED");
  }
};

export const verifyOtp = async (phone, otp) => {
  const record = await otpRepository.findLatestOtpByPhone(phone);

  if (!record) {
    throw new Error("OTP_NOT_FOUND");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("OTP_EXPIRED");
  }

  if (record.attempts >= 5) {
    throw new Error("MAX_ATTEMPTS_REACHED");
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) {
    await otpRepository.incrementAttempts(record._id);
    throw new Error("INVALID_OTP");
  }

  await otpRepository.deleteOtpsByPhone(phone);

  return { success: true };
};