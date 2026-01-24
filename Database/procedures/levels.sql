-- ============================================
-- LEVELS PROCEDURES
-- ============================================

-- 1. Create Level
CREATE OR REPLACE FUNCTION public.sp_level_create(
    p_program_id BIGINT,
    p_name TEXT,
    p_sort_order INTEGER DEFAULT 1
)
RETURNS TABLE(id BIGINT, program_id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.levels (program_id, name, sort_order)
    VALUES (p_program_id, p_name, p_sort_order)
    RETURNING levels.id, levels.program_id, levels.name, levels.sort_order, levels.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Level "%" already exists in this program', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Program ID % does not exist', p_program_id;
END;
$$;

-- 2. Get Level by ID
CREATE OR REPLACE FUNCTION public.sp_level_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, program_id BIGINT, program_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.id = p_id;
END;
$$;

-- 3. Get Level by Name and Program
CREATE OR REPLACE FUNCTION public.sp_level_get_by_name_program(
    p_name TEXT,
    p_program_id BIGINT
)
RETURNS TABLE(id BIGINT, program_id BIGINT, program_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.name = p_name AND l.program_id = p_program_id;
END;
$$;

-- 4. Get All Levels
CREATE OR REPLACE FUNCTION public.sp_level_get_all()
RETURNS TABLE(id BIGINT, program_id BIGINT, program_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    ORDER BY p.name, l.sort_order, l.name;
END;
$$;

-- 5. Get Levels by Program
CREATE OR REPLACE FUNCTION public.sp_level_get_by_program(
    p_program_id BIGINT
)
RETURNS TABLE(id BIGINT, program_id BIGINT, program_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.program_id = p_program_id
    ORDER BY l.sort_order, l.name;
END;
$$;

-- 6. Update Level
CREATE OR REPLACE FUNCTION public.sp_level_update(
    p_id BIGINT,
    p_name TEXT DEFAULT NULL,
    p_program_id BIGINT DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL
)
RETURNS TABLE(id BIGINT, program_id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.levels
    SET 
        name = COALESCE(p_name, levels.name),
        program_id = COALESCE(p_program_id, levels.program_id),
        sort_order = COALESCE(p_sort_order, levels.sort_order)
    WHERE levels.id = p_id
    RETURNING levels.id, levels.program_id, levels.name, levels.sort_order, levels.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Level with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Level "%" already exists in this program', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Program ID % does not exist', p_program_id;
END;
$$;

-- 7. Delete Level
CREATE OR REPLACE FUNCTION public.sp_level_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.levels
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Level with ID % not found', p_id;
    END IF;
END;
$$;

-- 8. Check if Level Exists
CREATE OR REPLACE FUNCTION public.sp_level_exists(
    p_name TEXT,
    p_program_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.levels 
        WHERE name = p_name AND program_id = p_program_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- 9. Search Levels
CREATE OR REPLACE FUNCTION public.sp_level_search(
    p_search_term TEXT
)
RETURNS TABLE(id BIGINT, program_id BIGINT, program_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.name ILIKE '%' || p_search_term || '%'
       OR p.name ILIKE '%' || p_search_term || '%'
    ORDER BY l.sort_order, l.name;
END;
$$;

-- 10. Get Level with Semester Count
CREATE OR REPLACE FUNCTION public.sp_level_get_with_semester_count()
RETURNS TABLE(id BIGINT, program_id BIGINT, program_name TEXT, name TEXT, 
              sort_order INTEGER, created_at TIMESTAMPTZ, semester_count BIGINT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, 
           l.sort_order, l.created_at, COUNT(s.id) AS semester_count
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    LEFT JOIN public.semesters s ON l.id = s.level_id
    GROUP BY l.id, l.program_id, p.name, l.name, l.sort_order, l.created_at
    ORDER BY p.name, l.sort_order, l.name;
END;
$$;

-- 11. Get Level Semesters
CREATE OR REPLACE FUNCTION public.sp_level_get_semesters(
    p_level_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    WHERE s.level_id = p_level_id
    ORDER BY s.sort_order, s.name;
END;
$$;

-- 12. Update Level Sort Order
CREATE OR REPLACE FUNCTION public.sp_level_update_sort_order(
    p_id BIGINT,
    p_sort_order INTEGER
)
RETURNS TABLE(id BIGINT, program_id BIGINT, name TEXT, sort_order INTEGER, created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.levels
    SET sort_order = p_sort_order
    WHERE levels.id = p_id
    RETURNING levels.id, levels.program_id, levels.name, levels.sort_order, levels.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Level with ID % not found', p_id;
    END IF;
END;
$$;

-- 13. Reorder Levels (swap positions)
CREATE OR REPLACE FUNCTION public.sp_level_reorder(
    p_level_id_1 BIGINT,
    p_level_id_2 BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_sort_1 INTEGER;
    v_sort_2 INTEGER;
BEGIN
    -- Get current sort orders
    SELECT sort_order INTO v_sort_1 FROM public.levels WHERE id = p_level_id_1;
    SELECT sort_order INTO v_sort_2 FROM public.levels WHERE id = p_level_id_2;
    
    IF v_sort_1 IS NULL OR v_sort_2 IS NULL THEN
        RAISE EXCEPTION 'One or both level IDs not found';
    END IF;
    
    -- Swap sort orders
    UPDATE public.levels SET sort_order = v_sort_2 WHERE id = p_level_id_1;
    UPDATE public.levels SET sort_order = v_sort_1 WHERE id = p_level_id_2;
    
    RETURN TRUE;
END;
$$;

-- 14. Get Next Sort Order for Program
CREATE OR REPLACE FUNCTION public.sp_level_get_next_sort_order(
    p_program_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_next_order
    FROM public.levels
    WHERE program_id = p_program_id;
    
    RETURN v_next_order;
END;
$$;

-- 15. Count Semesters by Level
CREATE OR REPLACE FUNCTION public.sp_level_count_semesters(
    p_level_id BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.semesters
    WHERE level_id = p_level_id;
    
    RETURN v_count;
END;
$$;

-- 16. Get Level with Full Details
CREATE OR REPLACE FUNCTION public.sp_level_get_full_details(
    p_level_id BIGINT
)
RETURNS TABLE(
    level_id BIGINT,
    level_name TEXT,
    level_sort_order INTEGER,
    level_created_at TIMESTAMPTZ,
    program_id BIGINT,
    program_name TEXT,
    semester_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id AS level_id,
        l.name AS level_name,
        l.sort_order AS level_sort_order,
        l.created_at AS level_created_at,
        l.program_id,
        p.name AS program_name,
        COUNT(s.id) AS semester_count
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    LEFT JOIN public.semesters s ON l.id = s.level_id
    WHERE l.id = p_level_id
    GROUP BY l.id, l.name, l.sort_order, l.created_at, l.program_id, p.name;
END;
$$;
