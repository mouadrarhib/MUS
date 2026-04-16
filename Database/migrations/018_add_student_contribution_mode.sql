-- ============================================================================
-- 018_add_student_contribution_mode.sql
-- Adds learner/contributor student capability mode and related routines.
-- ============================================================================

BEGIN;

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS contribution_mode TEXT;

UPDATE public.student_profiles
SET contribution_mode = 'contributor'
WHERE contribution_mode IS NULL OR btrim(contribution_mode) = '';

ALTER TABLE public.student_profiles
ALTER COLUMN contribution_mode SET DEFAULT 'contributor';

ALTER TABLE public.student_profiles
ALTER COLUMN contribution_mode SET NOT NULL;

ALTER TABLE public.student_profiles
DROP CONSTRAINT IF EXISTS student_profiles_contribution_mode_check;

ALTER TABLE public.student_profiles
ADD CONSTRAINT student_profiles_contribution_mode_check
CHECK (contribution_mode IN ('learner', 'contributor'));

CREATE OR REPLACE FUNCTION public.sp_user_register_student(
  p_full_name text,
  p_email text,
  p_password text,
  p_institution_id bigint,
  p_program_id bigint,
  p_level_id bigint,
  p_current_semester_id bigint,
  p_contribution_mode text DEFAULT 'contributor'
)
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_email text;
  v_contribution_mode text;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email is required';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  if p_institution_id is null or p_program_id is null or p_level_id is null or p_current_semester_id is null then
    raise exception 'Academic information is required';
  end if;

  v_contribution_mode := lower(coalesce(nullif(trim(p_contribution_mode), ''), 'contributor'));
  if v_contribution_mode not in ('learner', 'contributor') then
    raise exception 'contribution_mode must be learner or contributor';
  end if;

  if not exists (
    select 1 from public.institutions i where i.id = p_institution_id
  ) then
    raise exception 'Institution not found';
  end if;

  if not exists (
    select 1 from public.programs p where p.id = p_program_id
  ) then
    raise exception 'Program not found';
  end if;

  if not exists (
    select 1
    from public.institution_programs ip
    where ip.institution_id = p_institution_id
      and ip.program_id = p_program_id
  ) then
    raise exception 'Program is not available for selected institution';
  end if;

  if not exists (
    select 1
    from public.levels l
    where l.id = p_level_id
      and l.program_id = p_program_id
  ) then
    raise exception 'Level does not belong to selected program';
  end if;

  if not exists (
    select 1
    from public.semesters s
    where s.id = p_current_semester_id
      and s.level_id = p_level_id
  ) then
    raise exception 'Semester does not belong to selected level';
  end if;

  v_email := public.sp_user_normalize_email(p_email);

  insert into public.users (full_name, email, password_hash, is_active)
  values (
    nullif(trim(p_full_name), ''),
    v_email,
    crypt(p_password, gen_salt('bf')),
    true
  )
  returning users.id, users.full_name, users.email, users.is_active, users.created_at, users.updated_at
  into id, full_name, email, is_active, created_at, updated_at;

  insert into public.student_profiles (user_id, institution_id, program_id, current_semester_id, contribution_mode)
  values (id, p_institution_id, p_program_id, p_current_semester_id, v_contribution_mode);

  return next;

exception
  when unique_violation then
    raise exception 'Email already in use';
end;
$function$;

CREATE OR REPLACE FUNCTION public.sp_student_profile_create(
    p_user_id UUID,
    p_institution_id BIGINT DEFAULT NULL,
    p_program_id BIGINT DEFAULT NULL,
    p_current_semester_id BIGINT DEFAULT NULL,
    p_contribution_mode TEXT DEFAULT 'contributor'
)
RETURNS TABLE(
    user_id UUID,
    institution_id BIGINT,
    program_id BIGINT,
    current_semester_id BIGINT,
    contribution_mode TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_contribution_mode TEXT;
BEGIN
    v_contribution_mode := lower(coalesce(nullif(trim(p_contribution_mode), ''), 'contributor'));
    IF v_contribution_mode NOT IN ('learner', 'contributor') THEN
        RAISE EXCEPTION 'contribution_mode must be learner or contributor';
    END IF;

    RETURN QUERY
    INSERT INTO public.student_profiles (user_id, institution_id, program_id, current_semester_id, contribution_mode)
    VALUES (p_user_id, p_institution_id, p_program_id, p_current_semester_id, v_contribution_mode)
    RETURNING student_profiles.user_id,
              student_profiles.institution_id,
              student_profiles.program_id,
              student_profiles.current_semester_id,
              student_profiles.contribution_mode,
              student_profiles.created_at,
              student_profiles.updated_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Student profile already exists for user %', p_user_id;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid user_id, institution_id, program_id, or current_semester_id';
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_student_profile_update_contribution_mode(
    p_user_id UUID,
    p_contribution_mode TEXT
)
RETURNS TABLE(
    user_id UUID,
    institution_id BIGINT,
    program_id BIGINT,
    current_semester_id BIGINT,
    contribution_mode TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_contribution_mode TEXT;
BEGIN
    v_contribution_mode := lower(coalesce(nullif(trim(p_contribution_mode), ''), 'contributor'));
    IF v_contribution_mode NOT IN ('learner', 'contributor') THEN
        RAISE EXCEPTION 'contribution_mode must be learner or contributor';
    END IF;

    RETURN QUERY
    UPDATE public.student_profiles
    SET contribution_mode = v_contribution_mode
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id,
              student_profiles.institution_id,
              student_profiles.program_id,
              student_profiles.current_semester_id,
              student_profiles.contribution_mode,
              student_profiles.created_at,
              student_profiles.updated_at;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
END;
$function$;

COMMIT;
