<div align="center">

# 🖥️ MUS Frontend

**React web application for the MUS platform — built with React 19, Vite & Material UI**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MUI](https://img.shields.io/badge/MUI-Latest-007FFF?logo=mui&logoColor=white)](https://mui.com)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)

</div>

---

## 📖 Overview

The MUS frontend is a feature-rich React application providing:

- 🌐 **Public landing page** with animations and multilingual content (EN/FR/AR)
- 🔍 **Open resource discovery** at `/discover` — no login required
- 🔐 **Full authentication flows** (login, register, forgot password)
- 🎛️ **Role-based dashboard** for admin, teacher, and student roles
- 📚 **Resource browsing, uploading, moderation, and management**
- 💰 **Wallet, profile, settings**, and admin-only operations
- 🌍 **RTL support** for Arabic locale

---

## 🏗️ Tech Stack

| Category | Technology |
|---|---|
| **Core** | React 19, Vite (`rolldown-vite`), React Router |
| **HTTP Client** | Axios |
| **UI Framework** | Material UI (`@mui/material`, `@mui/icons-material`) |
| **Styling** | Emotion (`@emotion/react`, `@emotion/styled`) |
| **Animations** | GSAP (scroll & entrance animations) |
| **Charts** | Recharts (dashboard visuals) |
| **Scrollbars** | `simplebar-react` |
| **Forms** | React Hook Form |
| **Tooling** | ESLint 9, Playwright (screenshot automation) |

---

## 🗂️ Architecture Overview

The codebase follows a **feature-based modular architecture**:

```
Page / Component → Service → Axios Client → Backend API
```

| Directory | Role |
|---|---|
| `src/app/` | Global providers and route composition |
| `src/features/` | Domain-focused UI modules (auth, resources, users, wallet…) |
| `src/services/` | API access layer per backend domain |
| `src/shared/` | Reusable UI components and utilities |
| `src/layouts/` | Page shell layouts (dashboard sidebar/navbar) |
| `src/styles/` | MUI theme system and shared visual tokens |

---

## 📁 Project Structure

```text
MUS-frontend/
├── src/
│   ├── app/
│   │   ├── providers/              # Auth, theme, language providers
│   │   └── router/                 # App route tree
│   ├── features/                   # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── resources/
│   │   ├── users/
│   │   ├── library/
│   │   ├── uploads/
│   │   ├── wallet/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── verify/
│   │   ├── catalog/
│   │   ├── publicHome/
│   │   └── discover/
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── pages/                      # Public / auth top-level pages
│   ├── services/                   # API clients per backend domain
│   ├── shared/
│   │   └── components/ui/          # Reusable UI component library
│   ├── styles/                     # MUI themes + motion styles
│   ├── main.jsx                    # App entry point
│   └── App.jsx                     # App shell + dynamic page title
├── scripts/
│   └── captureRoleScreenshots.mjs
├── Dockerfile
└── vite.config.js
```

---

## 🗺️ Routing & Access Model

Routing is configured in `src/app/router/index.jsx`.

### Public Routes

| Route | Description |
|---|---|
| `/` | Animated public landing page |
| `/discover` | Resource discovery (open access) |
| `/login` | Login |
| `/register` | Registration |
| `/404` | Not found |

### Protected Dashboard Routes

> All require an authenticated session. Access is enforced by `ProtectedRoute` and role helpers from auth context.

| Route | Access | Description |
|---|---|---|
| `/dashboard` | All roles | Overview / home |
| `/dashboard/library` | All roles | Personal resource library |
| `/dashboard/uploads` | All roles | My uploaded resources |
| `/dashboard/wallet` | All roles | Wallet and engagement |
| `/dashboard/profile` | All roles | User profile |
| `/dashboard/settings` | All roles | Account settings |
| `/dashboard/users` | Admin only | User management |
| `/dashboard/resources` | Admin only | Resource management |
| `/dashboard/verify` | Admin only | Moderation queue |
| `/dashboard/catalog` | Admin only | Academic catalog management |

---

## 🌐 Global Providers

Configured in `src/main.jsx` and `src/app/providers/AppProvider.jsx`:

| Provider | Purpose |
|---|---|
| `AuthProvider` | Authentication state and session bootstrap |
| MUI Theme Provider | Light/dark theme + CSS variable bridge |
| `LanguageProvider` | i18n text lookup + RTL direction handling |
| `NotificationProvider` | Global in-app notification system |

---

## 🔐 Authentication Behavior

Auth state lives in `src/features/auth/context/AuthContext.jsx`:

- Stores token, roles, user profile, and loading state
- Persists token/user/roles in `localStorage`
- Normalizes backend role shapes to `ADMIN | TEACHER | STUDENT`
- Refreshes profile from `/auth/me` on app bootstrap when session exists

**Available helpers:**

```js
hasRole(role)         // Check for a specific role
hasAnyRole(...roles)  // Check for any of the given roles
isAdmin               // Boolean flag
isTeacher             // Boolean flag
isStudent             // Boolean flag
isPremium             // Boolean flag
```

---

## 🔌 API Integration

HTTP client is in `src/services/api.js`:

- Base URL from `VITE_API_URL`
- Auto-normalizes URL to include `/api`
- Sends credentials (`withCredentials: true`)
- Attaches `Authorization: Bearer <token>` if a token exists
- Intercepts `401` responses and redirects to `/login` (except auth endpoints)

The domain service layer in `src/services/` maps frontend actions to backend endpoints (auth, resources, users, admin, favorites, wallet, catalog, etc.).

---

## 🎨 UI System & Theming

| Feature | Details |
|---|---|
| **Theme** | Light + dark mode defined in `src/styles/theme.js` |
| **Typography** | Design tokens injected as CSS variables |
| **Component Library** | Reusable primitives in `src/shared/components/ui` |
| **Dashboard Shell** | Responsive sidebar/navbar in `src/layouts/DashboardLayout.jsx` |

---

## 🌍 Internationalization

Supported languages:

| Code | Language | Notes |
|---|---|---|
| `en` | English | Default |
| `fr` | French | |
| `ar` | Arabic | Automatically applies RTL at document level |

---

## 🔧 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ Yes | Backend base URL (e.g. `http://localhost:5000`) |
| `SCREENSHOT_BASE_URL` | Optional | Used by screenshot script (default: `http://127.0.0.1:5173`) |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
echo "VITE_API_URL=http://localhost:5000" > .env

# 3. Start the dev server
npm run dev
```

> App runs at **`http://localhost:5173`**

---

## 🐳 Docker

The Dockerfile uses a **two-stage build**:

1. **Build stage** – Node 20 compiles static files
2. **Serve stage** – Nginx serves `dist/`

```bash
# Build image
docker build -t mus-frontend --build-arg VITE_API_URL=http://localhost:5000 .

# Run container
docker run -p 8080:80 mus-frontend
```

> App runs at **`http://localhost:8080`**

---

## 📸 Screenshot Automation

Script: `scripts/captureRoleScreenshots.mjs`

**What it does:**
- Captures public page screenshots
- Logs in as admin, teacher, and student demo accounts
- Captures role-specific route screenshots

```bash
# Run with default base URL
node scripts/captureRoleScreenshots.mjs

# Run with custom base URL
SCREENSHOT_BASE_URL=http://127.0.0.1:5173 node scripts/captureRoleScreenshots.mjs
```

> Screenshots are saved under `../Screenshots/`

---

## 📦 Dependencies

### Runtime

| Package | Purpose |
|---|---|
| `react`, `react-dom` | Core framework |
| `react-router-dom` | Client-side routing |
| `@mui/material`, `@mui/icons-material` | UI component library |
| `@emotion/react`, `@emotion/styled` | CSS-in-JS for MUI |
| `axios` | HTTP client |
| `gsap` | Scroll and entrance animations |
| `recharts` | Dashboard charts |
| `react-hook-form` | Form state management |
| `simplebar-react` | Custom scrollbars |
| `prop-types` | Runtime prop validation |

### Development

| Package | Purpose |
|---|---|
| `vite` (`rolldown-vite`) | Dev server and bundler |
| `@vitejs/plugin-react` | React Fast Refresh |
| `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | Linting |
| `playwright` | Screenshot automation |
| `@faker-js/faker` | Test data generation |
| `@types/react`, `@types/react-dom` | TypeScript types |
| `globals` | ESLint globals config |

---

## 📝 Notes

- Component-level UI docs are located in `src/shared/components/ui/README.md`.
- Ensure the backend `CLIENT_ORIGIN` includes your frontend origin and that `withCredentials` is allowed for authenticated calls.
