<div align="center">

# ⚙️ MUS Backend

**REST API powering the MUS platform — built with Node.js, Express, Sequelize & PostgreSQL**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?logo=swagger&logoColor=black)](http://localhost:5000/api/docs)

</div>

---

## 📖 Overview

The MUS backend is a production-ready REST API that handles:

- 🔐 JWT authentication and role-based access control
- 📚 Full academic resource lifecycle (upload, publish, search, delivery)
- 🏛️ Academic catalog management (institutions, programs, levels, modules)
- 💬 Q&A, ratings, favorites, tags, and personalization
- 💳 Membership plans and wallet activity tracking
- 📩 Notifications via email, push, and in-app SSE streams
- 📄 Auto-generated OpenAPI documentation via Swagger

---

## 🏗️ Architecture

The codebase follows a clean **layered architecture**:

```
Route → Middleware (auth / validation / rate-limit) → Controller → Service → DB / Storage → Response
```

| Layer | Responsibility |
|---|---|
| **Routes** | Request validation, middleware composition, endpoint wiring |
| **Controllers** | HTTP input/output orchestration |
| **Services** | Business logic and data operations |
| **Models / Config** | Sequelize setup and model associations |
| **Snippets** | Reusable SQL query constants |
| **Helpers / Middleware / Utils** | Errors, response format, auth, rate limiting, JWT, async context |

---

## 📁 Project Structure

```text
MUS-backend/
├── index.js                       # Server bootstrap, DB auth, retry worker lifecycle
└── src/
    ├── app.js                     # Express app: CORS, docs, error handling
    ├── config/
    │   ├── database.js            # Sequelize + PostgreSQL connection
    │   └── swagger.js             # OpenAPI generation
    ├── routes/                    # Endpoint definitions and validators
    ├── controllers/               # HTTP handlers
    ├── services/                  # Domain / business logic
    │   └── storage/
    │       └── r2Service.js       # Cloudflare R2 integration
    ├── models/                    # Sequelize models + associations
    ├── middleware/                # Auth, role guards, rate limiting
    ├── helpers/                   # Response helpers and AppError
    ├── snippets/                  # SQL snippets for services
    └── utils/                     # JWT / password utilities
scripts/                           # Smoke and E2E test scripts
Dockerfile                         # Container runtime setup
```

---

## 🌐 API Reference

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `GET /api/docs` | Swagger UI |
| `GET /api/docs.json` | Swagger JSON spec |

### Route Groups (mounted in `src/routes/index.js`)

| Prefix | Scope |
|---|---|
| `/auth` | Registration, login, profile, password management |
| `/institution-types`, `/institutions`, `/domains`, `/programs` | Academic catalog base entities |
| `/levels`, `/semesters`, `/modules` | Learning hierarchy |
| `/resources` | CRUD, upload flows, status workflows, search, delivery |
| `/ratings` | Rating CRUD and summaries |
| `/qa` | Q&A around resources and modules |
| `/memberships` | Plans and current user membership |
| `/wallet` | Wallet summary and activity |
| `/personalization` | Preferences and recommendation endpoints |
| `/notifications` | SSE stream + delivery management |
| `/admin` | Admin-only operations |

---

## 🔐 Authentication & Authorization

JWT verification is handled in `src/middleware/auth.js`.

**Token is accepted from:**
- `Authorization: Bearer <token>` header
- `auth_token` cookie

**Role guards** in `src/middleware/authorization.js`:

| Guard | Description |
|---|---|
| `requireRole(...)` | Restrict to specific role(s) |
| `requireSelfOrAdmin(...)` | User can only access their own resource, or admin |
| `requireOwnerOrAdmin(...)` | Owner or admin access |
| `requirePublishedOrOwnerOrAdmin(...)` | Public access only for published resources |

---

## 🛡️ Security & Protections

| Mechanism | Details |
|---|---|
| **HTTP Headers** | `helmet` middleware for secure defaults |
| **CORS** | Configurable allow-list via `CLIENT_ORIGIN` |
| **Rate Limiting** | Global + auth-specific limits (`src/middleware/rateLimit.js`) |
| **Error Handling** | Centralized via `AppError` and `errorResponse` |
| **Input Validation** | `express-validator` + `validateRequest` middleware |

---

## ☁️ Resource Storage & Upload Design

File handling supports both direct and mediated upload flows:

1. **Generate signed upload URLs** (Cloudflare R2 via S3-compatible API)
2. **Confirm uploads** and attach object keys to resources
3. **Upload proxy endpoint** with `multer` (memory storage, size-limited)
4. **Generate signed download URLs** for secure delivery
5. **Optional public base URL** for direct access strategy

**Relevant files:**

```
src/routes/resourceRoutes.js
src/controllers/resourceController.js
src/services/resourceService.js
src/services/storage/r2Service.js
```

---

## 📩 Notifications Subsystem

| Feature | Details |
|---|---|
| Persistence | Notification creation and delivery records |
| Email | SMTP via `nodemailer` |
| Push | External gateway (URL + token) |
| Retry Worker | Interval-based scheduling with configurable max attempts |
| Live Feed | SSE stream endpoint for real-time user notifications |

**Relevant files:**

```
src/services/notificationService.js
src/services/notificationDeliveryService.js
src/services/notificationRetryWorkerService.js
src/services/notificationStreamService.js
src/routes/notificationRoutes.js
```

---

## 🗄️ Data Model Overview

Core Sequelize associations defined in `src/models/index.js`:

```
User ↔ Role                   (many-to-many via UserRole)
InstitutionType → Institution  (one-to-many)
Domain → Program               (one-to-many)
Institution ↔ Program          (many-to-many via InstitutionProgram)
Program → Level                (one-to-many)
Level → Semester               (one-to-many)
```

Additional entities (resources, ratings, favorites, tags, notifications, memberships, wallet) are managed by dedicated service/query layers.

---

## 📦 Dependencies

### Runtime

| Package | Purpose |
|---|---|
| `express` | HTTP framework |
| `sequelize`, `pg`, `pg-hstore` | ORM + PostgreSQL driver |
| `jsonwebtoken`, `bcrypt` | Auth and password hashing |
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | Cloudflare R2 / S3 storage |
| `nodemailer` | Email delivery |
| `helmet`, `cors`, `express-rate-limit` | Security layer |
| `express-validator` | Input validation |
| `multer` | Multipart file uploads |
| `cookie-parser` | Cookie handling |
| `swagger-jsdoc`, `swagger-ui-express` | API documentation |
| `dotenv`, `cross-env` | Environment config |

### Development

| Package | Purpose |
|---|---|
| `nodemon` | Auto-reload during development |

---

## 🔧 Environment Variables

> ⚠️ **Never commit real credentials. Rotate immediately if exposed.**

### Server

```env
PORT=
NODE_ENV=
```

### Database

```env
DB_NAME=        # or PGDATABASE
DB_USER=        # or PGUSER
DB_PASSWORD=    # or PGPASSWORD
DB_HOST=        # or PGHOST
DB_PORT=        # or PGPORT
```

### JWT / Auth

```env
JWT_SECRET=
JWT_EXPIRES_IN=
```

### CORS

```env
CLIENT_ORIGIN=   # comma-separated frontend URLs
```

### Rate Limiting

```env
RATE_LIMIT_PUBLIC_PER_MIN=
RATE_LIMIT_AUTH_PER_15MIN=
RATE_LIMIT_REGISTER_PER_HOUR=
RATE_LIMIT_FORGOT_PER_HOUR=
```

### Cloudflare R2 Storage

```env
R2_PROVIDER=
R2_ACCOUNT_ID=
R2_BUCKET=
R2_S3_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_API_TOKEN=
R2_SIGNED_URL_TTL_SECONDS=
R2_PUBLIC_BASE_URL=
```

### Email / SMTP

```env
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### Push Gateway

```env
PUSH_GATEWAY_URL=
PUSH_GATEWAY_TOKEN=
```

### Notification Retry Worker

```env
NOTIFICATION_RETRY_ENABLED=
NOTIFICATION_RETRY_INTERVAL_MS=
NOTIFICATION_RETRY_RUN_ON_START=
NOTIFICATION_RETRY_BATCH_SIZE=
NOTIFICATION_RETRY_MAX_ATTEMPTS=
NOTIFICATION_RETRY_BASE_DELAY_SECONDS=
```

### Feature Flags

```env
AUTO_PUBLISH_TEACHER=
```

---

## 🚀 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env   # then fill in your values

# 3. Start in development mode (auto-reload)
npm run dev

# 4. Or start in production mode
npm start
```

---

## 🐳 Docker

```bash
# Build image
docker build -t mus-backend .

# Run with env file
docker run --env-file .env -p 5000:5000 mus-backend
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with `nodemon` (auto-reload) |
| `npm start` | Start with `node index.js` |

---

## 📐 Response Conventions

All responses follow a consistent envelope format:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "..."
}
```

Validation errors are handled via `express-validator` + the `validateRequest` middleware.

---

## 🧪 Operational Scripts

Located in `scripts/`, these smoke/E2E scripts cover:

- Q&A workflows
- Confusion workflow and notification RBAC
- Notification retry logic
- Favorites role access
- Membership download access
- Resource rejection APIs
- Resource upload flows
- Tags APIs
- Rewards flow

---

## 🔒 Security Reminder

> If `.env` was ever committed or shared with real credentials, **immediately rotate** all exposed secrets: DB password, JWT secret, R2 keys/tokens, SMTP credentials, and push token.
