
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  connectBarberSocket,
  disconnectBarberSocket,
} from '../services/barberSocket';
import authService from '../services/authService';
import customerProfileService from '../services/customerProfileService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  profileLoading: false,

  // LOGIN
  login: async (identifier, password) => {
    try {
      set({ isLoading: true });

      const response = await authService.login(identifier, password);
      const { user, tokens } = response.data;
      const accessToken = tokens.accessToken;

      await SecureStore.setItemAsync('authToken', accessToken);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
      });

      if (user.roles?.includes('BARBER')) {
        connectBarberSocket(accessToken);
      }

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Login failed.',
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // REGISTER
  register: async (userData) => {
    try {
      set({ isLoading: true });

      const response = await authService.register(userData);

      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Registration failed.',
      };
    } finally {
      set({ isLoading: false });
    }
  },
  // REGISTER WITH PHONE OTP
  registerWithOtp: async (idToken, userData) => {
    try {
      set({ isLoading: true });

      // Step 1: Verify Firebase token and create account
      const { phone, ...registrationData } = userData;



      const payload = {
        idToken,
        ...registrationData,
      };

      console.log('OTP payload keys:', Object.keys(payload));
      console.log(
        'Does payload contain phone?',
        Object.prototype.hasOwnProperty.call(payload, 'phone')
      );

      await authService.verifyOtp(payload);
      // Step 2: Login after successful registration
      const loginResponse = await authService.login(
        userData.email,
        userData.password
      );

      const { user, tokens } = loginResponse.data;
      const accessToken = tokens.accessToken;

      // Step 3: Save authentication token
      await SecureStore.setItemAsync('authToken', accessToken);

      // Step 4: Update authentication state
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
      });

      return { success: true, user };
      if (user.roles?.includes('BARBER')) {
        connectBarberSocket(accessToken);
      }

    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'OTP registration failed.',
      };
    } finally {
      set({ isLoading: false });
    }
  },
  // RESTORE SESSION
  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) return;

      const user = await authService.getCurrentUser(token);

      set({
        token,
        user,
        isAuthenticated: true,
      });

      if (user.roles?.includes('BARBER')) {
        connectBarberSocket(token);
      }
    } catch (error) {
      console.log('Session restoration failed:', error);

      await SecureStore.deleteItemAsync('authToken');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isInitializing: false });
    }
  },

  // FETCH CUSTOMER PROFILE
  fetchCustomerProfile: async () => {
    const token = get().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    try {
      set({ profileLoading: true });

      const profile = await customerProfileService.getMyProfile(token);

      set((state) => ({
        user: {
          ...state.user,
          ...profile,
        },
      }));

      return { success: true, profile };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Unable to fetch profile.',
      };
    } finally {
      set({ profileLoading: false });
    }
  },

  // UPDATE USER IN LOCAL STATE
  updateUser: (updatedData) => {
    set((state) => ({
      user: {
        ...state.user,
        ...updatedData,
      },
    }));
  },

  // LOGOUT
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      disconnectBarberSocket();

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        profileLoading: false,
      });
    }
  },

  // UPDATE PASSWORD
  updatePassword: async (passwordData) => {
    const token = get().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    // Accept either a plain string or an object like { newPassword }
    const payload =
      typeof passwordData === 'string'
        ? { newPassword: passwordData }
        : passwordData;

    try {
      set({ isLoading: true });

      await authService.updatePassword(payload, token);

      return {
        success: true,
        message: 'Password updated successfully.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Password update failed.',
      };
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
