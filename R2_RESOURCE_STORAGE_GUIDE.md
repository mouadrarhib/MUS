# MUS Resource Storage Guide (Cloudflare R2, Low Budget)

This guide explains the best low-cost way to store MUS resources (PDF, images, Word, PowerPoint, video):

- Store file binaries in **Cloudflare R2** (object storage).
- Store only metadata and relationships in **PostgreSQL**.
- Keep resources private and use **signed URLs**.

---

## 1) Why this is best for MUS now

For your current budget and file types, this gives the best cost/performance balance:

- Postgres stays small and fast (no heavy file blobs).
- R2 is cheaper than classic storage+bandwidth setups for many apps.
- Works with your existing backend architecture (`routes -> controllers -> services`).
- Easy to scale later (CDN, transcoding, virus scan) without redesign.

---

## 2) Recommended architecture

### Data split

- **R2** stores file bytes.
- **resources table** stores metadata, owner, status, relationships.

### File lifecycle

1. User requests upload URL.
2. Backend validates file type/size and returns pre-signed PUT URL.
3. Frontend uploads file directly to R2.
4. Frontend confirms upload with backend.
5. Backend stores metadata in `resources` and sets moderation status.
6. Download goes through backend auth check, then signed GET URL.

---

## 3) Cloudflare R2 setup

## 3.1 Create bucket

1. Cloudflare Dashboard -> R2 -> Create bucket.
2. Bucket name example: `mus-resources`.
3. Keep bucket private.

## 3.2 Create API token

1. R2 -> Manage R2 API Tokens -> Create token.
2. Grant read/write for your bucket.
3. Save:
   - Access Key ID
   - Secret Access Key
   - S3 endpoint (account-specific)

## 3.3 Add backend environment variables

Add in backend `.env` (example names):

```env
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET=mus-resources
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=
R2_SIGNED_URL_TTL_SECONDS=900
```

Notes:

- Keep `R2_PUBLIC_BASE_URL` empty if files are private.
- `900` seconds = 15 min signed URL validity.

---

## 4) MUS backend implementation plan

Use existing files:

- `MUS-backend/src/routes/resourceRoutes.js`
- `MUS-backend/src/controllers/resourceController.js`
- `MUS-backend/src/services/resourceService.js`

Add a new storage utility layer (recommended):

- `MUS-backend/src/services/storage/r2Service.js`

## 4.1 Endpoints to add

### A) Request upload URL

`POST /api/resources/upload-url`

Request:

```json
{
  "filename": "Algorithms-Ch1.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 3244555
}
```

Response:

```json
{
  "upload_url": "https://...signed-put-url...",
  "object_key": "pending/<userId>/2026/02/<uuid>-Algorithms-Ch1.pdf",
  "expires_in": 900
}
```

Validation:

- Allowlist MIME types/extensions.
- Size limits per type (see section 8).

### B) Confirm upload

`POST /api/resources/confirm-upload`

Request:

```json
{
  "object_key": "pending/<userId>/2026/02/<uuid>-Algorithms-Ch1.pdf",
  "title": "Algorithms Chapter 1",
  "description": "Intro + exercises",
  "educational_type": "course",
  "format": "pdf",
  "resource_type_id": 1
}
```

Behavior:

- HEAD object in R2 to verify upload exists.
- Create resource row with metadata.
- Set `upload_status='uploaded'` and moderation status (`pending` recommended for student uploads).

### C) Download

`GET /api/resources/:id/download`

Behavior:

- Reuse existing authorization rules (published/owner/admin).
- Return short-lived signed GET URL.

---

## 5) MUS frontend implementation plan

Primary file to update:

- `MUS-frontend/src/features/resources/components/ResourceDialog.jsx`

Flow in UI:

1. User selects file.
2. Frontend calls `POST /resources/upload-url`.
3. Frontend PUTs file directly to returned `upload_url`.
4. Frontend calls `POST /resources/confirm-upload`.
5. Resource appears in list with normal status workflow.

Also:

- Show upload progress.
- Reject oversized/unsupported files before API call.
- Keep URL-based resources as fallback (optional).

---

## 6) Database changes (metadata only)

Add columns to `resources` (example migration):

```sql
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS storage_provider TEXT,
  ADD COLUMN IF NOT EXISTS bucket TEXT,
  ADD COLUMN IF NOT EXISTS object_key TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS checksum TEXT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'uploaded';

CREATE INDEX IF NOT EXISTS idx_resources_object_key ON public.resources(object_key);
```

Important:

- Do not store file binary in DB.
- Keep relationships unchanged (`resource_module_map`, `favorites`, `ratings`).

---

## 7) Moderation and lifecycle strategy

Recommended policy:

- New uploads go under `pending/` prefix.
- When approved, either:
  - keep same key and only status changes in DB, or
  - move key to `published/` prefix.
- Delete stale unapproved objects with R2 lifecycle rule:
  - `pending/*` older than 30 days.

This prevents storage waste and orphan files.

---

## 8) Low-budget limits (recommended defaults)

- Images: up to 10 MB
- Word/PowerPoint/Docs: up to 25 MB
- PDF: up to 50 MB
- Video: up to 200 MB (start low)

Allowed formats first:

- `pdf`, `jpg`, `jpeg`, `png`, `webp`, `doc`, `docx`, `ppt`, `pptx`, `mp4`

Add more only when needed.

---

## 9) Security checklist

- Bucket private by default.
- Signed URLs only (short TTL).
- Validate MIME + extension + size.
- Sanitize filenames.
- Use generated object keys (never trust raw filename as key).
- Keep auth checks for downloads in backend.

Optional later (phase 2):

- Antivirus scanning on upload.
- Video transcoding + thumbnails.
- Dedicated CDN domain for published/public assets.

---

## 10) Implementation order (small safe steps)

1. Add R2 env vars and `r2Service.js`.
2. Add upload URL + confirm endpoints.
3. Add DB metadata columns migration.
4. Wire frontend upload flow in `ResourceDialog.jsx`.
5. Add download signed URL endpoint and switch UI downloads to it.
6. Add lifecycle cleanup rule for `pending/*`.

---

## 11) Known MUS alignment notes

While implementing, align these existing mismatches:

- Frontend typo path `"/ressouces-module-map"` should be corrected.
- Verification list should target the actual moderation status used by backend.
- Ensure resource create payload names match backend (`educational_type`, `resource_type_id`, etc.).

---

If you follow this guide, you get a production-ready storage base with low monthly cost and room to scale later.
