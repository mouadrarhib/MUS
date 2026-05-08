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

const isContributorStudent = async (userId) => {
  const [rows] = await sequelize.query(
    `
    SELECT contribution_mode
    FROM public.student_profiles
    WHERE user_id = :user_id
    LIMIT 1
    `,
    { replacements: { user_id: userId } }
  );

  const mode = String(rows?.[0]?.contribution_mode || "").trim().toLowerCase();
  return mode === "contributor";
};

const requireTutor = async (user) => {
  if (!user?.id) throw new AppError("Authentification requise", 401);
  if (hasRole(user, "teacher") || hasRole(user, "admin")) return;
  if (hasRole(user, "student") && (await isContributorStudent(user.id))) return;
  throw new AppError("Acces refuse", 403);
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
  if (message.includes("duplicate key value") && message.includes("ux_teacher_session_bookings_slot_confirmed")) {
    return new AppError("Slot already booked", 409);
  }
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

const DURATION_MINUTES = [30, 60, 90, 120];
const PLATFORM_FEE_FIXED = 2;

const buildPricingTiers = (baseRatePerHour, currency = "USD") => {
  const base = Number(baseRatePerHour || 0);
  return DURATION_MINUTES.map((duration) => {
    const sessionAmount = Number(((base * duration) / 60).toFixed(2));
    const totalAmount = Number((sessionAmount + PLATFORM_FEE_FIXED).toFixed(2));
    return {
      duration_minutes: duration,
      session_amount: sessionAmount,
      platform_fee: PLATFORM_FEE_FIXED,
      total_amount: totalAmount,
      currency,
    };
  });
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

export const getTutorPricingProfile = async ({ tutorId }) => {
  try {
    const [rows] = await sequelize.query(
      `
      SELECT user_id, base_rate_per_hour, currency, is_active, updated_at
      FROM public.tutor_pricing_profiles
      WHERE user_id = :user_id
      LIMIT 1
      `,
      { replacements: { user_id: tutorId } }
    );

    const row = rows?.[0] || null;
    const baseRatePerHour = Number(row?.base_rate_per_hour || 25);
    const currency = String(row?.currency || "USD").toUpperCase();
    const isActive = row?.is_active !== false;

    return {
      tutor_id: tutorId,
      base_rate_per_hour: baseRatePerHour,
      currency,
      is_active: isActive,
      durations_supported: DURATION_MINUTES,
      pricing_tiers: buildPricingTiers(baseRatePerHour, currency),
      updated_at: row?.updated_at || null,
    };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("relation") && message.includes("tutor_pricing_profiles")) {
      const fallbackBase = 25;
      const fallbackCurrency = "USD";
      return {
        tutor_id: tutorId,
        base_rate_per_hour: fallbackBase,
        currency: fallbackCurrency,
        is_active: true,
        durations_supported: DURATION_MINUTES,
        pricing_tiers: buildPricingTiers(fallbackBase, fallbackCurrency),
        updated_at: null,
      };
    }
    throw error;
  }
};

export const upsertMyTutorPricingProfile = async ({ actor, baseRatePerHour, currency = "USD", isActive = true }) => {
  await requireTutor(actor);

  const safeBaseRate = Number(baseRatePerHour);
  if (!Number.isFinite(safeBaseRate) || safeBaseRate < 0) {
    throw new AppError("base_rate_per_hour must be a non-negative number", 400);
  }

  const safeCurrency = String(currency || "USD").trim().toUpperCase();
  if (safeCurrency.length < 3 || safeCurrency.length > 8) {
    throw new AppError("currency must be 3-8 characters", 400);
  }

  const [rows] = await sequelize.query(
    `
    INSERT INTO public.tutor_pricing_profiles (user_id, base_rate_per_hour, currency, is_active)
    VALUES (:user_id, :base_rate_per_hour, :currency, :is_active)
    ON CONFLICT (user_id)
    DO UPDATE SET
      base_rate_per_hour = EXCLUDED.base_rate_per_hour,
      currency = EXCLUDED.currency,
      is_active = EXCLUDED.is_active,
      updated_at = NOW()
    RETURNING user_id, base_rate_per_hour, currency, is_active, updated_at
    `,
    {
      replacements: {
        user_id: actor.id,
        base_rate_per_hour: safeBaseRate,
        currency: safeCurrency,
        is_active: Boolean(isActive),
      },
    }
  );

  const row = rows?.[0] || null;
  return {
    tutor_id: row?.user_id || actor.id,
    base_rate_per_hour: Number(row?.base_rate_per_hour || safeBaseRate),
    currency: String(row?.currency || safeCurrency).toUpperCase(),
    is_active: row?.is_active !== false,
    durations_supported: DURATION_MINUTES,
    pricing_tiers: buildPricingTiers(Number(row?.base_rate_per_hour || safeBaseRate), String(row?.currency || safeCurrency).toUpperCase()),
    updated_at: row?.updated_at || null,
  };
};

export const listTeacherSlots = async ({ actor, includeInactive = true }) => {
  await requireTutor(actor);
  const [rows] = await sequelize.query(SQL.SESSION.GET_TEACHER_SLOTS, {
    replacements: {
      teacher_id: actor.id,
      include_inactive: includeInactive,
    },
  });
  return rows;
};

export const createTeacherSlot = async ({ actor, startAt, endAt, timezone = "UTC" }) => {
  await requireTutor(actor);
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
  await requireTutor(actor);
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
  await requireTutor(actor);
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

export const createSessionBooking = async ({
  actor,
  slotId,
  note = null,
  durationMinutes = 60,
  sessionMode = "remote",
  subjectModule = null,
  pricingSnapshot = null,
  bookingMetadata = null,
}) => {
  requireStudent(actor);

  const safeDuration = Number(durationMinutes || 60);
  if (![30, 60, 90, 120].includes(safeDuration)) {
    throw new AppError("duration_minutes must be one of 30,60,90,120", 400);
  }

  const safeSessionMode = String(sessionMode || "remote").trim().toLowerCase();
  if (safeSessionMode !== "remote") {
    throw new AppError("session_mode must be remote", 400);
  }

  const safeSubjectModule = subjectModule == null ? null : String(subjectModule).trim().slice(0, 200);

  const safePricingSnapshot = pricingSnapshot && typeof pricingSnapshot === "object"
    ? pricingSnapshot
    : {};
  const safeBookingMetadata = bookingMetadata && typeof bookingMetadata === "object"
    ? bookingMetadata
    : {};

  try {
    const [rows] = await sequelize.query(SQL.SESSION.BOOK_SESSION, {
      replacements: {
        slot_id: slotId,
        student_id: actor.id,
        note,
      },
    });
    let booking = rows[0] || null;
    if (booking?.id) {
      const [metaRows] = await sequelize.query(
        `
        UPDATE public.teacher_session_bookings
        SET
          duration_minutes = :duration_minutes,
          session_mode = :session_mode,
          subject_module = :subject_module,
          pricing_snapshot = CAST(:pricing_snapshot AS jsonb),
          booking_metadata = CAST(:booking_metadata AS jsonb),
          updated_at = NOW()
        WHERE id = :booking_id
        RETURNING *
        `,
        {
          replacements: {
            booking_id: booking.id,
            duration_minutes: safeDuration,
            session_mode: safeSessionMode,
            subject_module: safeSubjectModule,
            pricing_snapshot: JSON.stringify(safePricingSnapshot || {}),
            booking_metadata: JSON.stringify(safeBookingMetadata || {}),
          },
        }
      );
      booking = metaRows?.[0] || booking;
    }

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

  const [teacherRowsResult, studentRowsResult] = await Promise.all([
    sequelize.query(SQL.SESSION.GET_TEACHER_BOOKINGS, {
      replacements: {
        teacher_id: actor.id,
        status,
        limit_value: limit,
        offset_value: offset,
      },
    }),
    sequelize.query(SQL.SESSION.GET_STUDENT_BOOKINGS, {
      replacements: {
        student_id: actor.id,
        status,
        limit_value: limit,
        offset_value: offset,
      },
    }),
  ]);

  const teacherRows = Array.isArray(teacherRowsResult?.[0]) ? teacherRowsResult[0] : [];
  const studentRows = Array.isArray(studentRowsResult?.[0]) ? studentRowsResult[0] : [];

  const merged = [...teacherRows, ...studentRows];
  const seen = new Set();
  const deduped = merged.filter((row) => {
    const bookingId = Number(row?.booking_id || row?.id || 0);
    if (!bookingId || seen.has(bookingId)) return false;
    seen.add(bookingId);
    return true;
  });

  deduped.sort((a, b) => {
    const aTime = new Date(a?.updated_at || a?.start_at || 0).getTime();
    const bTime = new Date(b?.updated_at || b?.start_at || 0).getTime();
    return bTime - aTime;
  });

  const bookingIds = deduped.map((row) => Number(row?.booking_id || row?.id || 0)).filter((id) => id > 0);
  let clearMap = new Map();
  if (bookingIds.length) {
    const [clearRows] = await sequelize.query(
      `
      SELECT booking_id, cleared_at
      FROM public.user_session_inbox_clears
      WHERE user_id = :user_id
        AND booking_id IN (:booking_ids)
      `,
      {
        replacements: {
          user_id: actor.id,
          booking_ids: bookingIds,
        },
      }
    );
    clearMap = new Map(
      (clearRows || []).map((row) => [Number(row.booking_id), new Date(row.cleared_at || 0).getTime()])
    );
  }

  const visible = deduped.filter((row) => {
    const bookingId = Number(row?.booking_id || row?.id || 0);
    const clearedAt = clearMap.get(bookingId);
    if (!clearedAt) return true;
    const rowTime = new Date(row?.updated_at || row?.start_at || 0).getTime();
    return rowTime > clearedAt;
  });

  return visible.slice(0, Math.max(Number(limit) || 50, 1));
};

export const clearSessionInbox = async ({ actor }) => {
  if (!actor?.id) throw new AppError("Authentification requise", 401);

  const [teacherRowsResult, studentRowsResult] = await Promise.all([
    sequelize.query(SQL.SESSION.GET_TEACHER_BOOKINGS, {
      replacements: {
        teacher_id: actor.id,
        status: null,
        limit_value: 500,
        offset_value: 0,
      },
    }),
    sequelize.query(SQL.SESSION.GET_STUDENT_BOOKINGS, {
      replacements: {
        student_id: actor.id,
        status: null,
        limit_value: 500,
        offset_value: 0,
      },
    }),
  ]);

  const teacherRows = Array.isArray(teacherRowsResult?.[0]) ? teacherRowsResult[0] : [];
  const studentRows = Array.isArray(studentRowsResult?.[0]) ? studentRowsResult[0] : [];
  const merged = [...teacherRows, ...studentRows];

  const bookingIds = Array.from(new Set(
    merged
      .map((row) => Number(row?.booking_id || row?.id || 0))
      .filter((id) => id > 0)
  ));

  if (!bookingIds.length) {
    return { cleared_count: 0 };
  }

  const nowIso = new Date().toISOString();
  await Promise.all(
    bookingIds.map((bookingId) =>
      sequelize.query(
        `
        INSERT INTO public.user_session_inbox_clears (user_id, booking_id, cleared_at, updated_at)
        VALUES (:user_id, :booking_id, :cleared_at, NOW())
        ON CONFLICT (user_id, booking_id)
        DO UPDATE SET cleared_at = EXCLUDED.cleared_at, updated_at = NOW()
        `,
        {
          replacements: {
            user_id: actor.id,
            booking_id: bookingId,
            cleared_at: nowIso,
          },
        }
      )
    )
  );

  return { cleared_count: bookingIds.length };
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
