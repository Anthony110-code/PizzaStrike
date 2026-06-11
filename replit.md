# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── pizzastrike/        # PizzaStrike React SPA
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## PizzaStrike App

A dark-neon bowling alley SPA with integrated food ordering. Mobile-first design.

### Features
- **Home Page**: Hero section with "PRENOTA. GIOCA. MANGIA." tagline, two CTAs, features grid
- **Booking Page**: Horizontal date strip, 6 lane grid, time slot pill selection, booking confirmation panel
- **Menu Page**: Category pill filters (Pizze, Snack, Bibite, Dolci), product cards with badges, add to cart
- **Cart & Orders**: Cart management, order creation, order history

### Design
- Dark neon aesthetic (Premium Night Mode)
- Primary background: #0A0A0B, Cards: #161618, Brand red: #F43F5E
- Mobile-first with sticky header and bottom navigation on mobile
- Framer Motion animations

### Database Schema
- `menu_items` — Food items with category, pricing, badges
- `cart_items` — Session-based cart
- `orders` — Completed orders with JSONB items snapshot
- `bookings` — Lane reservations by date/time slot

### API Routes (all under `/api`)
- `GET /menu?category=` — Fetch menu items
- `GET /cart?sessionId=`, `POST /cart`, `DELETE /cart/:itemId` — Cart management
- `GET /orders?sessionId=`, `POST /orders` — Order operations
- `GET /bookings?date=`, `POST /bookings` — Lane bookings

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

### `artifacts/pizzastrike` (`@workspace/pizzastrike`)

React + Vite SPA at `/`. Uses:
- `@workspace/api-client-react` for generated React Query hooks
- `framer-motion` for animations
- `date-fns` for date manipulation
- `uuid` for session ID generation

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
