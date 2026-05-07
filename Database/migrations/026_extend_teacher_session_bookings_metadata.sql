-- 026_extend_teacher_session_bookings_metadata.sql
-- Adds booking details for tutoring flow (phase 3)

ALTER TABLE public.teacher_session_bookings
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS session_mode text NOT NULL DEFAULT 'remote',
  ADD COLUMN IF NOT EXISTS subject_module text NULL,
  ADD COLUMN IF NOT EXISTS pricing_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS booking_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'teacher_session_bookings_duration_check'
  ) THEN
    ALTER TABLE public.teacher_session_bookings
      ADD CONSTRAINT teacher_session_bookings_duration_check
      CHECK (duration_minutes IN (30, 60, 90, 120));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'teacher_session_bookings_session_mode_check'
  ) THEN
    ALTER TABLE public.teacher_session_bookings
      ADD CONSTRAINT teacher_session_bookings_session_mode_check
      CHECK (session_mode IN ('remote'));
  END IF;
END $$;
