-- ============================================================================
-- 022_fix_session_booking_unique_constraint.sql
-- Allow re-booking a slot after cancellation/completion
-- Keep only one active (confirmed) booking per slot
-- ============================================================================

BEGIN;

ALTER TABLE public.teacher_session_bookings
  DROP CONSTRAINT IF EXISTS teacher_session_bookings_slot_unique;

DROP INDEX IF EXISTS public.ux_teacher_session_bookings_slot_confirmed;

CREATE UNIQUE INDEX ux_teacher_session_bookings_slot_confirmed
  ON public.teacher_session_bookings(slot_id)
  WHERE status = 'confirmed';

COMMIT;
