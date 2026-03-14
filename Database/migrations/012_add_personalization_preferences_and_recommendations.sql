-- ============================================================================
-- 012_add_personalization_preferences_and_recommendations.sql
-- User tag preferences + recommendation scoring (profile + tags + quality).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_tag_preferences (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tag_preferences_user
  ON public.user_tag_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_tag_preferences_tag
  ON public.user_tag_preferences(tag_id);

CREATE OR REPLACE FUNCTION public.sp_user_tag_preferences_set(
  p_user_id UUID,
  p_tag_ids BIGINT[]
)
RETURNS TABLE(
  user_id UUID,
  tag_id BIGINT,
  tag_name TEXT,
  tag_slug TEXT,
  category TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_ids BIGINT[];
BEGIN
  v_ids := COALESCE(p_tag_ids, ARRAY[]::BIGINT[]);

  DELETE FROM public.user_tag_preferences utp
  WHERE utp.user_id = p_user_id
    AND NOT (utp.tag_id = ANY(v_ids));

  INSERT INTO public.user_tag_preferences (user_id, tag_id)
  SELECT p_user_id, t.id
  FROM public.tags t
  WHERE t.id = ANY(v_ids)
    AND t.is_active = TRUE
  ON CONFLICT (user_id, tag_id) DO NOTHING;

  RETURN QUERY
  SELECT
    utp.user_id,
    utp.tag_id,
    t.name::TEXT AS tag_name,
    t.slug::TEXT AS tag_slug,
    t.category::TEXT,
    utp.created_at
  FROM public.user_tag_preferences utp
  INNER JOIN public.tags t ON t.id = utp.tag_id
  WHERE utp.user_id = p_user_id
  ORDER BY t.name ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_user_tag_preferences_get(
  p_user_id UUID
)
RETURNS TABLE(
  user_id UUID,
  tag_id BIGINT,
  tag_name TEXT,
  tag_slug TEXT,
  category TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    utp.user_id,
    utp.tag_id,
    t.name::TEXT AS tag_name,
    t.slug::TEXT AS tag_slug,
    t.category::TEXT,
    utp.created_at
  FROM public.user_tag_preferences utp
  INNER JOIN public.tags t ON t.id = utp.tag_id
  WHERE utp.user_id = p_user_id
  ORDER BY t.name ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_recommendation_get_for_user(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 24
)
RETURNS TABLE(
  resource_id BIGINT,
  title TEXT,
  description TEXT,
  status TEXT,
  educational_type TEXT,
  format TEXT,
  access_tier TEXT,
  created_by UUID,
  creator_name TEXT,
  created_at TIMESTAMPTZ,
  score NUMERIC,
  match_reasons TEXT[]
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT
      sp.user_id,
      pr.name::TEXT AS program_name,
      lv.name::TEXT AS level_name,
      sm.name::TEXT AS semester_name,
      sm.level_id,
      sm.sort_order
    FROM public.student_profiles sp
    LEFT JOIN public.programs pr ON pr.id = sp.program_id
    LEFT JOIN public.semesters sm ON sm.id = sp.current_semester_id
    LEFT JOIN public.levels lv ON lv.id = sm.level_id
    WHERE sp.user_id = p_user_id
    LIMIT 1
  ),
  adjacent_semesters AS (
    SELECT s.name::TEXT
    FROM public.semesters s
    INNER JOIN user_profile up ON up.level_id = s.level_id
    WHERE ABS(COALESCE(s.sort_order, 0) - COALESCE(up.sort_order, 0)) = 1
  ),
  user_tags AS (
    SELECT utp.tag_id
    FROM public.user_tag_preferences utp
    WHERE utp.user_id = p_user_id
  ),
  tag_count AS (
    SELECT COUNT(*)::NUMERIC AS total_user_tags FROM user_tags
  ),
  quality_stats AS (
    SELECT
      r.id AS resource_id,
      COUNT(DISTINCT rd.user_id)::NUMERIC AS downloads_count,
      COUNT(DISTINCT fv.user_id)::NUMERIC AS favorites_count,
      COALESCE(AVG(rt.score), 0)::NUMERIC AS avg_rating
    FROM public.resources r
    LEFT JOIN public.resource_downloads rd ON rd.resource_id = r.id
    LEFT JOIN public.favorites fv ON fv.resource_id = r.id
    LEFT JOIN public.ratings rt ON rt.resource_id = r.id
    GROUP BY r.id
  ),
  tag_match AS (
    SELECT
      rt.resource_id,
      COUNT(*)::NUMERIC AS matched_tags
    FROM public.resource_tags rt
    INNER JOIN user_tags ut ON ut.tag_id = rt.tag_id
    GROUP BY rt.resource_id
  ),
  candidates AS (
    SELECT
      r.id AS resource_id,
      r.title,
      r.description,
      r.status::TEXT AS status,
      r.educational_type::TEXT AS educational_type,
      r.format::TEXT AS format,
      COALESCE(r.access_tier::TEXT, 'free') AS access_tier,
      r.created_by,
      u.full_name::TEXT AS creator_name,
      r.created_at,
      COALESCE(tm.matched_tags, 0) AS matched_tags,
      COALESCE(tc.total_user_tags, 0) AS total_user_tags,
      COALESCE(qs.downloads_count, 0) AS downloads_count,
      COALESCE(qs.favorites_count, 0) AS favorites_count,
      COALESCE(qs.avg_rating, 0) AS avg_rating,
      COALESCE((r.metadata -> 'academicContext' ->> 'programName'), '')::TEXT AS resource_program,
      COALESCE((r.metadata -> 'academicContext' ->> 'levelName'), '')::TEXT AS resource_level,
      COALESCE((r.metadata -> 'academicContext' ->> 'semesterName'), '')::TEXT AS resource_semester
    FROM public.resources r
    LEFT JOIN public.users u ON u.id = r.created_by
    LEFT JOIN tag_match tm ON tm.resource_id = r.id
    LEFT JOIN quality_stats qs ON qs.resource_id = r.id
    CROSS JOIN tag_count tc
    WHERE r.status = 'published'
      AND r.created_by <> p_user_id
  ),
  scored AS (
    SELECT
      c.*,
      CASE
        WHEN c.total_user_tags > 0 THEN (c.matched_tags / c.total_user_tags) * 35
        ELSE 0
      END AS tag_score,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM user_profile up
          WHERE lower(trim(c.resource_program)) = lower(trim(COALESCE(up.program_name, '')))
        ) THEN 20 ELSE 0
      END AS program_score,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM user_profile up
          WHERE lower(trim(c.resource_level)) = lower(trim(COALESCE(up.level_name, '')))
        ) THEN 10 ELSE 0
      END AS level_score,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM user_profile up
          WHERE lower(trim(c.resource_semester)) = lower(trim(COALESCE(up.semester_name, '')))
        ) THEN 25
        WHEN EXISTS (
          SELECT 1 FROM adjacent_semesters ad
          WHERE lower(trim(c.resource_semester)) = lower(trim(ad.name))
        ) THEN 12
        ELSE 0
      END AS semester_score,
      LEAST(15, (LN(c.downloads_count + 1) * 4) + (c.avg_rating * 2) + (LN(c.favorites_count + 1) * 2)) AS quality_score,
      CASE
        WHEN c.created_at >= NOW() - INTERVAL '30 days' THEN 5
        WHEN c.created_at >= NOW() - INTERVAL '90 days' THEN 2
        ELSE 0
      END AS freshness_score
    FROM candidates c
  )
  SELECT
    s.resource_id,
    s.title::TEXT,
    s.description::TEXT,
    s.status::TEXT,
    s.educational_type::TEXT,
    s.format::TEXT,
    s.access_tier::TEXT,
    s.created_by,
    s.creator_name::TEXT,
    s.created_at,
    ROUND((s.tag_score + s.program_score + s.level_score + s.semester_score + s.quality_score + s.freshness_score)::NUMERIC, 2) AS score,
    ARRAY_REMOVE(
      ARRAY[
        CASE WHEN s.tag_score > 0 THEN 'Matches your preferred tags' END,
        CASE WHEN s.program_score > 0 THEN 'Matches your program' END,
        CASE WHEN s.level_score > 0 THEN 'Matches your level' END,
        CASE WHEN s.semester_score >= 25 THEN 'Matches your semester' END,
        CASE WHEN s.semester_score >= 12 AND s.semester_score < 25 THEN 'Matches adjacent semester' END,
        CASE WHEN s.quality_score >= 8 THEN 'Popular and highly rated' END,
        CASE WHEN s.freshness_score > 0 THEN 'Recently uploaded' END
      ],
      NULL
    ) AS match_reasons
  FROM scored s
  ORDER BY score DESC, s.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 24), 1);
END;
$function$;

COMMIT;
