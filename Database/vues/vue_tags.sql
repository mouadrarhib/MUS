-- ============================================================================
-- TAGS VIEWS
-- ============================================================================

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
