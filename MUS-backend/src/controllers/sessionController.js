import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  addSessionMessage,
  cancelSessionBooking,
  completeSessionBooking,
  createSessionBooking,
  createTeacherSlot,
  deleteTeacherSlot,
  getSessionBookingById,
  listBookableSlots,
  listMySessionBookings,
  listSessionMessages,
  listTeacherSlots,
  updateTeacherSlot,
} from "../services/sessionService.js";

export const listBookableSlotsHandler = asyncHandler(async (req, res) => {
  const { teacher_id, start_from, limit = 50, offset = 0 } = req.query;
  const data = await listBookableSlots({
    teacherId: teacher_id || null,
    startFrom: start_from || null,
    limit: Number(limit),
    offset: Number(offset),
  });
  return successResponse(res, "Bookable slots retrieved successfully", data);
});

export const listTeacherSlotsHandler = asyncHandler(async (req, res) => {
  const { include_inactive = "true" } = req.query;
  const data = await listTeacherSlots({
    actor: req.user,
    includeInactive: String(include_inactive).toLowerCase() === "true",
  });
  return successResponse(res, "Teacher slots retrieved successfully", data);
});

export const createTeacherSlotHandler = asyncHandler(async (req, res) => {
  const { start_at, end_at, timezone } = req.body;
  const data = await createTeacherSlot({
    actor: req.user,
    startAt: start_at,
    endAt: end_at,
    timezone,
  });
  return successResponse(res, "Teacher slot created successfully", data, 201);
});

export const updateTeacherSlotHandler = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const { start_at, end_at, timezone, is_active } = req.body;
  const data = await updateTeacherSlot({
    actor: req.user,
    slotId: Number(slotId),
    startAt: start_at,
    endAt: end_at,
    timezone,
    isActive: is_active,
  });
  return successResponse(res, "Teacher slot updated successfully", data);
});

export const deleteTeacherSlotHandler = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  await deleteTeacherSlot({
    actor: req.user,
    slotId: Number(slotId),
  });
  return successResponse(res, "Teacher slot deleted successfully");
});

export const createSessionBookingHandler = asyncHandler(async (req, res) => {
  const { slot_id, note } = req.body;
  const data = await createSessionBooking({
    actor: req.user,
    slotId: Number(slot_id),
    note,
  });
  return successResponse(res, "Session booked successfully", data, 201);
});

export const listMySessionBookingsHandler = asyncHandler(async (req, res) => {
  const { status = null, limit = 50, offset = 0 } = req.query;
  const data = await listMySessionBookings({
    actor: req.user,
    status,
    limit: Number(limit),
    offset: Number(offset),
  });
  return successResponse(res, "Session bookings retrieved successfully", data);
});

export const getSessionBookingByIdHandler = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const data = await getSessionBookingById({
    actor: req.user,
    bookingId: Number(bookingId),
  });
  return successResponse(res, "Session booking retrieved successfully", data);
});

export const cancelSessionBookingHandler = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;
  const data = await cancelSessionBooking({
    actor: req.user,
    bookingId: Number(bookingId),
    reason,
  });
  return successResponse(res, "Session booking cancelled successfully", data);
});

export const completeSessionBookingHandler = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const data = await completeSessionBooking({
    actor: req.user,
    bookingId: Number(bookingId),
  });
  return successResponse(res, "Session booking completed successfully", data);
});

export const listSessionMessagesHandler = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  const data = await listSessionMessages({
    actor: req.user,
    bookingId: Number(bookingId),
    limit: Number(limit),
    offset: Number(offset),
  });
  return successResponse(res, "Session messages retrieved successfully", data);
});

export const addSessionMessageHandler = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { body } = req.body;
  const data = await addSessionMessage({
    actor: req.user,
    bookingId: Number(bookingId),
    body,
  });
  return successResponse(res, "Session message sent successfully", data, 201);
});
