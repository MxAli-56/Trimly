import api from './api';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const barberService = {
  // TOGGLE AVAILABILITY  (PATCH /barber/availability)
  // Response: { success, message, data: { _id, isAvailable } }
  toggleAvailability: async (isAvailable, token) => {
    const response = await api.patch(
      '/barber/availability',
      { isAvailable },
      authHeader(token)
    );
    return response.data;
  },

  // DAILY TIMELINE  (GET /barber/dashboard/timeline?date=YYYY-MM-DD)
  // `date` is required by the backend (400 INVALID_DATE otherwise).
  // Response: { success, data: timeline }
  getDailyTimeline: async (date, token) => {
    const response = await api.get('/barber/dashboard/timeline', {
      ...authHeader(token),
      params: { date },
    });
    return response.data;
  },
};

export default barberService;
