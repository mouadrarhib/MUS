-- 1. Add Resource to Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_add(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS TABLE(
    user_id UUID,
    resource_id BIGINT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.resources WHERE id = p_resource_id) THEN
        RAISE EXCEPTION 'Resource with ID % does not exist', p_resource_id;
    END IF;

    RETURN QUERY
    INSERT INTO public.favorites (user_id, resource_id, created_at)
    VALUES (p_user_id, p_resource_id, NOW())
    ON CONFLICT (user_id, resource_id) DO NOTHING
    RETURNING 
        favorites.user_id,
        favorites.resource_id,
        favorites.created_at;
END;
$$;


-- 2. Remove Resource from Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_remove(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.favorites 
    WHERE user_id = p_user_id AND resource_id = p_resource_id;
    RETURN FOUND;
END;
$$;


-- 3. Check if Resource is in Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_exists(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.favorites
        WHERE user_id = p_user_id AND resource_id = p_resource_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;


-- 4. Get All User Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_get_by_user(
    p_user_id UUID
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_status TEXT,
    resource_url TEXT,
    resource_language TEXT,
    resource_license TEXT,
    resource_educational_type TEXT,
    resource_format TEXT,
    resource_type_id INTEGER,
    resource_metadata JSONB,
    resource_created_by UUID,
    resource_created_at TIMESTAMPTZ,
    resource_updated_at TIMESTAMPTZ,
    favorited_at TIMESTAMPTZ,
    average_rating NUMERIC,
    total_ratings BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.status::TEXT,
        res.url,
        res.language,
        res.license,
        res.educational_type::TEXT,
        res.format::TEXT,
        res.resource_type_id,
        res.metadata,
        res.created_by,
        res.created_at,
        res.updated_at,
        f.created_at AS favorited_at,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating,
        COUNT(r.user_id) AS total_ratings
    FROM public.favorites f
    INNER JOIN public.resources res ON f.resource_id = res.id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE f.user_id = p_user_id
    GROUP BY res.id, res.title, res.description, res.status, res.url, 
             res.language, res.license, res.educational_type, res.format,
             res.resource_type_id, res.metadata, res.created_by,
             res.created_at, res.updated_at, f.created_at
    ORDER BY f.created_at DESC;
END;
$$;


-- 5. Get User Favorites by Status
CREATE OR REPLACE FUNCTION public.sp_favorite_get_by_user_status(
    p_user_id UUID,
    p_status TEXT
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_status TEXT,
    resource_format TEXT,
    resource_educational_type TEXT,
    favorited_at TIMESTAMPTZ,
    average_rating NUMERIC,
    total_ratings BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.status::TEXT,
        res.format::TEXT,
        res.educational_type::TEXT,
        f.created_at AS favorited_at,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating,
        COUNT(r.user_id) AS total_ratings
    FROM public.favorites f
    INNER JOIN public.resources res ON f.resource_id = res.id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE f.user_id = p_user_id AND res.status = p_status
    GROUP BY res.id, res.title, res.description, res.status, 
             res.format, res.educational_type, f.created_at
    ORDER BY f.created_at DESC;
END;
$$;


-- 6. Get User Favorites by Educational Type
CREATE OR REPLACE FUNCTION public.sp_favorite_get_by_user_educational_type(
    p_user_id UUID,
    p_educational_type TEXT
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_format TEXT,
    resource_educational_type TEXT,
    favorited_at TIMESTAMPTZ,
    average_rating NUMERIC,
    total_ratings BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.format::TEXT,
        res.educational_type::TEXT,
        f.created_at AS favorited_at,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating,
        COUNT(r.user_id) AS total_ratings
    FROM public.favorites f
    INNER JOIN public.resources res ON f.resource_id = res.id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE f.user_id = p_user_id AND res.educational_type = p_educational_type
    GROUP BY res.id, res.title, res.description, res.format, 
             res.educational_type, f.created_at
    ORDER BY f.created_at DESC;
END;
$$;


-- 7. Get User Favorites by Format
CREATE OR REPLACE FUNCTION public.sp_favorite_get_by_user_format(
    p_user_id UUID,
    p_format TEXT
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_format TEXT,
    resource_educational_type TEXT,
    favorited_at TIMESTAMPTZ,
    average_rating NUMERIC,
    total_ratings BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.format::TEXT,
        res.educational_type::TEXT,
        f.created_at AS favorited_at,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating,
        COUNT(r.user_id) AS total_ratings
    FROM public.favorites f
    INNER JOIN public.resources res ON f.resource_id = res.id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE f.user_id = p_user_id AND res.format = p_format
    GROUP BY res.id, res.title, res.description, res.format, 
             res.educational_type, f.created_at
    ORDER BY f.created_at DESC;
END;
$$;


-- 8. Count User Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_count_by_user(
    p_user_id UUID
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.favorites
    WHERE user_id = p_user_id;
    
    RETURN v_count;
END;
$$;


-- 9. Count Favorites by Resource
CREATE OR REPLACE FUNCTION public.sp_favorite_count_by_resource(
    p_resource_id BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.favorites
    WHERE resource_id = p_resource_id;
    
    RETURN v_count;
END;
$$;


-- 10. Get Most Favorited Resources
CREATE OR REPLACE FUNCTION public.sp_favorite_get_most_popular(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_format TEXT,
    resource_educational_type TEXT,
    favorite_count BIGINT,
    average_rating NUMERIC,
    total_ratings BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.format::TEXT,
        res.educational_type::TEXT,
        COUNT(DISTINCT f.user_id) AS favorite_count,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating,
        COUNT(r.user_id) AS total_ratings
    FROM public.resources res
    INNER JOIN public.favorites f ON res.id = f.resource_id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE res.status = 'published'
    GROUP BY res.id, res.title, res.description, res.format, res.educational_type
    ORDER BY favorite_count DESC, average_rating DESC NULLS LAST
    LIMIT p_limit;
END;
$$;


-- 11. Get User's Recent Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_get_recent_by_user(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_format TEXT,
    resource_educational_type TEXT,
    favorited_at TIMESTAMPTZ,
    average_rating NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.format::TEXT,
        res.educational_type::TEXT,
        f.created_at AS favorited_at,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating
    FROM public.favorites f
    INNER JOIN public.resources res ON f.resource_id = res.id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE f.user_id = p_user_id
    GROUP BY res.id, res.title, res.description, res.format, 
             res.educational_type, f.created_at
    ORDER BY f.created_at DESC
    LIMIT p_limit;
END;
$$;


-- 12. Remove All User Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_remove_all_by_user(
    p_user_id UUID
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted_count BIGINT;
BEGIN
    DELETE FROM public.favorites WHERE user_id = p_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;


-- 13. Get User Favorite Statistics
CREATE OR REPLACE FUNCTION public.sp_favorite_get_user_statistics(
    p_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    total_favorites BIGINT,
    favorites_by_status JSONB,
    favorites_by_educational_type JSONB,
    favorites_by_format JSONB,
    most_recent_favorite_date TIMESTAMPTZ,
    oldest_favorite_date TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_user_id AS user_id,
        COUNT(f.resource_id) AS total_favorites,
        
        (SELECT jsonb_object_agg(res.status, count)
         FROM (
             SELECT res.status::TEXT, COUNT(*)::INTEGER AS count
             FROM public.favorites f
             INNER JOIN public.resources res ON f.resource_id = res.id
             WHERE f.user_id = p_user_id
             GROUP BY res.status
         ) res) AS favorites_by_status,
        
        (SELECT jsonb_object_agg(res.educational_type, count)
         FROM (
             SELECT res.educational_type::TEXT, COUNT(*)::INTEGER AS count
             FROM public.favorites f
             INNER JOIN public.resources res ON f.resource_id = res.id
             WHERE f.user_id = p_user_id AND res.educational_type IS NOT NULL
             GROUP BY res.educational_type
         ) res) AS favorites_by_educational_type,
        
        (SELECT jsonb_object_agg(res.format, count)
         FROM (
             SELECT res.format::TEXT, COUNT(*)::INTEGER AS count
             FROM public.favorites f
             INNER JOIN public.resources res ON f.resource_id = res.id
             WHERE f.user_id = p_user_id AND res.format IS NOT NULL
             GROUP BY res.format
         ) res) AS favorites_by_format,
        
        MAX(f.created_at) AS most_recent_favorite_date,
        MIN(f.created_at) AS oldest_favorite_date
        
    FROM public.favorites f
    WHERE f.user_id = p_user_id;
END;
$$;


-- 14. Search in User's Favorites
CREATE OR REPLACE FUNCTION public.sp_favorite_search_by_user(
    p_user_id UUID,
    p_search_term TEXT
)
RETURNS TABLE(
    resource_id BIGINT,
    resource_title TEXT,
    resource_description TEXT,
    resource_format TEXT,
    resource_educational_type TEXT,
    favorited_at TIMESTAMPTZ,
    average_rating NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::TEXT,
        res.description::TEXT,
        res.format::TEXT,
        res.educational_type::TEXT,
        f.created_at AS favorited_at,
        ROUND(AVG(r.score)::NUMERIC, 2) AS average_rating
    FROM public.favorites f
    INNER JOIN public.resources res ON f.resource_id = res.id
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    WHERE f.user_id = p_user_id
      AND (
          res.title ILIKE '%' || p_search_term || '%' OR
          res.description ILIKE '%' || p_search_term || '%'
      )
    GROUP BY res.id, res.title, res.description, res.format, 
             res.educational_type, f.created_at
    ORDER BY f.created_at DESC;
END;
$$;


-- 15. Toggle Favorite
CREATE OR REPLACE FUNCTION public.sp_favorite_toggle(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS TABLE(
    is_favorited BOOLEAN,
    action TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT sp_favorite_exists(p_user_id, p_resource_id) INTO v_exists;
    
    IF v_exists THEN
        PERFORM sp_favorite_remove(p_user_id, p_resource_id);
        RETURN QUERY SELECT FALSE AS is_favorited, 'removed'::TEXT AS action;
    ELSE
        PERFORM sp_favorite_add(p_user_id, p_resource_id);
        RETURN QUERY SELECT TRUE AS is_favorited, 'added'::TEXT AS action;
    END IF;
END;
$$;


-- 16. Get Users Who Favorited a Resource
CREATE OR REPLACE FUNCTION public.sp_favorite_get_users_by_resource(
    p_resource_id BIGINT
)
RETURNS TABLE(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    favorited_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.email,
        f.created_at AS favorited_at
    FROM public.favorites f
    INNER JOIN public.users u ON f.user_id = u.id
    WHERE f.resource_id = p_resource_id
    ORDER BY f.created_at DESC;
END;
$$;
