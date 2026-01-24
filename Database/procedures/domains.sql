-- ============================================
-- DOMAINS PROCEDURES
-- ============================================

-- 1. Create Domain
CREATE OR REPLACE FUNCTION public.sp_domain_create(
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.domains (name)
    VALUES (p_name)
    RETURNING domains.id, domains.name, domains.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Domain "%" already exists', p_name;
END;
$$;

-- 2. Get Domain by ID
CREATE OR REPLACE FUNCTION public.sp_domain_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    WHERE d.id = p_id;
END;
$$;

-- 3. Get Domain by Name
CREATE OR REPLACE FUNCTION public.sp_domain_get_by_name(
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    WHERE d.name = p_name;
END;
$$;

-- 4. Get All Domains
CREATE OR REPLACE FUNCTION public.sp_domain_get_all()
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    ORDER BY d.name;
END;
$$;

-- 5. Update Domain
CREATE OR REPLACE FUNCTION public.sp_domain_update(
    p_id BIGINT,
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.domains
    SET name = p_name
    WHERE domains.id = p_id
    RETURNING domains.id, domains.name, domains.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Domain with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Domain "%" already exists', p_name;
END;
$$;

-- 6. Delete Domain
CREATE OR REPLACE FUNCTION public.sp_domain_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.domains
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Domain with ID % not found', p_id;
    END IF;
END;
$$;

-- 7. Check if Domain Exists
CREATE OR REPLACE FUNCTION public.sp_domain_exists(
    p_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.domains WHERE name = p_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- 8. Search Domains
CREATE OR REPLACE FUNCTION public.sp_domain_search(
    p_search_term TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    WHERE d.name ILIKE '%' || p_search_term || '%'
    ORDER BY d.name;
END;
$$;

-- 9. Get Domain with Program Count
CREATE OR REPLACE FUNCTION public.sp_domain_get_with_program_count()
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ, program_count BIGINT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at, COUNT(p.id) AS program_count
    FROM public.domains d
    LEFT JOIN public.programs p ON d.id = p.domain_id
    GROUP BY d.id, d.name, d.created_at
    ORDER BY d.name;
END;
$$;

-- 10. Get Domain by ID with Programs
CREATE OR REPLACE FUNCTION public.sp_domain_get_by_id_with_programs(
    p_id BIGINT
)
RETURNS TABLE(
    domain_id BIGINT, 
    domain_name TEXT, 
    domain_created_at TIMESTAMPTZ,
    program_id BIGINT,
    program_name TEXT,
    program_created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id AS domain_id,
        d.name AS domain_name,
        d.created_at AS domain_created_at,
        p.id AS program_id,
        p.name AS program_name,
        p.created_at AS program_created_at
    FROM public.domains d
    LEFT JOIN public.programs p ON d.id = p.domain_id
    WHERE d.id = p_id
    ORDER BY p.name;
END;
$$;

-- 11. Get Programs by Domain
CREATE OR REPLACE FUNCTION public.sp_domain_get_programs(
    p_domain_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.created_at
    FROM public.programs p
    WHERE p.domain_id = p_domain_id
    ORDER BY p.name;
END;
$$;

-- 12. Count Programs by Domain
CREATE OR REPLACE FUNCTION public.sp_domain_count_programs(
    p_domain_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.programs
    WHERE domain_id = p_domain_id;
    
    RETURN v_count;
END;
$$;
