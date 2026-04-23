-- ============================================================================
-- 019_add_qa_notification_recipient_resolver.sql
--
-- Resolves Q&A notification recipients for:
-- - resource owner (resources.created_by)
-- - active module staff assignments (module_staff_assignments.is_active = true)
--
-- Excludes actor (if provided), filters inactive users, and deduplicates recipients.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sp_qa_notification_recipients(
  p_question_id BIGINT DEFAULT NULL,
  p_resource_id BIGINT DEFAULT NULL,
  p_module_id BIGINT DEFAULT NULL,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  source TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH context_row AS (
    SELECT q.resource_id, q.module_id
    FROM public.qa_questions q
    WHERE p_question_id IS NOT NULL
      AND q.id = p_question_id

    UNION ALL

    SELECT p_resource_id, p_module_id
    WHERE p_question_id IS NULL
      AND p_resource_id IS NOT NULL
      AND p_module_id IS NOT NULL

    LIMIT 1
  ),
  owner_candidates AS (
    SELECT r.created_by AS user_id, 'resource_owner'::text AS source
    FROM context_row c
    INNER JOIN public.resources r ON r.id = c.resource_id
  ),
  staff_candidates AS (
    SELECT msa.user_id, ('module_staff_' || msa.assignment_role)::text AS source
    FROM context_row c
    INNER JOIN public.module_staff_assignments msa
      ON msa.module_id = c.module_id
     AND msa.is_active = TRUE
  ),
  raw_candidates AS (
    SELECT * FROM owner_candidates
    UNION ALL
    SELECT * FROM staff_candidates
  ),
  normalized AS (
    SELECT DISTINCT ON (rc.user_id)
      rc.user_id,
      rc.source
    FROM raw_candidates rc
    INNER JOIN public.users u ON u.id = rc.user_id
    WHERE u.is_active = TRUE
      AND (p_actor_user_id IS NULL OR rc.user_id IS DISTINCT FROM p_actor_user_id)
    ORDER BY rc.user_id, rc.source
  )
  SELECT n.user_id, n.source
  FROM normalized n
  ORDER BY n.user_id;
END;
$$;
