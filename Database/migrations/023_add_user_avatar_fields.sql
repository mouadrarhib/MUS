BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS avatar_object_key text,
  ADD COLUMN IF NOT EXISTS avatar_mime_type text,
  ADD COLUMN IF NOT EXISTS avatar_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS avatar_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_users_avatar_object_key
  ON public.users (avatar_object_key)
  WHERE avatar_object_key IS NOT NULL;

COMMIT;
