-- ============================================================================
-- RESOURCE REJECTIONS PROCEDURES
-- ============================================================================

-- 1) CREATE REJECTION RECORD
CREATE OR REPLACE FUNCTION public.sp_resource_rejection_create(
  p_resource_id_original BIGINT,
  p_uploader_id UUID,
  p_rejected_by UUID,
  p_reason TEXT,
  p_resource_title TEXT,
  p_resource_url TEXT DEFAULT NULL,
  p_resource_format TEXT DEFAULT NULL,
  p_resource_educational_type TEXT DEFAULT NULL,
  p_resource_snapshot JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  id BIGINT,
  resource_id_original BIGINT,
  uploader_id UUID,
  rejected_by UUID,
  reason TEXT,
  resource_title TEXT,
  resource_url TEXT,
  resource_format TEXT,
  resource_educational_type TEXT,
  resource_snapshot JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.resource_rejections (
    resource_id_original,
    uploader_id,
    rejected_by,
    reason,
    resource_title,
    resource_url,
    resource_format,
    resource_educational_type,
    resource_snapshot
  )
  VALUES (
    p_resource_id_original,
    p_uploader_id,
    p_rejected_by,
    trim(p_reason),
    trim(p_resource_title),
    NULLIF(trim(p_resource_url), ''),
    NULLIF(trim(p_resource_format), ''),
    NULLIF(trim(p_resource_educational_type), ''),
    COALESCE(p_resource_snapshot, '{}'::jsonb)
  )
  RETURNING
    resource_rejections.id,
    resource_rejections.resource_id_original,
    resource_rejections.uploader_id,
    resource_rejections.rejected_by,
    resource_rejections.reason,
    resource_rejections.resource_title,
    resource_rejections.resource_url,
    resource_rejections.resource_format,
    resource_rejections.resource_educational_type,
    resource_rejections.resource_snapshot,
    resource_rejections.created_at;
END;
$$;

-- 2) GET REJECTIONS BY USER
CREATE OR REPLACE FUNCTION public.sp_resource_rejection_get_by_user(
  p_uploader_id UUID,
  p_limit_value INTEGER DEFAULT 100
)
RETURNS TABLE(
  id BIGINT,
  resource_id_original BIGINT,
  uploader_id UUID,
  uploader_name TEXT,
  rejected_by UUID,
  reviewer_name TEXT,
  reason TEXT,
  resource_title TEXT,
  resource_url TEXT,
  resource_format TEXT,
  resource_educational_type TEXT,
  resource_snapshot JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vrr.id,
    vrr.resource_id_original,
    vrr.uploader_id,
    vrr.uploader_name,
    vrr.rejected_by,
    vrr.reviewer_name,
    vrr.reason,
    vrr.resource_title,
    vrr.resource_url,
    vrr.resource_format,
    vrr.resource_educational_type,
    vrr.resource_snapshot,
    vrr.created_at
  FROM public.vw_resource_rejections vrr
  WHERE vrr.uploader_id = p_uploader_id
  ORDER BY vrr.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 100), 1);
END;
$$;

-- 3) GET REJECTION BY ID
CREATE OR REPLACE FUNCTION public.sp_resource_rejection_get_by_id(p_id BIGINT)
RETURNS TABLE(
  id BIGINT,
  resource_id_original BIGINT,
  uploader_id UUID,
  uploader_name TEXT,
  uploader_email TEXT,
  rejected_by UUID,
  reviewer_name TEXT,
  reviewer_email TEXT,
  reason TEXT,
  resource_title TEXT,
  resource_url TEXT,
  resource_format TEXT,
  resource_educational_type TEXT,
  resource_snapshot JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vrr.id,
    vrr.resource_id_original,
    vrr.uploader_id,
    vrr.uploader_name,
    vrr.uploader_email,
    vrr.rejected_by,
    vrr.reviewer_name,
    vrr.reviewer_email,
    vrr.reason,
    vrr.resource_title,
    vrr.resource_url,
    vrr.resource_format,
    vrr.resource_educational_type,
    vrr.resource_snapshot,
    vrr.created_at
  FROM public.vw_resource_rejections vrr
  WHERE vrr.id = p_id;
END;
$$;

-- 4) GET ALL REJECTIONS (ADMIN)
CREATE OR REPLACE FUNCTION public.sp_resource_rejection_get_all(
  p_search_term TEXT DEFAULT NULL,
  p_limit_value INTEGER DEFAULT 200
)
RETURNS TABLE(
  id BIGINT,
  resource_id_original BIGINT,
  uploader_id UUID,
  uploader_name TEXT,
  rejected_by UUID,
  reviewer_name TEXT,
  reason TEXT,
  resource_title TEXT,
  resource_format TEXT,
  resource_educational_type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vrr.id,
    vrr.resource_id_original,
    vrr.uploader_id,
    vrr.uploader_name,
    vrr.rejected_by,
    vrr.reviewer_name,
    vrr.reason,
    vrr.resource_title,
    vrr.resource_format,
    vrr.resource_educational_type,
    vrr.created_at
  FROM public.vw_resource_rejections vrr
  WHERE p_search_term IS NULL
    OR vrr.resource_title ILIKE '%' || p_search_term || '%'
    OR vrr.reason ILIKE '%' || p_search_term || '%'
    OR vrr.uploader_name ILIKE '%' || p_search_term || '%'
  ORDER BY vrr.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 200), 1);
END;
$$;
