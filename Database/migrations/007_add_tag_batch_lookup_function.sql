BEGIN;

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

COMMIT;
