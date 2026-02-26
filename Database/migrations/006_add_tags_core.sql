-- ============================================================================
-- 006_add_tags_core.sql
-- Adds tags and resource_tags core schema + views.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'topic',
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tags_name_length CHECK (char_length(trim(name)) >= 2),
  CONSTRAINT tags_slug_length CHECK (char_length(trim(slug)) >= 2),
  CONSTRAINT tags_slug_unique UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.resource_tags (
  resource_id BIGINT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (resource_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_tags_category_active ON public.tags(category, is_active);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON public.resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON public.resource_tags(tag_id);

CREATE OR REPLACE VIEW public.vw_resource_tags AS
SELECT
  rt.resource_id,
  t.id AS tag_id,
  t.name AS tag_name,
  t.slug AS tag_slug,
  t.category AS tag_category,
  t.description AS tag_description,
  t.is_active,
  rt.created_at AS linked_at
FROM public.resource_tags rt
INNER JOIN public.tags t ON t.id = rt.tag_id;

CREATE OR REPLACE VIEW public.vw_tags_popularity AS
SELECT
  t.id,
  t.name,
  t.slug,
  t.category,
  t.description,
  t.is_active,
  COUNT(rt.resource_id)::BIGINT AS usage_count,
  MAX(rt.created_at) AS last_used_at,
  t.created_at,
  t.updated_at
FROM public.tags t
LEFT JOIN public.resource_tags rt ON rt.tag_id = t.id
GROUP BY t.id, t.name, t.slug, t.category, t.description, t.is_active, t.created_at, t.updated_at;

COMMIT;
