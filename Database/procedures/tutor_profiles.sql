-- ============================================
-- TUTOR_PROFILES PROCEDURES
-- ============================================

CREATE OR REPLACE FUNCTION public.sp_tutor_profile_upsert(
  p_user_id UUID,
  p_headline TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_years_experience INTEGER DEFAULT NULL,
  p_hourly_rate NUMERIC DEFAULT NULL,
  p_currency TEXT DEFAULT NULL,
  p_response_time_minutes INTEGER DEFAULT NULL,
  p_visibility_status TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  headline TEXT,
  bio TEXT,
  years_experience INTEGER,
  hourly_rate NUMERIC,
  currency TEXT,
  response_time_minutes INTEGER,
  verification_status TEXT,
  visibility_status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_visibility TEXT;
  v_currency TEXT;
BEGIN
  v_visibility := lower(nullif(trim(coalesce(p_visibility_status, '')), ''));
  IF v_visibility IS NOT NULL AND v_visibility NOT IN ('draft', 'published', 'hidden') THEN
    RAISE EXCEPTION 'visibility_status must be draft, published, or hidden';
  END IF;

  v_currency := upper(nullif(trim(coalesce(p_currency, '')), ''));
  IF v_currency IS NOT NULL AND length(v_currency) <> 3 THEN
    RAISE EXCEPTION 'currency must be a 3-letter code';
  END IF;

  RETURN QUERY
  INSERT INTO public.tutor_profiles (
    user_id,
    headline,
    bio,
    years_experience,
    hourly_rate,
    currency,
    response_time_minutes,
    visibility_status
  )
  VALUES (
    p_user_id,
    nullif(trim(p_headline), ''),
    nullif(trim(p_bio), ''),
    p_years_experience,
    p_hourly_rate,
    COALESCE(v_currency, 'USD'),
    p_response_time_minutes,
    COALESCE(v_visibility, 'draft')
  )
  ON CONFLICT ON CONSTRAINT tutor_profiles_pkey
  DO UPDATE SET
    headline = COALESCE(nullif(trim(p_headline), ''), tutor_profiles.headline),
    bio = COALESCE(nullif(trim(p_bio), ''), tutor_profiles.bio),
    years_experience = COALESCE(p_years_experience, tutor_profiles.years_experience),
    hourly_rate = COALESCE(p_hourly_rate, tutor_profiles.hourly_rate),
    currency = COALESCE(v_currency, tutor_profiles.currency),
    response_time_minutes = COALESCE(p_response_time_minutes, tutor_profiles.response_time_minutes),
    visibility_status = COALESCE(v_visibility, tutor_profiles.visibility_status)
  RETURNING
    tutor_profiles.user_id,
    tutor_profiles.headline,
    tutor_profiles.bio,
    tutor_profiles.years_experience,
    tutor_profiles.hourly_rate,
    tutor_profiles.currency,
    tutor_profiles.response_time_minutes,
    tutor_profiles.verification_status,
    tutor_profiles.visibility_status,
    tutor_profiles.created_at,
    tutor_profiles.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_tutor_profile_get_by_user_id(
  p_user_id UUID
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  years_experience INTEGER,
  hourly_rate NUMERIC,
  currency TEXT,
  response_time_minutes INTEGER,
  verification_status TEXT,
  visibility_status TEXT,
  skills JSONB,
  education JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT
    tp.user_id,
    u.full_name,
    u.avatar_url,
    tp.headline,
    tp.bio,
    tp.years_experience,
    tp.hourly_rate,
    tp.currency,
    tp.response_time_minutes,
    tp.verification_status,
    tp.visibility_status,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'skill_name', s.skill_name,
            'sort_order', s.sort_order
          )
          ORDER BY s.sort_order, s.id
        )
        FROM public.tutor_profile_skills s
        WHERE s.user_id = tp.user_id
      ),
      '[]'::jsonb
    ) AS skills,
    COALESCE(
      (
        SELECT jsonb_agg(
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
        )
        FROM public.tutor_profile_education e
        WHERE e.user_id = tp.user_id
      ),
      '[]'::jsonb
    ) AS education,
    tp.created_at,
    tp.updated_at
  FROM public.tutor_profiles tp
  INNER JOIN public.users u ON u.id = tp.user_id
  WHERE tp.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.sp_tutor_profile_get_public(
  p_user_id UUID
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  years_experience INTEGER,
  hourly_rate NUMERIC,
  currency TEXT,
  response_time_minutes INTEGER,
  verification_status TEXT,
  skills JSONB,
  education JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.headline,
    p.bio,
    p.years_experience,
    p.hourly_rate,
    p.currency,
    p.response_time_minutes,
    p.verification_status,
    p.skills,
    p.education,
    p.created_at,
    p.updated_at
  FROM public.sp_tutor_profile_get_by_user_id(p_user_id) p
  WHERE p.visibility_status = 'published';
$$;

CREATE OR REPLACE FUNCTION public.sp_tutor_profile_set_visibility(
  p_user_id UUID,
  p_visibility_status TEXT
)
RETURNS TABLE(
  user_id UUID,
  visibility_status TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_visibility TEXT;
BEGIN
  v_visibility := lower(coalesce(nullif(trim(p_visibility_status), ''), 'draft'));
  IF v_visibility NOT IN ('draft', 'published', 'hidden') THEN
    RAISE EXCEPTION 'visibility_status must be draft, published, or hidden';
  END IF;

  RETURN QUERY
  UPDATE public.tutor_profiles
  SET visibility_status = v_visibility
  WHERE tutor_profiles.user_id = p_user_id
  RETURNING tutor_profiles.user_id, tutor_profiles.visibility_status, tutor_profiles.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tutor profile for user % not found', p_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_tutor_profile_replace_skills(
  p_user_id UUID,
  p_skills TEXT[]
)
RETURNS TABLE(
  id BIGINT,
  user_id UUID,
  skill_name TEXT,
  sort_order INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tutor_profiles WHERE tutor_profiles.user_id = p_user_id) THEN
    RAISE EXCEPTION 'Tutor profile for user % not found', p_user_id;
  END IF;

  DELETE FROM public.tutor_profile_skills WHERE tutor_profile_skills.user_id = p_user_id;

  IF p_skills IS NULL OR cardinality(p_skills) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO public.tutor_profile_skills (user_id, skill_name, sort_order)
  SELECT
    p_user_id,
    trim(s.v_skill_name),
    s.v_sort_order
  FROM (
    SELECT DISTINCT ON (lower(trim(t.v_skill_name)))
      t.v_skill_name,
      t.ord::INTEGER AS v_sort_order
    FROM unnest(p_skills) WITH ORDINALITY AS t(v_skill_name, ord)
    WHERE length(trim(t.v_skill_name)) > 0
    ORDER BY lower(trim(t.v_skill_name)), t.ord
  ) s
  ORDER BY s.v_sort_order
  RETURNING
    tutor_profile_skills.id,
    tutor_profile_skills.user_id,
    tutor_profile_skills.skill_name,
    tutor_profile_skills.sort_order,
    tutor_profile_skills.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_tutor_profile_replace_education(
  p_user_id UUID,
  p_education JSONB
)
RETURNS TABLE(
  id BIGINT,
  user_id UUID,
  degree TEXT,
  institution TEXT,
  start_year INTEGER,
  end_year INTEGER,
  description TEXT,
  sort_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tutor_profiles WHERE tutor_profiles.user_id = p_user_id) THEN
    RAISE EXCEPTION 'Tutor profile for user % not found', p_user_id;
  END IF;

  DELETE FROM public.tutor_profile_education WHERE tutor_profile_education.user_id = p_user_id;

  IF p_education IS NULL OR jsonb_typeof(p_education) <> 'array' OR jsonb_array_length(p_education) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO public.tutor_profile_education (
    user_id,
    degree,
    institution,
    start_year,
    end_year,
    description,
    sort_order
  )
  SELECT
    p_user_id,
    trim(coalesce(item->>'degree', '')),
    trim(coalesce(item->>'institution', '')),
    NULLIF(item->>'start_year', '')::INTEGER,
    NULLIF(item->>'end_year', '')::INTEGER,
    nullif(trim(coalesce(item->>'description', '')), ''),
    COALESCE(NULLIF(item->>'sort_order', '')::INTEGER, ord::INTEGER)
  FROM jsonb_array_elements(p_education) WITH ORDINALITY AS e(item, ord)
  WHERE length(trim(coalesce(item->>'degree', ''))) > 0
    AND length(trim(coalesce(item->>'institution', ''))) > 0
  ORDER BY ord
  RETURNING
    tutor_profile_education.id,
    tutor_profile_education.user_id,
    tutor_profile_education.degree,
    tutor_profile_education.institution,
    tutor_profile_education.start_year,
    tutor_profile_education.end_year,
    tutor_profile_education.description,
    tutor_profile_education.sort_order,
    tutor_profile_education.created_at,
    tutor_profile_education.updated_at;
END;
$$;
