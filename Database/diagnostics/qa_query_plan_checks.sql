-- QA query plan checks
-- Run in staging/production-like data before release:
-- psql "$DATABASE_URL" -f Database/diagnostics/qa_query_plan_checks.sql

EXPLAIN (ANALYZE, BUFFERS)
SELECT user_id, source
FROM public.sp_qa_notification_recipients(
  NULL,
  1,
  1,
  '00000000-0000-0000-0000-000000000000'::uuid
);

EXPLAIN (ANALYZE, BUFFERS)
SELECT q.id
FROM public.qa_questions q
WHERE q.resource_id = 1
  AND q.moderation_status = 'active'::qa_moderation_status
ORDER BY q.created_at DESC
LIMIT 50;

EXPLAIN (ANALYZE, BUFFERS)
SELECT a.id
FROM public.qa_answers a
WHERE a.question_id = 1
  AND a.moderation_status = 'active'::qa_moderation_status
ORDER BY a.is_accepted DESC, a.is_official DESC, a.created_at ASC
LIMIT 50;

EXPLAIN (ANALYZE, BUFFERS)
SELECT c.id
FROM public.qa_comments c
WHERE c.question_id = 1
  AND c.moderation_status = 'active'::qa_moderation_status
ORDER BY c.created_at ASC
LIMIT 100;
