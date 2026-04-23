# Q&A Feature Release Runbook

## Migration Run Notes

1. Apply DB migrations in order:
   - `019_add_qa_notification_recipient_resolver.sql`
   - `020_add_qa_notification_perf_indexes.sql`
2. Validate function exists:
   - `SELECT * FROM public.sp_qa_notification_recipients(NULL, 1, 1, NULL) LIMIT 5;`
3. Validate index presence:
   - `\d+ public.module_staff_assignments`
   - `\d+ public.qa_questions`
   - `\d+ public.qa_answers`
   - `\d+ public.qa_comments`

## Rollback Guidance

If rollback is required, run in reverse order:

1. Drop performance indexes from migration `020`.
2. Drop `public.sp_qa_notification_recipients(...)`.
3. Re-deploy backend without QA notification calls.

Suggested SQL rollback snippet:

```sql
DROP INDEX IF EXISTS public.idx_qa_comments_answer_moderation_created;
DROP INDEX IF EXISTS public.idx_qa_comments_question_moderation_created;
DROP INDEX IF EXISTS public.idx_qa_answers_question_moderation_created;
DROP INDEX IF EXISTS public.idx_qa_questions_resource_moderation_created;
DROP INDEX IF EXISTS public.idx_module_staff_assignments_module_user_active;

DROP FUNCTION IF EXISTS public.sp_qa_notification_recipients(BIGINT, BIGINT, BIGINT, UUID);
```

## Stakeholder QA Acceptance Checklist

- [ ] Student can post question on linked resource/module.
- [ ] Student can post answer/comment on open thread.
- [ ] Closed question blocks new answers/comments.
- [ ] Teacher/Admin can moderate question/answer/comment.
- [ ] Teacher/Admin can accept one answer.
- [ ] Anonymous question masks author identity for other non-admin viewers.
- [ ] Resource owner + active module staff receive QA notifications.
- [ ] Actor does not receive own notification.
- [ ] Notification click opens resource preview and targets question thread.

## Production Config Verification

Before deploy, verify:

- [ ] API base URL for frontend points to correct backend (`VITE_API_URL`).
- [ ] Backend DB connectivity env is set and healthy.
- [ ] Auth/session configuration is valid for SSE stream cookies.
- [ ] Notification stream endpoint reachable through ingress/proxy.
- [ ] CORS and credentials settings allow notification stream from frontend origin.

## Monitoring Post-Release

Track these signals for 24-72h:

1. Notification creation volume by type:
   - `QA_QUESTION_CREATED`
   - `QA_ANSWER_CREATED`
   - `QA_QUESTION_COMMENT_CREATED`
   - `QA_ANSWER_COMMENT_CREATED`
2. Notification delivery errors / failed inserts.
3. QA endpoint error rates and latency (`/qa/questions`, answers/comments routes).
4. Moderation actions audit volume (`QA_MODERATE_*`, `QA_ACCEPT_ANSWER`).

Recommended checks:

- Run: `npm run test:smoke:qa`
- Run: `npm run test:smoke:confusion`
- Run query plans: `Database/diagnostics/qa_query_plan_checks.sql`
