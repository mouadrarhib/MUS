# MUS - Management University System

MUS is a full-stack university platform for students, teachers, and administrators.

It combines academic resource sharing, moderation, role-based dashboards, personalization, membership-gated downloads, wallet/engagement analytics, and a modern public landing experience.

---

## What This Project Does

MUS helps university communities:

- discover and share academic resources (notes, exams, summaries, etc.)
- moderate and verify content quality
- personalize recommendations by profile + tag preferences
- manage premium access for protected downloads
- track engagement with wallet points and analytics
- support collaboration workflows with QA, notifications, and admin tooling

---

## Core Capabilities

### 1) Authentication and RBAC

- JWT-based auth (register, login, password reset)
- Roles: `student`, `teacher`, `admin`
- Role-aware route protection and dashboard navigation

### 2) Academic Resource Platform

- Create/upload/manage resources
- Resource metadata, tags, favorites, ratings
- Resource detail dialogs and analytics
- Published resources listing and advanced filtering/search

### 3) Moderation and Verification

- Admin verification workflow (`/dashboard/verify`)
- Rejection tracking and moderation-safe status transitions
- Additional confusion/reporting workflow support on backend

### 4) Personalization and Recommendations

- Student preference tags
- Recommendation APIs and dashboard integration
- Recommendation algorithm documentation in `docs/RECOMMENDATION_ALGORITHM.md`

### 5) Membership and Access Tiering

- Membership plans and user assignments
- Free vs premium resource access tier
- Download/file URL gating enforced server-side

### 6) Wallet and Engagement

- Wallet event ledger and summary endpoints
- Top resources/activity endpoints
- Wallet UI page on dashboard

### 7) Public Experience (Landing)

- Full-width animated public home page
- Hero, role/mission section, stats, best resources/institutions, testimonials
- Theme-aware sections (light/dark)

---

## Tech Stack

### Frontend (`MUS-frontend`)

- React 19 + Vite
- Material UI (MUI) + Emotion
- React Router
- React Hook Form
- GSAP (scroll and entrance animations)
- Recharts (dashboard charts)
- Axios

### Backend (`MUS-backend`)

- Node.js + Express
- PostgreSQL + Sequelize
- JWT authentication
- Swagger (OpenAPI docs)
- AWS S3 SDK (Cloudflare R2-compatible storage support)
- Nodemailer (notification delivery)

### Infrastructure

- Docker + Docker Compose

---

## Repository Structure

```text
MUS/
|- MUS-frontend/                  # React app (public site + dashboard)
|- MUS-backend/                   # Express API + services + routes
|- Database/
|  |- database_DDL.sql            # Base schema
|  \- migrations/                # Incremental SQL migrations
|- docs/
|  \- RECOMMENDATION_ALGORITHM.md
|- docker-compose.yml
\- README.md
```

---

## Important Backend Route Groups

Mounted in `MUS-backend/src/routes/index.js`:

- `/api/auth`
- `/api/resources`
- `/api/institutions`, `/api/programs`, `/api/levels`, `/api/semesters`, `/api/modules`
- `/api/ratings`, `/api/favorites`, `/api/tags`
- `/api/memberships`
- `/api/wallet`
- `/api/personalization`
- `/api/qa`
- `/api/admin`

Swagger:

- UI: `http://localhost:<PORT>/api/docs`
- JSON: `http://localhost:<PORT>/api/docs.json`

---

## Getting Started

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL
- Docker (optional but recommended for containerized run)

## 1) Local Development

### Step A: Database

1. Create a PostgreSQL database.
2. Apply base schema:
   - `Database/database_DDL.sql`
3. Apply migrations from `Database/migrations/` that your environment needs.

### Step B: Backend

```bash
cd MUS-backend
npm install
```

Create `MUS-backend/.env` with at least:

```env
PORT=5000

PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=mus_db

JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=1h

# Comma-separated origins (frontend URLs)
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
```

Run backend:

```bash
npm run dev
```

or:

```bash
npm start
```

### Step C: Frontend

```bash
cd MUS-frontend
npm install
```

Create `MUS-frontend/.env` (optional but recommended):

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Frontend default dev URL: `http://localhost:5173`

---

## 2) Docker Compose

From repository root:

```bash
docker-compose up -d --build
```

Based on current `docker-compose.yml`:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

Notes:

- Backend container reads env from `MUS-backend/.env`.
- Frontend image uses `VITE_API_URL` build arg set to `http://localhost:5001`.

---

## Available Scripts

### Frontend (`MUS-frontend/package.json`)

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend (`MUS-backend/package.json`)

- `npm run dev` (nodemon)
- `npm start`

---

## Environment Variables (Extended)

Depending on enabled features, backend may also use:

- Notification/worker:
  - `NOTIFICATION_RETRY_ENABLED`
  - `NOTIFICATION_RETRY_INTERVAL_MS`
  - `NOTIFICATION_RETRY_RUN_ON_START`
  - `NOTIFICATION_RETRY_BATCH_SIZE`
  - `NOTIFICATION_RETRY_MAX_ATTEMPTS`
  - `NOTIFICATION_RETRY_BASE_DELAY_SECONDS`
- Mail:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`
  - `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
- Push gateway:
  - `PUSH_GATEWAY_URL`, `PUSH_GATEWAY_TOKEN`
- Storage (R2/S3-compatible):
  - `R2_S3_ENDPOINT`, `R2_BUCKET`
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - `R2_SIGNED_URL_TTL_SECONDS`, `R2_PUBLIC_BASE_URL`

---

## Current Product Areas in Frontend

Main app routes include:

- Public home: `/`
- Auth: `/login`, `/register`
- Dashboard:
  - `/dashboard` (overview)
  - `/dashboard/users` (admin)
  - `/dashboard/resources` (admin)
  - `/dashboard/library`
  - `/dashboard/uploads`
  - `/dashboard/wallet`
  - `/dashboard/verify` (admin)
  - `/dashboard/catalog` (admin)
  - `/dashboard/profile`, `/dashboard/settings`

---

## Development Notes

- API client base URL is normalized in `MUS-frontend/src/services/api.js`.
- Backend defaults to `PORT=5000` if not set.
- Ensure `CLIENT_ORIGIN` allows the frontend URL you use.
- For production, set strong JWT secrets and secure CORS/origin settings.

---

## License

This project is currently private/internal unless a license file is added explicitly.
