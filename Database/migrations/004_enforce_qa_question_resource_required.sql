-- ============================================================================
-- 004_enforce_qa_question_resource_required.sql
-- Enforces resource_id requirement for Q&A questions.
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.qa_questions WHERE resource_id IS NULL) THEN
    RAISE EXCEPTION 'qa_questions contains rows with NULL resource_id. Update or delete them before applying this migration.';
  END IF;
END$$;

ALTER TABLE public.qa_questions
  ALTER COLUMN resource_id SET NOT NULL;
