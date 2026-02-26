-- ============================================================================
-- RESOURCE REJECTIONS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_resource_rejections AS
SELECT
  rr.id,
  rr.resource_id_original,
  rr.uploader_id,
  uploader.full_name AS uploader_name,
  uploader.email AS uploader_email,
  rr.rejected_by,
  reviewer.full_name AS reviewer_name,
  reviewer.email AS reviewer_email,
  rr.reason,
  rr.resource_title,
  rr.resource_url,
  rr.resource_format,
  rr.resource_educational_type,
  rr.resource_snapshot,
  rr.created_at
FROM public.resource_rejections rr
INNER JOIN public.users uploader ON uploader.id = rr.uploader_id
LEFT JOIN public.users reviewer ON reviewer.id = rr.rejected_by;
