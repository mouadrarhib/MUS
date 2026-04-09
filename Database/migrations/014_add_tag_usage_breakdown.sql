BEGIN;

DROP FUNCTION IF EXISTS public.sp_tag_get_all(TEXT, TEXT, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.sp_tag_get_popular(INTEGER);

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
  t.updated_at,
  COALESCE(resource_usage.resource_usage_count, 0)::BIGINT AS resource_usage_count,
  COALESCE(preference_usage.preference_usage_count, 0)::BIGINT AS preference_usage_count,
  resource_usage.last_resource_used_at,
  preference_usage.last_preference_used_at
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

CREATE OR REPLACE FUNCTION public.sp_tag_get_all(
  p_search_term TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit_value INTEGER DEFAULT 100
)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN,
  usage_count BIGINT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resource_usage_count BIGINT,
  preference_usage_count BIGINT,
  last_resource_used_at TIMESTAMPTZ,
  last_preference_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vtp.id,
    vtp.name,
    vtp.slug,
    vtp.category,
    vtp.description,
    vtp.is_active,
    vtp.usage_count,
    vtp.last_used_at,
    vtp.created_at,
    vtp.updated_at,
    vtp.resource_usage_count,
    vtp.preference_usage_count,
    vtp.last_resource_used_at,
    vtp.last_preference_used_at
  FROM public.vw_tags_popularity vtp
  WHERE (p_search_term IS NULL OR vtp.name ILIKE '%' || p_search_term || '%' OR vtp.slug ILIKE '%' || p_search_term || '%')
    AND (p_category IS NULL OR vtp.category = p_category)
    AND (p_is_active IS NULL OR vtp.is_active = p_is_active)
  ORDER BY vtp.usage_count DESC, vtp.name ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 100), 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_tag_get_popular(p_limit_value INTEGER DEFAULT 20)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  usage_count BIGINT,
  last_used_at TIMESTAMPTZ,
  resource_usage_count BIGINT,
  preference_usage_count BIGINT,
  last_resource_used_at TIMESTAMPTZ,
  last_preference_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vtp.id,
    vtp.name,
    vtp.slug,
    vtp.category,
    vtp.usage_count,
    vtp.last_used_at,
    vtp.resource_usage_count,
    vtp.preference_usage_count,
    vtp.last_resource_used_at,
    vtp.last_preference_used_at
  FROM public.vw_tags_popularity vtp
  WHERE vtp.is_active = TRUE
  ORDER BY vtp.usage_count DESC, vtp.last_used_at DESC NULLS LAST, vtp.name ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 20), 1);
END;
$$;

COMMIT;
