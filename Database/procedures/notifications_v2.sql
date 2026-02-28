-- ============================================================================
-- NOTIFICATIONS V2 PROCEDURES
-- External channels: email + push
-- ============================================================================

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
  SELECT
    d.id,
    d.user_id,
    d.device_token,
    d.platform,
    d.device_name,
    d.is_active,
    d.last_seen_at,
    d.created_at,
    d.updated_at
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


CREATE OR REPLACE FUNCTION public.sp_notification_delivery_get_retry_candidates(
  p_limit INT DEFAULT 50,
  p_max_attempts INT DEFAULT 5,
  p_base_delay_seconds INT DEFAULT 60
)
RETURNS TABLE(
  delivery_id BIGINT,
  notification_id BIGINT,
  channel TEXT,
  destination TEXT,
  attempts INT,
  error_message TEXT,
  updated_at TIMESTAMPTZ,
  recipient_user_id UUID,
  notification_type TEXT,
  title TEXT,
  body TEXT,
  payload JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.notification_id,
    d.channel,
    d.destination,
    d.attempts,
    d.error_message,
    d.updated_at,
    n.recipient_user_id,
    n.type,
    n.title,
    n.body,
    n.payload
  FROM public.notification_deliveries d
  JOIN public.user_notifications n ON n.id = d.notification_id
  WHERE d.status = 'failed'
    AND d.attempts < GREATEST(COALESCE(p_max_attempts, 5), 1)
    AND d.updated_at <= NOW() - make_interval(
      secs => (
        GREATEST(COALESCE(p_base_delay_seconds, 60), 1)
        * POWER(2::NUMERIC, GREATEST(d.attempts - 1, 0))
      )::DOUBLE PRECISION
    )
  ORDER BY d.updated_at ASC
  LIMIT GREATEST(COALESCE(p_limit, 50), 1);
END;
$$;


CREATE OR REPLACE FUNCTION public.sp_notification_delivery_prepare_retry(
  p_delivery_id BIGINT,
  p_max_attempts INT DEFAULT 5
)
RETURNS TABLE(
  id BIGINT,
  status TEXT,
  attempts INT,
  error_message TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.notification_deliveries d
  SET status = 'pending',
      attempts = d.attempts + 1,
      error_message = NULL,
      updated_at = NOW()
  WHERE d.id = p_delivery_id
    AND d.status = 'failed'
    AND d.attempts < GREATEST(COALESCE(p_max_attempts, 5), 1)
  RETURNING d.id, d.status, d.attempts, d.error_message, d.updated_at;
END;
$$;
