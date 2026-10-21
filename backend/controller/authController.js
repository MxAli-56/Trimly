import * as registerService from "../services/auth/registerService.js";
import * as loginService from "../services/auth/loginService.js";
import * as passwordService from "../services/auth/passwordService.js";
import * as otpService from "../services/auth/otpService.js";
import User from "../model/userModel.js";

export const Register = async (req, res) => {
  try {
    const user = await registerService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        error: { code: "EMAIL_EXISTS", message: "Email is already registered" },
      });
    }
    if (error.message === "PHONE_EXISTS") {
      return res.status(409).json({
        success: false,
        error: {
          code: "PHONE_EXISTS",
          message: "Phone number is already registered",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const Login = async (req, res) => {
  try {
    const reqDetails = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      deviceFcmToken: req.body.deviceFcmToken || null,
    };

    const result = await loginService.loginUser(req.body, reqDetails);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "-resetToken -resetTokenExpiry",
    );

    if (!user || user.deletedAt !== null) {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User profile not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await passwordService.requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      message: "If the email is registered, a password reset link will be sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await passwordService.verifyResetTokenService(token);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await passwordService.resetPasswordWithToken(token, newPassword);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password",
    });
  } catch (error) {
    if (error.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired reset token",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    await passwordService.updateUserPassword(userId, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User not found" },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error" },
    });
  }
};

export const SendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    await otpService.sendOtp(phone);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    if (error.message === "COOLDOWN_ACTIVE") {
      return res.status(429).json({
        success: false,
        error: {
          code: "COOLDOWN_ACTIVE",
          message: "Please wait 60 seconds before requesting a new OTP",
        },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to send OTP" },
    });
  }
};

export const VerifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    await otpService.verifyOtp(phone, otp);
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    const errorMap = {
      OTP_NOT_FOUND: { status: 404, message: "No OTP found for this number" },
      OTP_EXPIRED: { status: 400, message: "OTP has expired" },
      MAX_ATTEMPTS_REACHED: { status: 429, message: "Too many attempts" },
      INVALID_OTP: { status: 400, message: "Invalid OTP" },
    };

    const mapped = errorMap[error.message];
    if (mapped) {
      return res.status(mapped.status).json({
        success: false,
        error: { code: error.message, message: mapped.message },
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Verification failed" },
    });
  }
};