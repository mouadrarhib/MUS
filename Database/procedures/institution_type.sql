-- ============================================
-- INSTITUTION_TYPES PROCEDURES
-- ============================================

-- 1. Create Institution Type
CREATE OR REPLACE FUNCTION public.sp_institution_type_create(
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.institution_types (name)
    VALUES (p_name)
    RETURNING institution_types.id, institution_types.name, institution_types.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution type "%" already exists', p_name;
END;
$$;

-- 2. Get Institution Type by ID
CREATE OR REPLACE FUNCTION public.sp_institution_type_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT it.id, it.name, it.created_at
    FROM public.institution_types it
    WHERE it.id = p_id;
END;
$$;

-- 3. Get Institution Type by Name
CREATE OR REPLACE FUNCTION public.sp_institution_type_get_by_name(
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT it.id, it.name, it.created_at
    FROM public.institution_types it
    WHERE it.name = p_name;
END;
$$;

-- 4. Get All Institution Types
CREATE OR REPLACE FUNCTION public.sp_institution_type_get_all()
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT it.id, it.name, it.created_at
    FROM public.institution_types it
    ORDER BY it.name;
END;
$$;

-- 5. Update Institution Type
CREATE OR REPLACE FUNCTION public.sp_institution_type_update(
    p_id BIGINT,
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.institution_types
    SET name = p_name
    WHERE institution_types.id = p_id
    RETURNING institution_types.id, institution_types.name, institution_types.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Institution type with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution type "%" already exists', p_name;
END;
$$;

-- 6. Delete Institution Type
CREATE OR REPLACE FUNCTION public.sp_institution_type_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.institution_types
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Institution type with ID % not found', p_id;
    END IF;
END;
$$;

-- 7. Check if Institution Type Exists
CREATE OR REPLACE FUNCTION public.sp_institution_type_exists(
    p_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.institution_types WHERE name = p_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;


-- ============================================
-- INSTITUTIONS PROCEDURES
-- ============================================

-- 1. Create Institution
CREATE OR REPLACE FUNCTION public.sp_institution_create(
    p_name TEXT,
    p_institution_type_id BIGINT,
    p_country TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.institutions (name, institution_type_id, country, city)
    VALUES (p_name, p_institution_type_id, p_country, p_city)
    RETURNING institutions.id, institutions.name, institutions.institution_type_id, 
              institutions.country, institutions.city, institutions.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution "%" already exists in %, %', p_name, p_city, p_country;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Institution type ID % does not exist', p_institution_type_id;
END;
$$;

-- 2. Get Institution by ID
CREATE OR REPLACE FUNCTION public.sp_institution_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.id = p_id;
END;
$$;

-- 3. Get Institution by Name and Location
CREATE OR REPLACE FUNCTION public.sp_institution_get_by_name_location(
    p_name TEXT,
    p_country TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.name = p_name 
      AND (p_country IS NULL OR i.country = p_country)
      AND (p_city IS NULL OR i.city = p_city);
END;
$$;

-- 4. Get All Institutions
CREATE OR REPLACE FUNCTION public.sp_institution_get_all()
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    ORDER BY i.name;
END;
$$;

-- 5. Get Institutions by Type
CREATE OR REPLACE FUNCTION public.sp_institution_get_by_type(
    p_institution_type_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.institution_type_id = p_institution_type_id
    ORDER BY i.name;
END;
$$;

-- 6. Get Institutions by Country
CREATE OR REPLACE FUNCTION public.sp_institution_get_by_country(
    p_country TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.country = p_country
    ORDER BY i.name;
END;
$$;

-- 7. Update Institution
CREATE OR REPLACE FUNCTION public.sp_institution_update(
    p_id BIGINT,
    p_name TEXT DEFAULT NULL,
    p_institution_type_id BIGINT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.institutions
    SET 
        name = COALESCE(p_name, institutions.name),
        institution_type_id = COALESCE(p_institution_type_id, institutions.institution_type_id),
        country = COALESCE(p_country, institutions.country),
        city = COALESCE(p_city, institutions.city)
    WHERE institutions.id = p_id
    RETURNING institutions.id, institutions.name, institutions.institution_type_id, 
              institutions.country, institutions.city, institutions.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Institution with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution "%" already exists in this location', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Institution type ID % does not exist', p_institution_type_id;
END;
$$;

-- 8. Delete Institution
CREATE OR REPLACE FUNCTION public.sp_institution_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.institutions
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Institution with ID % not found', p_id;
    END IF;
END;
$$;

-- 9. Search Institutions
CREATE OR REPLACE FUNCTION public.sp_institution_search(
    p_search_term TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, institution_type_id BIGINT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.name ILIKE '%' || p_search_term || '%'
       OR i.country ILIKE '%' || p_search_term || '%'
       OR i.city ILIKE '%' || p_search_term || '%'
    ORDER BY i.name;
END;
$$;


-- ============================================
-- INSTITUTION_PROGRAMS PROCEDURES
-- ============================================

-- 1. Add Program to Institution
CREATE OR REPLACE FUNCTION public.sp_institution_program_add(
    p_institution_id BIGINT,
    p_program_id BIGINT
)
RETURNS TABLE(institution_id BIGINT, program_id BIGINT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.institution_programs (institution_id, program_id)
    VALUES (p_institution_id, p_program_id)
    ON CONFLICT (institution_id, program_id) DO NOTHING
    RETURNING institution_programs.institution_id, institution_programs.program_id, institution_programs.created_at;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Program already assigned to this institution';
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid institution_id or program_id';
END;
$$;

-- 2. Remove Program from Institution
CREATE OR REPLACE FUNCTION public.sp_institution_program_remove(
    p_institution_id BIGINT,
    p_program_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.institution_programs
    WHERE institution_id = p_institution_id AND program_id = p_program_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

-- 3. Get Programs by Institution
CREATE OR REPLACE FUNCTION public.sp_institution_program_get_by_institution(
    p_institution_id BIGINT
)
RETURNS TABLE(program_id BIGINT, program_name TEXT, domain_id BIGINT, domain_name TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, ip.created_at
    FROM public.institution_programs ip
    INNER JOIN public.programs p ON ip.program_id = p.id
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE ip.institution_id = p_institution_id
    ORDER BY p.name;
END;
$$;

-- 4. Get Institutions by Program
CREATE OR REPLACE FUNCTION public.sp_institution_program_get_by_program(
    p_program_id BIGINT
)
RETURNS TABLE(institution_id BIGINT, institution_name TEXT, institution_type_name TEXT, 
              country TEXT, city TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, it.name AS institution_type_name, i.country, i.city, ip.created_at
    FROM public.institution_programs ip
    INNER JOIN public.institutions i ON ip.institution_id = i.id
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE ip.program_id = p_program_id
    ORDER BY i.name;
END;
$$;

-- 5. Check if Institution has Program
CREATE OR REPLACE FUNCTION public.sp_institution_program_exists(
    p_institution_id BIGINT,
    p_program_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.institution_programs 
        WHERE institution_id = p_institution_id AND program_id = p_program_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- 6. Get All Institution-Program Mappings
CREATE OR REPLACE FUNCTION public.sp_institution_program_get_all()
RETURNS TABLE(institution_id BIGINT, institution_name TEXT, program_id BIGINT, 
              program_name TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT ip.institution_id, i.name AS institution_name, ip.program_id, 
           p.name AS program_name, ip.created_at
    FROM public.institution_programs ip
    INNER JOIN public.institutions i ON ip.institution_id = i.id
    INNER JOIN public.programs p ON ip.program_id = p.id
    ORDER BY i.name, p.name;
END;
$$;

-- 7. Remove All Programs from Institution
CREATE OR REPLACE FUNCTION public.sp_institution_program_remove_all_from_institution(
    p_institution_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM public.institution_programs
    WHERE institution_id = p_institution_id;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- 8. Add Multiple Programs to Institution
CREATE OR REPLACE FUNCTION public.sp_institution_program_add_bulk(
    p_institution_id BIGINT,
    p_program_ids BIGINT[]
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_program_id BIGINT;
    v_count INTEGER := 0;
BEGIN
    FOREACH v_program_id IN ARRAY p_program_ids
    LOOP
        INSERT INTO public.institution_programs (institution_id, program_id)
        VALUES (p_institution_id, v_program_id)
        ON CONFLICT (institution_id, program_id) DO NOTHING;
        
        IF FOUND THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$;
