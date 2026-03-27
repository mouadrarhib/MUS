# Database Documentation

## 1. System Overview

This database powers an educational resource-sharing platform with six main capabilities:

- **Identity and access control**: user accounts, roles, role assignments, settings, and password reset support.
- **Academic structure modeling**: institutions, domains, programs, levels, semesters, modules, and student profiles.
- **Resource lifecycle management**: resource publishing, tagging, module linkage, moderation/rejections, and metadata storage.
- **Engagement tracking**: favorites, ratings, downloads, and wallet points events.
- **Learning support workflows**: Q&A entities and confusion-case management with assignment and resolution events.
- **Communication and growth**: in-app notifications, external delivery tracking (email/push), membership tiers, and recommendations.

The SQL implementation is PostgreSQL-oriented (PL/pgSQL, enums, triggers, JSONB, partial indexes) and places significant business logic inside database routines.

---

## 2. Entity-Relationship Overview

### Core relationship graph (text ERD)

- `users` <- `user_roles` -> `roles`
- `users` -> `user_settings`
- `users` -> `student_profiles` -> (`institutions`, `programs`, `semesters`)
- `domains` -> `programs` -> `levels` -> `semesters` -> `modules`
- `institutions` <- `institution_programs` -> `programs`
- `users` -> `resources` <- `resource_module_map` -> `modules`
- `resources` <- `resource_tags` -> `tags`
- `users` -> `favorites` -> `resources`
- `users` -> `ratings` -> `resources`
- `users` -> `resource_downloads` -> `resources`
- `resources` -> `resource_confusion_signals`
- `resource_confusion_cases` links `resources + modules + users(student)` and references `qa_answers`
- `resource_confusion_cases` -> `resource_confusion_case_events`
- `qa_questions` -> `qa_answers` -> `qa_comments`
- `user_notifications` -> `notification_deliveries`
- `users` -> `user_push_devices`
- `users` -> `user_memberships` -> `membership_plans`
- `users/resources` -> `wallet_points_events`

### Relationship patterns

- **One-to-many**: domains->programs, programs->levels, levels->semesters, semesters->modules.
- **Many-to-many**: users<->roles, institutions<->programs, resources<->tags, resources<->modules.
- **Profile bridge**: `student_profiles` ties an identity to the academic hierarchy.
- **Workflow entity**: `resource_confusion_cases` acts as a case-management aggregate with status transitions and audit events.

---

## 3. Tables

> Format: **name | type | description**.  
> Only key constraints and practical notes are listed to keep this recruiter/developer friendly.

### Table: `domains`
- **Description**: Top-level academic domains.
- **Columns**:

| name | type | description |
|---|---|---|
| id | bigserial | Primary key |
| name | text | Unique domain name |
| created_at | timestamptz | Creation timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: Referenced by `programs.domain_id`
- **Notes**: `name` is unique.

### Table: `institution_types`
- **Description**: Classification for institutions.
- **Columns**: `id`, `name`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: Referenced by `institutions.institution_type_id`
- **Notes**: `name` is unique.

### Table: `institutions`
- **Description**: Schools/universities and location.
- **Columns**: `id`, `name`, `institution_type_id`, `country`, `city`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `institution_type_id -> institution_types.id`
- **Notes**: unique business key `(name, country, city)`.

### Table: `programs`
- **Description**: Academic programs inside a domain.
- **Columns**: `id`, `name`, `domain_id`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `domain_id -> domains.id`
- **Notes**: unique `(domain_id, name)`.

### Table: `levels`
- **Description**: Program levels (ordered).
- **Columns**: `id`, `program_id`, `name`, `sort_order`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `program_id -> programs.id`
- **Notes**: unique `(program_id, name)`.

### Table: `semesters`
- **Description**: Level semesters (ordered).
- **Columns**: `id`, `level_id`, `name`, `sort_order`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `level_id -> levels.id`
- **Notes**: unique `(level_id, name)`.

### Table: `modules`
- **Description**: Teaching modules linked to semesters.
- **Columns**: `id`, `semester_id`, `code`, `title`, `description`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `semester_id -> semesters.id`
- **Notes**: unique `(semester_id, title)`.

### Table: `institution_programs`
- **Description**: M:N mapping between institutions and programs.
- **Columns**: `institution_id`, `program_id`, `created_at`
- **Primary Key**: `(institution_id, program_id)`
- **Foreign Keys**: to `institutions.id`, `programs.id`

### Table: `users`
- **Description**: User identity, credentials, activation, and points balance.
- **Columns**: `id`, `full_name`, `email`, `password_hash`, `is_active`, `created_at`, `updated_at`, `points`
- **Primary Key**: `id`
- **Foreign Keys**: Referenced by most transactional tables
- **Notes**: unique `email`; trigger maintains `updated_at`.

### Table: `roles`
- **Description**: Role dictionary.
- **Columns**: `id`, `name`, `description`
- **Primary Key**: `id`
- **Notes**: unique `name`.

### Table: `user_roles`
- **Description**: User-role assignment pivot.
- **Columns**: `user_id`, `role_id`, `assigned_at`
- **Primary Key**: `(user_id, role_id)`
- **Foreign Keys**: `user_id -> users.id`, `role_id -> roles.id`
- **Notes**: indexed for user and role filters.

### Table: `user_settings`
- **Description**: User preferences (UI, locale, notifications, privacy).
- **Columns**: `user_id`, `theme_mode`, `font_size`, `language`, `timezone`, `date_format`, `email_notifications`, `push_notifications`, `resource_alerts`, `weekly_digest`, `show_activity_status`, `show_profile`, `two_factor_enabled`, `created_at`, `updated_at`
- **Primary Key**: `user_id`
- **Foreign Keys**: `user_id -> users.id`

### Table: `student_profiles`
- **Description**: Student academic context attached to user.
- **Columns**: `user_id`, `institution_id`, `program_id`, `current_semester_id`, `created_at`, `updated_at`
- **Primary Key**: `user_id`
- **Foreign Keys**: to `users`, `institutions`, `programs`, `semesters`
- **Notes**: highly used in recommendation and onboarding validation.

### Table: `resource_types`
- **Description**: Resource type catalog.
- **Columns**: `id`, `name`, `slug`, `icon_key`, `allowed_formats`, `created_at`
- **Primary Key**: `id`
- **Notes**: unique `name` and `slug`.

### Table: `resources`
- **Description**: Main content object.
- **Columns**: `id`, `title`, `description`, `status`, `url`, `language`, `license`, `created_by`, `created_at`, `updated_at`, `educational_type`, `format`, `resource_type_id`, `metadata`, storage fields (`storage_provider`, `bucket`, `object_key`, `mime_type`, `size_bytes`, `checksum`, `original_filename`), `is_public`, `upload_status`, `access_tier`
- **Primary Key**: `id`
- **Foreign Keys**: `created_by -> users.id`, `resource_type_id -> resource_types.id`
- **Notes**: heavily indexed by status/type/creator/date; `access_tier` constrained to `free|premium`.

### Table: `resource_module_map`
- **Description**: M:N between resources and modules plus pedagogical attributes.
- **Columns**: `module_id`, `resource_id`, `chapter`, `exam_related`, `created_at`, `difficulty`
- **Primary Key**: `(module_id, resource_id)`
- **Foreign Keys**: to `modules`, `resources`

### Table: `tags`
- **Description**: Controlled vocab for resource tagging.
- **Columns**: `id`, `name`, `slug`, `category`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Foreign Keys**: `created_by -> users.id`
- **Notes**: `slug` unique; length checks on `name` and `slug`.

### Table: `resource_tags`
- **Description**: M:N resource-tag links.
- **Columns**: `resource_id`, `tag_id`, `created_at`
- **Primary Key**: `(resource_id, tag_id)`
- **Foreign Keys**: to `resources`, `tags`

### Table: `favorites`
- **Description**: User bookmarked resources.
- **Columns**: `user_id`, `resource_id`, `created_at`
- **Primary Key**: `(user_id, resource_id)`
- **Foreign Keys**: to `users`, `resources`

### Table: `ratings`
- **Description**: Resource ratings by user.
- **Columns**: `user_id`, `resource_id`, `score`, `comment`, `created_at`, `updated_at`
- **Primary Key**: `(user_id, resource_id)`
- **Foreign Keys**: to `users`, `resources`
- **Notes**: `score` check range `1..5`.

### Table: `resource_downloads`
- **Description**: Download events.
- **Columns**: `id`, `user_id`, `resource_id`, `downloaded_at`
- **Primary Key**: `id`
- **Foreign Keys**: to `users`, `resources`
- **Notes**: unique `(user_id, resource_id)` to avoid duplicate rewarding.

### Table: `wallet_points_events`
- **Description**: Immutable-style points ledger.
- **Columns**: `id`, `user_id`, `actor_user_id`, `resource_id`, `event_type`, `points_change`, `occurred_at`, `metadata`
- **Primary Key**: `id`
- **Foreign Keys**: to `users` and `resources`
- **Notes**: event types constrained to download/favorite reward events.

### Table: `resource_rejections`
- **Description**: Moderation archive for rejected resources with snapshot data.
- **Columns**: `id`, `resource_id_original`, `uploader_id`, `rejected_by`, `reason`, `resource_title`, `resource_url`, `resource_format`, `resource_educational_type`, `resource_snapshot`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `uploader_id`, `rejected_by -> users.id`
- **Notes**: reason length check; indexed by uploader/reviewer and date.

### Table: `qa_questions`
- **Description**: Q&A questions linked to module and resource.
- **Columns**: `id`, `module_id`, `resource_id`, `user_id`, `title`, `body`, `is_anonymous`, `status`, `moderation_status`, `moderated_by`, `moderated_at`, `moderation_reason`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Foreign Keys**: to `modules`, `resources`, `users`
- **Notes**: trigger validates question resource-module coherence through `resource_module_map`.

### Table: `qa_answers`
- **Description**: Answers to Q&A questions.
- **Columns**: `id`, `question_id`, `user_id`, `body`, `explanation`, `example`, `is_official`, `is_accepted`, `accepted_by`, `accepted_at`, moderation fields, timestamps
- **Primary Key**: `id`
- **Foreign Keys**: to `qa_questions`, `users`
- **Notes**: partial unique index enforces one accepted answer per question; official answers require richer content.

### Table: `qa_comments`
- **Description**: Comments on a question or answer.
- **Columns**: `id`, `question_id`, `answer_id`, `user_id`, `body`, moderation fields, timestamps
- **Primary Key**: `id`
- **Foreign Keys**: to `qa_questions`, `qa_answers`, `users`
- **Notes**: check constraint enforces exactly one target (`question_id` XOR `answer_id`).

### Table: `resource_confusion_signals`
- **Description**: Student confusion signals on resources.
- **Columns**: `id`, `resource_id`, `user_id`, `note`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: to `resources`, `users`

### Table: `module_staff_assignments`
- **Description**: Staff assignment per module with role and priority marker.
- **Columns**: `id`, `module_id`, `user_id`, `assignment_role`, `is_primary`, `is_active`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: to `modules`, `users`
- **Notes**: partial unique index enforces one active primary per `(module, assignment_role)`.

### Table: `resource_confusion_cases`
- **Description**: Case-management aggregate for confusion workflow.
- **Columns**: `id`, `resource_id`, `module_id`, `student_id`, `status`, `priority`, `assigned_to_user_id`, `assigned_by_user_id`, `official_answer_id`, `first_signal_at`, `last_signal_at`, `resolved_at`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Foreign Keys**: to `resources`, `modules`, `users`, `qa_answers`
- **Notes**: partial unique index prevents duplicate open case per `(student, resource, module)`.

### Table: `resource_confusion_case_events`
- **Description**: Event stream for confusion case lifecycle.
- **Columns**: `id`, `case_id`, `event_type`, `actor_user_id`, `payload`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `case_id -> resource_confusion_cases.id`, `actor_user_id -> users.id`

### Table: `user_notifications`
- **Description**: In-app notifications.
- **Columns**: `id`, `recipient_user_id`, `type`, `title`, `body`, `payload`, `is_read`, `read_at`, `created_at`
- **Primary Key**: `id`
- **Foreign Keys**: `recipient_user_id -> users.id`

### Table: `user_push_devices`
- **Description**: User push-device tokens.
- **Columns**: `id`, `user_id`, `device_token`, `platform`, `device_name`, `is_active`, `last_seen_at`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Foreign Keys**: `user_id -> users.id`
- **Notes**: unique `(user_id, device_token)`; platform check (`web|android|ios`).

### Table: `notification_deliveries`
- **Description**: Per-channel notification delivery attempts.
- **Columns**: `id`, `notification_id`, `channel`, `destination`, `status`, `provider_message_id`, `error_message`, `attempts`, `sent_at`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Foreign Keys**: `notification_id -> user_notifications.id`
- **Notes**: status and channel checks, retry-oriented indexes.

### Table: `membership_plans`
- **Description**: Catalog of free/premium plans.
- **Columns**: `id`, `code`, `name`, `description`, `price_cents`, `currency`, `duration_days`, `is_active`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Notes**: uniqueness on `code`, pricing and non-empty checks.

### Table: `user_memberships`
- **Description**: User subscription/entitlement history.
- **Columns**: `id`, `user_id`, `plan_id`, `status`, `starts_at`, `ends_at`, `source`, `notes`, `created_at`, `updated_at`
- **Primary Key**: `id`
- **Foreign Keys**: `user_id -> users.id`, `plan_id -> membership_plans.id`
- **Notes**: active/current membership lookup indexed by `(user_id, status, ends_at)`.

### Supporting tables
- **`audit_logs`**: operational security/audit trail tied to `users`.
- **`password_reset_tokens`**: reset token lifecycle with expiry and single-use behavior.

---

## 4. Relationships

### One-to-many
- `domains -> programs -> levels -> semesters -> modules`
- `users -> resources`
- `users -> user_notifications -> notification_deliveries`
- `resource_confusion_cases -> resource_confusion_case_events`
- `qa_questions -> qa_answers -> qa_comments`

### Many-to-many
- `users <-> roles` via `user_roles`
- `institutions <-> programs` via `institution_programs`
- `resources <-> tags` via `resource_tags`
- `resources <-> modules` via `resource_module_map`

### Key relational flows
- **Student profile flow**: user chooses institution/program/semester; constraints and procedures enforce hierarchy consistency.
- **Resource context flow**: resources become academically contextual through module mapping and metadata.
- **Support flow**: confusion signal generates/updates a case, then assignment/resolution is tracked as events.
- **Delivery flow**: in-app notification is created first, then external deliveries are tracked and retried.

---

## 5. Stored Procedures

The schema uses mostly functions (`sp_*`) and a small number of true procedures.

### Procedure: `assign_role_to_user(p_user_id, p_role_id)`
- **Purpose**: Assign a role to a user.
- **Parameters**: user UUID, role BIGINT.
- **Logic summary**:
  1. Inserts into `user_roles`.
- **Use cases**: admin role provisioning.

### Procedure: `remove_role_from_user(p_user_id, p_role_id)`
- **Purpose**: Remove a role from a user.
- **Parameters**: user UUID, role BIGINT.
- **Logic summary**:
  1. Deletes matching row from `user_roles`.
- **Use cases**: role revocation.

### Procedure: `update_user_role(p_user_id, p_old_role_id, p_new_role_id)`
- **Purpose**: Replace one role assignment with another.
- **Parameters**: user UUID, old role ID, new role ID.
- **Logic summary**:
  1. Updates `user_roles.role_id` and refreshes `assigned_at`.
- **Use cases**: role transition workflows.

---

## 6. Functions

### Grouped catalog

- **Auth and identity**: `sp_user_*`, `sp_role_*`, `sp_user_settings_*`, password/token helpers.
- **Academic master data CRUD**: `sp_domain_*`, `sp_institution_type_*`, `sp_institution_*`, `sp_institution_program_*`, `sp_program_*`, `sp_level_*`, `sp_semester_*`, `sp_module_*`, `sp_student_profile_*`.
- **Resources and moderation**: `sp_resource_*`, `sp_resource_rejection_*`.
- **Engagement and rewards**: `sp_favorite_*`, `sp_rating_*`, `sp_resource_record_download`, wallet analytics (`sp_wallet_*`).
- **Tagging and personalization**: `sp_tag_*`, `sp_user_tag_preferences_*`, `sp_recommendation_get_for_user`.
- **Q&A and confusion support**: QA validation trigger + `sp_confusion_*`.
- **Notification pipeline**: `sp_notification_*`, `sp_notification_delivery_*` including retry/backoff.
- **Membership/access tier**: `sp_membership_*`, `sp_user_membership_*`, `sp_user_has_premium_access`.

### Detailed coverage of critical functions

### Function: `sp_user_register_student(...)`
- **Purpose**: Register account and create validated student profile in one transaction.
- **Parameters**: full name, email, password, institution/program/level/semester IDs.
- **Return value**: created user record fields.
- **Logic summary**:
  1. Validates required identity/academic inputs.
  2. Verifies institution exists, program exists, and institution-program mapping exists.
  3. Verifies level belongs to program and semester belongs to level.
  4. Normalizes email and hashes password.
  5. Inserts `users` then `student_profiles`.
  6. Raises clear business exceptions on violations.

### Function: `sp_resource_record_download(p_user_id, p_resource_id)`
- **Purpose**: Record download and apply owner reward policy.
- **Parameters**: actor user, resource.
- **Return value**: `success`, message, `points_awarded`.
- **Logic summary**:
  1. Loads resource owner; errors if resource missing.
  2. If already downloaded by actor, updates timestamp only.
  3. Else inserts download event.
  4. If actor != owner, increments owner points (+10) and logs event in `wallet_points_events`.

### Function: `sp_favorite_add(p_user_id, p_resource_id)` and `sp_favorite_remove(...)`
- **Purpose**: Manage favorites with reward/penalty side effects.
- **Parameters**: actor user, resource.
- **Return value**: inserted favorite row (`add`) / boolean (`remove`).
- **Logic summary**:
  1. Adds/removes favorite idempotently.
  2. Adjusts owner points (+2 on add, -2 on remove, floor at 0).
  3. Logs event rows into wallet ledger for analytics and audit.

### Function: `sp_confusion_signal_create_and_assign(...)`
- **Purpose**: End-to-end confusion case intake with auto-assignment.
- **Parameters**: resource, module, student, note, anti-spam window.
- **Return value**: signal metadata + case metadata + assignment source.
- **Logic summary**:
  1. Validates resource-module linkage.
  2. Enforces anti-spam on repeated signals.
  3. Creates signal row.
  4. Reuses open case or creates new one.
  5. Emits lifecycle event (`case_created` or `signal_attached`).
  6. Picks assignee by deterministic priority (`teacher primary -> teacher -> admin primary -> admin -> admin pool`).
  7. Auto-assigns case and emits `auto_assigned` event.

### Function: `sp_confusion_case_link_official_answer(p_question_id, p_answer_id, p_actor_user_id)`
- **Purpose**: Link Q&A answer to active confusion case.
- **Parameters**: question ID, answer ID, actor user ID.
- **Return value**: updated case fields.
- **Logic summary**:
  1. Finds matching open case via question context (student/resource/module).
  2. Sets `official_answer_id` and transitions status to `repondu_officiel` if applicable.
  3. Records event `official_answer_linked` with payload.

### Functions: `sp_notification_delivery_get_retry_candidates(...)` and `sp_notification_delivery_prepare_retry(...)`
- **Purpose**: Queue-safe retry engine for failed deliveries.
- **Parameters**: max attempts, base delay, limit, delivery ID.
- **Return value**: retry candidates / updated retry-ready delivery rows.
- **Logic summary**:
  1. Selects failed deliveries eligible under exponential backoff.
  2. Resets selected rows to `pending`, increments attempts, clears errors.
  3. Supports stateless worker loops.

### Function: `sp_recommendation_get_for_user(p_user_id, p_limit)`
- **Purpose**: Personalized resource ranking.
- **Parameters**: target user, result limit.
- **Return value**: resources with `score` and `match_reasons`.
- **Logic summary**:
  1. Reads student profile context and adjacent semesters.
  2. Reads preferred tags from `user_tag_preferences`.
  3. Builds quality signals (downloads, favorites, avg ratings).
  4. Scores candidates using weighted components (tag/profile/quality/freshness).
  5. Returns ordered recommendations with explainability reasons.

### Functions: `sp_user_membership_assign`, `sp_user_membership_get_current`, `sp_user_has_premium_access`
- **Purpose**: Membership entitlement lifecycle.
- **Parameters**: user, plan code, period fields.
- **Return value**: current membership row / boolean access.
- **Logic summary**:
  1. Validates plan and active state.
  2. Cancels existing active memberships when reassigning.
  3. Inserts active membership and computes premium flag (`plan_code <> free`).
  4. Access helper checks active, unexpired, non-free membership.

---

## 7. Business Logic & Workflows

### Workflow A: Student onboarding
- Validate institution-program-level-semester coherence.
- Create user account with normalized email and bcrypt hash.
- Create student profile tied to academic context.

### Workflow B: Resource publication and discoverability
- Resource is created with status/type/format and rich metadata.
- Resource can be mapped to modules and tagged.
- Recommendation engine and search/analytics routines consume these signals.

### Workflow C: Engagement-to-reward economy
- Downloads and favorites trigger owner point changes.
- Every points mutation is journaled in `wallet_points_events`.
- Wallet analytics aggregates current points, trend windows, and top resources.

### Workflow D: Q&A integrity
- Questions must target a `(module, resource)` pair that exists in `resource_module_map`.
- Moderation status and accepted-answer uniqueness are enforced via constraints/indexes.

### Workflow E: Confusion case management
- Student signal creates/updates a case.
- Auto-assignment chooses best available staff.
- Status transitions are evented and auditable.
- Official answer can be linked back into case and close the loop.

### Workflow F: Multi-channel notification delivery
- Notification created in-app (`user_notifications`).
- Delivery jobs persisted in `notification_deliveries`.
- Failed sends are retried with exponential backoff and attempt limits.

### Workflow G: Access control by entitlement
- Resource `access_tier` can be `free` or `premium`.
- Membership routines determine if user currently has premium access.

---

## 8. Data Flow Examples

### Example 1: New student registration
1. Client submits identity + academic selections.
2. API calls `sp_user_register_student`.
3. DB validates hierarchy and writes `users` + `student_profiles`.
4. API returns created account object.

### Example 2: User favorites a resource
1. Client triggers favorite action.
2. API calls `sp_favorite_add`.
3. DB inserts into `favorites` (idempotent).
4. If non-self action, owner points increase and `wallet_points_events` is logged.
5. Wallet dashboards reflect updated totals.

### Example 3: Student raises confusion
1. Client submits confusion signal for resource/module.
2. API calls `sp_confusion_signal_create_and_assign`.
3. DB stores signal, opens/updates case, records events, auto-assigns staff.
4. Staff view queries case list and works toward resolution.

### Example 4: Notification retry worker
1. Worker fetches candidates via `sp_notification_delivery_get_retry_candidates`.
2. Worker marks each candidate pending via `sp_notification_delivery_prepare_retry`.
3. External channel send is attempted.
4. Worker finalizes with `sp_notification_delivery_update_status`.

---

## 9. Improvements & Observations

### Potential optimizations
- **Consolidate duplicated routine definitions**: some functions appear in multiple files (`procedures.sql` vs domain-specific files), increasing deployment-order risk.
- **Reduce overlapping indexes**: examples include duplicate-like indexes on favorites/ratings; review with production usage stats before pruning.
- **Separate operational SQL from schema SQL**: admin view file currently includes `ANALYZE` and index creation, which is better managed in migration/ops scripts.

### Consistency and integrity observations
- **Legacy routine drift**: some resource routines still reference old type/status model variants; align all routines with `resource_type_id` and current enums/checks.
- **FK action mismatch**: there are places where `ON DELETE SET NULL` conflicts with `NOT NULL` semantics (e.g., reviewer field pattern), which can fail on delete operations.
- **Question-resource FK semantics**: current question schema enforces required resource but one FK action variant implies nulling behavior; align to `RESTRICT`/`CASCADE` according to product intent.

### Security and maintainability
- **Good practice already present**: critical auth functions use `SECURITY DEFINER` with fixed `search_path`.
- **Next hardening step**: document ownership/execute privileges per routine to avoid privilege creep.
- **Documentation hygiene**: keep a generated routine inventory (name/signature/source file) to detect accidental drift.

---

### Appendix: Main Views

- `vw_resource_tags`: resource-to-tag flattened mapping.
- `vw_tags_popularity`: aggregated tag usage and recency.
- `vw_resource_rejections`: enriched rejection details (uploader/reviewer context).
- `vw_admin_students_list`, `vw_admin_student_full_details`, `vw_admin_students_statistics`, `vw_admin_student_resources`: admin analytical read models.
