-- ============================================================================
-- MODULE MANAGEMENT STORED PROCEDURES
-- ============================================================================

-- ============================================================================
-- 1. CREATE MODULE
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_create(bigint, text, text, text);

CREATE OR REPLACE FUNCTION public.sp_module_create(
    p_semester_id bigint,
    p_code text,
    p_title text,
    p_description text DEFAULT NULL
)
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.modules (semester_id, code, title, description, created_at)
    VALUES (p_semester_id, p_code, p_title, p_description, NOW())
    RETURNING 
        modules.id,
        modules.semester_id,
        modules.code,
        modules.title,
        modules.description,
        modules.created_at;
END;
$$;

-- ============================================================================
-- 2. GET MODULE BY ID
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_id(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_id(p_id bigint)
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.semester_id,
        m.code,
        m.title,
        m.description,
        m.created_at
    FROM public.modules m
    WHERE m.id = p_id;
END;
$$;

-- ============================================================================
-- 3. GET MODULE BY CODE AND SEMESTER
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_code_semester(text, bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_code_semester(
    p_code text,
    p_semester_id bigint
)
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.semester_id,
        m.code,
        m.title,
        m.description,
        m.created_at
    FROM public.modules m
    WHERE m.code = p_code AND m.semester_id = p_semester_id;
END;
$$;

-- ============================================================================
-- 4. GET ALL MODULES
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_all();

CREATE OR REPLACE FUNCTION public.sp_module_get_all()
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.semester_id,
        m.code,
        m.title,
        m.description,
        m.created_at
    FROM public.modules m
    ORDER BY m.code;
END;
$$;

-- ============================================================================
-- 5. GET MODULES BY SEMESTER
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_semester(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_semester(p_semester_id bigint)
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.semester_id,
        m.code,
        m.title,
        m.description,
        m.created_at
    FROM public.modules m
    WHERE m.semester_id = p_semester_id
    ORDER BY m.code;
END;
$$;

-- ============================================================================
-- 6. UPDATE MODULE
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_update(bigint, text, text, text, bigint);

CREATE OR REPLACE FUNCTION public.sp_module_update(
    p_id bigint,
    p_code text,
    p_title text,
    p_description text,
    p_semester_id bigint
)
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.modules
    SET 
        code = p_code,
        title = p_title,
        description = p_description,
        semester_id = p_semester_id
    WHERE modules.id = p_id
    RETURNING 
        modules.id,
        modules.semester_id,
        modules.code,
        modules.title,
        modules.description,
        modules.created_at;
END;
$$;

-- ============================================================================
-- 7. DELETE MODULE
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_delete(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_delete(p_id bigint)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.modules WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- ============================================================================
-- 8. CHECK IF MODULE EXISTS
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_exists(text, bigint);

CREATE OR REPLACE FUNCTION public.sp_module_exists(
    p_code text,
    p_semester_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.modules
        WHERE code = p_code AND semester_id = p_semester_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- ============================================================================
-- 9. SEARCH MODULES
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_search(text);

CREATE OR REPLACE FUNCTION public.sp_module_search(p_search_term text)
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.semester_id,
        m.code,
        m.title,
        m.description,
        m.created_at
    FROM public.modules m
    WHERE 
        m.code ILIKE '%' || p_search_term || '%' OR
        m.title ILIKE '%' || p_search_term || '%' OR
        m.description ILIKE '%' || p_search_term || '%'
    ORDER BY m.code;
END;
$$;

-- ============================================================================
-- 10. GET MODULES WITH RESOURCE COUNT
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_with_resource_count();

CREATE OR REPLACE FUNCTION public.sp_module_get_with_resource_count()
RETURNS TABLE(
    id bigint,
    semester_id bigint,
    code text,
    title text,
    description text,
    created_at timestamp with time zone,
    resource_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.semester_id,
        m.code,
        m.title,
        m.description,
        m.created_at,
        COUNT(rmm.resource_id) AS resource_count
    FROM public.modules m
    LEFT JOIN public.resource_module_map rmm ON m.id = rmm.module_id
    GROUP BY m.id, m.semester_id, m.code, m.title, m.description, m.created_at
    ORDER BY m.code;
END;
$$;

-- ============================================================================
-- 11. GET MODULE RESOURCES
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_resources(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_resources(p_module_id bigint)
RETURNS TABLE(
    resource_id bigint,
    resource_title text,
    resource_description text,
    resource_status text,
    resource_url text,
    resource_format text,
    resource_type_id bigint,
    chapter text,
    difficulty text,
    exam_related boolean,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS resource_id,
        r.title AS resource_title,
        r.description AS resource_description,
        r.status AS resource_status,
        r.url AS resource_url,
        r.format AS resource_format,
        r.resource_type_id,
        rmm.chapter,
        rmm.difficulty,
        rmm.exam_related,
        rmm.created_at
    FROM public.resource_module_map rmm
    INNER JOIN public.resources r ON rmm.resource_id = r.id
    WHERE rmm.module_id = p_module_id
    ORDER BY rmm.chapter, r.title;
END;
$$;

-- ============================================================================
-- 12. COUNT MODULE RESOURCES
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_count_resources(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_count_resources(p_module_id bigint)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.resource_module_map
    WHERE module_id = p_module_id;
    
    RETURN v_count;
END;
$$;

-- ============================================================================
-- 13. GET MODULE FULL HIERARCHY (with semester, level, program, domain info)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_full_hierarchy(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_full_hierarchy(p_module_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    module_description text,
    semester_id bigint,
    semester_name text,
    level_id bigint,
    level_name text,
    program_id bigint,
    program_name text,
    domain_id bigint,
    domain_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        m.description AS module_description,
        s.id AS semester_id,
        s.name AS semester_name,
        l.id AS level_id,
        l.name AS level_name,
        p.id AS program_id,
        p.name AS program_name,
        d.id AS domain_id,
        d.name AS domain_name
    FROM public.modules m
    INNER JOIN public.semesters s ON m.semester_id = s.id
    INNER JOIN public.levels l ON s.level_id = l.id
    INNER JOIN public.programs p ON l.program_id = p.id
    INNER JOIN public.domains d ON p.domain_id = d.id
    WHERE m.id = p_module_id;
END;
$$;

-- ============================================================================
-- 14. GET MODULE FULL DETAILS (with all related info and resource count)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_full_details(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_full_details(p_module_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    module_description text,
    module_created_at timestamp with time zone,
    semester_id bigint,
    semester_name text,
    level_id bigint,
    level_name text,
    program_id bigint,
    program_name text,
    domain_id bigint,
    domain_name text,
    resource_count bigint,
    exam_resource_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        m.description AS module_description,
        m.created_at AS module_created_at,
        s.id AS semester_id,
        s.name AS semester_name,
        l.id AS level_id,
        l.name AS level_name,
        p.id AS program_id,
        p.name AS program_name,
        d.id AS domain_id,
        d.name AS domain_name,
        COUNT(rmm.resource_id) AS resource_count,
        COUNT(rmm.resource_id) FILTER (WHERE rmm.exam_related = true) AS exam_resource_count
    FROM public.modules m
    INNER JOIN public.semesters s ON m.semester_id = s.id
    INNER JOIN public.levels l ON s.level_id = l.id
    INNER JOIN public.programs p ON l.program_id = p.id
    INNER JOIN public.domains d ON p.domain_id = d.id
    LEFT JOIN public.resource_module_map rmm ON m.id = rmm.module_id
    WHERE m.id = p_module_id
    GROUP BY 
        m.id, m.code, m.title, m.description, m.created_at,
        s.id, s.name,
        l.id, l.name,
        p.id, p.name,
        d.id, d.name;
END;
$$;

-- ============================================================================
-- 15. GET MODULES BY LEVEL (all modules in a specific level)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_level(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_level(p_level_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    module_description text,
    semester_id bigint,
    semester_name text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        m.description AS module_description,
        s.id AS semester_id,
        s.name AS semester_name,
        m.created_at
    FROM public.modules m
    INNER JOIN public.semesters s ON m.semester_id = s.id
    WHERE s.level_id = p_level_id
    ORDER BY s.sort_order, m.code;
END;
$$;

-- ============================================================================
-- 16. GET MODULES BY PROGRAM (all modules in a specific program)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_program(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_program(p_program_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    module_description text,
    semester_id bigint,
    semester_name text,
    level_id bigint,
    level_name text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        m.description AS module_description,
        s.id AS semester_id,
        s.name AS semester_name,
        l.id AS level_id,
        l.name AS level_name,
        m.created_at
    FROM public.modules m
    INNER JOIN public.semesters s ON m.semester_id = s.id
    INNER JOIN public.levels l ON s.level_id = l.id
    WHERE l.program_id = p_program_id
    ORDER BY l.sort_order, s.sort_order, m.code;
END;
$$;

-- ============================================================================
-- 17. GET MODULES BY DOMAIN (all modules in a specific domain)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_domain(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_domain(p_domain_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    program_id bigint,
    program_name text,
    level_name text,
    semester_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        p.id AS program_id,
        p.name AS program_name,
        l.name AS level_name,
        s.name AS semester_name
    FROM public.modules m
    INNER JOIN public.semesters s ON m.semester_id = s.id
    INNER JOIN public.levels l ON s.level_id = l.id
    INNER JOIN public.programs p ON l.program_id = p.id
    WHERE p.domain_id = p_domain_id
    ORDER BY p.name, l.sort_order, s.sort_order, m.code;
END;
$$;

-- ============================================================================
-- 18. COUNT MODULES BY SEMESTER
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_count_by_semester(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_count_by_semester(p_semester_id bigint)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.modules
    WHERE semester_id = p_semester_id;
    
    RETURN v_count;
END;
$$;

-- ============================================================================
-- 19. GET MODULE STATISTICS (resource types breakdown)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_statistics(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_statistics(p_module_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    total_resources bigint,
    exam_resources bigint,
    non_exam_resources bigint,
    resource_types jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        COUNT(rmm.resource_id) AS total_resources,
        COUNT(rmm.resource_id) FILTER (WHERE rmm.exam_related = true) AS exam_resources,
        COUNT(rmm.resource_id) FILTER (WHERE rmm.exam_related = false OR rmm.exam_related IS NULL) AS non_exam_resources,
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'type_id', rt.id,
                'type_name', rt.name,
                'count', (
                    SELECT COUNT(*)
                    FROM public.resource_module_map rmm2
                    INNER JOIN public.resources r2 ON rmm2.resource_id = r2.id
                    WHERE rmm2.module_id = m.id AND r2.resource_type_id = rt.id
                )
            )
        ) FILTER (WHERE rt.id IS NOT NULL) AS resource_types
    FROM public.modules m
    LEFT JOIN public.resource_module_map rmm ON m.id = rmm.module_id
    LEFT JOIN public.resources r ON rmm.resource_id = r.id
    LEFT JOIN public.resource_types rt ON r.resource_type_id = rt.id
    WHERE m.id = p_module_id
    GROUP BY m.id, m.code, m.title;
END;
$$;

-- ============================================================================
-- 20. GET MODULES BY RESOURCE TYPE (find modules with specific resource type)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.sp_module_get_by_resource_type(bigint);

CREATE OR REPLACE FUNCTION public.sp_module_get_by_resource_type(p_resource_type_id bigint)
RETURNS TABLE(
    module_id bigint,
    module_code text,
    module_title text,
    semester_name text,
    resource_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title,
        s.name AS semester_name,
        COUNT(rmm.resource_id) AS resource_count
    FROM public.modules m
    INNER JOIN public.semesters s ON m.semester_id = s.id
    INNER JOIN public.resource_module_map rmm ON m.id = rmm.module_id
    INNER JOIN public.resources r ON rmm.resource_id = r.id
    WHERE r.resource_type_id = p_resource_type_id
    GROUP BY m.id, m.code, m.title, s.name
    ORDER BY resource_count DESC, m.code;
END;
$$;
