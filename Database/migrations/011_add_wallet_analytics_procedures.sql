-- ============================================================================
-- 011_add_wallet_analytics_procedures.sql
-- Wallet analytics procedures (points-based) for uploaded resource engagement.
-- ============================================================================

BEGIN;

-- Ensure function signature changes are allowed on existing databases.
DROP FUNCTION IF EXISTS public.sp_wallet_get_summary(UUID);
DROP FUNCTION IF EXISTS public.sp_wallet_get_top_resources(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.sp_wallet_get_activity(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.sp_resource_record_download(UUID, BIGINT);
DROP FUNCTION IF EXISTS public.sp_favorite_add(UUID, BIGINT);
DROP FUNCTION IF EXISTS public.sp_favorite_remove(UUID, BIGINT);

CREATE TABLE IF NOT EXISTS public.wallet_points_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  resource_id BIGINT NULL REFERENCES public.resources(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  points_change INTEGER NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NULL,
  CONSTRAINT wallet_points_events_event_type_check CHECK (
    event_type IN (
      'download_reward',
      'favorite_added_reward',
      'favorite_removed_penalty'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_wallet_points_events_user_occurred
  ON public.wallet_points_events(user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_points_events_resource_occurred
  ON public.wallet_points_events(resource_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_points_events_event_type
  ON public.wallet_points_events(event_type);

-- Keep existing reward behavior, and log events for wallet analytics.
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

CREATE OR REPLACE FUNCTION public.sp_wallet_get_summary(
  p_user_id UUID
)
RETURNS TABLE(
  user_id UUID,
  current_points BIGINT,
  total_resources BIGINT,
  published_resources BIGINT,
  total_downloads_received BIGINT,
  total_favorites_received BIGINT,
  points_from_downloads BIGINT,
  points_from_favorites BIGINT,
  total_points_from_engagement BIGINT,
  points_last_7_days BIGINT,
  points_last_30_days BIGINT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH my_resources AS (
    SELECT r.id, r.status
    FROM public.resources r
    WHERE r.created_by = p_user_id
  ),
  resources_stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_resources,
      COUNT(*) FILTER (WHERE status = 'published')::BIGINT AS published_resources
    FROM my_resources
  ),
  downloads_stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_downloads_received,
      (COUNT(*) * 10)::BIGINT AS points_from_downloads,
      (
        COUNT(*) FILTER (WHERE rd.downloaded_at >= NOW() - INTERVAL '7 days') * 10
      )::BIGINT AS points_downloads_last_7_days,
      (
        COUNT(*) FILTER (WHERE rd.downloaded_at >= NOW() - INTERVAL '30 days') * 10
      )::BIGINT AS points_downloads_last_30_days
    FROM public.resource_downloads rd
    INNER JOIN my_resources mr ON mr.id = rd.resource_id
  ),
  favorites_stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_favorites_received,
      (COUNT(*) * 2)::BIGINT AS points_from_favorites,
      (
        COUNT(*) FILTER (WHERE f.created_at >= NOW() - INTERVAL '7 days') * 2
      )::BIGINT AS points_favorites_last_7_days,
      (
        COUNT(*) FILTER (WHERE f.created_at >= NOW() - INTERVAL '30 days') * 2
      )::BIGINT AS points_favorites_last_30_days
    FROM public.favorites f
    INNER JOIN my_resources mr ON mr.id = f.resource_id
  ),
  user_points AS (
    SELECT COALESCE(u.points, 0)::BIGINT AS current_points
    FROM public.users u
    WHERE u.id = p_user_id
    LIMIT 1
  ),
  event_points AS (
    SELECT
      COALESCE(SUM(wpe.points_change), 0)::BIGINT AS total_points_from_events,
      COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.event_type = 'download_reward'), 0)::BIGINT AS points_from_downloads,
      COALESCE(SUM(wpe.points_change) FILTER (
        WHERE wpe.event_type IN ('favorite_added_reward', 'favorite_removed_penalty')
      ), 0)::BIGINT AS points_from_favorites,
      COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.occurred_at >= NOW() - INTERVAL '7 days'), 0)::BIGINT AS points_last_7_days,
      COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.occurred_at >= NOW() - INTERVAL '30 days'), 0)::BIGINT AS points_last_30_days
    FROM public.wallet_points_events wpe
    WHERE wpe.user_id = p_user_id
  )
  SELECT
    p_user_id AS user_id,
    COALESCE(up.current_points, 0)::BIGINT AS current_points,
    COALESCE(rs.total_resources, 0)::BIGINT AS total_resources,
    COALESCE(rs.published_resources, 0)::BIGINT AS published_resources,
    COALESCE(ds.total_downloads_received, 0)::BIGINT AS total_downloads_received,
    COALESCE(fs.total_favorites_received, 0)::BIGINT AS total_favorites_received,
    COALESCE(ep.points_from_downloads, 0)::BIGINT AS points_from_downloads,
    COALESCE(ep.points_from_favorites, 0)::BIGINT AS points_from_favorites,
    COALESCE(ep.total_points_from_events, 0)::BIGINT AS total_points_from_engagement,
    COALESCE(ep.points_last_7_days, 0)::BIGINT AS points_last_7_days,
    COALESCE(ep.points_last_30_days, 0)::BIGINT AS points_last_30_days,
    NOW() AS updated_at
  FROM resources_stats rs
  CROSS JOIN downloads_stats ds
  CROSS JOIN favorites_stats fs
  CROSS JOIN event_points ep
  LEFT JOIN user_points up ON TRUE;
END;
$function$;


CREATE OR REPLACE FUNCTION public.sp_wallet_get_top_resources(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  resource_id BIGINT,
  resource_title TEXT,
  resource_status TEXT,
  created_at TIMESTAMPTZ,
  downloads_count BIGINT,
  favorites_count BIGINT,
  points_from_downloads BIGINT,
  points_from_favorites BIGINT,
  points_total BIGINT
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS resource_id,
    r.title::TEXT AS resource_title,
    r.status::TEXT AS resource_status,
    r.created_at,
    COALESCE(d.downloads_count, 0)::BIGINT AS downloads_count,
    COALESCE(f.favorites_count, 0)::BIGINT AS favorites_count,
    COALESCE(p.points_from_downloads, (COALESCE(d.downloads_count, 0) * 10))::BIGINT AS points_from_downloads,
    COALESCE(p.points_from_favorites, (COALESCE(f.favorites_count, 0) * 2))::BIGINT AS points_from_favorites,
    COALESCE(
      p.points_total,
      ((COALESCE(d.downloads_count, 0) * 10) + (COALESCE(f.favorites_count, 0) * 2))
    )::BIGINT AS points_total
  FROM public.resources r
  LEFT JOIN (
    SELECT rd.resource_id, COUNT(*)::BIGINT AS downloads_count
    FROM public.resource_downloads rd
    GROUP BY rd.resource_id
  ) d ON d.resource_id = r.id
  LEFT JOIN (
    SELECT fv.resource_id, COUNT(*)::BIGINT AS favorites_count
    FROM public.favorites fv
    GROUP BY fv.resource_id
  ) f ON f.resource_id = r.id
  LEFT JOIN (
    SELECT
      wpe.resource_id,
      COALESCE(SUM(wpe.points_change), 0)::BIGINT AS points_total,
      COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.event_type = 'download_reward'), 0)::BIGINT AS points_from_downloads,
      COALESCE(SUM(wpe.points_change) FILTER (
        WHERE wpe.event_type IN ('favorite_added_reward', 'favorite_removed_penalty')
      ), 0)::BIGINT AS points_from_favorites
    FROM public.wallet_points_events wpe
    WHERE wpe.user_id = p_user_id
    GROUP BY wpe.resource_id
  ) p ON p.resource_id = r.id
  WHERE r.created_by = p_user_id
  ORDER BY COALESCE(p.points_total, 0) DESC, downloads_count DESC, favorites_count DESC, r.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 10), 1);
END;
$function$;


CREATE OR REPLACE FUNCTION public.sp_wallet_get_activity(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  event_type TEXT,
  points_change INTEGER,
  resource_id BIGINT,
  resource_title TEXT,
  actor_user_id UUID,
  occurred_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH all_events AS (
    SELECT
      wpe.event_type,
      wpe.points_change,
      wpe.resource_id,
      r.title::TEXT AS resource_title,
      wpe.actor_user_id,
      wpe.occurred_at
    FROM public.wallet_points_events wpe
    LEFT JOIN public.resources r ON r.id = wpe.resource_id
    WHERE wpe.user_id = p_user_id
  )
  SELECT
    ae.event_type,
    ae.points_change,
    ae.resource_id,
    ae.resource_title,
    ae.actor_user_id,
    ae.occurred_at
  FROM all_events ae
  ORDER BY ae.occurred_at DESC NULLS LAST
  LIMIT GREATEST(COALESCE(p_limit, 20), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;

COMMIT;
