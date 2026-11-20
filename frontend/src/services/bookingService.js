
import api from './api';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Normalize a single service ID or an array into an array.
const normalizeServiceIds = (serviceIds) => {
  const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds];

  return ids.filter(Boolean);
};

// Serialize service IDs as a comma-separated string.
const serializeServiceIds = (serviceIds) =>
  normalizeServiceIds(serviceIds).join(',');

const bookingService = {
  // Get barbers for a salon branch
  getSalonBarbers: async (branchId, token) => {
    const response = await api.get(
      `/api/customer/salons/${branchId}/barbers`,
      getAuthConfig(token)
    );

    return response.data.data;
  },

  // Get available dates for multiple selected services
  getAvailableDates: async (barberId, serviceIds, token) => {
    console.log('BARBER ID:', barberId);
    console.log('SERVICE IDS:', normalizeServiceIds(serviceIds));

    const response = await api.get(
      `/api/customer/barbers/${barberId}/available-dates`,
      {
        params: {
          serviceIds: serializeServiceIds(serviceIds),
          days: 30,
        },
        ...getAuthConfig(token),
      }
    );

    console.log('AVAILABLE DATES RESPONSE:', response.data);

    return response.data.data;
  },

  // Get available time slots for multiple selected services
  getAvailableSlots: async (barberId, date, serviceIds, token) => {
    const response = await api.get(
      `/api/customer/barbers/${barberId}/available-slots`,
      {
        params: {
          date,
          serviceIds: serializeServiceIds(serviceIds),
        },
        ...getAuthConfig(token),
      }
    );

    return response.data.data;
  },

  // Create a booking with multiple services
  createBooking: async (bookingData, token) => {
    const response = await api.post(
      '/api/bookings',
      bookingData,
      getAuthConfig(token)
    );

    return response.data;
  },

  // Get the current status of a booking
  getBookingStatus: async (bookingId, token) => {
    const response = await api.get(
      `/api/bookings/${bookingId}/status`,
      getAuthConfig(token)
    );

    return response.data.data;
  },

  // Get upcoming bookings
  getUpcomingBookings: async (token, page = 1, limit = 10) => {
    const response = await api.get('/api/bookings/upcoming', {
      params: { page, limit },
      ...getAuthConfig(token),
    });

    return response.data.data;
  },

  // Get past bookings
  getPastBookings: async (token, page = 1, limit = 10) => {
    const response = await api.get('/api/bookings/past', {
      params: { page, limit },
      ...getAuthConfig(token),
    });

    return response.data.data;
  },

  // Pay the booking deposit
  payForBooking: async (bookingId, token) => {
    const response = await api.patch(
      `/api/bookings/${bookingId}/pay`,
      {},
      getAuthConfig(token)
    );

    return response.data;
  },
};

export default bookingService;
