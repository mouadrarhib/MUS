# Feature Specification: Resource Rewards & Gamification System

## 1. Overview
This feature introduces a gamification system to the MUS platform. Users (Students) earn points when their uploaded resources are engaged with by other users. This incentivizes high-quality content contribution.

**Core Mechanics:**
*   **Downloads:** High reward (e.g., 10 points).
*   **Favorites:** Low reward (e.g., 2 points).
*   **Abuse Prevention:** Points for downloads are awarded only *once* per user-resource pair.

---

## 2. Database Schema Changes

### 2.1. New Table: `resource_downloads`
Tracks download history to prevent duplicate point awards and provide analytics.

```sql
CREATE TABLE IF NOT EXISTS public.resource_downloads (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    resource_id BIGINT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_resource_download UNIQUE(user_id, resource_id)
);
```

### 2.2. Update Table: `users`
Adds a column to store the user's total accumulated points.

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
```

---

## 3. Stored Procedures (Logic)

### 3.1. `sp_resource_record_download` (New)
*   **Input:** `p_user_id`, `p_resource_id`
*   **Logic:**
    1.  Check if a record exists in `resource_downloads`.
    2.  If **NO**:
        *   Insert record into `resource_downloads`.
        *   Identify the resource owner (`created_by` in `resources` table).
        *   `UPDATE users SET points = points + 10 WHERE id = owner_id`.
    3.  If **YES**: Do nothing (or return indicating already downloaded).

### 3.2. `sp_favorite_toggle` / `sp_favorite_add` (Modify)
*   **Current Logic:** Toggles or Inserts into `favorites`.
*   **New Logic:**
    *   **On Add:** Identify resource owner -> `UPDATE users SET points = points + 2 WHERE id = owner_id`.
    *   **On Remove:** Identify resource owner -> `UPDATE users SET points = points - 2 WHERE id = owner_id`.

---

## 4. Backend Implementation (Node.js/Express)

### 4.1. New Endpoint: `POST /api/resources/:id/download`
*   **Controller:** `downloadResource`
*   **Workflow:**
    1.  Authenticate user (get `userId` from token).
    2.  Call database function to record download.
    3.  Return success status.

### 4.2. Update Endpoint: `POST /api/favorites`
*   Ensure the existing favorite endpoint uses the updated stored procedures to handle point calculation automatically.

---

## 5. Frontend Implementation (React)

### 5.1. Resource Card / Detail View
*   **Download Button:**
    *   `onClick` handler updated to:
        1.  Call `POST /api/resources/:id/download`.
        2.  Trigger the actual file download.

### 5.2. Profile / Navigation
*   Fetch and display the `user.points` value in the profile header or dashboard.

