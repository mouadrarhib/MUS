BEGIN;

DROP FUNCTION IF EXISTS public.sp_resource_record_download(UUID, BIGINT);
DROP FUNCTION IF EXISTS public.sp_favorite_add(UUID, BIGINT);
DROP FUNCTION IF EXISTS public.sp_favorite_remove(UUID, BIGINT);

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
    v_owner_role TEXT;
    v_already_downloaded BOOLEAN;
BEGIN
    SELECT created_by INTO v_owner_id
    FROM public.resources
    WHERE id = p_resource_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_resource_id;
    END IF;

    SELECT lower(r.name)
    INTO v_owner_role
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_owner_id
    ORDER BY ur.assigned_at ASC, ur.role_id ASC
    LIMIT 1;

    SELECT EXISTS(
        SELECT 1 FROM public.resource_downloads
        WHERE user_id = p_user_id AND resource_id = p_resource_id
    ) INTO v_already_downloaded;

    IF v_already_downloaded THEN
        UPDATE public.resource_downloads
        SET downloaded_at = NOW()
        WHERE user_id = p_user_id AND resource_id = p_resource_id;

        RETURN QUERY SELECT TRUE, 'Resource already downloaded'::TEXT, 0;
    ELSE
        INSERT INTO public.resource_downloads (user_id, resource_id)
        VALUES (p_user_id, p_resource_id);

        IF v_owner_id != p_user_id AND v_owner_role IN ('student', 'teacher') THEN
            UPDATE public.users
            SET points = COALESCE(points, 0) + 10
            WHERE id = v_owner_id;

            INSERT INTO public.wallet_points_events (
              user_id,
              actor_user_id,
              resource_id,
              event_type,
              points_change,
              occurred_at,
              metadata
            ) VALUES (
              v_owner_id,
              p_user_id,
              p_resource_id,
              'download_reward',
              10,
              NOW(),
              jsonb_build_object('source', 'sp_resource_record_download')
            );

            RETURN QUERY SELECT TRUE, 'Download recorded and points awarded'::TEXT, 10;
        ELSE
            RETURN QUERY SELECT TRUE, 'Download recorded (no contributor reward applied)'::TEXT, 0;
        END IF;
    END IF;
END;
$$;

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
#variable_conflict use_column
DECLARE
    v_owner_id UUID;
    v_owner_role TEXT;
    v_inserted_rows INTEGER;
BEGIN
    SELECT created_by INTO v_owner_id
    FROM public.resources
    WHERE id = p_resource_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Resource with ID % does not exist', p_resource_id;
    END IF;

    SELECT lower(r.name)
    INTO v_owner_role
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_owner_id
    ORDER BY ur.assigned_at ASC, ur.role_id ASC
    LIMIT 1;

    INSERT INTO public.favorites (user_id, resource_id, created_at)
    VALUES (p_user_id, p_resource_id, NOW())
    ON CONFLICT (user_id, resource_id) DO NOTHING;

    GET DIAGNOSTICS v_inserted_rows = ROW_COUNT;

    IF v_inserted_rows > 0 THEN
        IF v_owner_id != p_user_id AND v_owner_role IN ('student', 'teacher') THEN
            UPDATE public.users
            SET points = COALESCE(points, 0) + 2
            WHERE id = v_owner_id;

            INSERT INTO public.wallet_points_events (
              user_id,
              actor_user_id,
              resource_id,
              event_type,
              points_change,
              occurred_at,
              metadata
            ) VALUES (
              v_owner_id,
              p_user_id,
              p_resource_id,
              'favorite_added_reward',
              2,
              NOW(),
              jsonb_build_object('source', 'sp_favorite_add')
            );
        END IF;

        RETURN QUERY
        SELECT p_user_id, p_resource_id, NOW();
    ELSE
        RETURN QUERY
        SELECT f.user_id, f.resource_id, f.created_at
        FROM public.favorites f
        WHERE f.user_id = p_user_id AND f.resource_id = p_resource_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_favorite_remove(
    p_user_id UUID,
    p_resource_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
DECLARE
    v_owner_id UUID;
    v_owner_role TEXT;
    v_deleted_count INTEGER;
BEGIN
    SELECT created_by INTO v_owner_id
    FROM public.resources
    WHERE id = p_resource_id;

    IF v_owner_id IS NOT NULL THEN
        SELECT lower(r.name)
        INTO v_owner_role
        FROM public.user_roles ur
        INNER JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = v_owner_id
        ORDER BY ur.assigned_at ASC, ur.role_id ASC
        LIMIT 1;
    END IF;

    DELETE FROM public.favorites
    WHERE user_id = p_user_id AND resource_id = p_resource_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count > 0 THEN
        IF v_owner_id IS NOT NULL AND v_owner_id != p_user_id AND v_owner_role IN ('student', 'teacher') THEN
            UPDATE public.users
            SET points = GREATEST(0, COALESCE(points, 0) - 2)
            WHERE id = v_owner_id;

            INSERT INTO public.wallet_points_events (
              user_id,
              actor_user_id,
              resource_id,
              event_type,
              points_change,
              occurred_at,
              metadata
            ) VALUES (
              v_owner_id,
              p_user_id,
              p_resource_id,
              'favorite_removed_penalty',
              -2,
              NOW(),
              jsonb_build_object('source', 'sp_favorite_remove')
            );
        END IF;

        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

DELETE FROM public.wallet_points_events wpe
USING public.user_roles ur
INNER JOIN public.roles r ON r.id = ur.role_id
WHERE ur.user_id = wpe.user_id
  AND lower(r.name) = 'admin';

UPDATE public.users u
SET points = 0,
    updated_at = NOW()
FROM public.user_roles ur
INNER JOIN public.roles r ON r.id = ur.role_id
WHERE ur.user_id = u.id
  AND lower(r.name) = 'admin'
  AND COALESCE(u.points, 0) <> 0;

COMMIT;
