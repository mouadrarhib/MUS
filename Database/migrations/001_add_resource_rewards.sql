-- ============================================
-- 1. ADD POINTS COLUMN TO USERS
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- ============================================
-- 2. CREATE RESOURCE_DOWNLOADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.resource_downloads (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    resource_id BIGINT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_resource_download UNIQUE(user_id, resource_id)
);

-- ============================================
-- 3. STORED PROCEDURE: RECORD DOWNLOAD
-- ============================================
CREATE OR REPLACE FUNCTION public.sp_resource_record_download(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    points_awarded INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner_id UUID;
    v_already_downloaded BOOLEAN;
BEGIN
    -- Check if resource exists and get owner
    SELECT created_by INTO v_owner_id
    FROM public.resources
    WHERE id = p_resource_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_resource_id;
    END IF;

    -- Check if already downloaded
    SELECT EXISTS(
        SELECT 1 FROM public.resource_downloads
        WHERE user_id = p_user_id AND resource_id = p_resource_id
    ) INTO v_already_downloaded;

    IF v_already_downloaded THEN
        -- Already downloaded: update timestamp but NO points
        UPDATE public.resource_downloads
        SET downloaded_at = NOW()
        WHERE user_id = p_user_id AND resource_id = p_resource_id;
        
        RETURN QUERY SELECT TRUE, 'Resource already downloaded'::TEXT, 0;
    ELSE
        -- First time download: Record it
        INSERT INTO public.resource_downloads (user_id, resource_id)
        VALUES (p_user_id, p_resource_id);

        -- Award points to owner (if not self-download)
        IF v_owner_id != p_user_id THEN
            UPDATE public.users
            SET points = COALESCE(points, 0) + 10
            WHERE id = v_owner_id;
            
            RETURN QUERY SELECT TRUE, 'Download recorded and points awarded'::TEXT, 10;
        ELSE
             RETURN QUERY SELECT TRUE, 'Download recorded (self-download, no points)'::TEXT, 0;
        END IF;
    END IF;
END;
$$;

-- ============================================
-- 4. UPDATE FAVORITE ADD (Add Points)
-- ============================================
DROP FUNCTION IF EXISTS public.sp_favorite_add(UUID, BIGINT);

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
DECLARE
    v_owner_id UUID;
    v_inserted_rows INTEGER;
BEGIN
    -- Check resource existence and get owner
    SELECT created_by INTO v_owner_id
    FROM public.resources 
    WHERE id = p_resource_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Resource with ID % does not exist', p_resource_id;
    END IF;

    -- Insert favorite
    INSERT INTO public.favorites (user_id, resource_id, created_at)
    VALUES (p_user_id, p_resource_id, NOW())
    ON CONFLICT (user_id, resource_id) DO NOTHING;
    
    GET DIAGNOSTICS v_inserted_rows = ROW_COUNT;
    
    -- If successful insert, award points
    IF v_inserted_rows > 0 THEN
        -- Award points to owner (if not self-favorite)
        IF v_owner_id != p_user_id THEN
            UPDATE public.users
            SET points = COALESCE(points, 0) + 2
            WHERE id = v_owner_id;
        END IF;

        RETURN QUERY
        SELECT 
            p_user_id,
            p_resource_id,
            NOW();
    ELSE
        -- Already existed, return existing record
        RETURN QUERY
        SELECT 
            f.user_id,
            f.resource_id,
            f.created_at
        FROM public.favorites f
        WHERE f.user_id = p_user_id AND f.resource_id = p_resource_id;
    END IF;
END;
$$;

-- ============================================
-- 5. UPDATE FAVORITE REMOVE (Remove Points)
-- ============================================
CREATE OR REPLACE FUNCTION public.sp_favorite_remove(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner_id UUID;
    v_deleted_count INTEGER;
BEGIN
    -- Get owner first
    SELECT created_by INTO v_owner_id
    FROM public.resources
    WHERE id = p_resource_id;

    DELETE FROM public.favorites 
    WHERE user_id = p_user_id AND resource_id = p_resource_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count > 0 THEN
        -- Remove points from owner (if not self-favorite)
        IF v_owner_id IS NOT NULL AND v_owner_id != p_user_id THEN
            UPDATE public.users
            SET points = GREATEST(0, COALESCE(points, 0) - 2) -- Prevent negative points
            WHERE id = v_owner_id;
        END IF;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;
