# MUS Frontend

Frontend web application for the MUS platform, built with React + Vite + Material UI.

This app provides:

- public landing and discovery experience
- authentication flows (login/register/forgot password)
- role-based dashboard (admin/teacher/student)
- resource browsing, upload, moderation, and management screens
- user profile, settings, wallet, catalog, and admin operations
- multilingual UI (English, French, Arabic) with RTL support for Arabic

## What this frontend does

- connects to MUS backend API
- manages auth session (token + profile bootstrap)
- protects routes by role
- renders modular feature pages by domain (resources, users, wallet, etc.)
- provides reusable UI component primitives (shared design system)
- supports responsive layouts for desktop and mobile

## Tech stack

### Core

- React 19
- Vite (via `rolldown-vite` override)
- React Router
- Axios

### UI and UX

- Material UI (`@mui/material`, `@mui/icons-material`)
- Emotion (`@emotion/react`, `@emotion/styled`)
- GSAP (animations)
- Recharts (charts and dashboard visuals)
- `simplebar-react` (custom scrollbars)

### Forms and validation

- `react-hook-form`

### Tooling

- ESLint 9
- Playwright (screenshot script)

## Architecture overview

The code is organized by feature + app layers:

- **`src/app`**: global providers and route composition
- **`src/features`**: domain-focused UI modules (auth, resources, users, wallet, etc.)
- **`src/services`**: API access layer by backend domain
- **`src/shared`**: reusable UI components and shared utilities
- **`src/layouts`**: page shell layouts (dashboard)
- **`src/styles`**: theme system and shared visual tokens

Typical flow:

`Page/Component -> Service -> Axios client -> Backend API`

## Project structure

```text
MUS-frontend/
  src/
    app/
      providers/              # Auth, theme, language providers
      router/                 # App route tree
    features/                 # Feature modules
      auth/
      dashboard/
      resources/
      users/
      library/
      uploads/
      wallet/
      profile/
      settings/
      verify/
      catalog/
      publicHome/
      discover/
    layouts/
      DashboardLayout.jsx
    pages/                    # public/auth top-level pages
    services/                 # API clients per backend domain
    shared/components/ui/     # reusable UI library
    styles/                   # MUI themes + motion styles
    main.jsx                  # app entry point
    App.jsx                   # app shell + dynamic page title
  scripts/
    captureRoleScreenshots.mjs
  Dockerfile
  vite.config.js
```

## Routing and access model

Routing is configured in `src/app/router/index.jsx`.

### Public routes

- `/` - public landing page
- `/login` - login
- `/register` - registration
- `/discover` - resource discovery page
- `/404` - not found

### Protected dashboard routes

Base layout: `/dashboard` (requires authenticated user)

- `/dashboard` - overview
- `/dashboard/library` - library (student/teacher/admin)
- `/dashboard/uploads` - my uploads (student/teacher/admin)
- `/dashboard/wallet` - wallet (student/teacher/admin)
- `/dashboard/profile` - profile
- `/dashboard/settings` - settings
- `/dashboard/users` - admin only
- `/dashboard/resources` - admin only
- `/dashboard/verify` - admin only
- `/dashboard/catalog` - admin only

Access checks are implemented by `ProtectedRoute` and role helpers from auth context.

## Global providers

Configured in `src/main.jsx` and `src/app/providers/AppProvider.jsx`:

- `AuthProvider` - authentication state/session bootstrap
- MUI Theme provider + CSS variables bridge
- `LanguageProvider` - i18n text lookup + RTL handling
- `NotificationProvider` - global in-app notifications

## Authentication behavior

Auth state lives in `src/features/auth/context/AuthContext.jsx`:

- stores token, roles, user profile, loading state
- persists token/user/roles in `localStorage`
- normalizes backend role shapes to `ADMIN | TEACHER | STUDENT`
- refreshes profile from `/auth/me` on app bootstrap when session exists
- provides helpers:
  - `hasRole(...)`
  - `hasAnyRole(...)`
  - flags like `isAdmin`, `isTeacher`, `isStudent`, `isPremium`

## API integration

HTTP client is in `src/services/api.js`:

- base URL from `VITE_API_URL`
- auto-normalizes URL to include `/api`
- sends credentials (`withCredentials: true`)
- attaches `Authorization: Bearer <token>` if token exists
- intercepts `401` and redirects to `/login` except selected auth cases

The domain service layer in `src/services/` maps frontend actions to backend endpoints (auth, resources, users, admin, favorites, wallet, catalog, etc.).

## UI system and theming

- MUI theme definitions in `src/styles/theme.js` (light + dark)
- typography and design tokens are injected as CSS variables
- reusable component library under `src/shared/components/ui`
- dashboard shell in `src/layouts/DashboardLayout.jsx` with responsive sidebar/navbar

## Internationalization

Language context supports:

- `en` (English)
- `fr` (French)
- `ar` (Arabic)

Arabic automatically applies RTL direction at document level.

## Environment variables

### Vite app env

- `VITE_API_URL` - backend base URL (example in `.env`: `http://localhost:5000`)

### Script env (optional)

- `SCREENSHOT_BASE_URL` - used by screenshot script (defaults to `http://127.0.0.1:5173`)

## Available npm scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint

## Local development

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```env
VITE_API_URL=http://localhost:5000
```

3. Start app:

```bash
npm run dev
```

4. Open browser:

- `http://localhost:5173`

## Docker

The Dockerfile uses a two-stage build:

- stage 1: Node 20 builds static files
- stage 2: Nginx serves `dist/`

Build and run:

```bash
docker build -t mus-frontend --build-arg VITE_API_URL=http://localhost:5000 .
docker run -p 8080:80 mus-frontend
```

Then open `http://localhost:8080`.

## Screenshot automation

Script: `scripts/captureRoleScreenshots.mjs`

Purpose:

- captures public pages screenshots
- logs in as admin/teacher/student demo accounts
- captures role-specific route screenshots

Run:

```bash
node scripts/captureRoleScreenshots.mjs
```

Optional base URL:

```bash
SCREENSHOT_BASE_URL=http://127.0.0.1:5173 node scripts/captureRoleScreenshots.mjs
```

Screenshots are saved under `../Screenshots`.

## Dependencies list

### Runtime dependencies

- `@emotion/react`
- `@emotion/styled`
- `@mui/icons-material`
- `@mui/material`
- `axios`
- `gsap`
- `prop-types`
- `react`
- `react-dom`
- `react-hook-form`
- `react-router-dom`
- `recharts`
- `simplebar-react`

### Development dependencies

- `@eslint/js`
- `@faker-js/faker`
- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react`
- `eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `playwright`
- `vite` (overridden to `rolldown-vite`)

## Notes

- This frontend README documents project structure and behavior; component-level UI docs are in `src/shared/components/ui/README.md`.
- Ensure backend CORS allows the frontend origin and credentials for authenticated calls.
