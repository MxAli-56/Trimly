
import { create } from 'zustand';
import useAuthStore from './useAuthStore';
import barberService from '../services/BarberService';

// Extract bookings from API response
const extractBookings = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;

  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return data;

  return (
    data?.bookings ||
    data?.appointments ||
    data?.items ||
    data?.results ||
    []
  );
};

// Convert booking date + HH:mm into a local Date
const getBookingStartTime = (booking) => {
  const time = booking.startTime || booking.startAt;

  if (!time) return '';

  // Already a complete date/time
  if (time.includes('T')) {
    return time;
  }

  const dateValue = booking.bookingDate || booking.date;

  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '';

  const [hours, minutes] = time.split(':').map(Number);

  // Use the calendar date, then construct local time
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hours,
    minutes
  ).toISOString();
};

// Normalize backend booking for the existing UI
const normalizeBooking = (booking) => {
  const services = Array.isArray(booking.services)
    ? booking.services
    : [];

  const customer = booking.customerId || booking.customer || {};

  const status =
    booking.statusId?.name ||
    booking.status?.name ||
    booking.status ||
    '';

  const serviceName =
    services.map((service) => service.name).filter(Boolean).join(', ') ||
    booking.service?.name ||
    booking.serviceName ||
    'Service';

  const durationMinutes =
    booking.totalDuration ||
    services.reduce(
      (total, service) => total + (service.durationMinutes || 0),
      0
    ) ||
    booking.durationMinutes ||
    30;

  return {
    ...booking,

    _id: booking._id || booking.id || booking.bookingId,

    startTime: getBookingStartTime(booking),

    durationMinutes,

    status: String(status).toUpperCase(),

    customer: {
      name: customer.name || 'Customer',
      profilePhoto:
        customer.profilePhoto ||
        customer.profileImage ||
        null,
    },

    service: {
      name: serviceName,
    },

    price:
      booking.totalAmount ??
      booking.totalPrice ??
      booking.price ??
      0,
  };
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  'Something went wrong';

const useBarberAppointmentsStore = create((set, get) => ({
  appointments: [],
  loading: false,
  actionId: null,

  // GET upcoming and completed appointments
  fetchAppointments: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    set({ loading: true });

    try {
      const [upcomingResponse, completedResponse] =
        await Promise.all([
          barberService.getUpcomingBookings(
            { page: 1, limit: 50 },
            token
          ),
          barberService.getCompletedBookings(
            { page: 1, limit: 50 },
            token
          ),
        ]);

      const upcoming = extractBookings(upcomingResponse);
      const completed = extractBookings(completedResponse);

      const normalized = [...upcoming, ...completed]
        .map(normalizeBooking)
        .filter((booking) => booking._id);

      // Remove duplicate bookings
      const uniqueAppointments = [
        ...new Map(
          normalized.map((booking) => [
            booking._id,
            booking,
          ])
        ).values(),
      ];

      uniqueAppointments.sort(
        (a, b) =>
          new Date(a.startTime) - new Date(b.startTime)
      );

      set({
        appointments: uniqueAppointments,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: getErrorMessage(error),
      };
    }
  },

  // Update booking status locally
  _setStatus: (id, status, updatedBooking = null) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment._id === id
          ? {
              ...appointment,
              ...(updatedBooking || {}),
              status,
            }
          : appointment
      ),
    })),

  // Accept booking
  confirmAppointment: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    set({ actionId: id });

    try {
      const response = await barberService.acceptBooking(id, token);

      const updatedBooking =
        response?.data?.booking || response?.data;

      get()._setStatus(
        id,
        updatedBooking?.statusId?.name ||
          updatedBooking?.status ||
          'ACCEPTED',
        updatedBooking
      );

      await get().fetchAppointments();

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
      };
    } finally {
      set({ actionId: null });
    }
  },

  // Start service
  startService: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    set({ actionId: id });

    try {
      const response = await barberService.startBooking(id, token);

      const updatedBooking =
        response?.data?.booking || response?.data;

      get()._setStatus(
        id,
        updatedBooking?.statusId?.name ||
          updatedBooking?.status ||
          'IN_PROGRESS',
        updatedBooking
      );

      await get().fetchAppointments();

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
      };
    } finally {
      set({ actionId: null });
    }
  },

  // Complete service
  completeService: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    set({ actionId: id });

    try {
      const response = await barberService.completeBooking(id, token);

      const updatedBooking =
        response?.data?.booking || response?.data;

      get()._setStatus(
        id,
        updatedBooking?.statusId?.name ||
          updatedBooking?.status ||
          'COMPLETED',
        updatedBooking
      );

      await get().fetchAppointments();

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
      };
    } finally {
      set({ actionId: null });
    }
  },

  reset: () =>
    set({
      appointments: [],
      loading: false,
      actionId: null,
    }),
}));

export default useBarberAppointmentsStore;
