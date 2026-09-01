# Changelog: Volume Discount Threshold Feature
**Date:** 2026-09-01

This document outlines the changes made to make the volume discount threshold (previously hardcoded at 3,500 sq.ft) editable within the Asthiwar application.

## Overview
The requirement was to allow administrators to edit the volume discount threshold for each package independently, instead of relying on a hardcoded 3,500 sq.ft limit.

## 1. Database (DB) Changes
**Status:** No changes required.
**Details:**
The database schema was already designed to support dynamic thresholds. 
- The `packages` table in `database/src/schema/packages.ts` includes the `volumeDiscountThresholdSqft` column (defined as an integer with a default of 3500).
- Seed scripts also already populate this field.

## 2. Backend Changes
**Status:** No changes required.
**Details:**
The backend API and services were already capable of processing custom thresholds.
- The Admin Configuration API (`admin-config.schema.ts` and `admin-config.controller.ts`) exposes `volumeDiscountThresholdSqft` in the update payload.
- The Calculator service (`calculator.service.ts`) fetches and applies `volumeDiscountThresholdSqft` dynamically during calculations.

## 3. Frontend Changes
**Status:** Completed.
**Details:**
The frontend was updated to expose the existing backend field in the Admin UI.

**Modified File:** `frontend/src/components/admin/AdminPricingConfigManager.tsx`
- **State Expansion:** The `pkgEdit` state was expanded to track the `threshold` value alongside the standard and volume rates.
- **Data Initialization:** Updated `fetchConfigs()` to pull the `volumeDiscountThresholdSqft` from the backend upon loading the pricing matrix.
- **Save Payload:** Updated `handleSavePackage()` to pass `volumeDiscountThresholdSqft` in the API request to `updatePackagePrices`.
- **UI Improvements:** 
  - Converted the pricing edit grid from 2 columns (`grid-cols-2`) to 3 columns (`grid-cols-1 sm:grid-cols-3`).
  - Added a new number input field for **"Volume Threshold"** with `sqft` unit badge.
  - Standardized label heights (`h-9 flex flex-col justify-end`) to ensure all 3 input fields align horizontally across cards.
  - Increased left padding on currency inputs to prevent the `₹` symbol from overlapping the number.
  - Updated the "Standard Rate" and "Volume Rate" input labels to dynamically display the currently set threshold (e.g., `Volume Rate (> {edit.threshold} sq.ft)`) with structured subtitle badges.

**Note on Calculator Flow:**
The customer-facing calculator (`Step3Packages.tsx`) was already programmed to read the dynamic threshold (`pkg.volumeDiscountThresholdSqft`), meaning no further changes were required there. Updates made in the Admin UI will immediately reflect on the customer calculator.
