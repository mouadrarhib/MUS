BEGIN;

ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS is_cleared boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_not_cleared
  ON public.user_notifications (recipient_user_id, created_at DESC)
  WHERE is_cleared = false;

CREATE TABLE IF NOT EXISTS public.user_session_inbox_clears (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id bigint NOT NULL REFERENCES public.teacher_session_bookings(id) ON DELETE CASCADE,
  cleared_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_user_session_inbox_clears_user
  ON public.user_session_inbox_clears (user_id, cleared_at DESC);

COMMIT;
