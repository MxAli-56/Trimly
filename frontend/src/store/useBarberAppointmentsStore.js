import { create } from 'zustand';

/*
 * PLACEHOLDER STORE: uses mock data until the backend endpoints exist.
 * Replace each TODO with a real call in services/BarberService.js.
 *
 *   TODO list     -> GET   /barber/appointments?status=upcoming|completed   (not built)
 *   TODO confirm  -> PATCH /bookings/:id/accept                             (exists)
 *   TODO start    -> PATCH /bookings/:id/start                              (not built)
 *   TODO complete -> PATCH /bookings/:id/complete                           (not built)
 *
 * The list items use the same shape as useBarberStore's normalized bookings:
 * { _id, startTime (ISO), durationMinutes, status, customer, service, price }
 */

const at = (hours, minutes, dayOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const MOCK_APPOINTMENTS = [
  {
    _id: 'a1',
    startTime: at(11, 0),
    durationMinutes: 45,
    status: 'CONFIRMED',
    customer: { name: 'Hamza Malik', profilePhoto: null },
    service: { name: 'Skin Fade & Beard Trim' },
    price: 1800,
  },
  {
    _id: 'a2',
    startTime: at(12, 30),
    durationMinutes: 30,
    status: 'CONFIRMED',
    customer: { name: 'Usman Sheikh', profilePhoto: null },
    service: { name: 'Classic Haircut' },
    price: 1200,
  },
  {
    _id: 'a3',
    startTime: at(14, 30),
    durationMinutes: 30,
    status: 'PENDING_BARBER_APPROVAL',
    customer: { name: 'Danish Raza', profilePhoto: null },
    service: { name: 'Hot Towel Shave' },
    price: 900,
  },
  {
    _id: 'a4',
    startTime: at(16, 0),
    durationMinutes: 45,
    status: 'PENDING_BARBER_APPROVAL',
    customer: { name: 'Saad Qureshi', profilePhoto: null },
    service: { name: 'Hair Cut' },
    price: 1000,
  },
  {
    _id: 'a5',
    startTime: at(10, 0, -1),
    durationMinutes: 30,
    status: 'COMPLETED',
    customer: { name: 'Bilal Ahmed', profilePhoto: null },
    service: { name: 'Beard Trim' },
    price: 700,
  },
  {
    _id: 'a6',
    startTime: at(15, 0, -2),
    durationMinutes: 45,
    status: 'COMPLETED',
    customer: { name: 'Faisal Khan', profilePhoto: null },
    service: { name: 'Haircut & Beard' },
    price: 1900,
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const useBarberAppointmentsStore = create((set, get) => ({
  appointments: [],
  loading: false,
  actionId: null, // id of the booking an action is running on

  // TODO: replace with GET /barber/appointments
  fetchAppointments: async () => {
    set({ loading: true });
    await delay(500);
    set({ appointments: MOCK_APPOINTMENTS, loading: false });
    return { success: true };
  },

  _setStatus: (id, status) =>
    set((state) => ({
      appointments: state.appointments.map((a) => (a._id === id ? { ...a, status } : a)),
    })),

  // TODO: PATCH /bookings/:id/accept  (customer then pays the deposit)
  confirmAppointment: async (id) => {
    set({ actionId: id });
    await delay(400);
    get()._setStatus(id, 'ACCEPTED');
    set({ actionId: null });
    return { success: true };
  },

  // TODO: PATCH /bookings/:id/start
  startService: async (id) => {
    set({ actionId: id });
    await delay(400);
    get()._setStatus(id, 'IN_PROGRESS');
    set({ actionId: null });
    return { success: true };
  },

  // TODO: PATCH /bookings/:id/complete
  completeService: async (id) => {
    set({ actionId: id });
    await delay(400);
    get()._setStatus(id, 'COMPLETED');
    set({ actionId: null });
    return { success: true };
  },
}));

export default useBarberAppointmentsStore;
