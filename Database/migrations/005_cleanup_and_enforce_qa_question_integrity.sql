-- ============================================================================
-- 005_cleanup_and_enforce_qa_question_integrity.sql
--
-- Goals:
-- 1) Remove legacy qa_questions rows with NULL resource_id (safe via CASCADE).
-- 2) Enforce qa_questions.resource_id as NOT NULL.
-- 3) Enforce (module_id, resource_id) consistency with resource_module_map
--    at DB level for INSERT/UPDATE.
-- ============================================================================

-- 1) Cleanup legacy rows (answers/comments are deleted automatically via CASCADE)
DELETE FROM public.qa_questions
WHERE resource_id IS NULL;

-- 2) Enforce mandatory resource_id
ALTER TABLE public.qa_questions
  ALTER COLUMN resource_id SET NOT NULL;

-- 3) DB-level integrity check: question resource must be linked to question module
CREATE OR REPLACE FUNCTION public.trg_validate_qa_question_resource_module_link()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resource_module_map rmm
    WHERE rmm.resource_id = NEW.resource_id
      AND rmm.module_id = NEW.module_id
  ) THEN
    RAISE EXCEPTION 'Resource % must be linked to module % in resource_module_map', NEW.resource_id, NEW.module_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qa_question_validate_resource_module_link ON public.qa_questions;
CREATE TRIGGER trg_qa_question_validate_resource_module_link
BEFORE INSERT OR UPDATE OF module_id, resource_id ON public.qa_questions
FOR EACH ROW
EXECUTE FUNCTION public.trg_validate_qa_question_resource_module_link();
