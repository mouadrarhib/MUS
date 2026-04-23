-- ============================================================================
-- 020_add_qa_notification_perf_indexes.sql
--
-- Additional indexes for QA notification recipient resolution and
-- high-volume list queries with moderation filtering + chronology.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_module_staff_assignments_module_user_active
  ON public.module_staff_assignments (module_id, user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_qa_questions_resource_moderation_created
  ON public.qa_questions (resource_id, moderation_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_answers_question_moderation_created
  ON public.qa_answers (question_id, moderation_status, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_qa_comments_question_moderation_created
  ON public.qa_comments (question_id, moderation_status, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_qa_comments_answer_moderation_created
  ON public.qa_comments (answer_id, moderation_status, created_at ASC);
