-- ============================================
-- USER_SETTINGS PROCEDURES
-- ============================================

-- Trigger function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.sp_user_settings_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user_settings table
DROP TRIGGER IF EXISTS trg_user_settings_set_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_set_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION sp_user_settings_set_updated_at();

-- 1. Create User Settings
CREATE OR REPLACE FUNCTION public.sp_user_settings_create(
    p_user_id UUID,
    p_theme_mode TEXT DEFAULT NULL,
    p_font_size TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT NULL,
    p_date_format TEXT DEFAULT NULL,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_push_notifications BOOLEAN DEFAULT NULL,
    p_resource_alerts BOOLEAN DEFAULT NULL,
    p_weekly_digest BOOLEAN DEFAULT NULL,
    p_show_activity_status BOOLEAN DEFAULT NULL,
    p_show_profile BOOLEAN DEFAULT NULL,
    p_two_factor_enabled BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    theme_mode TEXT,
    font_size TEXT,
    language TEXT,
    timezone TEXT,
    date_format TEXT,
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    resource_alerts BOOLEAN,
    weekly_digest BOOLEAN,
    show_activity_status BOOLEAN,
    show_profile BOOLEAN,
    two_factor_enabled BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.user_settings (
        user_id, theme_mode, font_size, language, timezone, date_format,
        email_notifications, push_notifications, resource_alerts, weekly_digest,
        show_activity_status, show_profile, two_factor_enabled
    )
    VALUES (
        p_user_id,
        COALESCE(p_theme_mode, 'light'),
        COALESCE(p_font_size, 'medium'),
        COALESCE(p_language, 'en'),
        COALESCE(p_timezone, 'Africa/Casablanca'),
        COALESCE(p_date_format, 'DD/MM/YYYY'),
        COALESCE(p_email_notifications, TRUE),
        COALESCE(p_push_notifications, TRUE),
        COALESCE(p_resource_alerts, TRUE),
        COALESCE(p_weekly_digest, FALSE),
        COALESCE(p_show_activity_status, TRUE),
        COALESCE(p_show_profile, TRUE),
        COALESCE(p_two_factor_enabled, FALSE)
    )
    RETURNING
        user_settings.user_id,
        user_settings.theme_mode,
        user_settings.font_size,
        user_settings.language,
        user_settings.timezone,
        user_settings.date_format,
        user_settings.email_notifications,
        user_settings.push_notifications,
        user_settings.resource_alerts,
        user_settings.weekly_digest,
        user_settings.show_activity_status,
        user_settings.show_profile,
        user_settings.two_factor_enabled,
        user_settings.created_at,
        user_settings.updated_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'User settings already exist for user %', p_user_id;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'User ID % does not exist', p_user_id;
END;
$$;

-- 2. Get User Settings by User ID
CREATE OR REPLACE FUNCTION public.sp_user_settings_get_by_user_id(
    p_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    theme_mode TEXT,
    font_size TEXT,
    language TEXT,
    timezone TEXT,
    date_format TEXT,
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    resource_alerts BOOLEAN,
    weekly_digest BOOLEAN,
    show_activity_status BOOLEAN,
    show_profile BOOLEAN,
    two_factor_enabled BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        us.user_id,
        us.theme_mode,
        us.font_size,
        us.language,
        us.timezone,
        us.date_format,
        us.email_notifications,
        us.push_notifications,
        us.resource_alerts,
        us.weekly_digest,
        us.show_activity_status,
        us.show_profile,
        us.two_factor_enabled,
        us.created_at,
        us.updated_at
    FROM public.user_settings us
    WHERE us.user_id = p_user_id;
END;
$$;

-- 3. Update User Settings (partial update)
CREATE OR REPLACE FUNCTION public.sp_user_settings_update(
    p_user_id UUID,
    p_theme_mode TEXT DEFAULT NULL,
    p_font_size TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT NULL,
    p_date_format TEXT DEFAULT NULL,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_push_notifications BOOLEAN DEFAULT NULL,
    p_resource_alerts BOOLEAN DEFAULT NULL,
    p_weekly_digest BOOLEAN DEFAULT NULL,
    p_show_activity_status BOOLEAN DEFAULT NULL,
    p_show_profile BOOLEAN DEFAULT NULL,
    p_two_factor_enabled BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    theme_mode TEXT,
    font_size TEXT,
    language TEXT,
    timezone TEXT,
    date_format TEXT,
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    resource_alerts BOOLEAN,
    weekly_digest BOOLEAN,
    show_activity_status BOOLEAN,
    show_profile BOOLEAN,
    two_factor_enabled BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.user_settings
    SET
        theme_mode = COALESCE(p_theme_mode, user_settings.theme_mode),
        font_size = COALESCE(p_font_size, user_settings.font_size),
        language = COALESCE(p_language, user_settings.language),
        timezone = COALESCE(p_timezone, user_settings.timezone),
        date_format = COALESCE(p_date_format, user_settings.date_format),
        email_notifications = COALESCE(p_email_notifications, user_settings.email_notifications),
        push_notifications = COALESCE(p_push_notifications, user_settings.push_notifications),
        resource_alerts = COALESCE(p_resource_alerts, user_settings.resource_alerts),
        weekly_digest = COALESCE(p_weekly_digest, user_settings.weekly_digest),
        show_activity_status = COALESCE(p_show_activity_status, user_settings.show_activity_status),
        show_profile = COALESCE(p_show_profile, user_settings.show_profile),
        two_factor_enabled = COALESCE(p_two_factor_enabled, user_settings.two_factor_enabled)
    WHERE user_settings.user_id = p_user_id
    RETURNING
        user_settings.user_id,
        user_settings.theme_mode,
        user_settings.font_size,
        user_settings.language,
        user_settings.timezone,
        user_settings.date_format,
        user_settings.email_notifications,
        user_settings.push_notifications,
        user_settings.resource_alerts,
        user_settings.weekly_digest,
        user_settings.show_activity_status,
        user_settings.show_profile,
        user_settings.two_factor_enabled,
        user_settings.created_at,
        user_settings.updated_at;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User settings for user % not found', p_user_id;
    END IF;
END;
$$;

-- 4. Update Notifications only
CREATE OR REPLACE FUNCTION public.sp_user_settings_update_notifications(
    p_user_id UUID,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_push_notifications BOOLEAN DEFAULT NULL,
    p_resource_alerts BOOLEAN DEFAULT NULL,
    p_weekly_digest BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    resource_alerts BOOLEAN,
    weekly_digest BOOLEAN,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.user_settings
    SET
        email_notifications = COALESCE(p_email_notifications, user_settings.email_notifications),
        push_notifications = COALESCE(p_push_notifications, user_settings.push_notifications),
        resource_alerts = COALESCE(p_resource_alerts, user_settings.resource_alerts),
        weekly_digest = COALESCE(p_weekly_digest, user_settings.weekly_digest)
    WHERE user_settings.user_id = p_user_id
    RETURNING
        user_settings.user_id,
        user_settings.email_notifications,
        user_settings.push_notifications,
        user_settings.resource_alerts,
        user_settings.weekly_digest,
        user_settings.updated_at;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User settings for user % not found', p_user_id;
    END IF;
END;
$$;

-- 5. Update Privacy only
CREATE OR REPLACE FUNCTION public.sp_user_settings_update_privacy(
    p_user_id UUID,
    p_show_activity_status BOOLEAN DEFAULT NULL,
    p_show_profile BOOLEAN DEFAULT NULL,
    p_two_factor_enabled BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    show_activity_status BOOLEAN,
    show_profile BOOLEAN,
    two_factor_enabled BOOLEAN,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.user_settings
    SET
        show_activity_status = COALESCE(p_show_activity_status, user_settings.show_activity_status),
        show_profile = COALESCE(p_show_profile, user_settings.show_profile),
        two_factor_enabled = COALESCE(p_two_factor_enabled, user_settings.two_factor_enabled)
    WHERE user_settings.user_id = p_user_id
    RETURNING
        user_settings.user_id,
        user_settings.show_activity_status,
        user_settings.show_profile,
        user_settings.two_factor_enabled,
        user_settings.updated_at;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User settings for user % not found', p_user_id;
    END IF;
END;
$$;

-- 6. Update Locale only
CREATE OR REPLACE FUNCTION public.sp_user_settings_update_locale(
    p_user_id UUID,
    p_language TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT NULL,
    p_date_format TEXT DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    language TEXT,
    timezone TEXT,
    date_format TEXT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.user_settings
    SET
        language = COALESCE(p_language, user_settings.language),
        timezone = COALESCE(p_timezone, user_settings.timezone),
        date_format = COALESCE(p_date_format, user_settings.date_format)
    WHERE user_settings.user_id = p_user_id
    RETURNING
        user_settings.user_id,
        user_settings.language,
        user_settings.timezone,
        user_settings.date_format,
        user_settings.updated_at;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User settings for user % not found', p_user_id;
    END IF;
END;
$$;

-- 7. Update Appearance only
CREATE OR REPLACE FUNCTION public.sp_user_settings_update_appearance(
    p_user_id UUID,
    p_theme_mode TEXT DEFAULT NULL,
    p_font_size TEXT DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    theme_mode TEXT,
    font_size TEXT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.user_settings
    SET
        theme_mode = COALESCE(p_theme_mode, user_settings.theme_mode),
        font_size = COALESCE(p_font_size, user_settings.font_size)
    WHERE user_settings.user_id = p_user_id
    RETURNING
        user_settings.user_id,
        user_settings.theme_mode,
        user_settings.font_size,
        user_settings.updated_at;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User settings for user % not found', p_user_id;
    END IF;
END;
$$;

-- 8. Delete User Settings
CREATE OR REPLACE FUNCTION public.sp_user_settings_delete(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.user_settings
    WHERE user_id = p_user_id;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'User settings for user % not found', p_user_id;
    END IF;
END;
$$;

-- 9. Check if User Settings Exists
CREATE OR REPLACE FUNCTION public.sp_user_settings_exists(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.user_settings WHERE user_id = p_user_id
    ) INTO v_exists;

    RETURN v_exists;
END;
$$;
