-- ============================================
-- RESOURCES PROCEDURES
-- ============================================

-- First, create the trigger function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.sp_resource_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on resources table (if not exists)
DROP TRIGGER IF EXISTS trg_resources_set_updated_at ON public.resources;
CREATE TRIGGER trg_resources_set_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION sp_resource_set_updated_at();

-- 1. Create Resource
CREATE OR REPLACE FUNCTION public.sp_resource_update(
    p_id BIGINT,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_url TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_license TEXT DEFAULT NULL,
    p_educational_type TEXT DEFAULT NULL,
    p_format TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, "type" TEXT, status TEXT, 
              url TEXT, "language" TEXT, license TEXT, created_by UUID,
              educational_type TEXT, format TEXT,
              created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET 
        title = COALESCE(p_title, resources.title),
        description = COALESCE(p_description, resources.description),
        "type" = COALESCE(p_type::resource_type, resources.type),
        status = COALESCE(p_status::resource_status, resources.status),
        url = COALESCE(p_url, resources.url),
        "language" = COALESCE(p_language, resources.language),
        license = COALESCE(p_license, resources.license),
        educational_type = COALESCE(p_educational_type::resource_educational_type, resources.educational_type),
        format = COALESCE(p_format::resource_format, resources.format)
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.description, 
              resources.type::TEXT, resources.status::TEXT, resources.url, 
              resources.language, resources.license, resources.created_by,
              resources.educational_type::TEXT, resources.format::TEXT,
              resources.created_at, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid type, status, educational_type or format value';
END;
$$;

-- 2. Get Resource by ID
CREATE OR REPLACE FUNCTION public.sp_resource_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID, 
              creator_name TEXT, creator_email TEXT,
              created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, u.email AS creator_email,
           r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.id = p_id;
END;
$$;

-- 3. Get All Resources
CREATE OR REPLACE FUNCTION public.sp_resource_get_all()
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              creator_name TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    ORDER BY r.created_at DESC;
END;
$$;

-- 4. Get Resources by Type
CREATE OR REPLACE FUNCTION public.sp_resource_get_by_type(
    p_type TEXT
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              creator_name TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.type::TEXT = p_type
    ORDER BY r.created_at DESC;
END;
$$;

-- 5. Get Resources by Status
CREATE OR REPLACE FUNCTION public.sp_resource_get_by_status(
    p_status TEXT
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              creator_name TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.status::TEXT = p_status
    ORDER BY r.created_at DESC;
END;
$$;

-- 6. Get Resources by Creator
DROP FUNCTION IF EXISTS public.sp_resource_get_by_creator(UUID);

CREATE OR REPLACE FUNCTION public.sp_resource_get_by_creator(p_created_by UUID)
RETURNS TABLE (
    id BIGINT,
    title TEXT,
    description TEXT,
    status TEXT,
    url TEXT,
    language TEXT,
    license TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    educational_type TEXT,
    format TEXT,
    resource_type_id BIGINT,
    metadata JSONB,
    access_tier TEXT,
    creator_name TEXT,
    creator_avatar_url TEXT,
    view_count BIGINT,
    likes BIGINT,
    rating NUMERIC,
    reviews_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id::BIGINT,
        r.title::TEXT,
        r.description::TEXT,
        r.status::TEXT,
        r.url::TEXT,
        r.language::TEXT,
        r.license::TEXT,
        r.created_at,
        r.updated_at,
        r.created_by,
        r.educational_type::TEXT,
        r.format::TEXT,
        r.resource_type_id::BIGINT,
        r.metadata::JSONB,
        COALESCE(r.access_tier, 'free')::TEXT AS access_tier,
        u.full_name::TEXT AS creator_name,
        u.avatar_url::TEXT AS creator_avatar_url,
        COALESCE(rd.view_count, 0)::BIGINT AS view_count,
        COALESCE(f.likes_count, 0)::BIGINT AS likes,
        COALESCE(rt.avg_rating, 0.0)::NUMERIC AS rating,
        COALESCE(rt.reviews_count, 0)::BIGINT AS reviews_count
    FROM 
        public.resources r
    LEFT JOIN 
        public.users u ON r.created_by = u.id
    LEFT JOIN (
        SELECT resource_id, COUNT(*) AS view_count 
        FROM public.resource_downloads 
        GROUP BY resource_id
    ) rd ON rd.resource_id = r.id
    LEFT JOIN (
        SELECT resource_id, COUNT(*) AS likes_count 
        FROM public.favorites 
        GROUP BY resource_id
    ) f ON f.resource_id = r.id
    LEFT JOIN (
        SELECT resource_id, ROUND(AVG(score)::numeric, 1) AS avg_rating, COUNT(*) AS reviews_count 
        FROM public.ratings 
        GROUP BY resource_id
    ) rt ON rt.resource_id = r.id
    WHERE 
        r.created_by = p_created_by
    ORDER BY 
        r.created_at DESC;
END;
$$;

-- 7. Get Resources by Language
CREATE OR REPLACE FUNCTION public.sp_resource_get_by_language(
    p_language TEXT
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              creator_name TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.language = p_language
    ORDER BY r.created_at DESC;
END;
$$;

-- 8. Update Resource
CREATE OR REPLACE FUNCTION public.sp_resource_update(
    p_id BIGINT,
    p_title TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_url TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_license TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET 
        title = COALESCE(p_title, resources.title),
        description = COALESCE(p_description, resources.description),
        type = COALESCE(p_type::resource_type, resources.type),
        status = COALESCE(p_status::resource_status, resources.status),
        url = COALESCE(p_url, resources.url),
        language = COALESCE(p_language, resources.language),
        license = COALESCE(p_license, resources.license)
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.description, 
              resources.type::TEXT, resources.status::TEXT, resources.url, 
              resources.language, resources.license, resources.created_by,
              resources.created_at, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid type or status value';
END;
$$;

-- 9. Update Resource Status
CREATE OR REPLACE FUNCTION public.sp_resource_update_status(
    p_id BIGINT,
    p_status TEXT
)
RETURNS TABLE(id BIGINT, title TEXT, status TEXT, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET status = p_status::resource_status
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.status::TEXT, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid status value: %', p_status;
END;
$$;

-- 10. Publish Resource (change status to published)
CREATE OR REPLACE FUNCTION public.sp_resource_publish(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, title TEXT, status TEXT, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET status = 'published'::resource_status
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.status::TEXT, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
END;
$$;

-- 11. Archive Resource (change status to archived)
CREATE OR REPLACE FUNCTION public.sp_resource_archive(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, title TEXT, status TEXT, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET status = 'archived'::resource_status
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.status::TEXT, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
END;
$$;

-- 12. Delete Resource
CREATE OR REPLACE FUNCTION public.sp_resource_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.resources
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
END;
$$;

-- 13. Search Resources
CREATE OR REPLACE FUNCTION public.sp_resource_search(
    p_search_term TEXT
)
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              creator_name TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.title ILIKE '%' || p_search_term || '%'
       OR r.description ILIKE '%' || p_search_term || '%'
    ORDER BY r.created_at DESC;
END;
$$;

-- 14. Get Published Resources
CREATE OR REPLACE FUNCTION public.sp_resource_get_published()
RETURNS TABLE(id BIGINT, title TEXT, description TEXT, type TEXT, status TEXT, 
              url TEXT, language TEXT, license TEXT, created_by UUID,
              creator_name TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.status = 'published'::resource_status
    ORDER BY r.created_at DESC;
END;
$$;

-- 15. Count Resources by Type
CREATE OR REPLACE FUNCTION public.sp_resource_count_by_type(
    p_type TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.resources
    WHERE type::TEXT = p_type;
    
    RETURN v_count;
END;
$$;

-- 16. Count Resources by Status
CREATE OR REPLACE FUNCTION public.sp_resource_count_by_status(
    p_status TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.resources
    WHERE status::TEXT = p_status;
    
    RETURN v_count;
END;
$$;

-- 17. Count Resources by Creator
CREATE OR REPLACE FUNCTION public.sp_resource_count_by_creator(
    p_created_by UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.resources
    WHERE created_by = p_created_by;
    
    RETURN v_count;
END;
$$;

-- 18. Get Resources with Ratings
CREATE OR REPLACE FUNCTION public.sp_resource_get_with_ratings()
RETURNS TABLE(id BIGINT, title TEXT, type TEXT, status TEXT, 
              average_rating NUMERIC, rating_count BIGINT,
              created_at TIMESTAMPTZ) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.type::TEXT, r.status::TEXT,
           ROUND(AVG(rat.score), 2) AS average_rating,
           COUNT(rat.score) AS rating_count,
           r.created_at
    FROM public.resources r
    LEFT JOIN public.ratings rat ON r.id = rat.resource_id
    GROUP BY r.id, r.title, r.type, r.status, r.created_at
    ORDER BY average_rating DESC NULLS LAST, r.created_at DESC;
END;
$$;

-- 19. Get Resource Statistics
CREATE OR REPLACE FUNCTION public.sp_resource_get_statistics(
    p_resource_id BIGINT
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    favorites_count BIGINT,
    ratings_count BIGINT,
    average_rating NUMERIC,
    modules_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS resource_id,
        r.title AS resource_title,
        COUNT(DISTINCT f.user_id) AS favorites_count,
        COUNT(DISTINCT rat.user_id) AS ratings_count,
        ROUND(AVG(rat.score), 2) AS average_rating,
        COUNT(DISTINCT rmm.module_id) AS modules_count
    FROM public.resources r
    LEFT JOIN public.favorites f ON r.id = f.resource_id
    LEFT JOIN public.ratings rat ON r.id = rat.resource_id
    LEFT JOIN public.resource_module_map rmm ON r.id = rmm.resource_id
    WHERE r.id = p_resource_id
    GROUP BY r.id, r.title;
END;
$$;

-- 20. Get Available Resource Types (from ENUM)
CREATE OR REPLACE FUNCTION public.sp_resource_get_types()
RETURNS TABLE(type_value TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT enumlabel::TEXT
    FROM pg_enum
    WHERE enumtypid = 'resource_type'::regtype
    ORDER BY enumsortorder;
END;
$$;

-- 21. Get Available Resource Statuses (from ENUM)
CREATE OR REPLACE FUNCTION public.sp_resource_get_statuses()
RETURNS TABLE(status_value TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT enumlabel::TEXT
    FROM pg_enum
    WHERE enumtypid = 'resource_status'::regtype
    ORDER BY enumsortorder;
END;
$$;



---------------------------------------------------------------------------------------------------------
-- helpers -----------
-- ============================================
-- CHECK YOUR ACTUAL ENUM VALUES
-- ============================================

-- Check resource_type ENUM
SELECT enumlabel::TEXT as available_types
FROM pg_enum
WHERE enumtypid = 'public.resource_type'::regtype
ORDER BY enumsortorder;

-- Check resource_status ENUM
SELECT enumlabel::TEXT as available_statuses
FROM pg_enum
WHERE enumtypid = 'public.resource_status'::regtype
ORDER BY enumsortorder;

-- Check resource_educational_type ENUM
SELECT enumlabel::TEXT as available_educational_types
FROM pg_enum
WHERE enumtypid = 'public.resource_educational_type'::regtype
ORDER BY enumsortorder;

-- Check resource_format ENUM
SELECT enumlabel::TEXT as available_formats
FROM pg_enum
WHERE enumtypid = 'public.resource_format'::regtype
ORDER BY enumsortorder;
