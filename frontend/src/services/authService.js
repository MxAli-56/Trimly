
import api from './api';

const authService = {
  // REGISTER
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // LOGIN
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', {
      identifier,
      password,
    });

    return response.data;
  },

  // GET CURRENT USER
  getCurrentUser: async (token) => {
    const response = await api.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  },

  // FORGOT PASSWORD
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });

    return response.data;
  },

  // VERIFY OTP
  verifyOtp: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // VERIFY RESET TOKEN
  verifyResetToken: async (token) => {
    const response = await api.get(
      `/auth/verify-reset-token/${encodeURIComponent(token)}`
    );

    return response.data;
  },

  // RESET PASSWORD
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  // UPDATE PASSWORD
  updatePassword: async (passwordData, token) => {
    const response = await api.patch(
      '/auth/update-password',
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },
};

export default authService;
