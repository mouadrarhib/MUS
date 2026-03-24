# MUS Backend

Backend API for the MUS platform, built with Node.js, Express, Sequelize, and PostgreSQL.

This service handles authentication, user roles, academic catalog data, resources, ratings, favorites, Q&A, memberships, wallet, personalization, confusion workflows, and notifications.

## What this backend does

- Exposes a REST API under `/api`
- Authenticates users with JWT (cookie or Bearer token)
- Authorizes access with role-based guards (admin/student/teacher)
- Manages core academic entities (institutions, domains, programs, levels, semesters, modules)
- Manages learning resources, uploads, metadata, search, status workflows, and file delivery
- Handles engagement features (ratings, favorites, Q&A, tags, personalization)
- Supports memberships and wallet summary/activity
- Runs notification delivery logic (email/push/in-app) and a background retry worker
- Exposes live notification stream endpoint (SSE)
- Publishes OpenAPI docs via Swagger

## High-level architecture

The codebase follows a layered structure:

- **Routes**: request validation, middleware composition, endpoint wiring
- **Controllers**: HTTP input/output orchestration
- **Services**: business logic and data operations
- **Models/Config**: Sequelize setup and model associations
- **Snippets**: SQL query constants used by services
- **Helpers/Middleware/Utils**: shared concerns (errors, response format, auth, rate limiting, JWT, async context)

Request flow is generally:

`Route -> Middleware (auth/validation/limits) -> Controller -> Service -> DB/Storage -> Response`

## Project structure

```text
MUS-backend/
  index.js                    # server bootstrap + DB auth + retry worker lifecycle
  src/
    app.js                    # express app setup, CORS, docs, error handling
    config/
      database.js             # sequelize postgres connection
      swagger.js              # openapi generation
    routes/                   # endpoint definitions and validators
    controllers/              # HTTP handlers
    services/                 # domain/business logic
      storage/r2Service.js    # cloudflare R2 integration
    models/                   # sequelize models + associations
    middleware/               # auth, role guards, rate limits
    helpers/                  # response helpers and app errors
    snippets/                 # SQL snippets
    utils/                    # jwt/password helpers
  scripts/                    # smoke and e2e checks
  Dockerfile                  # container runtime setup
```

## API base and docs

- Base API: `http://localhost:<PORT>/api`
- Health check: `GET /health`
- Swagger UI: `GET /api/docs`
- Swagger JSON: `GET /api/docs.json`

## Main API modules

Mounted in `src/routes/index.js`:

- `/auth` - registration, login, profile, password and account management
- `/institution-types`, `/institutions`, `/domains`, `/programs`, `/institution-programs` - academic catalog base entities
- `/levels`, `/semesters`, `/modules` - learning hierarchy entities
- `/resources` - resource CRUD, upload flows, status workflows, search, analytics, delivery
- `/ratings` - rating CRUD and summaries
- `/qa` - question/answer features around resources/modules
- `/memberships` - plans and current membership
- `/wallet` - user wallet summary/activity
- `/personalization` - user preferences and recommendation-related endpoints
- additional mounted groups: role/user-role, student profiles, user settings, favorites, tags, confusion cases, notifications, admin

## Authentication and authorization

- JWT verification is handled in `src/middleware/auth.js`
- Token accepted from:
  - `Authorization: Bearer <token>`
  - `auth_token` cookie
- Role/ownership guards are in `src/middleware/authorization.js`
  - `requireRole(...)`
  - `requireSelfOrAdmin(...)`
  - `requireOwnerOrAdmin(...)`
  - `requirePublishedOrOwnerOrAdmin(...)`

## Security and platform protections

- `helmet` for secure HTTP headers
- configurable CORS allow-list via `CLIENT_ORIGIN`
- global + auth-specific rate limits (`src/middleware/rateLimit.js`)
- centralized error handling via `AppError` and `errorResponse`
- request validation via `express-validator`

## Resource storage and upload design

Resource file handling supports both direct and mediated flows:

- Generate signed upload URLs (Cloudflare R2 via S3-compatible API)
- Confirm uploads and attach object keys to resources
- Upload file proxy endpoint with `multer` (memory storage, size limit configured)
- Generate signed download URLs
- Optionally expose public base URL for direct access strategy

Relevant files:

- `src/routes/resourceRoutes.js`
- `src/controllers/resourceController.js`
- `src/services/resourceService.js`
- `src/services/storage/r2Service.js`

## Notifications subsystem

Notification implementation includes:

- notification creation and delivery persistence
- email delivery via SMTP (`nodemailer`)
- push delivery integration via gateway URL/token
- retry worker with interval scheduling and max attempts
- SSE stream endpoint for live user notification feed

Relevant files:

- `src/services/notificationService.js`
- `src/services/notificationDeliveryService.js`
- `src/services/notificationRetryWorkerService.js`
- `src/services/notificationStreamService.js`
- `src/routes/notificationRoutes.js`

## Data model overview

Core Sequelize associations are defined in `src/models/index.js`:

- User <-> Role (many-to-many via `UserRole`)
- InstitutionType -> Institution (one-to-many)
- Domain -> Program (one-to-many)
- Institution <-> Program (many-to-many via `InstitutionProgram`)
- Program -> Level (one-to-many)
- Level -> Semester (one-to-many)

Additional domain entities are managed by service/query layers (resources, ratings, favorites, tags, notifications, memberships, wallet, etc.).

## Dependencies used

### Runtime dependencies

- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `bcrypt`
- `cookie-parser`
- `cors`
- `cross-env`
- `dotenv`
- `express`
- `express-rate-limit`
- `express-validator`
- `helmet`
- `jsonwebtoken`
- `multer`
- `nodemailer`
- `pg`
- `pg-hstore`
- `sequelize`
- `swagger-jsdoc`
- `swagger-ui-express`

### Development dependencies

- `nodemon`

### Runtime platform

- Node.js 20 (`node:20-alpine` in Dockerfile)

## Environment variables used

Keep only variable names in documentation. Do not publish real values.

### Server

- `PORT`
- `NODE_ENV`

### Database

- `DB_NAME` or `PGDATABASE`
- `DB_USER` or `PGUSER`
- `DB_PASSWORD` or `PGPASSWORD`
- `DB_HOST` or `PGHOST`
- `DB_PORT` or `PGPORT`

### JWT / auth

- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### CORS

- `CLIENT_ORIGIN`

### Rate limiting

- `RATE_LIMIT_PUBLIC_PER_MIN`
- `RATE_LIMIT_AUTH_PER_15MIN`
- `RATE_LIMIT_REGISTER_PER_HOUR`
- `RATE_LIMIT_FORGOT_PER_HOUR`

### Cloudflare R2 storage

- `R2_PROVIDER`
- `R2_ACCOUNT_ID`
- `R2_BUCKET`
- `R2_S3_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_API_TOKEN`
- `R2_SIGNED_URL_TTL_SECONDS`
- `R2_PUBLIC_BASE_URL`

### Email / SMTP

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### Push gateway

- `PUSH_GATEWAY_URL`
- `PUSH_GATEWAY_TOKEN`

### Notification retry worker

- `NOTIFICATION_RETRY_ENABLED`
- `NOTIFICATION_RETRY_INTERVAL_MS`
- `NOTIFICATION_RETRY_RUN_ON_START`
- `NOTIFICATION_RETRY_BATCH_SIZE`
- `NOTIFICATION_RETRY_MAX_ATTEMPTS`
- `NOTIFICATION_RETRY_BASE_DELAY_SECONDS`

### Feature flags

- `AUTO_PUBLISH_TEACHER`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create/update `.env` with required variables (database + JWT are mandatory).

3. Run in dev mode:

```bash
npm run dev
```

4. Run in start mode:

```bash
npm start
```

## Docker

Build and run:

```bash
docker build -t mus-backend .
docker run --env-file .env -p 5000:5000 mus-backend
```

## Available npm scripts

- `npm run dev` - start with `nodemon`
- `npm start` - start with `node index.js` (`PORT=5001` in script via `cross-env`)

## Validation and response conventions

- Validation errors are handled through `express-validator` + `validateRequest` middleware
- Successful response format:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

- Error response format:

```json
{
  "success": false,
  "message": "..."
}
```

## Operational scripts in `scripts/`

The repository includes smoke/e2e scripts for workflows such as:

- Q&A
- confusion workflow and notification RBAC
- notification retry
- favorites role access
- membership download access
- resource rejection APIs
- resource upload flows
- tags APIs
- rewards flow

## Important security note

If `.env` was ever committed or shared with real credentials/tokens, rotate all exposed secrets (DB password, JWT secret, R2 keys/tokens, SMTP credentials, push token).
