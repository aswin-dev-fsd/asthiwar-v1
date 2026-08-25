import { z } from 'zod';

export const updatePackagePriceSchema = z.object({
  pricePerSqft: z.coerce.number().positive('Standard price per sqft must be positive'),
  volumePricePerSqft: z.coerce.number().positive('Volume price per sqft must be positive'),
  volumeDiscountThresholdSqft: z.coerce.number().int().positive().default(3500),
  headRoomPricePerSqft: z.coerce.number().nonnegative().optional(),
});

export const updatePackageMetadataSchema = z.object({
  name: z.string().min(2).optional(),
  tagline: z.string().min(2).optional(),
  description: z.string().optional(),
  colorTheme: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(2, 'City name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9_]+$/, 'Slug must be lowercase alphanumeric with underscores'),
  priceMultiplier: z.coerce.number().min(0.5).max(2.0, 'Multiplier must be between 0.5 and 2.0'),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateLocationSchema = z.object({
  name: z.string().min(2).optional(),
  priceMultiplier: z.coerce.number().min(0.5).max(2.0).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateAddonPriceSchema = z.object({
  variantSlug: z.string().min(1, 'Variant slug is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
});

export const updateAddonMetadataSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const updateOptionPriceSchema = z.object({
  priceDelta: z.coerce.number().min(0, 'Price delta must be non-negative'),
});

export const updatePackageItemSchema = z.object({
  isIncluded: z.boolean().optional(),
  additionalCostPrice: z.coerce.number().min(0).optional(),
  includedCoverage: z.string().optional().nullable(),
  defaultOptionId: z.coerce.number().int().optional().nullable(),
});

export type UpdatePackagePriceDto = z.infer<typeof updatePackagePriceSchema>;
export type UpdatePackageMetadataDto = z.infer<typeof updatePackageMetadataSchema>;
export type CreateLocationDto = z.infer<typeof createLocationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;
export type UpdateAddonPriceDto = z.infer<typeof updateAddonPriceSchema>;
export type UpdateAddonMetadataDto = z.infer<typeof updateAddonMetadataSchema>;
export type UpdateOptionPriceDto = z.infer<typeof updateOptionPriceSchema>;
export type UpdatePackageItemDto = z.infer<typeof updatePackageItemSchema>;
