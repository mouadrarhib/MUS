-- ============================================================================
-- 008_add_resource_rejections.sql
-- Keeps rejection reasons after resource/file deletion.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.resource_rejections (
  id BIGSERIAL PRIMARY KEY,
  resource_id_original BIGINT NULL,
  uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rejected_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  resource_title TEXT NOT NULL,
  resource_url TEXT NULL,
  resource_format TEXT NULL,
  resource_educational_type TEXT NULL,
  resource_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT resource_rejections_reason_length CHECK (char_length(trim(reason)) >= 5)
);

CREATE INDEX IF NOT EXISTS idx_resource_rejections_uploader_created_at
  ON public.resource_rejections(uploader_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_rejections_reviewer_created_at
  ON public.resource_rejections(rejected_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_rejections_original_id
  ON public.resource_rejections(resource_id_original);

COMMIT;
