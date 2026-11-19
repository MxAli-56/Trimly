
import { create } from 'zustand';

import useAuthStore from './useAuthStore';
import barberService from '../services/BarberService';

// Helpers
const getError = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  error.message ||
  fallback;

// Local date as YYYY-MM-DD
const getLocalDateString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
};

// Build Date from booking date + time or ISO string
const toDateTime = (date, time) => {
  if (!time) return null;

  if (/^\d{1,2}:\d{2}$/.test(time)) {
    const [h, min] = time.split(':').map(Number);
    const [y, m, d] = (date || getLocalDateString())
      .split('-')
      .map(Number);

    return new Date(y, m - 1, d, h, min);
  }

  const parsed = new Date(time);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Normalize backend booking data for dashboard UI
const normalizeBooking = (b, requestedDate) => {
  const date = b.date || requestedDate;

  const start = toDateTime(date, b.startTime);
  const end = toDateTime(date, b.endTime);

  const services = Array.isArray(b.services) ? b.services : [];

  const serviceName =
    b.service?.name ||
    b.serviceName ||
    (services.length
      ? services.map((s) => s.name).filter(Boolean).join(' & ')
      : '') ||
    'Service';

  const duration =
    b.durationMinutes ||
    b.totalDuration ||
    (start && end
      ? Math.round((end - start) / 60000)
      : 30);

  return {
    _id: b._id || b.id || b.bookingId,
    appointmentCode: b.appointmentCode,
    startTime: start ? start.toISOString() : null,
    durationMinutes: duration,

    status: String(
      b.status?.name ||
      b.statusId?.name ||
      b.status ||
      ''
    ).toUpperCase(),

    customer: {
      name:
        b.customer?.name ||
        b.customerName ||
        b.customerId?.name ||
        'Customer',

      profilePhoto:
        b.customer?.profilePhoto ||
        b.customerId?.profilePhoto ||
        null,
    },

    service: {
      name: serviceName,
    },

    price: Number(
      b.totalPrice ?? b.totalAmount ?? b.price ?? 0
    ),
  };
};

const EMPTY_STATS = {
  total: 0,
  completed: 0,
  earnings: 0,
  weekly: [],
};

// Zustand Store
const useBarberStore = create((set, get) => ({
  // Dashboard state
  appointments: [],
  stats: EMPTY_STATS,
  isAvailable: true,
  dashboardLoading: false,

  // Daily Timeline state
  dailyTimeline: null,
  timelineLoading: false,
  timelineError: null,

  // Schedule state
  schedule: [],
  scheduleLoading: false,
  scheduleError: null,

  // Schedule request state
  scheduleRequests: [],
  scheduleRequestsLoading: false,
  scheduleRequestSubmitting: false,
  scheduleRequestError: null,
  // Temporary Leave state
  leaves: [],
  leavesLoading: false,
  leaveSubmitting: false,
  leaveDeletingId: null,
  leaveError: null,
  // Set availability from logged-in barber profile
  setAvailable: (value) => {
    if (typeof value === 'boolean') {
      set({ isAvailable: value });
    }
  },

  // GET /api/barber/appointments/today
  fetchDashboard: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({ dashboardLoading: true });

    try {
      const res = await barberService.getTodayAppointments(token);

      const date = res.data?.date || getLocalDateString();

      const appointments = (res.data?.appointments || [])
        .map((booking) => normalizeBooking(booking, date))
        .filter(
          (appointment) =>
            appointment._id && appointment.startTime
        );

      set({
        appointments,
        stats: computeStats(appointments),
      });

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
  // GET /api/barber/dashboard/timeline?date=YYYY-MM-DD
  fetchDailyTimeline: async (date = getLocalDateString()) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      timelineLoading: true,
      timelineError: null,
    });

    try {
      const res = await barberService.getDailyTimeline(
        date,
        token
      );

      const timelineData = res.data;

      set({
        dailyTimeline: timelineData,
      });

      return {
        success: true,
        data: timelineData,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to load daily timeline.'
      );

      set({
        timelineError: message,
      });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({
        timelineLoading: false,
      });
    }
  },
  // PATCH /api/barber/availability
  toggleAvailability: async (value) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    const previous = get().isAvailable;

    // Optimistic update
    set({ isAvailable: value });

    try {
      const res = await barberService.toggleAvailability(
        value,
        token
      );

      const updatedAvailability =
        res.data?.isAvailable ?? value;

      set({ isAvailable: updatedAvailability });

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      // Restore previous value if API fails
      set({ isAvailable: previous });

      return {
        success: false,
        error: getError(
          error,
          'Unable to update availability.'
        ),
      };
    }
  },

  // GET /api/barber/schedule
  fetchSchedule: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      scheduleLoading: true,
      scheduleError: null,
    });

    try {
      const res = await barberService.getSchedule(token);

      const schedule = Array.isArray(res.data)
        ? res.data
        : [];

      set({ schedule });

      return {
        success: true,
        data: schedule,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to load barber schedule.'
      );

      set({ scheduleError: message });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({ scheduleLoading: false });
    }
  },

  // POST /api/barber/schedule/send-request
  submitScheduleRequest: async (scheduleData) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      scheduleRequestSubmitting: true,
      scheduleRequestError: null,
    });

    try {
      const res = await barberService.submitScheduleRequest(
        scheduleData,
        token
      );

      // Refresh request history
      await get().fetchScheduleRequests();

      return {
        success: true,
        message: res.message,
        data: res.data,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to submit schedule request.'
      );

      set({ scheduleRequestError: message });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({ scheduleRequestSubmitting: false });
    }
  },

  // GET /api/barber/schedule/my-requests
  fetchScheduleRequests: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      scheduleRequestsLoading: true,
      scheduleRequestError: null,
    });

    try {
      const res = await barberService.getScheduleRequests(token);

      const requests = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.requests)
          ? res.data.requests
          : [];

      set({ scheduleRequests: requests });

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to load schedule request history.'
      );

      set({ scheduleRequestError: message });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({ scheduleRequestsLoading: false });
    }
  },

  // GET /api/barber/leaves
  fetchLeaves: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      leavesLoading: true,
      leaveError: null,
    });

    try {
      const res = await barberService.getLeaves(token);

      const leaves = Array.isArray(res.data)
        ? res.data
        : [];

      set({ leaves });

      return {
        success: true,
        data: leaves,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to load leaves.'
      );

      set({ leaveError: message });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({ leavesLoading: false });
    }
  },

  // POST /api/barber/leaves
  addLeave: async (leaveData) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      leaveSubmitting: true,
      leaveError: null,
    });

    try {
      const res = await barberService.addLeave(
        leaveData,
        token
      );

      // Refresh leaves after successful creation
      await get().fetchLeaves();

      return {
        success: true,
        message: res.message,
        data: res.data,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to add leave.'
      );

      set({ leaveError: message });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({ leaveSubmitting: false });
    }
  },

  // DELETE /api/barber/leaves/:leaveId
  deleteLeave: async (leaveId) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found.',
      };
    }

    set({
      leaveDeletingId: leaveId,
      leaveError: null,
    });

    try {
      const res = await barberService.deleteLeave(
        leaveId,
        token
      );

      set((state) => ({
        leaves: state.leaves.filter(
          (leave) => leave._id !== leaveId
        ),
      }));

      return {
        success: true,
        message: res.message,
      };
    } catch (error) {
      const message = getError(
        error,
        'Unable to remove leave.'
      );

      set({ leaveError: message });

      return {
        success: false,
        error: message,
      };
    } finally {
      set({ leaveDeletingId: null });
    }
  },

  // Clear leave error
  clearLeaveError: () => {
    set({ leaveError: null });
  },

  // Clear schedule errors
  clearScheduleError: () => {
    set({ scheduleError: null });
  },

  clearScheduleRequestError: () => {
    set({ scheduleRequestError: null });
  },

  // Reset store
  reset: () =>
    set({
      appointments: [],
      stats: EMPTY_STATS,
      isAvailable: true,
      dashboardLoading: false,
      dailyTimeline: null,
      timelineLoading: false,
      timelineError: null,
      schedule: [],
      scheduleLoading: false,
      scheduleError: null,

      scheduleRequests: [],
      // Temporary leave state
      leaves: [],
      leavesLoading: false,
      leaveSubmitting: false,
      leaveDeletingId: null,
      leaveError: null,
      scheduleRequestsLoading: false,
      scheduleRequestSubmitting: false,
      scheduleRequestError: null,
    }),
}));

// Calculate dashboard stats
const computeStats = (appointments) => {
  const completed = appointments.filter(
    (a) => a.status === 'COMPLETED'
  );

  return {
    total: appointments.length,
    completed: completed.length,
    earnings: completed.reduce(
      (sum, a) => sum + (a.price || 0),
      0
    ),
    weekly: [],
  };
};

export default useBarberStore;
