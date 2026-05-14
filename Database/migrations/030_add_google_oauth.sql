BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS google_id varchar(255),
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
  ON public.users (google_id)
  WHERE google_id IS NOT NULL;

COMMIT;
