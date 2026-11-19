
import api from './api';

const bookingService = {
  // Get barbers for a salon
  getSalonBarbers: async (branchId, token) => {
    const response = await api.get(
      `/api/customer/salons/${branchId}/barbers`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.data;
  },

  // Get available dates
  getAvailableDates: async (barberId, serviceId, token) => {
    const response = await api.get(
      `/api/customer/barbers/${barberId}/available-dates`,
      {
        params: { serviceId, days: 30 },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.data;
  },

  // Get available time slots
  getAvailableSlots: async (barberId, date, serviceId, token) => {
    const response = await api.get(
      `/api/customer/barbers/${barberId}/available-slots`,
      {
        params: { date, serviceId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.data;
  },

  // Create a booking with multiple services
  createBooking: async (bookingData, token) => {
    const response = await api.post(
      '/api/bookings',
      bookingData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  },

  // Get upcoming bookings
  getUpcomingBookings: async (token, page = 1, limit = 10) => {
    const response = await api.get('/api/bookings/upcoming', {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  },

  // Get past bookings
  getPastBookings: async (token, page = 1, limit = 10) => {
    const response = await api.get('/api/bookings/past', {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  },
};

export default bookingService;
