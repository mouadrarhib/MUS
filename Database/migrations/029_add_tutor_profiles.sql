-- ============================================================================
-- 029_add_tutor_profiles.sql
-- Tutor profile domain tables for discover + booking public profiles
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.tutor_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  years_experience INTEGER,
  hourly_rate NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  response_time_minutes INTEGER,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  visibility_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tutor_profiles_years_experience_check CHECK (years_experience IS NULL OR years_experience >= 0),
  CONSTRAINT tutor_profiles_hourly_rate_check CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  CONSTRAINT tutor_profiles_response_time_check CHECK (response_time_minutes IS NULL OR response_time_minutes >= 0),
  CONSTRAINT tutor_profiles_currency_check CHECK (char_length(trim(currency)) = 3),
  CONSTRAINT tutor_profiles_verification_status_check CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  CONSTRAINT tutor_profiles_visibility_status_check CHECK (visibility_status IN ('draft', 'published', 'hidden'))
);

CREATE TABLE IF NOT EXISTS public.tutor_profile_skills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.tutor_profiles(user_id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tutor_profile_skills_name_not_blank CHECK (length(trim(skill_name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tutor_profile_skills_user_skill_ci
  ON public.tutor_profile_skills(user_id, lower(skill_name));

CREATE INDEX IF NOT EXISTS idx_tutor_profile_skills_user_sort
  ON public.tutor_profile_skills(user_id, sort_order, id);

CREATE TABLE IF NOT EXISTS public.tutor_profile_education (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.tutor_profiles(user_id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  start_year INTEGER,
  end_year INTEGER,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tutor_profile_education_degree_not_blank CHECK (length(trim(degree)) > 0),
  CONSTRAINT tutor_profile_education_institution_not_blank CHECK (length(trim(institution)) > 0),
  CONSTRAINT tutor_profile_education_start_year_check CHECK (start_year IS NULL OR start_year BETWEEN 1900 AND 2200),
  CONSTRAINT tutor_profile_education_end_year_check CHECK (end_year IS NULL OR end_year BETWEEN 1900 AND 2200),
  CONSTRAINT tutor_profile_education_year_order_check CHECK (start_year IS NULL OR end_year IS NULL OR end_year >= start_year)
);

CREATE INDEX IF NOT EXISTS idx_tutor_profile_education_user_sort
  ON public.tutor_profile_education(user_id, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_visibility
  ON public.tutor_profiles(visibility_status, updated_at DESC);

CREATE OR REPLACE FUNCTION public.sp_tutor_profiles_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_tutor_profiles_set_updated_at ON public.tutor_profiles;
CREATE TRIGGER trg_tutor_profiles_set_updated_at
BEFORE UPDATE ON public.tutor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sp_tutor_profiles_set_updated_at();

DROP TRIGGER IF EXISTS trg_tutor_profile_education_set_updated_at ON public.tutor_profile_education;
CREATE TRIGGER trg_tutor_profile_education_set_updated_at
BEFORE UPDATE ON public.tutor_profile_education
FOR EACH ROW
EXECUTE FUNCTION public.sp_tutor_profiles_set_updated_at();

COMMIT;
