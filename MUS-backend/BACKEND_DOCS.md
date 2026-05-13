# Backend Architecture & Technical Documentation

## 1. PROJECT STRUCTURE

```
MUS-backend/
├── scripts/                # Standalone smoke tests, E2E validation scripts, and DB seeders
└── src/                    # Main application source code
    ├── config/             # Environment, Database (Sequelize), and Swagger configurations
    ├── controllers/        # Route handler functions handling HTTP req/res and validation
    ├── helpers/            # Application-wide utility helpers (AppError, asyncHandler, storage)
    ├── middleware/         # Express middleware (JWT auth, RBAC authorization, rate limiting)
    ├── models/             # Sequelize ORM data models, entity schemas, and associations
    ├── routes/             # Express router definitions and request validation chains
    ├── services/           # Core domain business logic, DB queries, and external integrations
    ├── snippets/           # Reusable SQL/JS code snippets and migration reference blocks
    └── utils/              # Cryptographic utilities (JWT signing/verifying, bcrypt password hashing)
```

* **Entry Point:** `index.js` — Loads environment variables, connects to PostgreSQL via Sequelize, initializes background notification workers, and starts the Express HTTP server.
* **Core Application:** `src/app.js` — Configures CORS, security headers (`helmet`), cookie parsing, rate limiting, Swagger UI documentation (`/api/docs`), API routing (`/api`), and centralized error-handling middleware.

---

## 2. ARCHITECTURE & DESIGN PATTERNS

* **Architectural Pattern:** Layered Architecture / MVC (Routes → Validation → Middleware → Controllers → Services → ORM Models).
* **Asynchronous Handling:** All async controller methods are wrapped in custom error catchers or rely on Express 5 compatible async error propagation.
* **Request Context Propagation:** Employs Node.js `node:async_hooks` `AsyncLocalStorage` (`src/helpers/storage.js`) to seamlessly propagate the active `req.user` payload across deeply nested service layers without manual argument drilling.
* **Error Handling Pipeline:** Handlers throw custom `AppError(message, statusCode)` instances. Uncaught exceptions are intercepted by Express error middleware (`src/app.js`), formatting consistent JSON responses (`{ success: false, error: message }`).

### Request Lifecycle Pipeline

```mermaid
flowchart TD
    A([Incoming HTTP Request]) --> B[CORS Validation]
    B --> C[Helmet Security Headers]
    C --> D[Rate Limiter]
    D --> E{Route matched?}
    E -- No --> Z1[404 AppError]
    E -- Yes --> F[express-validator Chain]
    F --> G{Validation passed?}
    G -- No --> Z2[400 Validation Error Response]
    G -- Yes --> H{Auth required?}
    H -- Yes --> I[authMiddleware\nextract JWT from Cookie or Bearer header]
    I --> J{Token valid?}
    J -- No --> Z3[401 Unauthorized]
    J -- Yes --> K[AsyncLocalStorage stores req.user]
    K --> L{Role check?}
    L -- Fail --> Z4[403 Forbidden]
    L -- Pass --> M[Controller invoked]
    H -- No --> M
    M --> N[Service layer business logic]
    N --> O[(PostgreSQL via Sequelize)]
    N --> P[(Cloudflare R2 / S3)]
    N --> Q[Nodemailer SMTP]
    O --> R[successResponse helper]
    P --> R
    Q --> R
    R --> S([HTTP Response])
    Z1 & Z2 & Z3 & Z4 --> ERR[Global Error Handler\nerrorResponse helper]
    ERR --> S
```

---

## 3. AUTHENTICATION & SECURITY

### JWT Authentication Flow

```mermaid
sequenceDiagram
    actor Client
    participant API
    participant authMiddleware
    participant JWT Utils
    participant AsyncLocalStorage
    participant Controller

    Client->>API: Request with Authorization: Bearer <token>\nor Cookie: auth_token=<token>
    API->>authMiddleware: Intercept request
    authMiddleware->>authMiddleware: Extract token from header or cookie
    authMiddleware->>JWT Utils: verifyToken(token)
    alt Token expired
        JWT Utils-->>authMiddleware: TokenExpiredError
        authMiddleware-->>Client: 401 Le jeton a expire
    else Token invalid
        JWT Utils-->>authMiddleware: JsonWebTokenError
        authMiddleware-->>Client: 401 Jeton invalide
    else Token valid
        JWT Utils-->>authMiddleware: decoded { sub, roles, iat, exp }
        authMiddleware->>AsyncLocalStorage: storage.run({ user: normalizedUser })
        authMiddleware->>Controller: next() with req.user populated
    end
```

### RBAC Authorization Matrix

```mermaid
graph LR
    subgraph "Public Routes (no auth)"
        P1[GET /resources/published]
        P2[POST /auth/login]
        P3[POST /auth/register]
        P4[GET /tutor-profiles]
    end

    subgraph "Authenticated (any valid token)"
        A1[GET /auth/me]
        A2[GET /resources/discover/bootstrap]
        A3[POST /resources/:id/download]
        A4[GET /sessions/my-sessions]
    end

    subgraph "Owner or Admin"
        O1[PATCH /resources/:id]
        O2[DELETE /resources/:id]
        O3[GET /resources/:id/statistics]
        O4[POST /qa/answers/:id/accept]
    end

    subgraph "Contributor or Staff"
        C1[POST /resources]
        C2[POST /resources/upload-url]
        C3[POST /resources/:id/upload-file]
    end

    subgraph "Admin Only"
        AD1[POST /resources/:id/publish]
        AD2[POST /resources/:id/reject]
        AD3[GET /admin/users/overview]
        AD4[PATCH /admin/users/:id/points]
        AD5[DELETE /auth/user/:id]
    end

    JWT[Valid JWT] --> A1 & A2 & A3 & A4
    JWT --> O1 & O2 & O3 & O4
    JWT --> C1 & C2 & C3
    JWT --> AD1 & AD2 & AD3 & AD4 & AD5
```

* **JWT Strategy:** Tokens signed using `JWT_SECRET` (`src/utils/jwt.js`). Auth middleware (`src/middleware/auth.js`) extracts tokens from `Authorization: Bearer` headers or `auth_token` cookies.
* **RBAC Authorization (`src/middleware/authorization.js`):**
  * `requireAuth`: Enforces valid user authentication.
  * `requireRole("admin", "teacher")`: Validates decoded token roles against required arrays.
  * `requireOwnerOrAdmin`: Evaluates resource authorship vs. active user ID.
  * `requirePublishedOrOwnerOrAdmin`: Bypasses auth for published content while protecting draft/pending items.
  * `requireStudentContributorOrStaff`: Restricts upload capabilities to verified contributors or staff.
* **Security Middleware:** Employs `helmet` for secure HTTP response headers and `express-rate-limit` for DDoS protection (`authRateLimit`, `registerRateLimit`).
* **CORS Configuration:** Strictly validated against `ALLOWED_ORIGINS` / `CLIENT_ORIGIN` environment variables with cookie credentials enabled (`credentials: true`).

---

## 4. CONTROLLERS & ROUTES INVENTORY

### Authentication & Users (`/api/auth`)
* `POST /register` | controller: `register` | auth: none | Rate limited; registers user and provisions initial role.
* `POST /login` | controller: `login` | auth: none | Authenticates email/password, returns JWT token.
* `GET /me` | controller: `me` | auth: `authMiddleware` | Returns active user profile and RBAC permissions.
* `POST /logout` | controller: `logout` | auth: `authMiddleware` | Invalidates client session.
* `POST /email/check` | controller: `checkEmail` | auth: none | Verifies email availability.
* `POST /password/forgot` | controller: `forgotPassword` | auth: none | Dispatches password reset token email.
* `POST /reset-password` | controller: `resetUserPassword`| auth: none | Resets password using verification token.
* `PATCH /password` | controller: `updatePassword` | auth: `authMiddleware` | Updates user password from old password.
* `PATCH /profile` | controller: `updateUserProfile`| auth: `authMiddleware` | Updates full name and profile metadata.
* `POST /avatar/upload-file`| controller: `uploadAvatar` | auth: `authMiddleware` | Directly uploads user avatar buffer.
* `PATCH /active` | controller: `toggleActive` | auth: `authMiddleware` | Toggles user active/inactive account status.
* `GET /user/:id` | controller: `getUserById` | auth: `requireRole("admin")` | Admin inspection of user account.
* `PATCH /user/:id` | controller: `updateUser` | auth: `requireRole("admin")` | Admin modification of user attributes.
* `DELETE /user/:id` | controller: `removeUserById` | auth: `requireRole("admin")` | Admin deletion of user account.

### Learning Resources (`/api/resources`)
* `GET /` | controller: `listResources` | auth: optional | Lists public/filtered learning resources.
* `POST /` | controller: `addResource` | auth: `requireStudentContributorOrStaff` | Creates a new academic resource.
* `POST /upload-url` | controller: `requestResourceUploadUrlHandler` | auth: `requireStudentContributorOrStaff` | Generates R2/S3 pre-signed upload URL.
* `POST /confirm-upload` | controller: `confirmResourceUploadHandler` | auth: `requireStudentContributorOrStaff` | Confirms successful file upload and creates record.
* `GET /my-resources` | controller: `listMyResources` | auth: `authMiddleware` | Lists resources uploaded by the active user.
* `GET /my-analytics` | controller: `getMyResourceAnalyticsHandler` | auth: `authMiddleware` | Aggregated analytics for creator's resources.
* `GET /my-rejections` | controller: `listMyResourceRejectionsHandler` | auth: `authMiddleware` | Lists creator's rejected resource submissions.
* `GET /rejections` | controller: `listAllResourceRejectionsHandler` | auth: `requireRole("admin")` | Admin view of all rejected submissions.
* `GET /published` | controller: `listPublishedResources` | auth: none | Lists officially verified and published catalog.
* `GET /discover/bootstrap`| controller: `getDiscoverBootstrapHandler` | auth: `authMiddleware` | Initial discovery dashboard payload.
* `GET /:id` | controller: `getResource` | auth: `requirePublishedOrOwnerOrAdmin` | Inspects single resource entity.
* `PATCH /:id` | controller: `updateExistingResource`| auth: `requireOwnerOrAdmin` | Updates resource fields.
* `DELETE /:id` | controller: `deleteExistingResource`| auth: `requireOwnerOrAdmin` | Deletes resource entity.
* `PATCH /:id/metadata` | controller: `updateResourceMetadataHandler` | auth: `requireOwnerOrAdmin` | Updates JSON metadata context.
* `PATCH /:id/status` | controller: `updateResourceStatusHandler` | auth: `authMiddleware` | Updates moderation status.
* `POST /:id/publish` | controller: `publishResourceHandler` | auth: `requireRole("admin")` | Admin publishes pending resource.
* `POST /:id/archive` | controller: `archiveResourceHandler` | auth: `requireRole("admin")` | Admin archives active resource.
* `POST /:id/reject` | controller: `rejectResourceHandler` | auth: `requireRole("admin")` | Admin rejects pending resource with reason.
* `POST /:id/download` | controller: `downloadResourceHandler` | auth: `authMiddleware` | Records download event and evaluates gamification.
* `GET /:id/file-url` | controller: `getResourceFileUrlHandler` | auth: `requirePublishedOrOwnerOrAdmin` | Generates S3 pre-signed download URL.
* `GET /:id/details` | controller: `getResourceDetailsBundleHandler` | auth: `requirePublishedOrOwnerOrAdmin` | Full detail bundle including author and tags.
* `GET /:id/statistics` | controller: `getResourceStatisticsHandler` | auth: `requireOwnerOrAdmin` | Views, downloads, and engagement metrics.

### Resource Moderation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft : POST /resources (create)
    draft --> pending : PATCH /:id/status = pending
    pending --> published : POST /:id/publish (admin)
    pending --> rejected : POST /:id/reject (admin)
    published --> archived : POST /:id/archive (admin)
    rejected --> draft : Creator edits & resubmits
    archived --> [*]
```

### Q&A & Community (`/api/qa`)
* `GET /resources/:id/questions` | controller: `listResourceQuestionsHandler` | auth: optional | Lists questions attached to a resource.
* `POST /resources/:id/questions`| controller: `askQuestionHandler` | auth: `authMiddleware` | Posts a new question on a resource.
* `POST /questions/:id/answers` | controller: `answerQuestionHandler` | auth: `authMiddleware` | Submits an answer to an existing question.
* `POST /questions/:id/vote` | controller: `voteQuestionHandler` | auth: `authMiddleware` | Upvotes/downvotes a question.
* `POST /answers/:id/vote` | controller: `voteAnswerHandler` | auth: `authMiddleware` | Upvotes/downvotes an answer.
* `POST /answers/:id/accept` | controller: `acceptAnswerHandler` | auth: `requireOwnerOrAdmin` | Marks an answer as accepted.

### Gamification, Wallet & Admin (`/api/admin`, `/api/wallet`, `/api/ratings`)
* `GET /admin/users/overview` | controller: `getUsersOverviewHandler` | auth: `requireRole("admin")` | Comprehensive user list with system metrics.
* `GET /admin/rewards/analytics` | controller: `getRewardsAnalyticsHandler` | auth: `requireRole("admin")` | Gamification overview and contributor metrics.
* `PATCH /admin/users/:id/points`| controller: `adjustUserPointsHandler` | auth: `requireRole("admin")` | Manually credits/debits user points.
* `GET /wallet/me/summary` | controller: `getMyWalletSummaryHandler` | auth: `requireRole("student", "teacher")` | User's wallet balance and point breakdown.
* `GET /wallet/me/transactions` | controller: `getMyTransactionsHandler` | auth: `requireRole("student", "teacher")` | Point ledger transaction history.
* `POST /ratings` | controller: `rateResourceHandler` | auth: `authMiddleware` | Submits 1-5 star rating and updates averages.

### Tutoring & Consultations (`/api/tutor-profiles`, `/api/sessions`)
* `GET /tutor-profiles` | controller: `listTutorProfilesHandler` | auth: none | Lists available tutors.
* `GET /tutor-profiles/:id` | controller: `getTutorProfileHandler` | auth: none | Detailed tutor profile and slots.
* `GET /sessions/my-sessions` | controller: `getMySessionsHandler` | auth: `authMiddleware` | Lists active tutoring sessions.
* `POST /sessions` | controller: `createSessionHandler` | auth: `authMiddleware` | Books a consultation slot.

### Academic Taxonomy (`/api/institutions`, `/api/modules`, `/api/tags`, etc.)
* CRUD endpoints across `/institutions`, `/institution-types`, `/domains`, `/programs`, `/levels`, `/semesters`, `/modules`, `/tags`. Admin protected for mutations (`POST`, `PATCH`, `DELETE`), public/authenticated for reads (`GET`).

---

## 5. SERVICES & BUSINESS LOGIC

### Service Layer Map

```mermaid
graph TD
    subgraph "Controllers"
        RC[resourceController]
        AC[authController]
        QC[qaController]
        SC[sessionController]
        ADC[adminController]
    end

    subgraph "Domain Services"
        RS[resourceService.js]
        AS[authService.js]
        QS[qaService.js]
        SS[sessionService.js]
        ADS[adminService.js]
        FS[favoriteService.js]
        RAT[ratingService.js]
        CONF[resourceConfusionService.js]
        NOTIF[notificationDeliveryService.js]
    end

    subgraph "Infrastructure Services"
        R2[storage/r2Service.js]
        MAIL[Nodemailer SMTP]
        RETRY[notificationRetryWorkerService.js]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        SEQ[Sequelize ORM]
    end

    RC --> RS
    RC --> FS
    RC --> RAT
    AC --> AS
    QC --> QS
    SC --> SS
    ADC --> ADS

    RS --> R2
    RS --> PG
    AS --> R2
    AS --> MAIL
    NOTIF --> MAIL
    RETRY --> NOTIF

    RS & AS & QS & SS & ADS & FS & RAT & CONF --> SEQ
    SEQ --> PG
```

* `authService.js`: Handles user lifecycle, JWT provisioning, bcrypt hashing, avatar handling, and password reset flows.
* `resourceService.js`: Core CRUD operations, query builders, visibility filtering, S3 pre-signed URL coordination, and publishing/archiving workflows.
* `qaService.js`: Manages question and answer threads, nested voting ledgers, answer acceptance logic, and author notification triggers.
* `ratingService.js`: Evaluates rating submissions, calculates weighted average scores, and updates aggregated resource statistics.
* `favoriteService.js`: Toggles user resource favorites and updates creator gamification metrics.
* `sessionService.js`: Manages tutoring session scheduling, slot locking, and real-time messaging persistence.
* `adminService.js`: Aggregates cross-table platform metrics, reward analytics, and user point ledger adjustments.
* `storage/r2Service.js`: Coordinates Cloudflare R2 / AWS S3 client interactions, generating pre-signed PUT/GET URLs and executing direct buffer uploads.
* `notificationDeliveryService.js`: Handles in-app notifications, SSE stream broadcasting, and email delivery via Nodemailer.
* `resourceConfusionService.js`: Processes student confusion signals, triggering teacher alerts for difficult course modules.

---

## 6. STORAGE ARCHITECTURE (Cloudflare R2 / AWS S3)

### Storage System Overview

```mermaid
graph LR
    subgraph "Client Browser"
        FE[Frontend App]
    end

    subgraph "MUS Backend (Express)"
        API[API Server]
        R2SVC[r2Service.js\n@aws-sdk/client-s3]
    end

    subgraph "Cloudflare R2 / S3 Compatible"
        BUCKET[(R2 Bucket\npending/ & published/)]
        CDN[R2 Public URL\nfor thumbnails]
    end

    subgraph "PostgreSQL"
        DB[(resources table\nobject_key, bucket,\nmime_type, size_bytes)]
    end

    FE -- "1. POST /resources/upload-url\n(filename, mime_type)" --> API
    API -- "2. PutObjectCommand\n(signed URL generation)" --> R2SVC
    R2SVC -- "3. getSignedUrl\nTTL: env.R2_SIGNED_URL_TTL_SECONDS" --> BUCKET
    BUCKET -- "4. Return pre-signed PUT URL" --> R2SVC
    R2SVC -- "5. Return { uploadUrl, expiresIn }" --> API
    API -- "6. Return uploadUrl to client" --> FE
    FE -- "7. PUT file directly to R2\n(no backend bandwidth)" --> BUCKET
    FE -- "8. POST /resources/confirm-upload\n(object_key, metadata)" --> API
    API -- "9. INSERT resource record" --> DB

    FE -- "A. GET /resources/:id/file-url" --> API
    API -- "B. GetObjectCommand\n(signed download URL)" --> R2SVC
    R2SVC -- "C. getSignedUrl TTL: 900s default" --> BUCKET
    BUCKET -- "D. Return pre-signed GET URL" --> FE
    FE -- "E. Download file directly from R2" --> BUCKET
```

### Object Key Path Strategy

```mermaid
flowchart LR
    A[buildObjectKey called] --> B["prefix/userId/year/month/uuid/filename"]
    B --> C{prefix type}
    C -- "Resource file" --> D["pending/{userId}/{yyyy}/{mm}/{uuid}/{filename}"]
    C -- "Thumbnail" --> E["thumbnails/{userId}/{yyyy}/{mm}/{uuid}/{filename}"]
    C -- "Avatar" --> F["avatars/{userId}/{yyyy}/{mm}/{uuid}/{filename}"]
    D --> G[Stored in resources.object_key]
    E --> H[Stored in resources.thumbnail_key]
    F --> I[Stored in users.avatar_key]
```

### Upload Variants

```mermaid
flowchart TD
    A{Upload method} --> B[Pre-signed URL flow\nLarge files, resources]
    A --> C[Direct buffer upload\nSmall files, avatars, thumbnails]

    B --> B1["POST /upload-url → getUploadUrl()"]
    B1 --> B2[Client PUT directly to R2]
    B2 --> B3["POST /confirm-upload → db record created"]

    C --> C1["POST /avatar/upload-file\nmulter memoryStorage() max 10MB"]
    C1 --> C2["putObjectBuffer() sends Buffer to R2"]
    C2 --> C3[Update user avatar_key in DB]

    B3 --> D[(resources table updated)]
    C3 --> E[(users table updated)]
```

### r2Service.js Exported Functions

| Function | Direction | Auth Pattern | Use Case |
| :--- | :--- | :--- | :--- |
| `getUploadUrl()` | PUT → R2 | Pre-signed URL | Large resource file uploads |
| `getDownloadUrl()` | GET ← R2 | Pre-signed URL | Authenticated file downloads |
| `putObjectBuffer()` | PUT → R2 | Direct SDK call | Avatar / thumbnail buffer uploads |
| `headObject()` | HEAD → R2 | Direct SDK call | Validate object existence & metadata |
| `deleteObject()` | DELETE → R2 | Direct SDK call | Cleanup on resource deletion |
| `getPublicObjectUrl()` | Static URL | Public CDN | Thumbnail public access via R2 CDN |
| `buildObjectKey()` | Utility | — | Namespaced path: `prefix/userId/yyyy/mm/uuid/filename` |
| `isR2Configured()` | Guard | — | Checks all required env vars before operations |

---

## 7. KEY API FLOWS

### Password Reset Flow

```mermaid
sequenceDiagram
    actor User
    participant API
    participant authService
    participant DB
    participant SMTP

    User->>API: POST /auth/password/forgot { email }
    API->>authService: forgotPassword(email)
    authService->>DB: Lookup user by email
    DB-->>authService: user record
    authService->>DB: INSERT password_reset_tokens\n(token, expires_at = now + 1hr)
    authService->>SMTP: Send reset email with token link
    API-->>User: 200 OK (always, to prevent enumeration)

    User->>API: POST /auth/reset-password { token, new_password }
    API->>authService: resetPassword(token, new_password)
    authService->>DB: Validate token not expired, not used
    authService->>DB: UPDATE users SET password_hash = bcrypt(new_password)
    authService->>DB: Mark token as used
    API-->>User: 200 Password updated
```

### Resource Discovery Bootstrap Flow

```mermaid
sequenceDiagram
    actor Student
    participant API
    participant resourceService
    participant DB

    Student->>API: GET /resources/discover/bootstrap\n?sort_by=recommended&module_id=5
    API->>resourceService: getDiscoverBootstrap(userId, filters)
    resourceService->>DB: sp_recommendation_get_for_user(userId, limit)\n(tags + profile + quality scoring)
    DB-->>resourceService: ranked recommendations[]
    resourceService->>DB: Query published resources\nwith filters (format, language, tier)
    DB-->>resourceService: paginated resources[]
    resourceService->>DB: Fetch available modules, tags
    DB-->>resourceService: metadata[]
    resourceService-->>API: { recommendations, resources, modules, tags }
    API-->>Student: 200 Bootstrap payload
```

### Session Booking Flow

```mermaid
sequenceDiagram
    actor Student
    participant API
    participant sessionService
    participant DB
    participant notificationService

    Student->>API: GET /tutor-profiles/:id\n(view available slots)
    API-->>Student: { profile, availability_slots[] }

    Student->>API: POST /sessions\n{ slot_id, teacher_id, message }
    API->>sessionService: createSession(params)
    sessionService->>DB: Verify slot is_active = true
    sessionService->>DB: INSERT teacher_session_bookings\nstatus = pending
    sessionService->>DB: Mark slot is_active = false (lock slot)
    sessionService->>notificationService: Notify teacher of new request
    API-->>Student: 201 { booking_id, status: pending }

    Note over DB: Teacher reviews booking
    API->>DB: PATCH /sessions/:id/confirm OR reject
    DB-->>API: Update confirmed_at / rejected_at + actor
    API->>notificationService: Notify student of decision
```

---

## 8. DATA LAYER & ORM/DATABASE

* **Database Engine:** PostgreSQL (`pg`).
* **ORM:** Sequelize v6 (`sequelize`). Configured in `src/config/database.js` supporting SSL connection strings (`DATABASE_URL`) or granular environment variables (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).

### Models Inventory
* `User` (`user.js`): Core authentication entity (email, password_hash, full_name, is_active, points).
* `Role` (`role.js`): RBAC role definitions (`admin`, `teacher`, `student`).
* `UserRole` (`userRole.js`): Join table mapping Users to Roles.
* `InstitutionType` (`institutionType.js`): Taxonomy of institution categories.
* `Institution` (`institution.js`): Academic universities / schools.
* `Domain` (`domain.js`): Broad academic faculties.
* `Program` (`program.js`): Specific academic majors/curricula.
* `InstitutionProgram` (`institutionProgram.js`): Join table mapping Institutions to Programs.
* `Level` (`level.js`): Academic years within a Program.
* `Semester` (`semester.js`): Semesters within an Academic Level.

---

## 9. KEY DEPENDENCIES

| Package Name | Version | Purpose |
| :--- | :--- | :--- |
| `express` | `^4.19.2` | High-performance HTTP server routing framework. |
| `sequelize` | `^6.37.7` | Promise-based Node.js ORM for PostgreSQL. |
| `pg` / `pg-hstore` | `^8.16.3` | Native PostgreSQL client bindings and serialization. |
| `jsonwebtoken` | `^9.0.3` | Cryptographic JWT signing and verification. |
| `bcrypt` | `^6.0.0` | Secure password hashing using salted Blowfish cipher. |
| `@aws-sdk/client-s3` | `^3.879.0` | AWS SDK v3 client for S3/R2 object storage interactions. |
| `express-validator`| `^7.3.1` | Express middleware for declarative payload validation. |
| `cors` | `^2.8.5` | Cross-Origin Resource Sharing middleware. |
| `helmet` | `^8.0.0` | Secure HTTP header injection. |
| `express-rate-limit`| `^7.4.1` | IP-based request rate limiting. |
| `multer` | `^2.1.0` | Multipart/form-data parsing for in-memory buffer uploads. |
| `nodemailer` | `^8.0.1` | SMTP client for transactional email dispatch. |
| `swagger-ui-express`| `^5.0.1` | Serves interactive OpenAPI / Swagger API documentation. |

---

## 10. KNOWN ISSUES & TODOS

* **In-Memory Multer Buffering:** Direct avatar and thumbnail uploads utilize `multer.memoryStorage()`. While restricted via file size limits, high-concurrency large uploads could impact server memory. The architectural roadmap prioritizes transitioning all binary ingestion to pre-signed client-side S3 URLs.
* **Notification Retry Queue:** Failed email notifications are currently managed via an in-memory periodic worker (`notificationRetryWorkerService.js`). Horizontal scaling across multiple backend pods will require migrating this queue to Redis or BullMQ.

---

## Quick Context for AI Agents

The MUS (Moroccan University Students) Backend is an Express + Sequelize PostgreSQL API providing robust academic taxonomy, resource sharing, Q&A, and tutoring capabilities. Authentication relies on JWTs passed via cookies or Bearer headers, with active user context seamlessly propagated across service layers using `AsyncLocalStorage`. Storage operations coordinate with Cloudflare R2 / AWS S3 via pre-signed URLs to offload bandwidth. When expanding features, adhere strictly to the Layered Architecture, declare strict request validation chains using `express-validator`, enforce RBAC permissions via existing authorization middleware, and throw standard `AppError` instances for centralized error handling.
