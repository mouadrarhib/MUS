-- ============================================================================
-- TAGS MANAGEMENT STORED PROCEDURES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sp_tag_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tags_set_updated_at ON public.tags;
CREATE TRIGGER trg_tags_set_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW
EXECUTE FUNCTION public.sp_tag_set_updated_at();

-- 1) CREATE TAG
CREATE OR REPLACE FUNCTION public.sp_tag_create(
  p_name TEXT,
  p_slug TEXT,
  p_category TEXT DEFAULT 'topic',
  p_description TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.tags (name, slug, category, description, created_by)
  VALUES (
    trim(p_name),
    lower(trim(p_slug)),
    COALESCE(NULLIF(trim(p_category), ''), 'topic'),
    NULLIF(trim(p_description), ''),
    p_created_by
  )
  RETURNING
    tags.id,
    tags.name,
    tags.slug,
    tags.category,
    tags.description,
    tags.is_active,
    tags.created_by,
    tags.created_at,
    tags.updated_at;
END;
$$;

-- 2) GET TAG BY ID
CREATE OR REPLACE FUNCTION public.sp_tag_get_by_id(p_id BIGINT)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug, t.category, t.description, t.is_active, t.created_by, t.created_at, t.updated_at
  FROM public.tags t
  WHERE t.id = p_id;
END;
$$;

-- 3) GET TAG BY SLUG
CREATE OR REPLACE FUNCTION public.sp_tag_get_by_slug(p_slug TEXT)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug, t.category, t.description, t.is_active, t.created_by, t.created_at, t.updated_at
  FROM public.tags t
  WHERE t.slug = lower(trim(p_slug));
END;
$$;

-- 4) LIST TAGS
CREATE OR REPLACE FUNCTION public.sp_tag_get_all(
  p_search_term TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit_value INTEGER DEFAULT 100
)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN,
  usage_count BIGINT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resource_usage_count BIGINT,
  preference_usage_count BIGINT,
  last_resource_used_at TIMESTAMPTZ,
  last_preference_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vtp.id,
    vtp.name,
    vtp.slug,
    vtp.category,
    vtp.description,
    vtp.is_active,
    vtp.usage_count,
    vtp.last_used_at,
    vtp.created_at,
    vtp.updated_at,
    vtp.resource_usage_count,
    vtp.preference_usage_count,
    vtp.last_resource_used_at,
    vtp.last_preference_used_at
  FROM public.vw_tags_popularity vtp
  WHERE (p_search_term IS NULL OR vtp.name ILIKE '%' || p_search_term || '%' OR vtp.slug ILIKE '%' || p_search_term || '%')
    AND (p_category IS NULL OR vtp.category = p_category)
    AND (p_is_active IS NULL OR vtp.is_active = p_is_active)
  ORDER BY vtp.usage_count DESC, vtp.name ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 100), 1);
END;
$$;

-- 5) UPDATE TAG
CREATE OR REPLACE FUNCTION public.sp_tag_update(
  p_id BIGINT,
  p_name TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.tags
  SET
    name = COALESCE(NULLIF(trim(p_name), ''), tags.name),
    slug = COALESCE(NULLIF(lower(trim(p_slug)), ''), tags.slug),
    category = COALESCE(NULLIF(trim(p_category), ''), tags.category),
    description = COALESCE(p_description, tags.description),
    is_active = COALESCE(p_is_active, tags.is_active)
  WHERE tags.id = p_id
  RETURNING
    tags.id,
    tags.name,
    tags.slug,
    tags.category,
    tags.description,
    tags.is_active,
    tags.created_by,
    tags.created_at,
    tags.updated_at;
END;
$$;

-- 6) DELETE TAG
CREATE OR REPLACE FUNCTION public.sp_tag_delete(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.tags WHERE id = p_id;
  RETURN FOUND;
END;
$$;

-- 7) CHECK TAG BY SLUG
CREATE OR REPLACE FUNCTION public.sp_tag_exists_by_slug(p_slug TEXT, p_exclude_id BIGINT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM public.tags t
    WHERE t.slug = lower(trim(p_slug))
      AND (p_exclude_id IS NULL OR t.id <> p_exclude_id)
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

-- 8) GET TAGS BY RESOURCE
CREATE OR REPLACE FUNCTION public.sp_tag_get_by_resource(p_resource_id BIGINT)
RETURNS TABLE(
  tag_id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  linked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT vrt.tag_id, vrt.tag_name, vrt.tag_slug, vrt.tag_category, vrt.tag_description, vrt.linked_at
  FROM public.vw_resource_tags vrt
  WHERE vrt.resource_id = p_resource_id
  ORDER BY vrt.tag_name;
END;
$$;

-- 8.b) GET TAGS BY RESOURCES (batch)
CREATE OR REPLACE FUNCTION public.sp_tag_get_by_resources(p_resource_ids BIGINT[])
RETURNS TABLE(
  resource_id BIGINT,
  tag_id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  linked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vrt.resource_id,
    vrt.tag_id,
    vrt.tag_name,
    vrt.tag_slug,
    vrt.tag_category,
    vrt.tag_description,
    vrt.linked_at
  FROM public.vw_resource_tags vrt
  WHERE vrt.resource_id = ANY(p_resource_ids)
  ORDER BY vrt.resource_id, vrt.tag_name;
END;
$$;

-- 9) ATTACH TAG TO RESOURCE
CREATE OR REPLACE FUNCTION public.sp_tag_attach_to_resource(p_resource_id BIGINT, p_tag_id BIGINT)
RETURNS TABLE(
  resource_id BIGINT,
  tag_id BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.resource_tags (resource_id, tag_id)
  VALUES (p_resource_id, p_tag_id)
  ON CONFLICT (resource_id, tag_id) DO UPDATE
    SET created_at = resource_tags.created_at
  RETURNING
    resource_tags.resource_id,
    resource_tags.tag_id,
    resource_tags.created_at;
END;
$$;

-- 10) DETACH TAG FROM RESOURCE
CREATE OR REPLACE FUNCTION public.sp_tag_detach_from_resource(p_resource_id BIGINT, p_tag_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.resource_tags
  WHERE resource_id = p_resource_id AND tag_id = p_tag_id;
  RETURN FOUND;
END;
$$;

-- 11) REPLACE RESOURCE TAGS (atomic)
CREATE OR REPLACE FUNCTION public.sp_tag_replace_resource_tags(p_resource_id BIGINT, p_tag_ids BIGINT[])
RETURNS TABLE(
  tag_id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  description TEXT,
  linked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.resource_tags
  WHERE resource_id = p_resource_id;

  IF p_tag_ids IS NOT NULL AND array_length(p_tag_ids, 1) > 0 THEN
    INSERT INTO public.resource_tags(resource_id, tag_id)
    SELECT p_resource_id, DISTINCT_TAGS.tag_id
    FROM (
      SELECT DISTINCT unnest(p_tag_ids) AS tag_id
    ) AS DISTINCT_TAGS
    INNER JOIN public.tags t ON t.id = DISTINCT_TAGS.tag_id;
  END IF;

  RETURN QUERY
  SELECT vrt.tag_id, vrt.tag_name, vrt.tag_slug, vrt.tag_category, vrt.tag_description, vrt.linked_at
  FROM public.vw_resource_tags vrt
  WHERE vrt.resource_id = p_resource_id
  ORDER BY vrt.tag_name;
END;
$$;

-- 12) POPULAR TAGS
CREATE OR REPLACE FUNCTION public.sp_tag_get_popular(p_limit_value INTEGER DEFAULT 20)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  slug TEXT,
  category TEXT,
  usage_count BIGINT,
  last_used_at TIMESTAMPTZ,
  resource_usage_count BIGINT,
  preference_usage_count BIGINT,
  last_resource_used_at TIMESTAMPTZ,
  last_preference_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vtp.id,
    vtp.name,
    vtp.slug,
    vtp.category,
    vtp.usage_count,
    vtp.last_used_at,
    vtp.resource_usage_count,
    vtp.preference_usage_count,
    vtp.last_resource_used_at,
    vtp.last_preference_used_at
  FROM public.vw_tags_popularity vtp
  WHERE vtp.is_active = TRUE
  ORDER BY vtp.usage_count DESC, vtp.last_used_at DESC NULLS LAST, vtp.name ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 20), 1);
END;
$$;
