# MUS V1 Sessions Feature

## Overview

This document describes the new **Teacher Sessions** feature implemented in MUS.

V1 scope:

- 1:1 student-teacher sessions
- Slot-based booking
- Auto-confirmed booking (no approval step)
- In-app text chat per booking
- Free sessions (no payment/points deduction)
- Any teacher can be booked

---

## Architecture

The implementation follows existing MUS architecture:

- **Database-first logic** via PostgreSQL functions/procedures
- SQL invocation through `MUS-backend/src/snippets/snippets.js`
- Feature service/controller/routes in backend
- Frontend service + feature pages/components with shared UI system

---

## Database

### Migrations

1. `Database/migrations/021_add_teacher_sessions_v1.sql`
2. `Database/migrations/022_fix_session_booking_unique_constraint.sql`

### Tables

#### `teacher_availability_slots`

- `id` (bigserial, PK)
- `teacher_id` (uuid, FK -> `users.id`)
- `start_at` (timestamptz)
- `end_at` (timestamptz)
- `timezone` (text, default `UTC`)
- `is_active` (boolean, default `true`)
- `created_at`, `updated_at`

Constraint:

- `end_at > start_at`

Indexes:

- teacher/start index for teacher listing
- active/start index for discovery

#### `teacher_session_bookings`

- `id` (bigserial, PK)
- `slot_id` (bigint, FK -> `teacher_availability_slots.id`)
- `teacher_id` (uuid, FK -> `users.id`)
- `student_id` (uuid, FK -> `users.id`)
- `status` (`confirmed|cancelled|completed|no_show`)
- `booked_at`
- `cancelled_at`, `cancelled_by`, `cancel_reason`
- `completed_at`
- `created_at`, `updated_at`

Constraints:

- status check enum-like constraint
- `teacher_id <> student_id`

Uniqueness model:

- Partial unique index `ux_teacher_session_bookings_slot_confirmed` on `slot_id` where `status = 'confirmed'`
- This allows historical bookings while preventing two active confirmed bookings for same slot.

#### `teacher_session_messages`

- `id` (bigserial, PK)
- `booking_id` (FK -> `teacher_session_bookings.id`)
- `sender_id` (FK -> `users.id`)
- `body` (text)
- `created_at`

Constraint:

- trimmed `body` must be non-empty

### Triggers

- Shared trigger function updates `updated_at` for slots/bookings on update.

---

## Database Functions

### Slots

- `sp_teacher_slot_create(teacher_id, start_at, end_at, timezone)`
- `sp_teacher_slot_update(slot_id, teacher_id, start_at, end_at, timezone, is_active)`
- `sp_teacher_slot_delete(slot_id, teacher_id)`
- `sp_teacher_slot_get_by_teacher(teacher_id, include_inactive)`
- `sp_teacher_slot_get_bookable(teacher_id?, start_from?, limit, offset)`

### Bookings

- `sp_teacher_session_book(slot_id, student_id, note)`
  - Auto-confirms booking
  - Validates: slot exists, active, not past, not already confirmed-booked, teacher != student
- `sp_teacher_session_get_for_student(student_id, status?, limit, offset)`
- `sp_teacher_session_get_for_teacher(teacher_id, status?, limit, offset)`
- `sp_teacher_session_get_by_id(booking_id)`
- `sp_teacher_session_cancel(booking_id, actor_user_id, reason)`
- `sp_teacher_session_complete(booking_id)`

### Messages

- `sp_teacher_session_message_add(booking_id, sender_id, body)`
- `sp_teacher_session_message_get(booking_id, limit, offset)`

---

## Backend

### Snippets

`MUS-backend/src/snippets/snippets.js`

New namespace:

- `SQL.SESSION.GET_BOOKABLE_TEACHER_SLOTS`
- `SQL.SESSION.GET_TEACHER_SLOTS`
- `SQL.SESSION.CREATE_TEACHER_SLOT`
- `SQL.SESSION.UPDATE_TEACHER_SLOT`
- `SQL.SESSION.DELETE_TEACHER_SLOT`
- `SQL.SESSION.BOOK_SESSION`
- `SQL.SESSION.GET_STUDENT_BOOKINGS`
- `SQL.SESSION.GET_TEACHER_BOOKINGS`
- `SQL.SESSION.GET_BOOKING_BY_ID`
- `SQL.SESSION.CANCEL_BOOKING`
- `SQL.SESSION.COMPLETE_BOOKING`
- `SQL.SESSION.ADD_MESSAGE`
- `SQL.SESSION.GET_MESSAGES`

### Service Layer

`MUS-backend/src/services/sessionService.js`

Responsibilities:

- Execute SQL snippets
- Enforce role/ownership/participant checks
- Normalize DB exceptions to app-level HTTP errors
- Emit notifications (best effort)

Notification types emitted:

- `SESSION_BOOKING_CREATED`
- `SESSION_BOOKING_CANCELLED`
- `SESSION_MESSAGE_CREATED`

### Controller Layer

`MUS-backend/src/controllers/sessionController.js`

Pattern:

- `asyncHandler`
- `successResponse`
- query/body normalization

### Routes

`MUS-backend/src/routes/sessionRoutes.js`

Mounted at:

- `/api/sessions` (from `src/routes/index.js`)

#### Public

- `GET /sessions/slots`

#### Authenticated

Teacher/Admin:

- `GET /sessions/teacher/slots`

Teacher only:

- `POST /sessions/teacher/slots`
- `PATCH /sessions/teacher/slots/:slotId`
- `DELETE /sessions/teacher/slots/:slotId`

Student only:

- `POST /sessions/bookings`

Student/Teacher/Admin:

- `GET /sessions/bookings`
- `GET /sessions/bookings/:bookingId`
- `PATCH /sessions/bookings/:bookingId/cancel`
- `GET /sessions/bookings/:bookingId/messages`
- `POST /sessions/bookings/:bookingId/messages`

Teacher/Admin:

- `PATCH /sessions/bookings/:bookingId/complete`

---

## Frontend

### Service API Client

`MUS-frontend/src/services/sessionService.js`

Methods:

- `listBookableSlots`
- `listTeacherSlots`
- `createTeacherSlot`
- `updateTeacherSlot`
- `deleteTeacherSlot`
- `createBooking`
- `listMyBookings`
- `getBookingById`
- `cancelBooking`
- `completeBooking`
- `listMessages`
- `sendMessage`

### Feature UI

- Page: `MUS-frontend/src/features/sessions/pages/Sessions.jsx`
- Components:
  - `SessionCards.jsx`
  - `SessionSlotDialog.jsx`
  - `SessionChatDialog.jsx`
  - `sessionUtils.js`

Design/UX alignment:

- Uses existing dashboard visual language (`PageHeader`, `AsyncButton`, `EmptyState`)
- Responsive card/list layout
- Subtle entry motion and polished gradients
- Role-aware tabs and actions

### Router + Navigation

- Route added in `MUS-frontend/src/app/router/index.jsx`:
  - `/dashboard/sessions`
- Sidebar item added in `MUS-frontend/src/config/dashboardNavigation.jsx`:
  - Label `Sessions`, icon `Forum`
  - Roles: `STUDENT`, `TEACHER`
  - Excludes `ADMIN`

---

## RBAC Rules

- **Student**
  - Can browse public slots
  - Can create booking (auto-confirmed)
  - Can view/cancel own bookings
  - Can chat only in own bookings

- **Teacher**
  - Can create/update/delete own slots
  - Can view teacher bookings
  - Can complete confirmed bookings
  - Can chat only in own bookings

- **Admin**
  - Can view booking endpoints (as allowed by route)
  - Can access details/messages only when participant checks and policy allow

---

## Status Lifecycle

Primary path:

1. `confirmed` (on booking creation)
2. either `cancelled` or `completed`

Business constraints:

- Cannot have two confirmed bookings for one slot
- Cannot book past slot
- Cannot complete/cancel invalid states

---

## Testing

### Backend Smoke + E2E

Added script:

- `MUS-backend/scripts/session-e2e-check.mjs`

NPM command:

- `npm run test:smoke:sessions`

Coverage includes:

- role setup and auth
- teacher slot lifecycle
- student booking and duplicate prevention
- booking access control
- chat access control
- cancel/complete transitions

Known requirement:

- Provide valid admin credentials through env vars:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

---

## Known Notes

- If booking returns 500 in environments initialized before migration fix:
  - apply `022_fix_session_booking_unique_constraint.sql`
  - restart backend
- Frontend and backend are compatible with UTC storage + timezone metadata.

---

## Suggested Next Iterations (V1.1+)

- Session reminders (notification scheduling)
- Teacher availability recurrence rules
- Optional meeting link attachment
- Presence/read receipts for chat
- Session analytics widgets for teachers/admin
