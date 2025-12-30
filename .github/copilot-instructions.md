# Copilot Instructions: Music Notation Platform

These instructions help AI coding agents work productively in this repo by explaining the architecture, key workflows, and project-specific patterns. Keep changes minimal, align with existing structure, and verify with local runs.

## Big Picture

- Full-stack app with three parts:
  - Frontend: React + Vite + Tailwind in `client/` renders ABC notation via `abcjs`, handles auth, routing, i18n.
  - Backend: Node + Express + MongoDB in `server/` exposes REST APIs for auth, scores, comments, users.
  - Scraper: Python in `scraper/` ingests ABC tunes from abcnotation.com into MongoDB.
- Data model: `User`, `Score`, `Comment` in `server/src/models/`. Scores support `isPublic`, `likes[]`, `owner` and timestamps.
- Auth: JWT in HTTP `Authorization: Bearer <token>`. Email verification via Resend; login requires `isVerified`.

## Dev Workflow

- Env files (backend): `server/src/config/config.js` loads `.env` or `.env.production` based on `NODE_ENV`. Required keys: `MONGODB_URI`, optional `DB_NAME`, `PORT`, `JWT_SECRET`, `RESEND_API_KEY`, `CLIENT_URL`.
- Start backend (dev):
  ```bash
  cd server
  npm run dev
  ```
- Start frontend (dev):
  ```bash
  cd client
  npm run dev
  ```
- Verify DB connection:
  ```bash
  cd server
  node verify-db.js
  ```
- Promote admin:
  ```bash
  cd server
  node makeAdmin.js <email>
  ```
- Lint/build frontend:
  ```bash
  cd client
  npm run lint
  npm run build
  ```

## Integration & Environment

- API base URL selection in `client/src/api.js`:
  - If hostname is local, use `http://localhost:5000/api`.
  - Otherwise, default `http://47.110.94.14:5000/api`.
- Request interceptor attaches JWT from `localStorage`.
- Email verification links point to `${CLIENT_URL || http://localhost:5173}/verify/:token` (see `server/src/utils/email.js`).
- CORS + JSON body parsing applied in `server/src/index.js`.

## Backend Patterns

- Route → Controller → Model structure:
  - Routes in `server/src/routes/*.js` mount under `/api/...` in `server/src/index.js`.
  - Controllers in `server/src/controllers/*.js` perform auth, validation, DB ops.
- Middlewares (in `server/src/middleware/authMiddleware.js`):
  - `protect`: requires valid JWT; sets `req.user`.
  - `resolveUser`: optional JWT; sets `req.user` if valid, continues otherwise.
  - `admin`: requires `req.user.role === 'admin'`.
- Email verification flow (`authController.js`):
  - `POST /api/auth/register` creates user + `verificationToken` and sends email via Resend.
  - `GET /api/auth/verify/:token` marks `isVerified=true`.
  - `POST /api/auth/login` rejects if not verified; issues 1h JWT with `{ id, username, role }`.
- Scores API (`scoreController.js`):
  - Public or owned visibility by default; admins can see all.
  - Search via `?search=...`; pagination via `?page=` and `?limit=` returns `{ scores, total, page, totalPages }`.
  - Likes managed via `PUT /api/scores/:id/like` (ensures `likes[]`).
- Comments (`commentController.js`):
  - Anyone can read; posting requires `protect` and score visibility.

## Frontend Patterns

- Auth state in `client/src/context/AuthContext.jsx`:
  - Stores JWT in `localStorage`; decodes with `jwt-decode` to derive `role`.
  - Provides `login(email, password)`, `register(username, email, password)`, `logout()`.
- i18n via `i18next` with resources in `client/src/locales/` and setup in `client/src/i18n.js`.
- ABC rendering via `abcjs` within components/pages (e.g., `pages/ScoreView.jsx`, `pages/ScoreEditor.jsx`).
- Pagination/search handled via query params matching backend (`page`, `limit`, `search`).
- Example API usage:
  ```js
  // Fetch public scores with search + paging
  const { data } = await api.get("/scores", {
    params: { search, page, limit },
  });
  ```

## Scraper

- Uses `requests`, `beautifulsoup4`, `pymongo`, `python-dotenv` (see `scraper/requirements.txt`).
- Env selection: `.env` vs `.env.production` based on `SCRAPER_ENV`.
- Writes to `scores` collection in `DB_NAME` (`MONGODB_URI` required).
- Run search/browse modes:
  ```bash
  cd scraper
  python scraper.py --query jig --limit 2
  python scraper.py --browse --start-page 0 --limit 1
  ```
- Lightweight tests:
  ```bash
  python test_validation_logic.py
  ```

## When Adding Features

- Backend:
  - Define model changes in `server/src/models/*`.
  - Implement controller logic and mount routes; apply `protect/admin/resolveUser` appropriately.
  - Return paginated lists where applicable with `{ total, page, totalPages }`.
- Frontend:
  - Call APIs via `client/src/api.js`; update context/pages/components; keep JWT in `localStorage`.
  - Extend i18n strings in `client/src/locales/` when adding UI.
- Keep visibility rules consistent: private scores visible to owner/admin; public readable by all; comment creation gated by visibility.
