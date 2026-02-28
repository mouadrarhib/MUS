-- ============================================================================
-- 006_add_resource_confusion_signals.sql
-- Adds "Je ne comprends pas" signals for resources.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_confusion_signals (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT resource_confusion_note_length CHECK (note IS NULL OR char_length(trim(note)) >= 3)
);

CREATE INDEX IF NOT EXISTS idx_confusion_resource_created_at
  ON public.resource_confusion_signals(resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_confusion_user_resource_created_at
  ON public.resource_confusion_signals(user_id, resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_confusion_created_at
  ON public.resource_confusion_signals(created_at DESC);
