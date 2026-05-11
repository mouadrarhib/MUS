-- ============================================================================
-- USER PUBLIC PROFILE VIEW (Tutor + Academic + Public Stats)
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_user_profile_public AS
WITH roles_agg AS (
  SELECT
    ur.user_id,
    ARRAY_AGG(DISTINCT lower(r.name) ORDER BY lower(r.name)) AS roles
  FROM public.user_roles ur
  INNER JOIN public.roles r ON r.id = ur.role_id
  GROUP BY ur.user_id
),
skills_agg AS (
  SELECT
    s.user_id,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'skill_name', s.skill_name,
          'sort_order', s.sort_order
        )
        ORDER BY s.sort_order, s.id
      ),
      '[]'::jsonb
    ) AS skills
  FROM public.tutor_profile_skills s
  GROUP BY s.user_id
),
education_agg AS (
  SELECT
    e.user_id,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'degree', e.degree,
          'institution', e.institution,
          'start_year', e.start_year,
          'end_year', e.end_year,
          'description', e.description,
          'sort_order', e.sort_order
        )
        ORDER BY e.sort_order, e.id
      ),
      '[]'::jsonb
    ) AS education
  FROM public.tutor_profile_education e
  GROUP BY e.user_id
),
resource_stats AS (
  SELECT
    r.created_by AS user_id,
    COUNT(*) FILTER (WHERE r.status = 'published'::resource_status)::BIGINT AS published_resources_count,
    COUNT(DISTINCT rat.user_id)::BIGINT AS rating_count,
    COALESCE(ROUND(AVG(rat.score)::numeric, 2), 0)::NUMERIC(4,2) AS rating_avg
  FROM public.resources r
  LEFT JOIN public.ratings rat ON rat.resource_id = r.id
  GROUP BY r.created_by
),
session_stats AS (
  SELECT
    b.teacher_id AS user_id,
    COUNT(*) FILTER (WHERE b.status = 'confirmed')::BIGINT AS sessions_taught_count,
    COUNT(DISTINCT b.student_id) FILTER (WHERE b.status = 'confirmed')::BIGINT AS students_taught_count
  FROM public.teacher_session_bookings b
  GROUP BY b.teacher_id
)
SELECT
  u.id AS user_id,
  u.full_name,
  u.avatar_url,
  COALESCE(ra.roles, ARRAY[]::text[]) AS roles,

  tp.headline,
  tp.bio,
  tp.years_experience,
  tp.hourly_rate,
  tp.currency,
  tp.response_time_minutes,
  tp.verification_status,
  tp.visibility_status,

  sp.contribution_mode,
  sp.institution_id,
  i.name AS institution_name,
  sp.program_id,
  p.name AS program_name,
  sp.current_semester_id,
  sem.name AS current_semester_name,
  lvl.id AS level_id,
  lvl.name AS level_name,
  d.id AS domain_id,
  d.name AS domain_name,

  COALESCE(sa.skills, '[]'::jsonb) AS skills,
  COALESCE(ea.education, '[]'::jsonb) AS education,

  COALESCE(rs.published_resources_count, 0)::BIGINT AS published_resources_count,
  COALESCE(rs.rating_count, 0)::BIGINT AS rating_count,
  COALESCE(rs.rating_avg, 0)::NUMERIC(4,2) AS rating_avg,
  COALESCE(ss.sessions_taught_count, 0)::BIGINT AS sessions_taught_count,
  COALESCE(ss.students_taught_count, 0)::BIGINT AS students_taught_count,

  tp.created_at AS profile_created_at,
  tp.updated_at AS profile_updated_at,
  u.created_at AS account_created_at
FROM public.tutor_profiles tp
INNER JOIN public.users u ON u.id = tp.user_id
LEFT JOIN roles_agg ra ON ra.user_id = u.id
LEFT JOIN skills_agg sa ON sa.user_id = u.id
LEFT JOIN education_agg ea ON ea.user_id = u.id
LEFT JOIN resource_stats rs ON rs.user_id = u.id
LEFT JOIN session_stats ss ON ss.user_id = u.id
LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
LEFT JOIN public.institutions i ON i.id = sp.institution_id
LEFT JOIN public.programs p ON p.id = sp.program_id
LEFT JOIN public.semesters sem ON sem.id = sp.current_semester_id
LEFT JOIN public.levels lvl ON lvl.id = sem.level_id
LEFT JOIN public.domains d ON d.id = p.domain_id
WHERE u.is_active = TRUE
  AND tp.visibility_status = 'published';

COMMENT ON VIEW public.vw_user_profile_public IS
'Public tutor profile view: identity, tutor profile, skills, education, student academic labels, and public performance stats.';
