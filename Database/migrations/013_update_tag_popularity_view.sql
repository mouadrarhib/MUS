BEGIN;

CREATE OR REPLACE VIEW public.vw_tags_popularity AS
SELECT
  t.id,
  t.name,
  t.slug,
  t.category,
  t.description,
  t.is_active,
  (
    COALESCE(resource_usage.resource_usage_count, 0)
    + COALESCE(preference_usage.preference_usage_count, 0)
  )::BIGINT AS usage_count,
  CASE
    WHEN resource_usage.last_resource_used_at IS NULL AND preference_usage.last_preference_used_at IS NULL THEN NULL
    ELSE GREATEST(
      COALESCE(resource_usage.last_resource_used_at, '-infinity'::timestamptz),
      COALESCE(preference_usage.last_preference_used_at, '-infinity'::timestamptz)
    )
  END AS last_used_at,
  t.created_at,
  t.updated_at
FROM public.tags t
LEFT JOIN (
  SELECT
    rt.tag_id,
    COUNT(*)::BIGINT AS resource_usage_count,
    MAX(rt.created_at) AS last_resource_used_at
  FROM public.resource_tags rt
  GROUP BY rt.tag_id
) AS resource_usage ON resource_usage.tag_id = t.id
LEFT JOIN (
  SELECT
    utp.tag_id,
    COUNT(*)::BIGINT AS preference_usage_count,
    MAX(utp.created_at) AS last_preference_used_at
  FROM public.user_tag_preferences utp
  GROUP BY utp.tag_id
) AS preference_usage ON preference_usage.tag_id = t.id;

COMMIT;
