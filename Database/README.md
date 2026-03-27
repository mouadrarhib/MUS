<div align="center">

# 🗄️ MUS Database

**PostgreSQL schema, migrations, and business routines for the MUS platform**

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![PL/pgSQL](https://img.shields.io/badge/Language-PL%2FpgSQL-336791)](https://www.postgresql.org/docs/current/plpgsql.html)
[![Schema](https://img.shields.io/badge/Schema-Versioned-blue)](./database_DDL.sql)
[![Migrations](https://img.shields.io/badge/Migrations-SQL-0A7E8C)](./migrations)

</div>

---

## 📖 Overview

The MUS database is a PostgreSQL-first design that combines:

- 🔐 **Identity and RBAC** (`users`, `roles`, `user_roles`, `user_settings`)
- 🏛️ **Academic hierarchy** (`domains -> programs -> levels -> semesters -> modules`)
- 📚 **Resource lifecycle** (resources, mapping, tags, ratings, favorites, downloads)
- 💬 **Support workflows** (Q&A + confusion case management)
- 📩 **Notification pipeline** (in-app, push devices, channel deliveries, retry logic)
- 💳 **Membership & access tiers** (free/premium gating and entitlement checks)
- 🎯 **Personalization & analytics** (tag preferences, recommendations, wallet events)

Business logic is intentionally centralized in SQL routines (`sp_*`) to enforce consistency across API paths.

---

## 🏗️ Data Architecture

### Core Relationship Graph

```text
users <- user_roles -> roles
users -> user_settings

domains -> programs -> levels -> semesters -> modules
institutions <- institution_programs -> programs
users -> student_profiles -> institutions/programs/semesters

users -> resources <- resource_module_map -> modules
resources <- resource_tags -> tags
users -> favorites/ratings/resource_downloads -> resources

resources -> resource_confusion_signals
resource_confusion_cases -> resource_confusion_case_events
qa_questions -> qa_answers -> qa_comments

user_notifications -> notification_deliveries
users -> user_push_devices

users -> user_memberships -> membership_plans
users/resources -> wallet_points_events
```

### Design Characteristics

| Characteristic | Implementation |
|---|---|
| **Referential integrity** | Strict FKs, composite PKs, check constraints |
| **Workflow enforcement** | Trigger + function orchestration (`sp_confusion_*`, QA validation trigger) |
| **Performance posture** | Focused indexes on status, owner, time, and queue scanning |
| **Operational traceability** | Event tables (`wallet_points_events`, case events, delivery status history) |

---

## 📁 Directory Structure

```text
Database/
├── README.md                           # This file
├── database_DDL.sql                    # Main schema snapshot
├── Database_Documentation.md           # Extended architecture documentation
├── migrations/                         # Incremental SQL changes
├── procedures/                         # Business functions and procedures
├── vues/                               # SQL views (analytics and enriched projections)
└── seeds/                              # Seed/test scripts
```

---

## 🧱 Core Tables by Domain

### Identity & Access

| Tables |
|---|
| `users`, `roles`, `user_roles`, `user_settings`, `password_reset_tokens`, `audit_logs` |

### Academic Catalog

| Tables |
|---|
| `institution_types`, `institutions`, `domains`, `programs`, `levels`, `semesters`, `modules`, `institution_programs`, `student_profiles` |

### Resources & Engagement

| Tables |
|---|
| `resource_types`, `resources`, `resource_module_map`, `tags`, `resource_tags`, `favorites`, `ratings`, `resource_downloads`, `resource_rejections` |

### Learning Support

| Tables |
|---|
| `qa_questions`, `qa_answers`, `qa_comments`, `resource_confusion_signals`, `module_staff_assignments`, `resource_confusion_cases`, `resource_confusion_case_events` |

### Notifications, Membership, Personalization

| Tables |
|---|
| `user_notifications`, `user_push_devices`, `notification_deliveries`, `membership_plans`, `user_memberships`, `wallet_points_events`, `user_tag_preferences` |

---

## ⚙️ Routine Catalog (Grouped)

| Group | Key Routines |
|---|---|
| **Auth / Users** | `sp_user_*`, `sp_role_*`, `sp_user_settings_*` |
| **Academic CRUD** | `sp_domain_*`, `sp_program_*`, `sp_level_*`, `sp_semester_*`, `sp_module_*`, `sp_institution_*`, `sp_student_profile_*` |
| **Resources / Moderation** | `sp_resource_*`, `sp_resource_rejection_*` |
| **Engagement / Wallet** | `sp_favorite_*`, `sp_rating_*`, `sp_resource_record_download`, `sp_wallet_*` |
| **Tagging / Personalization** | `sp_tag_*`, `sp_user_tag_preferences_*`, `sp_recommendation_get_for_user` |
| **Q&A / Confusion** | `trg_validate_qa_question_resource_module_link`, `sp_confusion_*`, `sp_module_staff_assignment_*` |
| **Notifications** | `sp_notification_*`, `sp_notification_delivery_*` |
| **Membership** | `sp_membership_*`, `sp_user_membership_*`, `sp_user_has_premium_access` |

---

## 🔄 Critical Workflows

### 1) Student Registration (Validated Academic Onboarding)
- Function: `sp_user_register_student`
- Validates institution-program-level-semester consistency.
- Creates user + student profile atomically.

### 2) Engagement Rewards Ledger
- Functions: `sp_resource_record_download`, `sp_favorite_add`, `sp_favorite_remove`
- Updates owner points and writes immutable-style wallet events.

### 3) Confusion Case Lifecycle
- Function family: `sp_confusion_*`
- Flow: signal creation -> case create/update -> auto-assignment -> status updates -> official answer linkage -> resolution events.

### 4) Notification Delivery Retry
- Functions: `sp_notification_delivery_get_retry_candidates`, `sp_notification_delivery_prepare_retry`
- Uses exponential backoff and attempt caps for failed deliveries.

### 5) Personalized Recommendations
- Function: `sp_recommendation_get_for_user`
- Scores resources from profile alignment, tag matches, quality metrics, and freshness.

---

## 👀 Views

| View | Purpose |
|---|---|
| `vw_resource_tags` | Flattened resource-tag joins |
| `vw_tags_popularity` | Tag usage and recency analytics |
| `vw_resource_rejections` | Rejection records enriched with uploader/reviewer identity |
| `vw_admin_students_list` | Student listing with profile and activity stats |
| `vw_admin_student_full_details` | Deep student analytics view |
| `vw_admin_students_statistics` | Global admin KPI aggregates |
| `vw_admin_student_resources` | Student-created resources with academic joins |

---

## 🚀 Usage Notes

### Apply Base Schema

```bash
psql -d mus_db -f Database/database_DDL.sql
```

### Apply Migrations (ordered)

```bash
# Example pattern
psql -d mus_db -f Database/migrations/001_add_resource_rewards.sql
psql -d mus_db -f Database/migrations/002_fix_favorite_reward_function_output.sql
# ... continue in numeric order
```

---

## 📚 Related Docs

- Extended doc: `Database/Database_Documentation.md`
- Root platform README: `README.md`
- Backend API README: `MUS-backend/README.md`
- Frontend app README: `MUS-frontend/README.md`

---

## 🛠️ Improvement Notes

- Consolidate duplicate routine definitions across SQL files to reduce deployment-order ambiguity.
- Audit overlapping indexes on high-write tables (`favorites`, `ratings`) for redundancy.
- Keep migration-only operational tasks (`ANALYZE`, maintenance index creation) separate from view-definition scripts.
