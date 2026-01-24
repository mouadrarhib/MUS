-- ============================================
-- PROGRAMS PROCEDURES
-- ============================================

-- 1. Create Program
CREATE OR REPLACE FUNCTION public.sp_program_create(
    p_name TEXT,
    p_domain_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.programs (name, domain_id)
    VALUES (p_name, p_domain_id)
    RETURNING programs.id, programs.name, programs.domain_id, programs.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Program "%" already exists in this domain', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Domain ID % does not exist', p_domain_id;
END;
$$;

-- 2. Get Program by ID
CREATE OR REPLACE FUNCTION public.sp_program_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.id = p_id;
END;
$$;

-- 3. Get Program by Name and Domain
CREATE OR REPLACE FUNCTION public.sp_program_get_by_name_domain(
    p_name TEXT,
    p_domain_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.name = p_name AND p.domain_id = p_domain_id;
END;
$$;

-- 4. Get All Programs
CREATE OR REPLACE FUNCTION public.sp_program_get_all()
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    ORDER BY d.name, p.name;
END;
$$;

-- 5. Get Programs by Domain
CREATE OR REPLACE FUNCTION public.sp_program_get_by_domain(
    p_domain_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.domain_id = p_domain_id
    ORDER BY p.name;
END;
$$;

-- 6. Update Program
CREATE OR REPLACE FUNCTION public.sp_program_update(
    p_id BIGINT,
    p_name TEXT DEFAULT NULL,
    p_domain_id BIGINT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.programs
    SET 
        name = COALESCE(p_name, programs.name),
        domain_id = COALESCE(p_domain_id, programs.domain_id)
    WHERE programs.id = p_id
    RETURNING programs.id, programs.name, programs.domain_id, programs.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Program with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Program "%" already exists in this domain', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Domain ID % does not exist', p_domain_id;
END;
$$;

-- 7. Delete Program
CREATE OR REPLACE FUNCTION public.sp_program_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.programs
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Program with ID % not found', p_id;
    END IF;
END;
$$;

-- 8. Check if Program Exists
CREATE OR REPLACE FUNCTION public.sp_program_exists(
    p_name TEXT,
    p_domain_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.programs 
        WHERE name = p_name AND domain_id = p_domain_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- 9. Search Programs
CREATE OR REPLACE FUNCTION public.sp_program_search(
    p_search_term TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.name ILIKE '%' || p_search_term || '%'
       OR d.name ILIKE '%' || p_search_term || '%'
    ORDER BY p.name;
END;
$$;

-- 10. Get Program with Level Count
CREATE OR REPLACE FUNCTION public.sp_program_get_with_level_count()
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, 
              created_at TIMESTAMPTZ, level_count BIGINT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, 
           p.created_at, COUNT(l.id) AS level_count
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    LEFT JOIN public.levels l ON p.id = l.program_id
    GROUP BY p.id, p.name, p.domain_id, d.name, p.created_at
    ORDER BY d.name, p.name;
END;
$$;

-- 11. Get Program Levels
CREATE OR REPLACE FUNCTION public.sp_program_get_levels(
    p_program_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.name, l.sort_order, l.created_at
    FROM public.levels l
    WHERE l.program_id = p_program_id
    ORDER BY l.sort_order, l.name;
END;
$$;

-- 12. Get Program with Full Details
CREATE OR REPLACE FUNCTION public.sp_program_get_full_details(
    p_program_id BIGINT
)
RETURNS TABLE(
    program_id BIGINT,
    program_name TEXT,
    program_created_at TIMESTAMPTZ,
    domain_id BIGINT,
    domain_name TEXT,
    level_count BIGINT,
    institution_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS program_id,
        p.name AS program_name,
        p.created_at AS program_created_at,
        p.domain_id,
        d.name AS domain_name,
        COUNT(DISTINCT l.id) AS level_count,
        COUNT(DISTINCT ip.institution_id) AS institution_count
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    LEFT JOIN public.levels l ON p.id = l.program_id
    LEFT JOIN public.institution_programs ip ON p.id = ip.program_id
    WHERE p.id = p_program_id
    GROUP BY p.id, p.name, p.created_at, p.domain_id, d.name;
END;
$$;

-- 13. Get Programs by Institution
CREATE OR REPLACE FUNCTION public.sp_program_get_by_institution(
    p_institution_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    INNER JOIN public.institution_programs ip ON p.id = ip.program_id
    WHERE ip.institution_id = p_institution_id
    ORDER BY p.name;
END;
$$;

-- 14. Count Levels by Program
CREATE OR REPLACE FUNCTION public.sp_program_count_levels(
    p_program_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.levels
    WHERE program_id = p_program_id;
    
    RETURN v_count;
END;
$$;

-- 15. Count Institutions by Program
CREATE OR REPLACE FUNCTION public.sp_program_count_institutions(
    p_program_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.institution_programs
    WHERE program_id = p_program_id;
    
    RETURN v_count;
END;
$$;
