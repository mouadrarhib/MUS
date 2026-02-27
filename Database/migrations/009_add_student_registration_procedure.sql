-- ============================================================================
-- 009_add_student_registration_procedure.sql
-- Register user with academic profile validation for student onboarding.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.sp_user_register_student(
  p_full_name text,
  p_email text,
  p_password text,
  p_institution_id bigint,
  p_program_id bigint,
  p_level_id bigint,
  p_current_semester_id bigint
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

  insert into public.student_profiles (user_id, institution_id, program_id, current_semester_id)
  values (id, p_institution_id, p_program_id, p_current_semester_id);

  return next;

exception
  when unique_violation then
    raise exception 'Email already in use';
end;
$function$;

COMMIT;
