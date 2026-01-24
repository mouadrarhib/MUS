-- ============================================
-- STUDENT_PROFILES PROCEDURES
-- ============================================

-- First, create the trigger function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.sp_student_profile_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on student_profiles table (if not exists)
DROP TRIGGER IF EXISTS trg_student_profiles_set_updated_at ON public.student_profiles;
CREATE TRIGGER trg_student_profiles_set_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION sp_student_profile_set_updated_at();

-- 1. Create Student Profile
CREATE OR REPLACE FUNCTION public.sp_student_profile_create(
    p_user_id UUID,
    p_institution_id BIGINT DEFAULT NULL,
    p_program_id BIGINT DEFAULT NULL,
    p_current_semester_id BIGINT DEFAULT NULL
)
RETURNS TABLE(user_id UUID, institution_id BIGINT, program_id BIGINT, 
              current_semester_id BIGINT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.student_profiles (user_id, institution_id, program_id, current_semester_id)
    VALUES (p_user_id, p_institution_id, p_program_id, p_current_semester_id)
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Student profile already exists for user %', p_user_id;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid user_id, institution_id, program_id, or current_semester_id';
END;
$$;

-- 2. Get Student Profile by User ID
CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_user_id(
    p_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    institution_id BIGINT,
    institution_name TEXT,
    program_id BIGINT,
    program_name TEXT,
    current_semester_id BIGINT,
    current_semester_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.program_id,
        p.name AS program_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    WHERE sp.user_id = p_user_id;
END;
$$;

-- 3. Get All Student Profiles
CREATE OR REPLACE FUNCTION public.sp_student_profile_get_all()
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    institution_id BIGINT,
    institution_name TEXT,
    program_id BIGINT,
    program_name TEXT,
    current_semester_id BIGINT,
    current_semester_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.program_id,
        p.name AS program_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    ORDER BY u.full_name;
END;
$$;

-- 4. Update Student Profile
CREATE OR REPLACE FUNCTION public.sp_student_profile_update(
    p_user_id UUID,
    p_institution_id BIGINT DEFAULT NULL,
    p_program_id BIGINT DEFAULT NULL,
    p_current_semester_id BIGINT DEFAULT NULL
)
RETURNS TABLE(user_id UUID, institution_id BIGINT, program_id BIGINT, 
              current_semester_id BIGINT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET 
        institution_id = COALESCE(p_institution_id, student_profiles.institution_id),
        program_id = COALESCE(p_program_id, student_profiles.program_id),
        current_semester_id = COALESCE(p_current_semester_id, student_profiles.current_semester_id)
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid institution_id, program_id, or current_semester_id';
END;
$$;

-- 5. Update Institution
CREATE OR REPLACE FUNCTION public.sp_student_profile_update_institution(
    p_user_id UUID,
    p_institution_id BIGINT
)
RETURNS TABLE(user_id UUID, institution_id BIGINT, program_id BIGINT, 
              current_semester_id BIGINT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET institution_id = p_institution_id
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Institution ID % does not exist', p_institution_id;
END;
$$;

-- 6. Update Program
CREATE OR REPLACE FUNCTION public.sp_student_profile_update_program(
    p_user_id UUID,
    p_program_id BIGINT
)
RETURNS TABLE(user_id UUID, institution_id BIGINT, program_id BIGINT, 
              current_semester_id BIGINT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET program_id = p_program_id
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Program ID % does not exist', p_program_id;
END;
$$;

-- 7. Update Current Semester
CREATE OR REPLACE FUNCTION public.sp_student_profile_update_semester(
    p_user_id UUID,
    p_current_semester_id BIGINT
)
RETURNS TABLE(user_id UUID, institution_id BIGINT, program_id BIGINT, 
              current_semester_id BIGINT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET current_semester_id = p_current_semester_id
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Semester ID % does not exist', p_current_semester_id;
END;
$$;

-- 8. Delete Student Profile
CREATE OR REPLACE FUNCTION public.sp_student_profile_delete(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.student_profiles
    WHERE user_id = p_user_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
END;
$$;

-- 9. Check if Student Profile Exists
CREATE OR REPLACE FUNCTION public.sp_student_profile_exists(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.student_profiles WHERE user_id = p_user_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- 10. Get Students by Institution
CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_institution(
    p_institution_id BIGINT
)
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    program_id BIGINT,
    program_name TEXT,
    current_semester_id BIGINT,
    current_semester_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.program_id,
        p.name AS program_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    WHERE sp.institution_id = p_institution_id
    ORDER BY u.full_name;
END;
$$;

-- 11. Get Students by Program
CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_program(
    p_program_id BIGINT
)
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    institution_id BIGINT,
    institution_name TEXT,
    current_semester_id BIGINT,
    current_semester_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    WHERE sp.program_id = p_program_id
    ORDER BY u.full_name;
END;
$$;

-- 12. Get Students by Semester
CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_semester(
    p_semester_id BIGINT
)
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    institution_id BIGINT,
    institution_name TEXT,
    program_id BIGINT,
    program_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.program_id,
        p.name AS program_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    WHERE sp.current_semester_id = p_semester_id
    ORDER BY u.full_name;
END;
$$;

-- 13. Count Students by Institution
CREATE OR REPLACE FUNCTION public.sp_student_profile_count_by_institution(
    p_institution_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.student_profiles
    WHERE institution_id = p_institution_id;
    
    RETURN v_count;
END;
$$;

-- 14. Count Students by Program
CREATE OR REPLACE FUNCTION public.sp_student_profile_count_by_program(
    p_program_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.student_profiles
    WHERE program_id = p_program_id;
    
    RETURN v_count;
END;
$$;

-- 15. Count Students by Semester
CREATE OR REPLACE FUNCTION public.sp_student_profile_count_by_semester(
    p_semester_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.student_profiles
    WHERE current_semester_id = p_semester_id;
    
    RETURN v_count;
END;
$$;

-- 16. Get Student Profile with Full Details
CREATE OR REPLACE FUNCTION public.sp_student_profile_get_full_details(
    p_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    user_is_active BOOLEAN,
    institution_id BIGINT,
    institution_name TEXT,
    institution_country TEXT,
    institution_city TEXT,
    program_id BIGINT,
    program_name TEXT,
    domain_id BIGINT,
    domain_name TEXT,
    current_semester_id BIGINT,
    current_semester_name TEXT,
    level_id BIGINT,
    level_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        u.is_active AS user_is_active,
        sp.institution_id,
        i.name AS institution_name,
        i.country AS institution_country,
        i.city AS institution_city,
        sp.program_id,
        pr.name AS program_name,
        pr.domain_id,
        d.name AS domain_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        s.level_id,
        l.name AS level_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs pr ON sp.program_id = pr.id
    LEFT JOIN public.domains d ON pr.domain_id = d.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE sp.user_id = p_user_id;
END;
$$;
