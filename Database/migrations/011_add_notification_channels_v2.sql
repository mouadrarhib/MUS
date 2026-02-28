-- ============================================================================
-- 011_add_notification_channels_v2.sql
-- Adds notification external channels support (email + push devices).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_push_devices (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
  device_name TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_token)
);

CREATE INDEX IF NOT EXISTS idx_user_push_devices_user_active
  ON public.user_push_devices(user_id, is_active, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_push_devices_token
  ON public.user_push_devices(device_token);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id BIGSERIAL PRIMARY KEY,
  notification_id BIGINT NOT NULL REFERENCES public.user_notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push')),
  destination TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id TEXT NULL,
  error_message TEXT NULL,
  attempts INT NOT NULL DEFAULT 1,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification
  ON public.notification_deliveries(notification_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_channel_status
  ON public.notification_deliveries(channel, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_user_push_device_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_push_devices_set_updated_at ON public.user_push_devices;
CREATE TRIGGER trg_user_push_devices_set_updated_at
BEFORE UPDATE ON public.user_push_devices
FOR EACH ROW
EXECUTE FUNCTION public.set_user_push_device_updated_at();

CREATE OR REPLACE FUNCTION public.set_notification_delivery_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_deliveries_set_updated_at ON public.notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_set_updated_at
BEFORE UPDATE ON public.notification_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.set_notification_delivery_updated_at();

CREATE OR REPLACE FUNCTION public.sp_notification_get_user_preferences(
  p_user_id UUID
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  email_notifications BOOLEAN,
  push_notifications BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(us.email_notifications, TRUE) AS email_notifications,
    COALESCE(us.push_notifications, TRUE) AS push_notifications
  FROM public.users u
  LEFT JOIN public.user_settings us ON us.user_id = u.id
  WHERE u.id = p_user_id
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_register_push_device(
  p_user_id UUID,
  p_device_token TEXT,
  p_platform TEXT,
  p_device_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  user_id UUID,
  device_token TEXT,
  platform TEXT,
  device_name TEXT,
  is_active BOOLEAN,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.user_push_devices(user_id, device_token, platform, device_name, is_active, last_seen_at)
  VALUES (p_user_id, TRIM(p_device_token), TRIM(p_platform), NULLIF(TRIM(p_device_name), ''), TRUE, NOW())
  ON CONFLICT ON CONSTRAINT user_push_devices_user_id_device_token_key
  DO UPDATE SET
    platform = EXCLUDED.platform,
    device_name = EXCLUDED.device_name,
    is_active = TRUE,
    last_seen_at = NOW(),
    updated_at = NOW()
  RETURNING
    public.user_push_devices.id,
    public.user_push_devices.user_id,
    public.user_push_devices.device_token,
    public.user_push_devices.platform,
    public.user_push_devices.device_name,
    public.user_push_devices.is_active,
    public.user_push_devices.last_seen_at,
    public.user_push_devices.created_at,
    public.user_push_devices.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_unregister_push_device(
  p_user_id UUID,
  p_device_token TEXT
)
RETURNS TABLE(
  id BIGINT,
  user_id UUID,
  device_token TEXT,
  is_active BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.user_push_devices d
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE d.user_id = p_user_id
    AND d.device_token = TRIM(p_device_token)
  RETURNING d.id, d.user_id, d.device_token, d.is_active, d.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_list_push_devices(
  p_user_id UUID,
  p_active_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  id BIGINT,
  user_id UUID,
  device_token TEXT,
  platform TEXT,
  device_name TEXT,
  is_active BOOLEAN,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.user_id, d.device_token, d.platform, d.device_name, d.is_active, d.last_seen_at, d.created_at, d.updated_at
  FROM public.user_push_devices d
  WHERE d.user_id = p_user_id
    AND (p_active_only = FALSE OR d.is_active = TRUE)
  ORDER BY d.updated_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_delivery_create(
  p_notification_id BIGINT,
  p_channel TEXT,
  p_destination TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_provider_message_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_attempts INT DEFAULT 1,
  p_sent_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  notification_id BIGINT,
  channel TEXT,
  destination TEXT,
  status TEXT,
  provider_message_id TEXT,
  error_message TEXT,
  attempts INT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.notification_deliveries(
    notification_id,
    channel,
    destination,
    status,
    provider_message_id,
    error_message,
    attempts,
    sent_at
  )
  VALUES (
    p_notification_id,
    TRIM(p_channel),
    NULLIF(TRIM(p_destination), ''),
    TRIM(p_status),
    NULLIF(TRIM(p_provider_message_id), ''),
    NULLIF(TRIM(p_error_message), ''),
    GREATEST(COALESCE(p_attempts, 1), 1),
    p_sent_at
  )
  RETURNING
    public.notification_deliveries.id,
    public.notification_deliveries.notification_id,
    public.notification_deliveries.channel,
    public.notification_deliveries.destination,
    public.notification_deliveries.status,
    public.notification_deliveries.provider_message_id,
    public.notification_deliveries.error_message,
    public.notification_deliveries.attempts,
    public.notification_deliveries.sent_at,
    public.notification_deliveries.created_at,
    public.notification_deliveries.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_delivery_update_status(
  p_delivery_id BIGINT,
  p_status TEXT,
  p_provider_message_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_sent_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  status TEXT,
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.notification_deliveries d
  SET status = TRIM(p_status),
      provider_message_id = COALESCE(NULLIF(TRIM(p_provider_message_id), ''), d.provider_message_id),
      error_message = NULLIF(TRIM(p_error_message), ''),
      sent_at = COALESCE(p_sent_at, d.sent_at),
      updated_at = NOW()
  WHERE d.id = p_delivery_id
  RETURNING d.id, d.status, d.provider_message_id, d.error_message, d.sent_at, d.updated_at;
END;
$$;

COMMIT;
