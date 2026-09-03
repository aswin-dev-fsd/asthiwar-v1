# Master Changelog & Feature Log
**Date:** 2026-09-03

This document details all Frontend, Backend, Database, Seed, PDF, and Admin changes implemented across the Asthiwar application on 2026-09-03.

---

## 1. Brand Customisation Per-Package Pricing Architecture & CRUD Fix

### Overview
Completely overhauled the brand customizations pricing model and CRUD pipeline in the Admin Portal. Previously, brand option prices only supported a single universal price delta, and price updates lacked package filtering, leading to data overwrites. The system now fully supports package-specific pricing (Standard, Premium, Luxury, Elite) alongside a Universal fallback.

### Database & Architecture Impact
- **Table:** `option_prices`
- **Integrity Verified:** Confirmed `option_prices.id` is not referenced by any foreign key. Past customer estimates store immutable JSON snapshots of pricing at calculation time, making clean-slate price set updates 100% safe.
- **Calculator Compatibility:** Confirmed the public calculator's left-join query on `option_prices` (`package_id = X OR package_id IS NULL`) automatically prioritizes package-specific rates and seamlessly falls back to Universal rates.

### Backend Changes
- **`admin-config.schema.ts`**:
  - Extended `createOptionSchema` and `updateOptionPriceSchema` to support a `prices` array:
    ```typescript
    prices: z.array(
      z.object({
        packageId: z.number().int().positive().nullable(),
        priceDelta: z.number().min(0),
      })
    ).optional()
    ```
  - Preserved optional `priceDelta` field for backwards compatibility.
- **`admin-config.service.ts`**:
  - `createAdminOption`: Batch inserts package-specific price rows or creates a single universal row (`packageId = null`).
  - `updateAdminOptionPrice`: Implemented a clean-slate transaction pattern that deletes existing `option_prices` records for the option and inserts the new batch of per-package prices.
- **`admin-config.controller.ts`**:
  - Updated `updateOptionPriceController` response messaging to reflect batch price updates.

### Frontend Changes
- **`adminApi.ts`**:
  - Updated TypeScript interfaces for `createAdminOption` and `updateAdminOptionPrice` to support `prices?: { packageId: number | null; priceDelta: number }[]`.
- **`AdminPricingConfigManager.tsx`**:
  - **State Refactor:**
    - `specEdit`: Refactored to `Record<number, { name: string; prices: Record<string, number> }>`.
    - `newOptPrices`: Refactored to `Record<string, string>` storing `{ universal: '...', [packageId]: '...' }`.
  - **Inline Editing Table:**
    - Expanded table layout from 3 columns to `col-span-4` (Brand/Option Name), `col-span-6` (Inline pricing grid), and `col-span-2` (Actions).
    - Rendered 5 inline inputs per brand option: **Universal**, **Standard**, **Premium**, **Luxury**, and **Elite**.
  - **Add Brand Option Modal:**
    - Replaced single delta input with a 5-field grid for Universal + 4 package tiers.
    - Added helper text: *"Leave package specific prices empty to fallback to Universal."*
  - **Validation:** Verified with `tsc --noEmit` with zero TypeScript errors.

---

## 2. 11 Standard Exclusions & Client Scope (Transparency & PDF Contract)

### Overview
Integrated the formal 11 Standard Construction Exclusions and Client-Scope items across both the client-facing Estimate Report (Step 5) and the downloadable formal PDF estimate summary.

### Frontend Changes (`Step5EstimateReport.tsx`)
- Added a dedicated **"Standard Exclusions & Client Scope"** card with badge and 2-column responsive layout outlining:
  1. **Elevation Work:** Custom architectural facade & exterior stone/HPL claddings beyond standard design.
  2. **Outer Area Development:** Setbacks, perimeter pavers, compound pathways & landscaping.
  3. **Interior Works & Carpentry:** Wardrobes, kitchen cabinets, modular woodwork & loose furniture.
  4. **Building Plan Sanction:** DTCP / Local body building plan approval & government liaison fees.
  5. **Electricity Board (EB):** Permanent line connection charges, meter deposit & statutory tariffs.
  6. **Gas Connection:** Piped gas line connection & municipal pipeline installation charges.
  7. **Water & Drainage (UGD):** Municipal drinking water & underground drainage connection fees.
  8. **Borewell Drilling:** Borewell drilling, PVC casing pipes & submersible pump depth piping.
  9. **Water Motors & Pumps:** Supply & installation of motors (unless chosen in Add-Ons).
  10. **Electrical Appliances:** TV, Refrigerator, Air Conditioners, Chimney, Hob & Geysers.
  11. **Taxes & Levies:** Vacant Land Tax (VLT), property assessment taxes & municipal duties.

### Backend PDF Engine (`pdf.service.ts`)
- Added a 2-column **STANDARD EXCLUSIONS & CLIENT SCOPE (Out of Scope for Civil Contract)** section positioned above the signature block.
- **PDF Layout Optimization & Ghost Page Fix:**
  - Set `doc.page.margins.bottom = 0` during footer rendering to eliminate PDFKit ghost page creation.
  - Adjusted milestone row height (17pt) and typography to ensure complete PDF estimates strictly format into clean 3-page quotation contracts.

---

## 3. Dynamic Add-On Rules & Calculator Clarifications

### Backend Calculator Engine (`calculator.service.ts`)
- Implemented dynamic package-level add-on rules for **Roof Weathering / Cool Roof Tiles**:
  - Automatically complimentary (₹0) for **Premium** and **Luxury** packages.
  - Automatically waived (₹0) for **Basic / Standard** packages when terrace quantity exceeds 2,000 sq.ft.

### Frontend Dimensions Note (`Step1Dimensions.tsx`)
- Added a clarifying microcopy note under **Car Parking Area (Sq.Ft)**:
  `Note: Only if parking is separate from the floor built-up area above.`

---

## 4. Package Tagline Cleanup & Master Data Seed

### Premium Package Tagline
- Updated the Premium package tagline from `"Best Value / Most Popular"` to `"Best Value"` across:
  - Master Seed (`database/src/seeds/seed.ts`)
  - Live Neon PostgreSQL Database (`packages` table)
  - Public Calculator UI (`Step3Packages.tsx`)

### Master Seed (`database/src/seeds/seed.ts`) Sync
- **Add-On Pricing Sync:**
  - Motor Automation: Bore Water OHT (₹12,000), Corporation Water OHT (₹12,000), Both (₹24,000).
  - Pressure Pump: 4 variants (₹57,500 to ₹1,07,000).
  - Water Softener: AO Smith (₹1,05,000).
- **Milestone Stages Seeding:**
  - `seedMilestones()` populating all 10 standard construction milestones with percentage shares and deliverables using `onConflictDoUpdate`.

---

## 5. Verification & Testing

- **TypeScript Typecheck (`npx tsc --noEmit`)**: Passed with 0 errors across frontend and backend.
- **Database Schema Validation**: Verified cascade constraints and query safety.
- **Admin Dashboard Integration**: Tested brand option creation, package-level editing, and deletion flows.
- **Live Servers**: Verified active development servers on ports 5173 / 3000 / 4000.
