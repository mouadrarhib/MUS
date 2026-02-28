-- ============================================================================
-- 004_enforce_qa_question_resource_required.sql
-- Enforces resource_id requirement for Q&A questions.
-- Includes safe backfill from module-resource mappings before NOT NULL.
-- ============================================================================

-- 1) Try to backfill missing resource_id from mapped resources in same module.
-- Priority:
--   - published resources first
--   - most recent resource next
UPDATE public.qa_questions q
SET resource_id = picked.resource_id
FROM LATERAL (
  SELECT rmm.resource_id
  FROM public.resource_module_map rmm
  INNER JOIN public.resources r ON r.id = rmm.resource_id
  WHERE rmm.module_id = q.module_id
  ORDER BY
    CASE WHEN r.status = 'published'::resource_status THEN 0 ELSE 1 END,
    r.created_at DESC,
    r.id DESC
  LIMIT 1
) AS picked
WHERE q.resource_id IS NULL;

-- 2) Report remaining NULL rows (do not fail here).
DO $$
DECLARE
  missing_count integer;
  sample_ids text;
BEGIN
  SELECT COUNT(*)::int INTO missing_count
  FROM public.qa_questions
  WHERE resource_id IS NULL;

  IF missing_count > 0 THEN
    SELECT string_agg(id::text, ', ' ORDER BY id)
    INTO sample_ids
    FROM (
      SELECT id
      FROM public.qa_questions
      WHERE resource_id IS NULL
      ORDER BY id
      LIMIT 20
    ) s;

    RAISE NOTICE
      'qa_questions still has % row(s) with NULL resource_id. IDs(sample): %',
      missing_count,
      COALESCE(sample_ids, 'none');
  END IF;
END$$;

-- 3) Enforce NOT NULL only when data is clean.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.qa_questions WHERE resource_id IS NULL) THEN
    ALTER TABLE public.qa_questions
      ALTER COLUMN resource_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'Skipping NOT NULL on qa_questions.resource_id (remaining NULL rows).';
  END IF;
END$$;
