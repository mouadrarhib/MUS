import { del, get, patch, post } from "@/services/http";

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

  listTeacherSlots: async ({ includeInactive = true } = {}) => {
    const response = await get("/sessions/teacher/slots", {
      params: {
        include_inactive: includeInactive,
      },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  createTeacherSlot: async ({ start_at, end_at, timezone = "UTC" }) => {
    const response = await post("/sessions/teacher/slots", { start_at, end_at, timezone });
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

  createBooking: async ({ slot_id, note }) => {
    const response = await post("/sessions/bookings", { slot_id, note });
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
