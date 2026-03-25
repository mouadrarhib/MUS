# DevOps and Code Quality Checklist

This checklist is tailored to current branch strategy: `mouad`, `haytham`, `main`.

## Phase 1 - Immediate (Do now)

- [x] Update `.github/workflows/ci.yml` triggers
  - [x] `push` on `mouad`, `haytham`, `main`
  - [x] `pull_request` targeting `main`
- [x] Split CI into jobs
  - [x] `frontend-quality` (`npm ci`, `npm run lint`, `npm run build`)
  - [x] `backend-quality` (`npm ci`, backend lint + light smoke)
  - [x] `docker-build` (depends on quality jobs)
- [x] Add backend lint baseline
  - [x] Create `MUS-backend/eslint.config.js`
  - [x] Add `lint` script in `MUS-backend/package.json`
- [x] Ensure CI fails on first quality failure

## Phase 2 - Script Standardization

- [x] Normalize backend test scripts in `MUS-backend/package.json`
  - [x] `test:smoke`
  - [x] `test:e2e` (optional now)
  - [x] `test` aggregator
- [x] Map existing backend scripts under these aliases
  - [x] Membership checks
  - [x] Notification checks
  - [x] QA/Confusion checks
- [x] Keep smoke suite short and stable for PRs

## Phase 3 - Security Baseline

- [x] Create `.github/workflows/security.yml`
  - [x] Frontend `npm audit`
  - [x] Backend `npm audit`
  - [x] CodeQL JS/TS scan
- [x] Add container scan (Trivy) in `.github/workflows/docker-publish.yml` before push
- [x] Keep Docker publish only on `main`

## Phase 4 - Branch Protection

- [ ] In GitHub branch settings for `main`
  - [ ] Require status checks (`frontend-quality`, `backend-quality`, `docker-build`)
  - [ ] Require at least 1 review
  - [ ] Disallow direct pushes
- [ ] Optional: require conversation resolution before merge

Note: Phase 4 is manual in GitHub repository settings (not file-based).

## Phase 5 - Quality Metrics (After CI Stabilizes)

- [ ] Add unit test frameworks
  - [ ] Frontend: Vitest + Testing Library
  - [ ] Backend: Jest + Supertest
- [ ] Add coverage report upload in CI
- [ ] Set initial coverage thresholds and raise gradually
