-- ============================================================================
-- 012_add_notification_retry_functions_v2.sql
-- Adds retry/backoff helper procedures for notification deliveries.
-- ============================================================================

BEGIN;

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

COMMIT;
