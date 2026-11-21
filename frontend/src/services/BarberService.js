
import api from './api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const barberService = {
  // DASHBOARD APIs

  toggleAvailability: async (isAvailable, token) => {
    const response = await api.patch(
      '/api/barber/availability',
      { isAvailable },
      authHeader(token)
    );

    return response.data;
  },

  getDailyTimeline: async (date, token) => {
    const response = await api.get(
      '/api/barber/dashboard/timeline',
      {
        ...authHeader(token),
        params: { date },
      }
    );

    return response.data;
  },

  getTodayAppointments: async (token) => {
    const response = await api.get(
      '/api/barber/appointments/today',
      authHeader(token)
    );

    return response.data;
  },

  // APPOINTMENT LIST APIs

  getUpcomingBookings: async (params = {}, token) => {
    const response = await api.get(
      '/api/barber/bookings/upcoming',
      {
        ...authHeader(token),
        params,
      }
    );

    return response.data;
  },

  getCompletedBookings: async (params = {}, token) => {
    const response = await api.get(
      '/api/barber/bookings/completed',
      {
        ...authHeader(token),
        params,
      }
    );
    return response.data;
  },

  // APPOINTMENT ACTION APIs
  acceptBooking: async (bookingId, token) => {
    const response = await api.patch(
      `/api/bookings/${bookingId}/accept`,
      {},
      authHeader(token)
    );

    return response.data;
  },

  rejectBooking: async (bookingId, reason, token) => {
    const response = await api.patch(
      `/api/bookings/${bookingId}/reject`,
      { reason },
      authHeader(token)
    );

    return response.data;
  },

  startBooking: async (bookingId, token) => {
    const response = await api.patch(
      `/api/bookings/${bookingId}/start`,
      {},
      authHeader(token)
    );

    return response.data;
  },

  completeBooking: async (bookingId, token) => {
    const response = await api.patch(
      `/api/bookings/${bookingId}/complete`,
      {},
      authHeader(token)
    );

    return response.data;
  },


  // SCHEDULE APIs
  getSchedule: async (token) => {
    const response = await api.get(
      '/api/barber/schedule',
      authHeader(token)
    );

    return response.data;
  },

  // POST /api/barber/schedule/send-request
  submitScheduleRequest: async (schedule, token) => {
    const response = await api.post(
      '/api/barber/schedule/send-request',
      { schedule },
      authHeader(token)
    );
    return response.data;
  },

  // GET /api/barber/schedule/my-requests
  getScheduleRequests: async (token) => {
    const response = await api.get(
      '/api/barber/schedule/my-requests',
      authHeader(token)
    );
    return response.data;
  },

  // TEMPORARY LEAVE APIs

  addLeave: async (leaveData, token) => {
    const response = await api.post(
      '/api/barber/leaves',
      leaveData,
      authHeader(token)
    );
    return response.data;
  },

  getLeaves: async (token) => {
    const response = await api.get(
      '/api/barber/leaves',
      authHeader(token)
    );
    return response.data;
  },

  deleteLeave: async (leaveId, token) => {
    const response = await api.delete(
      `/api/barber/leaves/${leaveId}`,
      authHeader(token)
    );
    return response.data;
  },
  // GET /api/barber/booking-requests/:bookingId
  getBookingRequestDetails: async (bookingId, token) => {
    const response = await api.get(
      `/api/barber/booking-requests/${bookingId}`,
      authHeader(token)
    );

    return response.data;
  },
};

export default barberService;
