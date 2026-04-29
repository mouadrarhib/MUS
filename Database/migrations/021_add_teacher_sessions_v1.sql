-- ============================================================================
-- 021_add_teacher_sessions_v1.sql
-- Teacher 1:1 booking sessions (slots, bookings, messages) - v1
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.teacher_availability_slots (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT teacher_availability_slots_time_check CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_teacher_slots_teacher_start
  ON public.teacher_availability_slots(teacher_id, start_at);

CREATE INDEX IF NOT EXISTS idx_teacher_slots_bookable
  ON public.teacher_availability_slots(is_active, start_at)
  WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.teacher_session_bookings (
  id BIGSERIAL PRIMARY KEY,
  slot_id BIGINT NOT NULL REFERENCES public.teacher_availability_slots(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ NULL,
  cancelled_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  cancel_reason TEXT NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT teacher_session_bookings_status_check CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  CONSTRAINT teacher_session_bookings_teacher_student_diff CHECK (teacher_id <> student_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_bookings_teacher_status
  ON public.teacher_session_bookings(teacher_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_teacher_bookings_student_status
  ON public.teacher_session_bookings(student_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_teacher_session_bookings_slot_confirmed
  ON public.teacher_session_bookings(slot_id)
  WHERE status = 'confirmed';

CREATE TABLE IF NOT EXISTS public.teacher_session_messages (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.teacher_session_bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT teacher_session_messages_body_check CHECK (length(btrim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_teacher_session_messages_booking_created
  ON public.teacher_session_messages(booking_id, created_at ASC);

CREATE OR REPLACE FUNCTION public.sp_teacher_session_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_teacher_availability_slots_set_updated_at ON public.teacher_availability_slots;
CREATE TRIGGER trg_teacher_availability_slots_set_updated_at
BEFORE UPDATE ON public.teacher_availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.sp_teacher_session_set_updated_at();

DROP TRIGGER IF EXISTS trg_teacher_session_bookings_set_updated_at ON public.teacher_session_bookings;
CREATE TRIGGER trg_teacher_session_bookings_set_updated_at
BEFORE UPDATE ON public.teacher_session_bookings
FOR EACH ROW
EXECUTE FUNCTION public.sp_teacher_session_set_updated_at();

CREATE OR REPLACE FUNCTION public.sp_teacher_slot_create(
  p_teacher_id UUID,
  p_start_at TIMESTAMPTZ,
  p_end_at TIMESTAMPTZ,
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  IF p_start_at IS NULL OR p_end_at IS NULL THEN
    RAISE EXCEPTION 'start_at and end_at are required';
  END IF;

  IF p_end_at <= p_start_at THEN
    RAISE EXCEPTION 'end_at must be after start_at';
  END IF;

  RETURN QUERY
  INSERT INTO public.teacher_availability_slots (teacher_id, start_at, end_at, timezone)
  VALUES (p_teacher_id, p_start_at, p_end_at, COALESCE(NULLIF(btrim(p_timezone), ''), 'UTC'))
  RETURNING
    teacher_availability_slots.id,
    teacher_availability_slots.teacher_id,
    teacher_availability_slots.start_at,
    teacher_availability_slots.end_at,
    teacher_availability_slots.timezone,
    teacher_availability_slots.is_active,
    teacher_availability_slots.created_at,
    teacher_availability_slots.updated_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_slot_update(
  p_slot_id BIGINT,
  p_teacher_id UUID,
  p_start_at TIMESTAMPTZ,
  p_end_at TIMESTAMPTZ,
  p_timezone TEXT,
  p_is_active BOOLEAN
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.teacher_availability_slots s
  SET
    start_at = COALESCE(p_start_at, s.start_at),
    end_at = COALESCE(p_end_at, s.end_at),
    timezone = COALESCE(NULLIF(btrim(p_timezone), ''), s.timezone),
    is_active = COALESCE(p_is_active, s.is_active)
  WHERE s.id = p_slot_id
    AND s.teacher_id = p_teacher_id
  RETURNING s.id, s.teacher_id, s.start_at, s.end_at, s.timezone, s.is_active, s.created_at, s.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found for teacher';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.teacher_availability_slots s2
    WHERE s2.id = p_slot_id
      AND s2.end_at <= s2.start_at
  ) THEN
    RAISE EXCEPTION 'end_at must be after start_at';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_slot_delete(
  p_slot_id BIGINT,
  p_teacher_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM public.teacher_availability_slots s
  WHERE s.id = p_slot_id
    AND s.teacher_id = p_teacher_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found for teacher';
  END IF;

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_slot_get_by_teacher(
  p_teacher_id UUID,
  p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_booked BOOLEAN
)
LANGUAGE sql
AS $function$
  SELECT
    s.id,
    s.teacher_id,
    s.start_at,
    s.end_at,
    s.timezone,
    s.is_active,
    s.created_at,
    s.updated_at,
    EXISTS (
      SELECT 1
      FROM public.teacher_session_bookings b
      WHERE b.slot_id = s.id
        AND b.status = 'confirmed'
    ) AS is_booked
  FROM public.teacher_availability_slots s
  WHERE s.teacher_id = p_teacher_id
    AND (p_include_inactive = TRUE OR s.is_active = TRUE)
  ORDER BY s.start_at ASC;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_slot_get_bookable(
  p_teacher_id UUID DEFAULT NULL,
  p_start_from TIMESTAMPTZ DEFAULT NOW(),
  p_limit_value INTEGER DEFAULT 50,
  p_offset_value INTEGER DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  teacher_name TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  is_active BOOLEAN
)
LANGUAGE sql
AS $function$
  SELECT
    s.id,
    s.teacher_id,
    u.full_name AS teacher_name,
    s.start_at,
    s.end_at,
    s.timezone,
    s.is_active
  FROM public.teacher_availability_slots s
  INNER JOIN public.users u ON u.id = s.teacher_id
  WHERE s.is_active = TRUE
    AND s.start_at >= COALESCE(p_start_from, NOW())
    AND (p_teacher_id IS NULL OR s.teacher_id = p_teacher_id)
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      INNER JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = s.teacher_id
        AND lower(r.name) = 'teacher'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.teacher_session_bookings b
      WHERE b.slot_id = s.id
        AND b.status = 'confirmed'
    )
  ORDER BY s.start_at ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 50), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_book(
  p_slot_id BIGINT,
  p_student_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  slot_id BIGINT,
  teacher_id UUID,
  student_id UUID,
  status TEXT,
  booked_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_slot RECORD;
BEGIN
  SELECT s.*
  INTO v_slot
  FROM public.teacher_availability_slots s
  WHERE s.id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  IF v_slot.is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Slot is not active';
  END IF;

  IF v_slot.start_at < NOW() THEN
    RAISE EXCEPTION 'Cannot book a past slot';
  END IF;

  IF v_slot.teacher_id = p_student_id THEN
    RAISE EXCEPTION 'Teacher cannot book own slot';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.teacher_session_bookings b
    WHERE b.slot_id = v_slot.id
      AND b.status = 'confirmed'
  ) THEN
    RAISE EXCEPTION 'Slot already booked';
  END IF;

  RETURN QUERY
  INSERT INTO public.teacher_session_bookings (
    slot_id,
    teacher_id,
    student_id,
    status,
    cancel_reason
  )
  VALUES (
    v_slot.id,
    v_slot.teacher_id,
    p_student_id,
    'confirmed',
    NULLIF(btrim(p_note), '')
  )
  RETURNING
    teacher_session_bookings.id,
    teacher_session_bookings.slot_id,
    teacher_session_bookings.teacher_id,
    teacher_session_bookings.student_id,
    teacher_session_bookings.status,
    teacher_session_bookings.booked_at,
    teacher_session_bookings.cancel_reason,
    teacher_session_bookings.created_at,
    teacher_session_bookings.updated_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_get_for_student(
  p_student_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit_value INTEGER DEFAULT 50,
  p_offset_value INTEGER DEFAULT 0
)
RETURNS TABLE(
  booking_id BIGINT,
  slot_id BIGINT,
  teacher_id UUID,
  teacher_name TEXT,
  student_id UUID,
  status TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  booked_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
AS $function$
  SELECT
    b.id AS booking_id,
    b.slot_id,
    b.teacher_id,
    t.full_name AS teacher_name,
    b.student_id,
    b.status,
    s.start_at,
    s.end_at,
    s.timezone,
    b.booked_at,
    b.cancelled_at,
    b.completed_at,
    b.created_at,
    b.updated_at
  FROM public.teacher_session_bookings b
  INNER JOIN public.teacher_availability_slots s ON s.id = b.slot_id
  INNER JOIN public.users t ON t.id = b.teacher_id
  WHERE b.student_id = p_student_id
    AND (p_status IS NULL OR b.status = p_status)
  ORDER BY s.start_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 50), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_get_for_teacher(
  p_teacher_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit_value INTEGER DEFAULT 50,
  p_offset_value INTEGER DEFAULT 0
)
RETURNS TABLE(
  booking_id BIGINT,
  slot_id BIGINT,
  teacher_id UUID,
  student_id UUID,
  student_name TEXT,
  status TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  booked_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
AS $function$
  SELECT
    b.id AS booking_id,
    b.slot_id,
    b.teacher_id,
    b.student_id,
    u.full_name AS student_name,
    b.status,
    s.start_at,
    s.end_at,
    s.timezone,
    b.booked_at,
    b.cancelled_at,
    b.completed_at,
    b.created_at,
    b.updated_at
  FROM public.teacher_session_bookings b
  INNER JOIN public.teacher_availability_slots s ON s.id = b.slot_id
  INNER JOIN public.users u ON u.id = b.student_id
  WHERE b.teacher_id = p_teacher_id
    AND (p_status IS NULL OR b.status = p_status)
  ORDER BY s.start_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 50), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_get_by_id(
  p_booking_id BIGINT
)
RETURNS TABLE(
  booking_id BIGINT,
  slot_id BIGINT,
  teacher_id UUID,
  teacher_name TEXT,
  student_id UUID,
  student_name TEXT,
  status TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT,
  booked_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
AS $function$
  SELECT
    b.id AS booking_id,
    b.slot_id,
    b.teacher_id,
    t.full_name AS teacher_name,
    b.student_id,
    s2.full_name AS student_name,
    b.status,
    s.start_at,
    s.end_at,
    s.timezone,
    b.booked_at,
    b.cancelled_at,
    b.completed_at,
    b.cancel_reason,
    b.created_at,
    b.updated_at
  FROM public.teacher_session_bookings b
  INNER JOIN public.teacher_availability_slots s ON s.id = b.slot_id
  INNER JOIN public.users t ON t.id = b.teacher_id
  INNER JOIN public.users s2 ON s2.id = b.student_id
  WHERE b.id = p_booking_id
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_cancel(
  p_booking_id BIGINT,
  p_actor_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  slot_id BIGINT,
  teacher_id UUID,
  student_id UUID,
  status TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancel_reason TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.teacher_session_bookings b
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    cancelled_by = p_actor_user_id,
    cancel_reason = NULLIF(btrim(p_reason), '')
  WHERE b.id = p_booking_id
    AND b.status = 'confirmed'
  RETURNING b.id, b.slot_id, b.teacher_id, b.student_id, b.status, b.cancelled_at, b.cancelled_by, b.cancel_reason, b.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not cancellable';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_complete(
  p_booking_id BIGINT
)
RETURNS TABLE(
  id BIGINT,
  slot_id BIGINT,
  teacher_id UUID,
  student_id UUID,
  status TEXT,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.teacher_session_bookings b
  SET
    status = 'completed',
    completed_at = NOW()
  WHERE b.id = p_booking_id
    AND b.status = 'confirmed'
  RETURNING b.id, b.slot_id, b.teacher_id, b.student_id, b.status, b.completed_at, b.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not completable';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_message_add(
  p_booking_id BIGINT,
  p_sender_id UUID,
  p_body TEXT
)
RETURNS TABLE(
  id BIGINT,
  booking_id BIGINT,
  sender_id UUID,
  body TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  IF p_body IS NULL OR length(btrim(p_body)) = 0 THEN
    RAISE EXCEPTION 'Message body is required';
  END IF;

  RETURN QUERY
  INSERT INTO public.teacher_session_messages (booking_id, sender_id, body)
  VALUES (p_booking_id, p_sender_id, btrim(p_body))
  RETURNING
    teacher_session_messages.id,
    teacher_session_messages.booking_id,
    teacher_session_messages.sender_id,
    teacher_session_messages.body,
    teacher_session_messages.created_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_teacher_session_message_get(
  p_booking_id BIGINT,
  p_limit_value INTEGER DEFAULT 100,
  p_offset_value INTEGER DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  booking_id BIGINT,
  sender_id UUID,
  sender_name TEXT,
  body TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
AS $function$
  SELECT
    m.id,
    m.booking_id,
    m.sender_id,
    u.full_name AS sender_name,
    m.body,
    m.created_at
  FROM public.teacher_session_messages m
  INNER JOIN public.users u ON u.id = m.sender_id
  WHERE m.booking_id = p_booking_id
  ORDER BY m.created_at ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 100), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
$function$;

COMMIT;
