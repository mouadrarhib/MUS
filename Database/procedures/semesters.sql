-- ============================================
-- SEMESTERS PROCEDURES
-- ============================================

-- 1. Create Semester
CREATE OR REPLACE FUNCTION public.sp_semester_create(
    p_level_id BIGINT,
    p_name TEXT,
    p_sort_order INTEGER DEFAULT 1
)
RETURNS TABLE(id BIGINT, level_id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.semesters (level_id, name, sort_order)
    VALUES (p_level_id, p_name, p_sort_order)
    RETURNING semesters.id, semesters.level_id, semesters.name, semesters.sort_order, semesters.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Semester "%" already exists in this level', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Level ID % does not exist', p_level_id;
END;
$$;

-- 2. Get Semester by ID
CREATE OR REPLACE FUNCTION public.sp_semester_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, level_id BIGINT, level_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.id = p_id;
END;
$$;

-- 3. Get Semester by Name and Level
CREATE OR REPLACE FUNCTION public.sp_semester_get_by_name_level(
    p_name TEXT,
    p_level_id BIGINT
)
RETURNS TABLE(id BIGINT, level_id BIGINT, level_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.name = p_name AND s.level_id = p_level_id;
END;
$$;

-- 4. Get All Semesters
CREATE OR REPLACE FUNCTION public.sp_semester_get_all()
RETURNS TABLE(id BIGINT, level_id BIGINT, level_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    ORDER BY l.sort_order, s.sort_order, s.name;
END;
$$;

-- 5. Get Semesters by Level
CREATE OR REPLACE FUNCTION public.sp_semester_get_by_level(
    p_level_id BIGINT
)
RETURNS TABLE(id BIGINT, level_id BIGINT, level_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.level_id = p_level_id
    ORDER BY s.sort_order, s.name;
END;
$$;

-- 6. Update Semester
CREATE OR REPLACE FUNCTION public.sp_semester_update(
    p_id BIGINT,
    p_name TEXT DEFAULT NULL,
    p_level_id BIGINT DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL
)
RETURNS TABLE(id BIGINT, level_id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.semesters
    SET 
        name = COALESCE(p_name, semesters.name),
        level_id = COALESCE(p_level_id, semesters.level_id),
        sort_order = COALESCE(p_sort_order, semesters.sort_order)
    WHERE semesters.id = p_id
    RETURNING semesters.id, semesters.level_id, semesters.name, semesters.sort_order, semesters.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Semester with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Semester "%" already exists in this level', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Level ID % does not exist', p_level_id;
END;
$$;

-- 7. Delete Semester
CREATE OR REPLACE FUNCTION public.sp_semester_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.semesters
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Semester with ID % not found', p_id;
    END IF;
END;
$$;

-- 8. Check if Semester Exists
CREATE OR REPLACE FUNCTION public.sp_semester_exists(
    p_name TEXT,
    p_level_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.semesters 
        WHERE name = p_name AND level_id = p_level_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- 9. Search Semesters
CREATE OR REPLACE FUNCTION public.sp_semester_search(
    p_search_term TEXT
)
RETURNS TABLE(id BIGINT, level_id BIGINT, level_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.name ILIKE '%' || p_search_term || '%'
       OR l.name ILIKE '%' || p_search_term || '%'
    ORDER BY s.sort_order, s.name;
END;
$$;

-- 10. Get Semester with Module Count
CREATE OR REPLACE FUNCTION public.sp_semester_get_with_module_count()
RETURNS TABLE(id BIGINT, level_id BIGINT, level_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ, module_count BIGINT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, 
           s.sort_order, s.created_at, COUNT(m.id) AS module_count
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    LEFT JOIN public.modules m ON s.id = m.semester_id
    GROUP BY s.id, s.level_id, l.name, s.name, s.sort_order, s.created_at
    ORDER BY l.sort_order, s.sort_order, s.name;
END;
$$;

-- 11. Get Semester Modules
CREATE OR REPLACE FUNCTION public.sp_semester_get_modules(
    p_semester_id BIGINT
)
RETURNS TABLE(id BIGINT, code TEXT, title TEXT, description TEXT, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.code, m.title, m.description, m.created_at
    FROM public.modules m
    WHERE m.semester_id = p_semester_id
    ORDER BY m.code, m.title;
END;
$$;

-- 12. Update Semester Sort Order
CREATE OR REPLACE FUNCTION public.sp_semester_update_sort_order(
    p_id BIGINT,
    p_sort_order INTEGER
)
RETURNS TABLE(id BIGINT, level_id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.semesters
    SET sort_order = p_sort_order
    WHERE semesters.id = p_id
    RETURNING semesters.id, semesters.level_id, semesters.name, semesters.sort_order, semesters.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Semester with ID % not found', p_id;
    END IF;
END;
$$;

-- 13. Reorder Semesters (swap positions)
CREATE OR REPLACE FUNCTION public.sp_semester_reorder(
    p_semester_id_1 BIGINT,
    p_semester_id_2 BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_sort_1 INTEGER;
    v_sort_2 INTEGER;
BEGIN
    -- Get current sort orders
    SELECT sort_order INTO v_sort_1 FROM public.semesters WHERE id = p_semester_id_1;
    SELECT sort_order INTO v_sort_2 FROM public.semesters WHERE id = p_semester_id_2;
    
    IF v_sort_1 IS NULL OR v_sort_2 IS NULL THEN
        RAISE EXCEPTION 'One or both semester IDs not found';
    END IF;
    
    -- Swap sort orders
    UPDATE public.semesters SET sort_order = v_sort_2 WHERE id = p_semester_id_1;
    UPDATE public.semesters SET sort_order = v_sort_1 WHERE id = p_semester_id_2;
    
    RETURN TRUE;
END;
$$;

-- 14. Get Next Sort Order for Level
CREATE OR REPLACE FUNCTION public.sp_semester_get_next_sort_order(
    p_level_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_next_order
    FROM public.semesters
    WHERE level_id = p_level_id;
    
    RETURN v_next_order;
END;
$$;

-- 15. Count Modules by Semester
CREATE OR REPLACE FUNCTION public.sp_semester_count_modules(
    p_semester_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.modules
    WHERE semester_id = p_semester_id;
    
    RETURN v_count;
END;
$$;

-- 16. Get Semester with Full Hierarchy
CREATE OR REPLACE FUNCTION public.sp_semester_get_full_hierarchy(
    p_semester_id BIGINT
)
RETURNS TABLE(
    semester_id BIGINT,
    semester_name TEXT,
    semester_sort_order INTEGER,
    semester_created_at TIMESTAMPTZ,
    level_id BIGINT,
    level_name TEXT,
    program_id BIGINT,
    program_name TEXT,
    domain_id BIGINT,
    domain_name TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS semester_id,
        s.name AS semester_name,
        s.sort_order AS semester_sort_order,
        s.created_at AS semester_created_at,
        l.id AS level_id,
        l.name AS level_name,
        p.id AS program_id,
        p.name AS program_name,
        d.id AS domain_id,
        d.name AS domain_name
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    LEFT JOIN public.programs p ON l.program_id = p.id
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE s.id = p_semester_id;
END;
$$;

-- 17. Get Semester with Full Details
CREATE OR REPLACE FUNCTION public.sp_semester_get_full_details(
    p_semester_id BIGINT
)
RETURNS TABLE(
    semester_id BIGINT,
    semester_name TEXT,
    semester_sort_order INTEGER,
    semester_created_at TIMESTAMPTZ,
    level_id BIGINT,
    level_name TEXT,
    module_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS semester_id,
        s.name AS semester_name,
        s.sort_order AS semester_sort_order,
        s.created_at AS semester_created_at,
        s.level_id,
        l.name AS level_name,
        COUNT(m.id) AS module_count
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    LEFT JOIN public.modules m ON s.id = m.semester_id
    WHERE s.id = p_semester_id
    GROUP BY s.id, s.name, s.sort_order, s.created_at, s.level_id, l.name;
END;
$$;
