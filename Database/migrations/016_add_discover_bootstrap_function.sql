BEGIN;

CREATE INDEX IF NOT EXISTS idx_resources_status_created_at
  ON public.resources(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_module_map_resource_created_at
  ON public.resource_module_map(resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user_created_at
  ON public.favorites(user_id, created_at DESC);

DROP FUNCTION IF EXISTS public.sp_discover_bootstrap(UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.sp_discover_bootstrap(
  p_user_id UUID,
  p_recommendation_limit INTEGER DEFAULT 12,
  p_resources_limit INTEGER DEFAULT 200
)
RETURNS TABLE(
  generated_at TIMESTAMPTZ,
  published_resources JSONB,
  discover_modules JSONB,
  recommendations JSONB,
  favorites JSONB,
  meta JSONB
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_published_resources JSONB := '[]'::JSONB;
  v_discover_modules JSONB := '[]'::JSONB;
  v_recommendations JSONB := '[]'::JSONB;
  v_favorites JSONB := '[]'::JSONB;
BEGIN
  WITH module_pick AS (
    SELECT DISTINCT ON (rmm.resource_id)
      rmm.resource_id,
      m.id AS module_id,
      m.code AS module_code,
      m.title AS module_title
    FROM public.resource_module_map rmm
    INNER JOIN public.modules m ON m.id = rmm.module_id
    ORDER BY rmm.resource_id, rmm.created_at DESC NULLS LAST, m.id ASC
  ),
  tags_agg AS (
    SELECT
      rt.resource_id,
      ARRAY_AGG(t.name ORDER BY t.name) AS tags
    FROM public.resource_tags rt
    INNER JOIN public.tags t ON t.id = rt.tag_id
    GROUP BY rt.resource_id
  ),
  ratings_agg AS (
    SELECT
      r.resource_id,
      ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating,
      COUNT(r.user_id)::BIGINT AS total_ratings
    FROM public.ratings r
    GROUP BY r.resource_id
  ),
  favorites_agg AS (
    SELECT
      f.resource_id,
      COUNT(*)::BIGINT AS total_favorites
    FROM public.favorites f
    GROUP BY f.resource_id
  ),
  rows_clean AS (
    SELECT
      r.id,
      r.title,
      r.description,
      r.status::TEXT AS status,
      r.educational_type::TEXT AS educational_type,
      r.format::TEXT AS format,
      COALESCE(r.access_tier::TEXT, 'free') AS access_tier,
      r.url,
      r.language,
      r.license,
      r.resource_type_id,
      r.created_by,
      u.full_name::TEXT AS creator_name,
      r.created_at,
      r.updated_at,
      mp.module_id,
      mp.module_code,
      mp.module_title,
      COALESCE(ta.tags, ARRAY[]::TEXT[]) AS tags,
      COALESCE(ra.average_rating, 0)::NUMERIC AS average_rating,
      COALESCE(ra.total_ratings, 0)::BIGINT AS total_ratings,
      COALESCE(fa.total_favorites, 0)::BIGINT AS total_favorites,
      CASE
        WHEN p_user_id IS NULL THEN FALSE
        ELSE EXISTS (
          SELECT 1
          FROM public.favorites f_user
          WHERE f_user.user_id = p_user_id
            AND f_user.resource_id = r.id
        )
      END AS is_favorited
    FROM public.resources r
    LEFT JOIN public.users u ON u.id = r.created_by
    LEFT JOIN module_pick mp ON mp.resource_id = r.id
    LEFT JOIN tags_agg ta ON ta.resource_id = r.id
    LEFT JOIN ratings_agg ra ON ra.resource_id = r.id
    LEFT JOIN favorites_agg fa ON fa.resource_id = r.id
    WHERE r.status = 'published'::resource_status
    ORDER BY r.created_at DESC
    LIMIT GREATEST(COALESCE(p_resources_limit, 200), 1)
  )
  SELECT COALESCE(JSONB_AGG(TO_JSONB(rows_clean)), '[]'::JSONB)
  INTO v_published_resources
  FROM rows_clean;

  WITH module_rows AS (
    SELECT
      m.id,
      m.code,
      m.title,
      m.description,
      m.semester_id,
      COUNT(*)::BIGINT AS published_resources_count
    FROM public.modules m
    INNER JOIN public.resource_module_map rmm ON rmm.module_id = m.id
    INNER JOIN public.resources r ON r.id = rmm.resource_id
    WHERE r.status = 'published'::resource_status
    GROUP BY m.id, m.code, m.title, m.description, m.semester_id
    ORDER BY m.title ASC
  )
  SELECT COALESCE(JSONB_AGG(TO_JSONB(module_rows)), '[]'::JSONB)
  INTO v_discover_modules
  FROM module_rows;

  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(JSONB_AGG(TO_JSONB(rec_rows)), '[]'::JSONB)
    INTO v_recommendations
    FROM public.sp_recommendation_get_for_user(
      p_user_id,
      GREATEST(COALESCE(p_recommendation_limit, 12), 1)
    ) AS rec_rows;

    SELECT COALESCE(JSONB_AGG(TO_JSONB(fav_rows)), '[]'::JSONB)
    INTO v_favorites
    FROM (
      SELECT *
      FROM public.sp_favorite_get_by_user(p_user_id)
      WHERE resource_status = 'published'
      ORDER BY favorited_at DESC
    ) AS fav_rows;
  END IF;

  RETURN QUERY
  SELECT
    NOW(),
    v_published_resources,
    v_discover_modules,
    v_recommendations,
    v_favorites,
    JSONB_BUILD_OBJECT(
      'published_count', JSONB_ARRAY_LENGTH(v_published_resources),
      'modules_count', JSONB_ARRAY_LENGTH(v_discover_modules),
      'recommendations_count', JSONB_ARRAY_LENGTH(v_recommendations),
      'favorites_count', JSONB_ARRAY_LENGTH(v_favorites)
    );
END;
$function$;

COMMIT;
