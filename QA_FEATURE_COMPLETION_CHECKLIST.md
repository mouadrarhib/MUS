# Q&A Feature Completion Checklist

Use this checklist to deliver the Q&A/comment + owner notification feature with production-level quality.

## 1) Scope and Product Decisions

- [x] Confirm recipient policy: notify `resources.created_by` + active `module_staff_assignments` users.
- [x] Confirm whether global admins are always included or only context-scoped recipients.
- [x] Confirm event coverage: new question, new answer, question comment, answer comment.
- [x] Confirm exclusion rules: no self-notifications, no inactive users, no moderated-hidden leak.
- [x] Confirm frontend entry points (required: `ResourcePreviewPage`; optional: details dialog).

## 2) Database and Migration Work

- [x] Add a migration that creates a DB helper function to resolve Q&A recipients.
- [x] Ensure recipient resolver returns distinct user IDs and excludes actor.
- [x] Ensure resolver filters to active users only.
- [x] Ensure query path includes owner (`resources.created_by`) and active module staff.
- [x] Add/validate indexes needed for recipient lookup performance.
- [x] Keep migration idempotent and safe for re-run.

## 3) Backend Service Implementation

- [x] Add centralized Q&A notification helper in `MUS-backend/src/services/qaService.js`.
- [x] Wire notifications into `createQuestionWithRoles`.
- [x] Wire notifications into `createAnswer`.
- [x] Wire notifications into `createCommentOnQuestion`.
- [x] Wire notifications into `createCommentOnAnswer`.
- [x] Use `createNotificationsBulk` from `notificationService` for consistency.
- [x] Ensure notification send only occurs after successful write.
- [x] Prevent duplicates per event/recipient.

## 4) Notification Contract and Payload

- [x] Define stable QA notification `type` values.
- [x] Standardize payload keys: `resource_id`, `module_id`, `question_id`, `answer_id`, `comment_id`, `actor_user_id`.
- [x] Keep title/body style consistent with existing notification language.
- [x] Verify payload has enough context for deep-link navigation.
- [x] Keep backward compatibility for existing notification endpoints.

## 5) Frontend Q&A Integration

- [x] Create `MUS-frontend/src/services/qaService.js` for all `/qa` API calls.
- [x] Add questions list + create question UI in preview page.
- [x] Add answers list + create answer UI.
- [x] Add comments list + create comment UI for both questions and answers.
- [x] Add loading, empty, error, retry states for each data section.
- [x] Add role-aware UI guards for moderation-only actions.
- [x] Keep mobile and desktop layouts usable.

## 6) Frontend Notifications UX

- [x] Add notifications API client methods if missing.
- [x] Add unread indicator and read-state updates.
- [x] Add SSE subscription handling for realtime notification updates.
- [x] Add safe dedupe when realtime and manual refresh overlap.
- [x] Add deep-link navigation from notification item to target Q&A context.

## 7) Security, Privacy, Moderation

- [x] Preserve anonymous question identity masking for non-author/non-admin users.
- [x] Ensure hidden/deleted moderated content is not shown to unauthorized viewers.
- [x] Ensure actor cannot trigger a notification to self through any create path.
- [x] Verify role checks remain enforced for moderation and accept-answer actions.
- [x] Add/verify audit logging where moderation decisions occur.

## 8) Performance and Reliability

- [ ] Verify recipient lookup query plan is acceptable under load.
- [x] Verify list endpoints scale with pagination.
- [x] Keep notification insert flow batched for multi-recipient events.
- [x] Ensure notification dispatch failures do not break core QA writes.
- [x] Add defensive error handling for partial downstream failures.

## 9) Testing and Validation

- [x] Extend `MUS-backend/scripts/qa-e2e-check.mjs` to assert notification side effects.
- [x] Add coverage for self-notification suppression.
- [x] Add coverage for owner + module staff recipient resolution.
- [x] Add coverage for inactive user exclusion and duplicate suppression.
- [x] Add coverage for moderation visibility behavior.
- [ ] Run `npm run test:smoke:qa`.
- [ ] Run `npm run test:smoke:confusion` to check regressions in linked flows.

## 10) Delivery, Commits, and Release Readiness

- [x] Split changes into clean commits:
  - [x] DB migration and recipient resolver
  - [x] Backend Q&A notification wiring
  - [x] Frontend Q&A integration
  - [x] Frontend notifications polish + docs
- [x] Prepare migration run notes and rollback guidance.
- [x] Add final QA acceptance checklist for stakeholder sign-off.
- [x] Verify production config and required envs before deploy.
- [x] Monitor post-release: notification creation rate, delivery failures, API errors.

## Blocked in Current Environment

- [ ] Verify recipient lookup query plan is acceptable under load. (Ready via `Database/diagnostics/qa_query_plan_checks.sql`, execution pending staging/prod-like DB run)
- [ ] Run `npm run test:smoke:qa`. (Command executed, blocked by admin credential/env setup)
- [ ] Run `npm run test:smoke:confusion` to check regressions in linked flows. (Command executed, blocked by admin credential/env setup)
