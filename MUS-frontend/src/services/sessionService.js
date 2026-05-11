import { del, get, patch, post, put } from "@/services/http";

const sessionService = {
  listBookableSlots: async ({ teacherId, startFrom, limit = 80, offset = 0 } = {}) => {
    const response = await get("/sessions/slots", {
      params: {
        teacher_id: teacherId || undefined,
        start_from: startFrom || undefined,
        limit,
        offset,
      },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  getTutorPricingProfile: async (tutorId) => {
    const response = await get(`/sessions/tutors/${tutorId}/pricing`);
    return response?.data || null;
  },

  upsertMyTutorPricingProfile: async ({ base_rate_per_hour, currency = "USD", is_active = true }) => {
    const response = await put('/sessions/tutors/me/pricing', {
      base_rate_per_hour,
      currency,
      is_active,
    });
    return response?.data || null;
  },

  listTeacherSlots: async ({ includeInactive = true } = {}) => {
    const response = await get("/sessions/teacher/slots", {
      params: {
        include_inactive: includeInactive,
      },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  createTeacherSlot: async ({ available_date, available_time, duration_minutes, price, timezone = "Africa/Casablanca" }) => {
    const response = await post("/sessions/teacher/slots", {
      available_date,
      available_time,
      duration_minutes,
      price,
      timezone,
    });
    return response?.data || null;
  },

  updateTeacherSlot: async (slotId, payload) => {
    const response = await patch(`/sessions/teacher/slots/${slotId}`, payload);
    return response?.data || null;
  },

  deleteTeacherSlot: async (slotId) => {
    const response = await del(`/sessions/teacher/slots/${slotId}`);
    return response?.data || null;
  },

  createBooking: async ({ slot_id, note, duration_minutes, session_mode, subject_module, pricing_snapshot, booking_metadata }) => {
    const response = await post("/sessions/bookings", {
      slot_id,
      note,
      duration_minutes,
      session_mode,
      subject_module,
      pricing_snapshot,
      booking_metadata,
    });
    return response?.data || null;
  },

  listMyBookings: async ({ status, limit = 80, offset = 0 } = {}) => {
    const response = await get("/sessions/bookings", {
      params: {
        status: status || undefined,
        limit,
        offset,
      },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  clearInbox: async () => {
    const response = await patch('/sessions/bookings/clear');
    return response?.data || { cleared_count: 0 };
  },

  getBookingById: async (bookingId) => {
    const response = await get(`/sessions/bookings/${bookingId}`);
    return response?.data || null;
  },

  cancelBooking: async (bookingId, reason = "") => {
    const response = await patch(`/sessions/bookings/${bookingId}/cancel`, { reason });
    return response?.data || null;
  },

  completeBooking: async (bookingId) => {
    const response = await patch(`/sessions/bookings/${bookingId}/complete`);
    return response?.data || null;
  },

  confirmBooking: async (bookingId) => {
    const response = await patch(`/sessions/bookings/${bookingId}/confirm`);
    return response?.data || null;
  },

  rejectBooking: async (bookingId, reason = "") => {
    const response = await patch(`/sessions/bookings/${bookingId}/reject`, { reason });
    return response?.data || null;
  },

  listMessages: async (bookingId, { limit = 200, offset = 0 } = {}) => {
    const response = await get(`/sessions/bookings/${bookingId}/messages`, {
      params: { limit, offset },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  sendMessage: async (bookingId, body) => {
    const response = await post(`/sessions/bookings/${bookingId}/messages`, { body });
    return response?.data || null;
  },
};

export default sessionService;
