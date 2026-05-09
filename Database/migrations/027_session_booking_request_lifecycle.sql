-- 027_session_booking_request_lifecycle.sql
-- Booking request lifecycle: pending -> confirmed/rejected

-- 1) Extend booking table for request workflow
ALTER TABLE public.teacher_session_bookings
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text NULL,
  ADD COLUMN IF NOT EXISTS confirmed_by uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_by uuid NULL REFERENCES public.users(id) ON DELETE SET NULL;

-- 2) Expand status constraint to include pending + rejected
ALTER TABLE public.teacher_session_bookings
  DROP CONSTRAINT IF EXISTS teacher_session_bookings_status_check;

ALTER TABLE public.teacher_session_bookings
  ADD CONSTRAINT teacher_session_bookings_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'pending'::text,
        'confirmed'::text,
        'rejected'::text,
        'cancelled'::text,
        'completed'::text,
        'no_show'::text
      ]
    )
  );

-- 3) Rework session booking function to create PENDING requests
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

  -- If a confirmed booking already exists, reject new requests.
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
    'pending',
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

-- 4) Tutor confirms one pending request (first-confirm wins)
CREATE OR REPLACE FUNCTION public.sp_teacher_session_confirm(
  p_booking_id BIGINT,
  p_actor_user_id UUID
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
  v_booking RECORD;
BEGIN
  SELECT b.*
  INTO v_booking
  FROM public.teacher_session_bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.teacher_id <> p_actor_user_id THEN
    RAISE EXCEPTION 'Only slot owner can confirm booking';
  END IF;

  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'Booking not pending';
  END IF;

  -- Ensure no other confirmed booking already exists for this slot.
  IF EXISTS (
    SELECT 1
    FROM public.teacher_session_bookings b
    WHERE b.slot_id = v_booking.slot_id
      AND b.status = 'confirmed'
      AND b.id <> v_booking.id
  ) THEN
    RAISE EXCEPTION 'Slot already booked';
  END IF;

  RETURN QUERY
  UPDATE public.teacher_session_bookings b
  SET
    status = 'confirmed',
    confirmed_at = NOW(),
    confirmed_by = p_actor_user_id,
    rejected_at = NULL,
    rejected_by = NULL,
    rejection_reason = NULL,
    updated_at = NOW()
  WHERE b.id = v_booking.id
  RETURNING
    b.id,
    b.slot_id,
    b.teacher_id,
    b.student_id,
    b.status,
    b.booked_at,
    b.cancel_reason,
    b.created_at,
    b.updated_at;
END;
$function$;

-- 5) Tutor rejects a pending request
CREATE OR REPLACE FUNCTION public.sp_teacher_session_reject(
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
  booked_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT b.*
  INTO v_booking
  FROM public.teacher_session_bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.teacher_id <> p_actor_user_id THEN
    RAISE EXCEPTION 'Only slot owner can reject booking';
  END IF;

  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'Booking not pending';
  END IF;

  RETURN QUERY
  UPDATE public.teacher_session_bookings b
  SET
    status = 'rejected',
    rejected_at = NOW(),
    rejected_by = p_actor_user_id,
    rejection_reason = NULLIF(btrim(p_reason), ''),
    updated_at = NOW()
  WHERE b.id = v_booking.id
  RETURNING
    b.id,
    b.slot_id,
    b.teacher_id,
    b.student_id,
    b.status,
    b.booked_at,
    b.cancel_reason,
    b.created_at,
    b.updated_at;
END;
$function$;
