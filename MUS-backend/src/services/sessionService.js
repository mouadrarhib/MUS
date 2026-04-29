import AppError from "../helpers/appError.js";
import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import { createNotificationsBulk } from "./notificationService.js";

const SESSION_NOTIFICATION_TYPES = {
  BOOKING_CREATED: "SESSION_BOOKING_CREATED",
  BOOKING_CANCELLED: "SESSION_BOOKING_CANCELLED",
  MESSAGE_CREATED: "SESSION_MESSAGE_CREATED",
};

const hasRole = (user, role) => (user?.roles || []).includes(role);

const requireTeacher = (user) => {
  if (!user?.id) throw new AppError("Authentification requise", 401);
  if (!hasRole(user, "teacher")) throw new AppError("Acces refuse", 403);
};

const requireStudent = (user) => {
  if (!user?.id) throw new AppError("Authentification requise", 401);
  if (!hasRole(user, "student")) throw new AppError("Acces refuse", 403);
};

const ensureBookingParticipant = (booking, user) => {
  const isAdmin = hasRole(user, "admin");
  if (isAdmin) return;
  if (!booking) throw new AppError("Session introuvable", 404);
  const isParticipant = booking.teacher_id === user?.id || booking.student_id === user?.id;
  if (!isParticipant) throw new AppError("Acces refuse", 403);
};

const normalizeDbError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("slot already booked")) return new AppError("Slot already booked", 409);
  if (message.includes("cannot book a past slot")) return new AppError("Cannot book a past slot", 400);
  if (message.includes("slot is not active")) return new AppError("Slot is not active", 400);
  if (message.includes("slot not found for teacher")) return new AppError("Slot not found", 404);
  if (message.includes("slot not found")) return new AppError("Slot not found", 404);
  if (message.includes("booking not found or not cancellable")) return new AppError("Booking not cancellable", 400);
  if (message.includes("booking not found or not completable")) return new AppError("Booking not completable", 400);
  if (message.includes("message body is required")) return new AppError("Message body is required", 400);
  if (message.includes("end_at must be after start_at")) return new AppError("end_at must be after start_at", 400);
  return error;
};

const notifySessionParticipants = async ({ actorId, booking, type, title, body, payload = {} }) => {
  try {
    const recipients = [booking?.teacher_id, booking?.student_id].filter(
      (userId) => Boolean(userId) && userId !== actorId
    );
    if (!recipients.length) return;

    await createNotificationsBulk(
      recipients.map((recipientUserId) => ({
        recipientUserId,
        type,
        title,
        body,
        payload,
      }))
    );
  } catch (_error) {
    // best effort notifications
  }
};

export const listBookableSlots = async ({ teacherId = null, startFrom = null, limit = 50, offset = 0 }) => {
  const [rows] = await sequelize.query(SQL.SESSION.GET_BOOKABLE_TEACHER_SLOTS, {
    replacements: {
      teacher_id: teacherId,
      start_from: startFrom,
      limit_value: limit,
      offset_value: offset,
    },
  });
  return rows;
};

export const listTeacherSlots = async ({ actor, includeInactive = true }) => {
  requireTeacher(actor);
  const [rows] = await sequelize.query(SQL.SESSION.GET_TEACHER_SLOTS, {
    replacements: {
      teacher_id: actor.id,
      include_inactive: includeInactive,
    },
  });
  return rows;
};

export const createTeacherSlot = async ({ actor, startAt, endAt, timezone = "UTC" }) => {
  requireTeacher(actor);
  try {
    const [rows] = await sequelize.query(SQL.SESSION.CREATE_TEACHER_SLOT, {
      replacements: {
        teacher_id: actor.id,
        start_at: startAt,
        end_at: endAt,
        timezone,
      },
    });
    return rows[0] || null;
  } catch (error) {
    throw normalizeDbError(error);
  }
};

export const updateTeacherSlot = async ({ actor, slotId, startAt = null, endAt = null, timezone = null, isActive = null }) => {
  requireTeacher(actor);
  try {
    const [rows] = await sequelize.query(SQL.SESSION.UPDATE_TEACHER_SLOT, {
      replacements: {
        slot_id: slotId,
        teacher_id: actor.id,
        start_at: startAt,
        end_at: endAt,
        timezone,
        is_active: typeof isActive === "boolean" ? isActive : null,
      },
    });
    return rows[0] || null;
  } catch (error) {
    throw normalizeDbError(error);
  }
};

export const deleteTeacherSlot = async ({ actor, slotId }) => {
  requireTeacher(actor);
  try {
    const [rows] = await sequelize.query(SQL.SESSION.DELETE_TEACHER_SLOT, {
      replacements: {
        slot_id: slotId,
        teacher_id: actor.id,
      },
    });
    return Boolean(rows?.[0]?.deleted);
  } catch (error) {
    throw normalizeDbError(error);
  }
};

export const createSessionBooking = async ({ actor, slotId, note = null }) => {
  requireStudent(actor);
  try {
    const [rows] = await sequelize.query(SQL.SESSION.BOOK_SESSION, {
      replacements: {
        slot_id: slotId,
        student_id: actor.id,
        note,
      },
    });
    const booking = rows[0] || null;
    if (booking) {
      await notifySessionParticipants({
        actorId: actor.id,
        booking,
        type: SESSION_NOTIFICATION_TYPES.BOOKING_CREATED,
        title: "New session booking",
        body: "A student booked one of your available session slots.",
        payload: { booking_id: booking.id, slot_id: booking.slot_id, action: "booking_created" },
      });
    }
    return booking;
  } catch (error) {
    throw normalizeDbError(error);
  }
};

export const listMySessionBookings = async ({ actor, status = null, limit = 50, offset = 0 }) => {
  if (!actor?.id) throw new AppError("Authentification requise", 401);

  if (hasRole(actor, "teacher")) {
    const [rows] = await sequelize.query(SQL.SESSION.GET_TEACHER_BOOKINGS, {
      replacements: {
        teacher_id: actor.id,
        status,
        limit_value: limit,
        offset_value: offset,
      },
    });
    return rows;
  }

  if (hasRole(actor, "student")) {
    const [rows] = await sequelize.query(SQL.SESSION.GET_STUDENT_BOOKINGS, {
      replacements: {
        student_id: actor.id,
        status,
        limit_value: limit,
        offset_value: offset,
      },
    });
    return rows;
  }

  throw new AppError("Acces refuse", 403);
};

export const getSessionBookingById = async ({ actor, bookingId }) => {
  if (!actor?.id) throw new AppError("Authentification requise", 401);
  const [rows] = await sequelize.query(SQL.SESSION.GET_BOOKING_BY_ID, {
    replacements: { booking_id: bookingId },
  });
  const booking = rows[0] || null;
  ensureBookingParticipant(booking, actor);
  return booking;
};

export const cancelSessionBooking = async ({ actor, bookingId, reason = null }) => {
  const booking = await getSessionBookingById({ actor, bookingId });
  ensureBookingParticipant(booking, actor);

  try {
    const [rows] = await sequelize.query(SQL.SESSION.CANCEL_BOOKING, {
      replacements: {
        booking_id: bookingId,
        actor_user_id: actor.id,
        reason,
      },
    });

    const cancelled = rows[0] || null;
    if (cancelled) {
      await notifySessionParticipants({
        actorId: actor.id,
        booking,
        type: SESSION_NOTIFICATION_TYPES.BOOKING_CANCELLED,
        title: "Session booking cancelled",
        body: "A session booking has been cancelled.",
        payload: { booking_id: bookingId, action: "booking_cancelled", reason: reason || null },
      });
    }
    return cancelled;
  } catch (error) {
    throw normalizeDbError(error);
  }
};

export const completeSessionBooking = async ({ actor, bookingId }) => {
  requireTeacher(actor);
  const booking = await getSessionBookingById({ actor, bookingId });
  if (booking.teacher_id !== actor.id && !hasRole(actor, "admin")) {
    throw new AppError("Acces refuse", 403);
  }

  try {
    const [rows] = await sequelize.query(SQL.SESSION.COMPLETE_BOOKING, {
      replacements: { booking_id: bookingId },
    });
    return rows[0] || null;
  } catch (error) {
    throw normalizeDbError(error);
  }
};

export const listSessionMessages = async ({ actor, bookingId, limit = 100, offset = 0 }) => {
  await getSessionBookingById({ actor, bookingId });
  const [rows] = await sequelize.query(SQL.SESSION.GET_MESSAGES, {
    replacements: {
      booking_id: bookingId,
      limit_value: limit,
      offset_value: offset,
    },
  });
  return rows;
};

export const addSessionMessage = async ({ actor, bookingId, body }) => {
  const booking = await getSessionBookingById({ actor, bookingId });
  try {
    const [rows] = await sequelize.query(SQL.SESSION.ADD_MESSAGE, {
      replacements: {
        booking_id: bookingId,
        sender_id: actor.id,
        body,
      },
    });
    const message = rows[0] || null;
    if (message) {
      await notifySessionParticipants({
        actorId: actor.id,
        booking,
        type: SESSION_NOTIFICATION_TYPES.MESSAGE_CREATED,
        title: "New session message",
        body: "You received a new message in your booked session.",
        payload: { booking_id: bookingId, message_id: message.id, action: "message_created" },
      });
    }
    return message;
  } catch (error) {
    throw normalizeDbError(error);
  }
};
