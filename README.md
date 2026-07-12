# AssetFlow — Enterprise Asset & Resource Management System

A ground-up TypeScript ERP for tracking, allocating, booking, and maintaining
physical assets and shared resources — built for the hackathon problem
statement (see `docs/problem-statement.pdf`, not included here).

**Stack:** Node.js + Express + TypeScript + PostgreSQL + Prisma (backend) ·
React + TypeScript + Vite + Tailwind (frontend). No third-party SaaS APIs —
auth, tokens, and business logic are all hand-built.

## Repository layout

```
assetFlow/
├── backend/          # Express API, Prisma schema, business logic
└── frontend/         # React app (added in a later phase)
```

## Build status — this is a phased delivery

Given the size of the system (10 screens, 6+ workflow engines), it is being
built and reviewed in phases rather than dumped in one shot. **Phase 1**
(this drop) ships:

- ✅ Full Prisma schema modeling the entire domain (Users, Departments,
  Categories, Assets, Allocations, Transfers, Bookings, Maintenance,
  Audit Cycles, Notifications, Activity Log)
- ✅ Auth module: signup (Employee-only), login, refresh/logout, forgot/reset
  password, JWT access + httpOnly-cookie refresh tokens
- ✅ Organization Setup (Screen 3): Departments (Tab A), Asset Categories
  (Tab B), Employee Directory + the **sole** role-promotion endpoint (Tab C)
- ✅ Asset Registration & Directory (Screen 4): register, search/filter,
  lifecycle state machine, allocation + maintenance history
- ✅ Shared infra: RBAC middleware, Zod validation, centralized error
  handling, activity logging, in-app notifications, seed script

**Not yet in this drop** (coming in follow-up phases): Allocation & Transfer
conflict handling (Screen 5), Resource Booking overlap validation (Screen 6),
Maintenance approval workflow (Screen 7), Audit Cycles (Screen 8), Dashboard
KPIs (Screen 2), Reports & Analytics (Screen 9), and the entire React
frontend for all 10 screens.

## Getting started (backend)

1. Install PostgreSQL locally (or use a Docker container) and create a
   database, e.g. `createdb assetflow`.
2. `cd backend && cp .env.example .env` and fill in `DATABASE_URL`, JWT
   secrets, and bootstrap admin credentials.
3. `npm install`
4. `npx prisma migrate dev --name init` — creates all tables from
   `prisma/schema.prisma`.
   *(This step needs to download Prisma's query engine binary, so run it on
   a machine with normal internet access — it was not runnable inside this
   sandboxed environment, which only allows a fixed set of package-registry
   domains.)*
5. `npm run seed` — creates the one bootstrap Admin account (credentials
   from `.env`) and a few starter asset categories. This is the **only** way
   an Admin account is ever created — signup always creates a plain Employee.
6. `npm run dev` — starts the API on `http://localhost:5000`.

Health check: `GET http://localhost:5000/api/health`

## Role model (enforced end-to-end)

- **Signup** (`POST /api/auth/signup`) always creates an `EMPLOYEE`. No role
  field is accepted from the client — see `auth.schema.ts`.
- **Only an Admin** can promote a user to `DEPARTMENT_HEAD` or
  `ASSET_MANAGER` via `PATCH /api/employees/:id/promote` — the single code
  path in the whole system that changes a role.
- Every write route is guarded with `requireRole(...)` middleware; read
  routes are open to any authenticated user unless noted.

## API surface so far

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/signup` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh` | public (cookie) |
| POST | `/api/auth/logout` | authenticated |
| POST | `/api/auth/forgot-password` | public |
| POST | `/api/auth/reset-password` | public |
| GET | `/api/auth/me` | authenticated |
| GET/POST/PATCH | `/api/departments` | GET: any user · writes: Admin |
| GET/POST/PATCH/DELETE | `/api/categories` | GET: any user · writes: Admin |
| GET/PATCH | `/api/employees` | GET: any user · writes: Admin |
| PATCH | `/api/employees/:id/promote` | Admin only |
| GET/POST/PATCH | `/api/assets` | GET: any user · writes: Asset Manager/Admin |
| GET | `/api/assets/:id/history` | any authenticated user |
| GET/PATCH | `/api/notifications` | authenticated (own notifications) |
| GET | `/api/notifications/activity-log` | Admin/Asset Manager |

## Design notes

- **Money** (`acquisitionCost`) is stored as `Decimal` — kept for
  ranking/reporting only, never linked to accounting, per the problem
  statement's explicit scope boundary.
- **Asset lifecycle** transitions are enforced by a small state machine
  (`asset.stateMachine.ts`) shared by every module that changes an asset's
  status, so illegal transitions (e.g. `DISPOSED → AVAILABLE`) are rejected
  everywhere consistently.
- **No third-party services**: password reset doesn't send real email (no
  mail provider wired in) — in development it returns the reset link
  directly in the API response, clearly marked, so the flow is demoable.
  Swap in a real mailer in `auth.service.ts` for production.
