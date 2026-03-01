-- ============================================================================
-- 010_add_membership_and_resource_access_tier.sql
-- Adds manual membership model and free/premium resource access tier.
-- ============================================================================

BEGIN;

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS access_tier TEXT NOT NULL DEFAULT 'free';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'resources_access_tier_check'
  ) THEN
    ALTER TABLE public.resources
      ADD CONSTRAINT resources_access_tier_check
      CHECK (access_tier IN ('free', 'premium'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_resources_access_tier_status
  ON public.resources(access_tier, status);

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  duration_days INTEGER NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT membership_plans_code_not_empty CHECK (length(trim(code)) > 0),
  CONSTRAINT membership_plans_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT membership_plans_price_non_negative CHECK (price_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.user_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id BIGINT NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NULL,
  source TEXT NOT NULL DEFAULT 'admin',
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_memberships_status_check CHECK (status IN ('active', 'expired', 'cancelled', 'grace')),
  CONSTRAINT user_memberships_source_not_empty CHECK (length(trim(source)) > 0),
  CONSTRAINT user_memberships_period_check CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_status_end
  ON public.user_memberships(user_id, status, ends_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_user_memberships_plan_status
  ON public.user_memberships(plan_id, status);

INSERT INTO public.membership_plans (code, name, description, price_cents, currency, duration_days, is_active)
VALUES
  ('free', 'Free', 'Default access to free resources only.', 0, 'USD', NULL, TRUE),
  ('premium_manual', 'Premium (Manual)', 'Manual premium access granted by admin.', 0, 'USD', NULL, TRUE)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = TRUE,
  updated_at = NOW();

CREATE OR REPLACE FUNCTION public.sp_membership_plan_get_all_active()
RETURNS TABLE(
  id BIGINT,
  code TEXT,
  name TEXT,
  description TEXT,
  price_cents INTEGER,
  currency TEXT,
  duration_days INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    mp.id,
    mp.code,
    mp.name,
    mp.description,
    mp.price_cents,
    mp.currency,
    mp.duration_days,
    mp.is_active,
    mp.created_at,
    mp.updated_at
  FROM public.membership_plans mp
  WHERE mp.is_active = TRUE
  ORDER BY mp.price_cents ASC, mp.id ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_user_membership_get_current(
  p_user_id UUID
)
RETURNS TABLE(
  membership_id BIGINT,
  user_id UUID,
  plan_id BIGINT,
  plan_code TEXT,
  plan_name TEXT,
  status TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_premium BOOLEAN
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    um.id AS membership_id,
    um.user_id,
    um.plan_id,
    mp.code AS plan_code,
    mp.name AS plan_name,
    um.status,
    um.starts_at,
    um.ends_at,
    um.source,
    um.notes,
    um.created_at,
    um.updated_at,
    (mp.code <> 'free') AS is_premium
  FROM public.user_memberships um
  INNER JOIN public.membership_plans mp ON mp.id = um.plan_id
  WHERE um.user_id = p_user_id
    AND um.status = 'active'
    AND (um.ends_at IS NULL OR um.ends_at > NOW())
  ORDER BY um.starts_at DESC, um.id DESC
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_user_has_premium_access(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $function$
DECLARE
  v_has_premium BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.user_memberships um
    INNER JOIN public.membership_plans mp ON mp.id = um.plan_id
    WHERE um.user_id = p_user_id
      AND um.status = 'active'
      AND (um.ends_at IS NULL OR um.ends_at > NOW())
      AND mp.code <> 'free'
      AND mp.is_active = TRUE
  )
  INTO v_has_premium;

  RETURN COALESCE(v_has_premium, FALSE);
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_user_membership_assign(
  p_user_id UUID,
  p_plan_code TEXT,
  p_starts_at TIMESTAMPTZ DEFAULT NOW(),
  p_ends_at TIMESTAMPTZ DEFAULT NULL,
  p_source TEXT DEFAULT 'admin',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  membership_id BIGINT,
  user_id UUID,
  plan_id BIGINT,
  plan_code TEXT,
  plan_name TEXT,
  status TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_premium BOOLEAN
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_plan_id BIGINT;
BEGIN
  SELECT mp.id
  INTO v_plan_id
  FROM public.membership_plans mp
  WHERE mp.code = lower(trim(p_plan_code))
    AND mp.is_active = TRUE
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Membership plan % not found or inactive', p_plan_code;
  END IF;

  UPDATE public.user_memberships
  SET
    status = 'cancelled',
    updated_at = NOW(),
    notes = COALESCE(user_memberships.notes, '') || CASE WHEN user_memberships.notes IS NULL THEN '' ELSE E'\n' END || 'Cancelled by reassignment'
  WHERE user_memberships.user_id = p_user_id
    AND user_memberships.status = 'active';

  INSERT INTO public.user_memberships (
    user_id,
    plan_id,
    status,
    starts_at,
    ends_at,
    source,
    notes
  ) VALUES (
    p_user_id,
    v_plan_id,
    'active',
    COALESCE(p_starts_at, NOW()),
    p_ends_at,
    COALESCE(NULLIF(trim(p_source), ''), 'admin'),
    p_notes
  );

  RETURN QUERY
  SELECT * FROM public.sp_user_membership_get_current(p_user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.sp_user_membership_cancel(
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.user_memberships
  SET
    status = 'cancelled',
    updated_at = NOW(),
    ends_at = COALESCE(ends_at, NOW()),
    notes = COALESCE(NULLIF(trim(p_notes), ''), user_memberships.notes)
  WHERE user_memberships.user_id = p_user_id
    AND user_memberships.status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$function$;

COMMIT;
