# ASTHIWAR — Phase Walkthrough Reports

This document tracks the detailed implementation and verification report for each phase.

---

# Phase 1: Project Scaffolding & Architecture Foundation

**Status:** ✅ Completed & Verified

### 1. Implementation Summary
* **Monorepo Structure:** Configured root `package.json` with npm workspaces (`database`, `backend`).
* **Shared Config:** Created `tsconfig.base.json` with path aliases for `@asthiwar/database`, `.env.example`, and `.env`.
* **Database Layer (`database/`):**
  * Integrated **Drizzle ORM** with **`node-postgres`** (`pg`).
  * Automated SSL detection for **Neon PostgreSQL**.
  * Health verification utility (`testDatabaseConnection`) with latency tracking.
* **Backend API Layer (`backend/`):**
  * Built Express factory with `helmet`, `cors`, `cookie-parser`, `morgan`, and graceful shutdown handlers.
  * Zod environment validator (`backend/src/config/env.ts`).
  * Centralized error handler (`backend/src/middleware/errorHandler.ts`).
  * Request validation middleware (`backend/src/middleware/validate.ts`).
  * Health check route at `GET /api/v1/health`.

### 2. Verification Evidence
* `npm run check-types`: **0 Errors**.
* `npm run build`: **0 Errors** across all workspace packages.
* Health Check Execution: Verified graceful 503 response when database is unreachable and structured diagnostics.

---

# Phase 2: Database Schema & Migration Engine (Neon PostgreSQL)

**Status:** ✅ Completed & Verified

### 1. Implementation Summary
* **Schema Modules Designed & Implemented (`database/src/schema/`):**
  1. **`admin.ts`**: `admin_users` (UUID primary key, email, bcrypt hash, role, status) & `admin_sessions` (token, expiry, IP/UserAgent).
  2. **`locations.ts`**: `locations` (city name, slug, price multiplier, sort order, active flag).
  3. **`packages.ts`**: `packages` (4 tiers: Basic, Standard, Premium, Luxury) & `package_prices` (versioned base rates with standard <= 3,500 sq.ft & volume > 3,500 sq.ft rates, effective dates).
  4. **`specifications.ts`**:
     * `categories`: 10 structural & finishing categories.
     * `items`: Specification items with measurement units (`sqft`, `rft`, `fixed`).
     * `options`: Brand choices (e.g. TATA steel, Ultratech cement, Jaquar sanitaryware).
     * `package_items`: Package-level inclusion rules, default brand mappings, and explicit additional cost unit rates.
     * `option_prices`: Versioned price differentials for brand upgrades.
  5. **`addons.ts`**: `addons` (15 add-ons catalog) & `addon_prices` (multi-tier variants: Rs./Litre, Rs./rft, fixed capacity fees).
  6. **`estimates.ts`**: `estimates` (unique human-readable `EST-YYYY-XXXXXX`, customer details, project dimensions, total breakdown, immutable milestone & snapshot JSONs), `estimate_items` (brand customization records), and `estimate_addons` (addon selections).
  7. **`enquiries.ts`**: `enquiries` (consultation leads linked to estimates, status workflow `NEW` → `CONTACTED` → `CLOSED`).
* **Drizzle Migration Generator:** Configured `drizzle-kit generate` and created `database/drizzle/0000_cute_ma_gnuci.sql` with all 16 tables, foreign keys, and indexes.
* **Migration Runner Script:** Created `database/src/migrate.ts` for automated programmatic migration against Neon PostgreSQL.

### 2. Verification Evidence
* `drizzle-kit generate`: **16 tables successfully generated** with full schema constraints.
* Generated migration file: `database/drizzle/0000_cute_ma_gnuci.sql` (240 lines, 16 tables).
* `npm run check-types`: **0 Errors** across all packages.
* `npm run build`: **0 Errors** compiling all TypeScript code to `dist/`.

---

# Live Connection Test — Phase 1 + Phase 2 End-to-End

**Date:** 2026-08-18 23:10 IST
**Status:** ✅ Passed

**Setup:**
* `.env` configured with real Neon PostgreSQL credentials.
* Backend compiled to `dist/` and started via `node backend/dist/server.js`.

### Test Results

| Test | Method | Endpoint / Action | Result |
|---|---|---|---|
| Server Startup | — | `node backend/dist/server.js` | ✅ Running on port 4000 |
| Health Check | `GET` | `/api/v1/health` | ✅ HTTP 200 |
| Neon DB Connected | — | Reported by health check | ✅ `connected: true` |
| DB Latency | — | Reported by health check | ✅ 685ms (Neon AP Southeast cold start) |
| 404 Handler | `GET` | `/api/v1/some-invalid-route` | ✅ HTTP 404, structured JSON |

### Health Check Response (Actual Output)

```json
{
  "status": "healthy",
  "timestamp": "2026-08-18T17:40:53.772Z",
  "service": "asthiwar-backend",
  "version": "1.0.0",
  "database": {
    "provider": "Neon PostgreSQL (node-postgres)",
    "connected": true,
    "message": "Database connection healthy",
    "latencyMs": 685
  },
  "uptimeSeconds": 10
}
```

### 404 Handler Response (Actual Output)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Endpoint GET /api/v1/some-invalid-route not found"
  }
}
```

### Notes
* A `pg` library deprecation warning for SSL mode aliasing (`sslmode=require` treated as `verify-full`) is logged at startup. **Non-breaking.** Does not affect connectivity. Will resolve in `pg` v9.

---

# Phase 3: Master Data Seeding on Neon PostgreSQL

**Date:** 2026-08-18 23:19 IST
**Status:** ✅ Completed & Verified

### 1. Implementation Summary

**File created:** `database/src/seeds/seed.ts`

The seed script is fully idempotent — uses `ON CONFLICT DO NOTHING` on all slug-keyed tables. All data traces directly to approved source documents (`temp/asthiwar_requirements_and_packages.md`).

**Data seeded (6 sections, top-down dependency order):**

| # | Section | Rows |
|---|---|---|
| 1 | **Locations** | 6 |
| 2 | **Packages** | 4 |
| 3 | **Package Prices** (versioned, with volume thresholds) | 4 |
| 4 | **Categories** | 10 |
| 5 | **Items** (specification line items across 10 categories) | 49 |
| 6 | **Options** (brand choices per item) | 40 |
| 7 | **Package Items** (4 packages × 49 items = full mapping matrix with defaults & additional cost rates) | 192 |
| 8 | **Option Prices** (upgrade deltas: red brick, RCC basement) | 6 |
| 9 | **Add-Ons** (15 catalog items) | 15 |
| 10 | **Add-On Prices** (all variants: per_litre, per_rft, fixed) | 26 |
| 11 | **Admin User** (bcrypt-hashed, salt rounds = 12) | 1 |

**Total rows seeded: 353**

### 2. Prices Seeded — Package Matrix

| Package | Standard Rate (≤ 3,500 sq.ft) | Volume Rate (> 3,500 sq.ft) |
|---|---|---|
| Basic    | ₹ 2,099 / sq.ft | ₹ 2,000 / sq.ft |
| Standard | ₹ 2,468 / sq.ft | ₹ 2,357 / sq.ft |
| Premium  | ₹ 2,899 / sq.ft | ₹ 2,799 / sq.ft |
| Luxury   | ₹ 3,250 / sq.ft | ₹ 3,200 / sq.ft |

### 3. Key "Additional Cost" Rates Seeded

| Item | Basic | Standard | Premium | Luxury |
|---|---|---|---|---|
| Waterproofing | +₹10/sqft | Included | Included | Included |
| Furniture Layout | +₹4/sqft | +₹4/sqft | Included | Included |
| Structural Drawing | +₹6/sqft | Included | Included | Included |
| Soil Testing | +₹40/sqft | +₹40/sqft | Included | Included |
| Site Assessment | +₹10/sqft | +₹10/sqft | Included | Included |
| Electrical Drawings | +₹6/sqft | +₹6/sqft | Included | Included |
| Plumbing Drawings | +₹6/sqft | +₹6/sqft | Included | Included |
| Isometric Views | +₹8/sqft | +₹8/sqft | Included | Included |
| VR 3D | +₹40/sqft | +₹40/sqft | +₹40/sqft | Included |
| Architect Visit | +₹40/sqft | +₹40/sqft | Included | Included |
| Ceiling Fans | +₹50/sqft | +₹50/sqft | Included | Included |
| Roof Weathering | +₹80/sqft (<2000) | +₹70/sqft (<2000) | Included | Included |
| Lofts & Shelves | +₹12/sqft | +₹12/sqft | Included | Included |
| False Ceiling | +₹12/sqft | +₹12/sqft | Included | Included |
| Red Brick upgrade | +₹120/sqft | +₹100/sqft | +₹100/sqft | Included |
| RCC Basement upgrade | +₹40/sqft | +₹40/sqft | +₹40/sqft | Included |

### 4. Locations Seeded

| City | Slug | Price Multiplier |
|---|---|---|
| Coimbatore | coimbatore | 1.0000 |
| Pollachi   | pollachi   | 0.9600 |
| Tiruppur   | tiruppur   | 0.9800 |
| Erode      | erode      | 0.9800 |
| Chennai    | chennai    | 1.0500 |
| Other TN   | other_tn   | 0.9600 |

### 5. Verification Evidence — Live Row Counts from Neon

Verified via direct `SELECT COUNT(*)` queries post-seed:

```
locations            6
packages             4
package_prices       4
categories           10
items                49
options              40
package_items        192
option_prices        6
addons               15
addon_prices         26
admin_users          1
```

* `npm run check-types`: **0 Errors**
* `npm run db:migrate`: **Migrations applied successfully**
* `npm run db:seed`: **Exit code 0 — All 353 rows seeded**
* **Idempotency confirmed:** Re-running seed produces 0 new rows (ON CONFLICT DO NOTHING).

### 6. Notes

* **Waste Water Recycling Tank** (Add-On #15): Price seeded as ₹0.00. Source document states "Conditional on user input" — no fixed price exists. This is intentional per Rule 3: *Never invent missing prices.* Will be resolved as a custom quote item in the calculator.
* **Admin Password:** Default password used. Must set `ADMIN_SEED_PASSWORD` in `.env` before production deployment.
* **bcrypt** added to `@asthiwar/database` dependencies (salt rounds = 12).

---
