-- ============================================================================
-- RATING MANAGEMENT STORED PROCEDURES
-- Version: 1.0
-- Date: 2026-01-31
-- Description: Complete rating and review management system
-- ============================================================================

-- ============================================================================
-- 1. CREATE RATING
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_create(uuid, bigint, int4, text);

CREATE OR REPLACE FUNCTION public.sp_rating_create(
    p_user_id uuid,
    p_resource_id bigint,
    p_score integer,
    p_comment text DEFAULT NULL
)
RETURNS TABLE(
    user_id uuid,
    resource_id bigint,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate score range (1-5)
    IF p_score < 1 OR p_score > 5 THEN
        RAISE EXCEPTION 'Score must be between 1 and 5';
    END IF;

    RETURN QUERY
    INSERT INTO public.ratings (user_id, resource_id, score, comment, created_at, updated_at)
    VALUES (p_user_id, p_resource_id, p_score, p_comment, NOW(), NOW())
    RETURNING 
        ratings.user_id,
        ratings.resource_id,
        ratings.score,
        ratings.comment,
        ratings.created_at,
        ratings.updated_at;
END;
$$;

-- ============================================================================
-- 2. GET RATING BY USER AND RESOURCE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_by_user_resource(uuid, bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_get_by_user_resource(
    p_user_id uuid,
    p_resource_id bigint
)
RETURNS TABLE(
    user_id uuid,
    resource_id bigint,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.user_id,
        r.resource_id,
        r.score,
        r.comment,
        r.created_at,
        r.updated_at
    FROM public.ratings r
    WHERE r.user_id = p_user_id AND r.resource_id = p_resource_id;
END;
$$;

-- ============================================================================
-- 3. GET ALL RATINGS BY RESOURCE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_by_resource(bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_get_by_resource(p_resource_id bigint)
RETURNS TABLE(
    user_id uuid,
    user_full_name text,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.user_id,
        u.full_name AS user_full_name,
        r.score,
        r.comment,
        r.created_at,
        r.updated_at
    FROM public.ratings r
    INNER JOIN public.users u ON r.user_id = u.id
    WHERE r.resource_id = p_resource_id
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- 4. GET ALL RATINGS BY USER
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_by_user(uuid);

CREATE OR REPLACE FUNCTION public.sp_rating_get_by_user(p_user_id uuid)
RETURNS TABLE(
    resource_id bigint,
    resource_title text,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.resource_id,
        res.title AS resource_title,
        r.score,
        r.comment,
        r.created_at,
        r.updated_at
    FROM public.ratings r
    INNER JOIN public.resources res ON r.resource_id = res.id
    WHERE r.user_id = p_user_id
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- 5. UPDATE RATING
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_update(uuid, bigint, int4, text);

CREATE OR REPLACE FUNCTION public.sp_rating_update(
    p_user_id uuid,
    p_resource_id bigint,
    p_score integer,
    p_comment text
)
RETURNS TABLE(
    user_id uuid,
    resource_id bigint,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate score range (1-5)
    IF p_score < 1 OR p_score > 5 THEN
        RAISE EXCEPTION 'Score must be between 1 and 5';
    END IF;

    RETURN QUERY
    UPDATE public.ratings
    SET 
        score = p_score,
        comment = p_comment,
        updated_at = NOW()
    WHERE ratings.user_id = p_user_id AND ratings.resource_id = p_resource_id
    RETURNING 
        ratings.user_id,
        ratings.resource_id,
        ratings.score,
        ratings.comment,
        ratings.created_at,
        ratings.updated_at;
END;
$$;

-- ============================================================================
-- 6. DELETE RATING
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_delete(uuid, bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_delete(
    p_user_id uuid,
    p_resource_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.ratings 
    WHERE user_id = p_user_id AND resource_id = p_resource_id;
    RETURN FOUND;
END;
$$;

-- ============================================================================
-- 7. CHECK IF RATING EXISTS
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_exists(uuid, bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_exists(
    p_user_id uuid,
    p_resource_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.ratings
        WHERE user_id = p_user_id AND resource_id = p_resource_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- ============================================================================
-- 8. GET AVERAGE RATING FOR RESOURCE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_average(bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_get_average(p_resource_id bigint)
RETURNS TABLE(
    resource_id bigint,
    average_score numeric,
    total_ratings bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_resource_id AS resource_id,
        ROUND(AVG(r.score)::numeric, 2) AS average_score,
        COUNT(r.user_id) AS total_ratings
    FROM public.ratings r
    WHERE r.resource_id = p_resource_id
    GROUP BY p_resource_id;
END;
$$;

-- ============================================================================
-- 9. GET RATING STATISTICS FOR RESOURCE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_statistics(bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_get_statistics(p_resource_id bigint)
RETURNS TABLE(
    resource_id bigint,
    average_score numeric,
    total_ratings bigint,
    five_star_count bigint,
    four_star_count bigint,
    three_star_count bigint,
    two_star_count bigint,
    one_star_count bigint,
    with_comment_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_resource_id AS resource_id,
        ROUND(AVG(r.score)::numeric, 2) AS average_score,
        COUNT(r.user_id) AS total_ratings,
        COUNT(r.user_id) FILTER (WHERE r.score = 5) AS five_star_count,
        COUNT(r.user_id) FILTER (WHERE r.score = 4) AS four_star_count,
        COUNT(r.user_id) FILTER (WHERE r.score = 3) AS three_star_count,
        COUNT(r.user_id) FILTER (WHERE r.score = 2) AS two_star_count,
        COUNT(r.user_id) FILTER (WHERE r.score = 1) AS one_star_count,
        COUNT(r.user_id) FILTER (WHERE r.comment IS NOT NULL AND r.comment != '') AS with_comment_count
    FROM public.ratings r
    WHERE r.resource_id = p_resource_id;
END;
$$;

-- ============================================================================
-- 10. GET RESOURCES WITH RATINGS (for listing)
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_resources_with_ratings();

CREATE OR REPLACE FUNCTION public.sp_rating_get_resources_with_ratings()
RETURNS TABLE(
    resource_id bigint,
    resource_title text,
    resource_status text,
    average_score numeric,
    total_ratings bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id AS resource_id,
        res.title::text AS resource_title,
        res.status::text AS resource_status,
        ROUND(AVG(r.score)::numeric, 2) AS average_score,
        COUNT(r.user_id) AS total_ratings
    FROM public.resources res
    LEFT JOIN public.ratings r ON res.id = r.resource_id
    GROUP BY res.id, res.title, res.status
    ORDER BY average_score DESC NULLS LAST, total_ratings DESC;
END;
$$;

-- ============================================================================
-- 11. GET TOP RATED RESOURCES
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_top_rated(integer, integer);

CREATE OR REPLACE FUNCTION public.sp_rating_get_top_rated(
    p_limit integer DEFAULT 10,
    p_min_ratings integer DEFAULT 5
)
RETURNS TABLE(
    resource_id bigint,
    resource_title text,
    resource_description text,
    resource_format text,
    average_score numeric,
    total_ratings bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        res.id,
        res.title::text,
        res.description::text,
        res.format::text,
        ROUND(AVG(r.score)::numeric, 2),
        COUNT(r.user_id)::bigint
    FROM public.resources res
    INNER JOIN public.ratings r ON res.id = r.resource_id
    WHERE res.status = 'published'
    GROUP BY res.id, res.title, res.description, res.format
    HAVING COUNT(r.user_id)::bigint >= p_min_ratings::bigint
    ORDER BY AVG(r.score) DESC, COUNT(r.user_id) DESC
    LIMIT p_limit;
END;
$$;

-- ============================================================================
-- 12. GET RECENT RATINGS
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_recent(int4);

CREATE OR REPLACE FUNCTION public.sp_rating_get_recent(p_limit integer DEFAULT 10)
RETURNS TABLE(
    user_id uuid,
    user_full_name text,
    resource_id bigint,
    resource_title text,
    score integer,
    comment text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.user_id,
        u.full_name AS user_full_name,
        r.resource_id,
        res.title AS resource_title,
        r.score,
        r.comment,
        r.created_at
    FROM public.ratings r
    INNER JOIN public.users u ON r.user_id = u.id
    INNER JOIN public.resources res ON r.resource_id = res.id
    ORDER BY r.created_at DESC
    LIMIT p_limit;
END;
$$;

-- ============================================================================
-- 13. GET RATINGS BY SCORE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_by_score(bigint, int4);

CREATE OR REPLACE FUNCTION public.sp_rating_get_by_score(
    p_resource_id bigint,
    p_score integer
)
RETURNS TABLE(
    user_id uuid,
    user_full_name text,
    score integer,
    comment text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.user_id,
        u.full_name AS user_full_name,
        r.score,
        r.comment,
        r.created_at
    FROM public.ratings r
    INNER JOIN public.users u ON r.user_id = u.id
    WHERE r.resource_id = p_resource_id AND r.score = p_score
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- 14. COUNT RATINGS BY RESOURCE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_count_by_resource(bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_count_by_resource(p_resource_id bigint)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.ratings
    WHERE resource_id = p_resource_id;
    
    RETURN v_count;
END;
$$;

-- ============================================================================
-- 15. COUNT RATINGS BY USER
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_count_by_user(uuid);

CREATE OR REPLACE FUNCTION public.sp_rating_count_by_user(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.ratings
    WHERE user_id = p_user_id;
    
    RETURN v_count;
END;
$$;

-- ============================================================================
-- 16. GET USER RATING SUMMARY
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_user_summary(uuid);

CREATE OR REPLACE FUNCTION public.sp_rating_get_user_summary(p_user_id uuid)
RETURNS TABLE(
    user_id uuid,
    total_ratings bigint,
    average_score_given numeric,
    five_star_given bigint,
    four_star_given bigint,
    three_star_given bigint,
    two_star_given bigint,
    one_star_given bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_user_id AS user_id,
        COUNT(r.resource_id) AS total_ratings,
        ROUND(AVG(r.score)::numeric, 2) AS average_score_given,
        COUNT(r.resource_id) FILTER (WHERE r.score = 5) AS five_star_given,
        COUNT(r.resource_id) FILTER (WHERE r.score = 4) AS four_star_given,
        COUNT(r.resource_id) FILTER (WHERE r.score = 3) AS three_star_given,
        COUNT(r.resource_id) FILTER (WHERE r.score = 2) AS two_star_given,
        COUNT(r.resource_id) FILTER (WHERE r.score = 1) AS one_star_given
    FROM public.ratings r
    WHERE r.user_id = p_user_id;
END;
$$;

-- ============================================================================
-- 17. GET RATINGS WITH COMMENTS ONLY
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_with_comments(bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_get_with_comments(p_resource_id bigint)
RETURNS TABLE(
    user_id uuid,
    user_full_name text,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.user_id,
        u.full_name AS user_full_name,
        r.score,
        r.comment,
        r.created_at,
        r.updated_at
    FROM public.ratings r
    INNER JOIN public.users u ON r.user_id = u.id
    WHERE r.resource_id = p_resource_id 
      AND r.comment IS NOT NULL 
      AND r.comment != ''
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- 18. UPSERT RATING (Create or Update)
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_upsert(uuid, bigint, int4, text);

CREATE OR REPLACE FUNCTION public.sp_rating_upsert(
    p_user_id uuid,
    p_resource_id bigint,
    p_score integer,
    p_comment text DEFAULT NULL
)
RETURNS TABLE(
    user_id uuid,
    resource_id bigint,
    score integer,
    comment text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    is_new boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists boolean;
BEGIN
    -- Validate score range (1-5)
    IF p_score < 1 OR p_score > 5 THEN
        RAISE EXCEPTION 'Score must be between 1 and 5';
    END IF;

    -- Check if rating exists
    SELECT sp_rating_exists(p_user_id, p_resource_id) INTO v_exists;

    IF v_exists THEN
        -- Update existing rating
        RETURN QUERY
        UPDATE public.ratings
        SET 
            score = p_score,
            comment = p_comment,
            updated_at = NOW()
        WHERE ratings.user_id = p_user_id AND ratings.resource_id = p_resource_id
        RETURNING 
            ratings.user_id,
            ratings.resource_id,
            ratings.score,
            ratings.comment,
            ratings.created_at,
            ratings.updated_at,
            false AS is_new;
    ELSE
        -- Create new rating
        RETURN QUERY
        INSERT INTO public.ratings (user_id, resource_id, score, comment, created_at, updated_at)
        VALUES (p_user_id, p_resource_id, p_score, p_comment, NOW(), NOW())
        RETURNING 
            ratings.user_id,
            ratings.resource_id,
            ratings.score,
            ratings.comment,
            ratings.created_at,
            ratings.updated_at,
            true AS is_new;
    END IF;
END;
$$;

-- ============================================================================
-- 19. GET RATINGS BY DATE RANGE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_get_by_date_range(bigint, timestamp, timestamp);

CREATE OR REPLACE FUNCTION public.sp_rating_get_by_date_range(
    p_resource_id bigint,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone
)
RETURNS TABLE(
    user_id uuid,
    user_full_name text,
    score integer,
    comment text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.user_id,
        u.full_name AS user_full_name,
        r.score,
        r.comment,
        r.created_at
    FROM public.ratings r
    INNER JOIN public.users u ON r.user_id = u.id
    WHERE r.resource_id = p_resource_id 
      AND r.created_at >= p_start_date 
      AND r.created_at <= p_end_date
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- 20. DELETE ALL RATINGS FOR RESOURCE
-- ============================================================================
DROP FUNCTION IF EXISTS public.sp_rating_delete_by_resource(bigint);

CREATE OR REPLACE FUNCTION public.sp_rating_delete_by_resource(p_resource_id bigint)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted_count bigint;
BEGIN
    DELETE FROM public.ratings WHERE resource_id = p_resource_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
-- CREATE INDEX IF NOT EXISTS idx_ratings_resource_id ON public.ratings(resource_id);
-- CREATE INDEX IF NOT EXISTS idx_ratings_score ON public.ratings(score);
-- CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_ratings_user_resource ON public.ratings(user_id, resource_id);

-- ============================================================================
-- GRANTS (Adjust according to your roles)
-- ============================================================================
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_role;

-- ============================================================================
-- END OF RATING FUNCTIONS
-- ============================================================================
