BEGIN;

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS storage_provider TEXT,
  ADD COLUMN IF NOT EXISTS bucket TEXT,
  ADD COLUMN IF NOT EXISTS object_key TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS checksum TEXT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'uploaded';

CREATE INDEX IF NOT EXISTS idx_resources_object_key ON public.resources(object_key);

COMMIT;
