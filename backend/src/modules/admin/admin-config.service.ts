import {
  db,
  schema,
  eq,
  and,
  isNull,
  desc,
  asc,
} from '@asthiwar/database';
import {
  UpdatePackagePriceDto,
  UpdatePackageMetadataDto,
  CreateLocationDto,
  UpdateLocationDto,
  UpdateAddonPriceDto,
  UpdateAddonMetadataDto,
  UpdateOptionPriceDto,
  UpdatePackageItemDto,
} from './admin-config.schema.js';
import { AdminServiceError } from './admin.service.js';

// ----------------------------------------------------
// 1. PACKAGES CONFIGURATION & PRICE VERSIONING
// ----------------------------------------------------

export async function getAdminPackages() {
  const allPackages = await db
    .select()
    .from(schema.packages)
    .orderBy(asc(schema.packages.sortOrder));

  const allPrices = await db
    .select()
    .from(schema.packagePrices)
    .orderBy(desc(schema.packagePrices.effectiveFrom));

  return allPackages.map((pkg) => {
    const pkgPrices = allPrices.filter((p) => p.packageId === pkg.id);
    const activePrice = pkgPrices.find((p) => !p.effectiveTo) || pkgPrices[0] || null;
    return {
      ...pkg,
      activePrice,
      priceHistory: pkgPrices,
    };
  });
}

export async function updateAdminPackagePrice(packageId: number, dto: UpdatePackagePriceDto) {
  const pkg = await db.query.packages.findFirst({
    where: eq(schema.packages.id, packageId),
  });

  if (!pkg) {
    throw new AdminServiceError(404, 'PACKAGE_NOT_FOUND', `Package with ID ${packageId} not found`);
  }

  const now = new Date();

  // 1. Invalidate current active price by setting effectiveTo
  await db
    .update(schema.packagePrices)
    .set({ effectiveTo: now })
    .where(
      and(
        eq(schema.packagePrices.packageId, packageId),
        isNull(schema.packagePrices.effectiveTo)
      )
    );

  // 2. Insert new versioned price record
  const [newPrice] = await db
    .insert(schema.packagePrices)
    .values({
      packageId,
      pricePerSqft: dto.pricePerSqft.toFixed(2),
      volumePricePerSqft: dto.volumePricePerSqft.toFixed(2),
      volumeDiscountThresholdSqft: dto.volumeDiscountThresholdSqft,
      effectiveFrom: now,
      effectiveTo: null,
    })
    .returning();

  return newPrice;
}

export async function updateAdminPackageMetadata(packageId: number, dto: UpdatePackageMetadataDto) {
  const pkg = await db.query.packages.findFirst({
    where: eq(schema.packages.id, packageId),
  });

  if (!pkg) {
    throw new AdminServiceError(404, 'PACKAGE_NOT_FOUND', `Package with ID ${packageId} not found`);
  }

  const [updated] = await db
    .update(schema.packages)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.tagline !== undefined && { tagline: dto.tagline }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.colorTheme !== undefined && { colorTheme: dto.colorTheme }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      updatedAt: new Date(),
    })
    .where(eq(schema.packages.id, packageId))
    .returning();

  return updated;
}

// ----------------------------------------------------
// 2. LOCATIONS CONFIGURATION
// ----------------------------------------------------

export async function getAdminLocations() {
  return db
    .select()
    .from(schema.locations)
    .orderBy(asc(schema.locations.sortOrder));
}

export async function createAdminLocation(dto: CreateLocationDto) {
  const existing = await db.query.locations.findFirst({
    where: eq(schema.locations.slug, dto.slug),
  });

  if (existing) {
    throw new AdminServiceError(409, 'LOCATION_ALREADY_EXISTS', `Location slug '${dto.slug}' already exists`);
  }

  const [created] = await db
    .insert(schema.locations)
    .values({
      name: dto.name,
      slug: dto.slug,
      priceMultiplier: dto.priceMultiplier.toFixed(4),
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    })
    .returning();

  return created;
}

export async function updateAdminLocation(locationId: number, dto: UpdateLocationDto) {
  const existing = await db.query.locations.findFirst({
    where: eq(schema.locations.id, locationId),
  });

  if (!existing) {
    throw new AdminServiceError(404, 'LOCATION_NOT_FOUND', `Location with ID ${locationId} not found`);
  }

  const [updated] = await db
    .update(schema.locations)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.priceMultiplier !== undefined && { priceMultiplier: dto.priceMultiplier.toFixed(4) }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(schema.locations.id, locationId))
    .returning();

  return updated;
}

// ----------------------------------------------------
// 3. ADDONS CONFIGURATION & PRICE VERSIONING
// ----------------------------------------------------

export async function getAdminAddons() {
  const allAddons = await db
    .select()
    .from(schema.addons)
    .orderBy(asc(schema.addons.sortOrder));

  const allPrices = await db
    .select()
    .from(schema.addonPrices)
    .orderBy(desc(schema.addonPrices.effectiveFrom));

  return allAddons.map((addon) => {
    const addonPricesList = allPrices.filter((p) => p.addonId === addon.id);
    const activePrices = addonPricesList.filter((p) => !p.effectiveTo);
    return {
      ...addon,
      activePrices,
      allPriceHistory: addonPricesList,
    };
  });
}

export async function updateAdminAddonPrice(addonId: number, dto: UpdateAddonPriceDto) {
  const addon = await db.query.addons.findFirst({
    where: eq(schema.addons.id, addonId),
  });

  if (!addon) {
    throw new AdminServiceError(404, 'ADDON_NOT_FOUND', `Addon with ID ${addonId} not found`);
  }

  const existingVariant = await db.query.addonPrices.findFirst({
    where: and(
      eq(schema.addonPrices.addonId, addonId),
      eq(schema.addonPrices.variantSlug, dto.variantSlug)
    ),
    orderBy: desc(schema.addonPrices.effectiveFrom),
  });

  const now = new Date();

  // 1. Invalidate current active variant price
  await db
    .update(schema.addonPrices)
    .set({ effectiveTo: now })
    .where(
      and(
        eq(schema.addonPrices.addonId, addonId),
        eq(schema.addonPrices.variantSlug, dto.variantSlug),
        isNull(schema.addonPrices.effectiveTo)
      )
    );

  // 2. Insert new versioned price
  const [newPrice] = await db
    .insert(schema.addonPrices)
    .values({
      addonId,
      variantSlug: dto.variantSlug,
      variantName: existingVariant?.variantName || dto.variantSlug,
      packageTier: existingVariant?.packageTier || 'all',
      price: dto.price.toFixed(2),
      effectiveFrom: now,
      effectiveTo: null,
    })
    .returning();

  return newPrice;
}

export async function updateAdminAddonMetadata(addonId: number, dto: UpdateAddonMetadataDto) {
  const addon = await db.query.addons.findFirst({
    where: eq(schema.addons.id, addonId),
  });

  if (!addon) {
    throw new AdminServiceError(404, 'ADDON_NOT_FOUND', `Addon with ID ${addonId} not found`);
  }

  const [updated] = await db
    .update(schema.addons)
    .set({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      updatedAt: new Date(),
    })
    .where(eq(schema.addons.id, addonId))
    .returning();

  return updated;
}

// ----------------------------------------------------
// 4. SPECIFICATIONS & OPTION PRICING
// ----------------------------------------------------

export async function getAdminSpecifications() {
  const categoriesList = await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder));

  const itemsList = await db
    .select()
    .from(schema.items)
    .orderBy(asc(schema.items.sortOrder));

  const optionsList = await db
    .select()
    .from(schema.options);

  const optionPricesList = await db
    .select()
    .from(schema.optionPrices)
    .orderBy(desc(schema.optionPrices.effectiveFrom));

  const packageItemsList = await db
    .select()
    .from(schema.packageItems);

  return categoriesList.map((cat) => {
    const catItems = itemsList
      .filter((item) => item.categoryId === cat.id)
      .map((item) => {
        const itemOptions = optionsList
          .filter((opt) => opt.itemId === item.id)
          .map((opt) => ({
            ...opt,
            prices: optionPricesList.filter((p) => p.optionId === opt.id),
            activePrice: optionPricesList.find((p) => p.optionId === opt.id && !p.effectiveTo) || null,
          }));

        const itemPackageMappings = packageItemsList.filter((pi) => pi.itemId === item.id);

        return {
          ...item,
          options: itemOptions,
          packageMappings: itemPackageMappings,
        };
      });

    return {
      ...cat,
      items: catItems,
    };
  });
}

export async function updateAdminOptionPrice(optionId: number, dto: UpdateOptionPriceDto) {
  const option = await db.query.options.findFirst({
    where: eq(schema.options.id, optionId),
  });

  if (!option) {
    throw new AdminServiceError(404, 'OPTION_NOT_FOUND', `Option with ID ${optionId} not found`);
  }

  const now = new Date();

  // Invalidate old active option price
  await db
    .update(schema.optionPrices)
    .set({ effectiveTo: now })
    .where(
      and(
        eq(schema.optionPrices.optionId, optionId),
        isNull(schema.optionPrices.effectiveTo)
      )
    );

  // Insert new versioned option price
  const [newPrice] = await db
    .insert(schema.optionPrices)
    .values({
      optionId,
      priceDelta: dto.priceDelta.toFixed(2),
      effectiveFrom: now,
      effectiveTo: null,
    })
    .returning();

  return newPrice;
}

export async function updateAdminPackageItem(packageItemId: number, dto: UpdatePackageItemDto) {
  const item = await db.query.packageItems.findFirst({
    where: eq(schema.packageItems.id, packageItemId),
  });

  if (!item) {
    throw new AdminServiceError(404, 'PACKAGE_ITEM_NOT_FOUND', `Package item with ID ${packageItemId} not found`);
  }

  const [updated] = await db
    .update(schema.packageItems)
    .set({
      ...(dto.isIncluded !== undefined && { isIncluded: dto.isIncluded }),
      ...(dto.additionalCostPrice !== undefined && { additionalCostPrice: dto.additionalCostPrice.toFixed(2) }),
      ...(dto.includedCoverage !== undefined && { includedCoverage: dto.includedCoverage }),
      ...(dto.defaultOptionId !== undefined && { defaultOptionId: dto.defaultOptionId }),
    })
    .where(eq(schema.packageItems.id, packageItemId))
    .returning();

  return updated;
}
