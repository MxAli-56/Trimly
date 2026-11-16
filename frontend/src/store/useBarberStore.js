import { create } from 'zustand';

import useAuthStore from './useAuthStore';
import barberService from '../services/BarberService';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const getError = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  error.message ||
  fallback;

// Local date as YYYY-MM-DD (toISOString would give the UTC date)
const getLocalDateString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Build a Date from a booking date + "HH:mm" time (or an ISO string)
const toDateTime = (date, time) => {
  if (!time) return null;

  if (/^\d{1,2}:\d{2}$/.test(time)) {
    const [h, min] = time.split(':').map(Number);
    const [y, m, d] = (date || getLocalDateString()).split('-').map(Number);
    return new Date(y, m - 1, d, h, min);
  }

  const parsed = new Date(time);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/*
 * IMPORTANT: this is the ONLY place that knows the backend field names.
 * I have not seen the real GET /barber/dashboard/timeline response yet,
 * so the fallbacks below are guesses. Compare with one real booking from
 * Postman and adjust the right-hand sides.
 */
const normalizeBooking = (b, requestedDate) => {
  const date = b.date || requestedDate;
  const start = toDateTime(date, b.startTime);
  const end = toDateTime(date, b.endTime);

  const services = Array.isArray(b.services) ? b.services : [];
  const serviceName =
    b.service?.name ||
    b.serviceName ||
    (services.length ? services.map((s) => s.name).filter(Boolean).join(' & ') : '') ||
    'Service';

  const duration =
    b.durationMinutes ||
    b.totalDuration ||
    (start && end ? Math.round((end - start) / 60000) : 30);

  return {
    _id: b._id || b.id || b.bookingId,
    appointmentCode: b.appointmentCode,
    startTime: start ? start.toISOString() : null,
    durationMinutes: duration,
    status: String(b.status || '').toUpperCase(),
    customer: {
      name: b.customer?.name || b.customerName || b.customerId?.name || 'Customer',
      profilePhoto: b.customer?.profilePhoto || b.customerId?.profilePhoto || null,
    },
    service: { name: serviceName },
    price: Number(b.totalPrice ?? b.totalAmount ?? b.price ?? 0),
  };
};

// The timeline can be an array or an object holding the bookings
const extractBookings = (timeline) => {
  const list = Array.isArray(timeline)
    ? timeline
    : timeline?.bookings || timeline?.appointments || timeline?.items || [];

  // Skip non-booking entries (breaks, leaves) if the backend marks them
  return list.filter((item) => !['BREAK', 'LEAVE'].includes(String(item.type || '').toUpperCase()));
};

const EMPTY_STATS = {
  total: 0,
  completed: 0,
  earnings: 0,
  weekly: [], // no weekly endpoint exists yet
};

const computeStats = (appointments) => {
  const completed = appointments.filter((a) => a.status === 'COMPLETED');
  return {
    total: appointments.length,
    completed: completed.length,
    earnings: completed.reduce((sum, a) => sum + (a.price || 0), 0),
    weekly: [],
  };
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

const useBarberStore = create((set, get) => ({
  appointments: [],
  stats: EMPTY_STATS,
  isAvailable: true,
  dashboardLoading: false,

  // Set the initial availability from the logged-in user's barber profile
  setAvailable: (value) => {
    if (typeof value === 'boolean') set({ isAvailable: value });
  },

  // FETCH DASHBOARD  (GET /barber/dashboard/timeline?date=today)
  fetchDashboard: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return { success: false, error: 'Authentication token not found.' };
    }

    try {
      set({ dashboardLoading: true });

      const date = getLocalDateString();
      const res = await barberService.getDailyTimeline(date, token);

      const appointments = extractBookings(res.data)
        .map((b) => normalizeBooking(b, date))
        .filter((a) => a._id && a.startTime);

      set({ appointments, stats: computeStats(appointments) });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getError(error, 'Unable to load dashboard.'),
      };
    } finally {
      set({ dashboardLoading: false });
    }
  },

  // TOGGLE AVAILABILITY (optimistic update, rolls back on failure)
  toggleAvailability: async (value) => {
    const token = useAuthStore.getState().token;
    const previous = get().isAvailable;

    set({ isAvailable: value });

    try {
      const res = await barberService.toggleAvailability(value, token);
      set({ isAvailable: res.data?.isAvailable ?? value });
      return { success: true };
    } catch (error) {
      set({ isAvailable: previous });
      return {
        success: false,
        error: getError(error, 'Unable to update availability.'),
      };
    }
  },

  reset: () =>
    set({ appointments: [], stats: EMPTY_STATS, isAvailable: true, dashboardLoading: false }),
}));

export default useBarberStore;
