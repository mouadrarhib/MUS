# Q&A Feature Completion Checklist

Use this checklist to deliver the Q&A/comment + owner notification feature with production-level quality.

## 1) Scope and Product Decisions

- [ ] Confirm recipient policy: notify `resources.created_by` + active `module_staff_assignments` users.
- [ ] Confirm whether global admins are always included or only context-scoped recipients.
- [ ] Confirm event coverage: new question, new answer, question comment, answer comment.
- [ ] Confirm exclusion rules: no self-notifications, no inactive users, no moderated-hidden leak.
- [ ] Confirm frontend entry points (required: `ResourcePreviewPage`; optional: details dialog).

## 2) Database and Migration Work

- [ ] Add a migration that creates a DB helper function to resolve Q&A recipients.
- [ ] Ensure recipient resolver returns distinct user IDs and excludes actor.
- [ ] Ensure resolver filters to active users only.
- [ ] Ensure query path includes owner (`resources.created_by`) and active module staff.
- [ ] Add/validate indexes needed for recipient lookup performance.
- [ ] Keep migration idempotent and safe for re-run.

## 3) Backend Service Implementation

- [ ] Add centralized Q&A notification helper in `MUS-backend/src/services/qaService.js`.
- [ ] Wire notifications into `createQuestionWithRoles`.
- [ ] Wire notifications into `createAnswer`.
- [ ] Wire notifications into `createCommentOnQuestion`.
- [ ] Wire notifications into `createCommentOnAnswer`.
- [ ] Use `createNotificationsBulk` from `notificationService` for consistency.
- [ ] Ensure notification send only occurs after successful write.
- [ ] Prevent duplicates per event/recipient.

## 4) Notification Contract and Payload

- [ ] Define stable QA notification `type` values.
- [ ] Standardize payload keys: `resource_id`, `module_id`, `question_id`, `answer_id`, `comment_id`, `actor_user_id`.
- [ ] Keep title/body style consistent with existing notification language.
- [ ] Verify payload has enough context for deep-link navigation.
- [ ] Keep backward compatibility for existing notification endpoints.

## 5) Frontend Q&A Integration

- [ ] Create `MUS-frontend/src/services/qaService.js` for all `/qa` API calls.
- [ ] Add questions list + create question UI in preview page.
- [ ] Add answers list + create answer UI.
- [ ] Add comments list + create comment UI for both questions and answers.
- [ ] Add loading, empty, error, retry states for each data section.
- [ ] Add role-aware UI guards for moderation-only actions.
- [ ] Keep mobile and desktop layouts usable.

## 6) Frontend Notifications UX

- [ ] Add notifications API client methods if missing.
- [ ] Add unread indicator and read-state updates.
- [ ] Add SSE subscription handling for realtime notification updates.
- [ ] Add safe dedupe when realtime and manual refresh overlap.
- [ ] Add deep-link navigation from notification item to target Q&A context.

## 7) Security, Privacy, Moderation

- [ ] Preserve anonymous question identity masking for non-author/non-admin users.
- [ ] Ensure hidden/deleted moderated content is not shown to unauthorized viewers.
- [ ] Ensure actor cannot trigger a notification to self through any create path.
- [ ] Verify role checks remain enforced for moderation and accept-answer actions.
- [ ] Add/verify audit logging where moderation decisions occur.

## 8) Performance and Reliability

- [ ] Verify recipient lookup query plan is acceptable under load.
- [ ] Verify list endpoints scale with pagination.
- [ ] Keep notification insert flow batched for multi-recipient events.
- [ ] Ensure notification dispatch failures do not break core QA writes.
- [ ] Add defensive error handling for partial downstream failures.

## 9) Testing and Validation

- [ ] Extend `MUS-backend/scripts/qa-e2e-check.mjs` to assert notification side effects.
- [ ] Add coverage for self-notification suppression.
- [ ] Add coverage for owner + module staff recipient resolution.
- [ ] Add coverage for inactive user exclusion and duplicate suppression.
- [ ] Add coverage for moderation visibility behavior.
- [ ] Run `npm run test:smoke:qa`.
- [ ] Run `npm run test:smoke:confusion` to check regressions in linked flows.

## 10) Delivery, Commits, and Release Readiness

- [ ] Split changes into clean commits:
  - [ ] DB migration and recipient resolver
  - [ ] Backend Q&A notification wiring
  - [ ] Frontend Q&A integration
  - [ ] Frontend notifications polish + docs
- [ ] Prepare migration run notes and rollback guidance.
- [ ] Add final QA acceptance checklist for stakeholder sign-off.
- [ ] Verify production config and required envs before deploy.
- [ ] Monitor post-release: notification creation rate, delivery failures, API errors.
