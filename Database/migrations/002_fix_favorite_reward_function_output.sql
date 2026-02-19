DROP FUNCTION IF EXISTS public.sp_favorite_add(UUID, BIGINT);

CREATE OR REPLACE FUNCTION public.sp_favorite_add(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS TABLE(
    fav_user_id UUID,
    fav_resource_id BIGINT,
    fav_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner_id UUID;
    v_inserted_rows INTEGER;
BEGIN
    SELECT r.created_by INTO v_owner_id
    FROM public.resources r
    WHERE r.id = p_resource_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Resource with ID % does not exist', p_resource_id;
    END IF;

    INSERT INTO public.favorites (user_id, resource_id, created_at)
    VALUES (p_user_id, p_resource_id, NOW())
    ON CONFLICT (user_id, resource_id) DO NOTHING;

    GET DIAGNOSTICS v_inserted_rows = ROW_COUNT;

    IF v_inserted_rows > 0 THEN
        IF v_owner_id != p_user_id THEN
            UPDATE public.users
            SET points = COALESCE(points, 0) + 2
            WHERE id = v_owner_id;
        END IF;

        RETURN QUERY
        SELECT p_user_id, p_resource_id, NOW();
    ELSE
        RETURN QUERY
        SELECT f.user_id, f.resource_id, f.created_at
        FROM public.favorites f
        WHERE f.user_id = p_user_id
          AND f.resource_id = p_resource_id;
    END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.sp_favorite_toggle(UUID, BIGINT);

CREATE OR REPLACE FUNCTION public.sp_favorite_toggle(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS TABLE(
    fav_is_favorited BOOLEAN,
    fav_action TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT public.sp_favorite_exists(p_user_id, p_resource_id) INTO v_exists;

    IF v_exists THEN
        PERFORM public.sp_favorite_remove(p_user_id, p_resource_id);
        RETURN QUERY SELECT FALSE, 'removed'::TEXT;
    ELSE
        PERFORM public.sp_favorite_add(p_user_id, p_resource_id);
        RETURN QUERY SELECT TRUE, 'added'::TEXT;
    END IF;
END;
$$;
