export interface Location {
  id: number;
  name: string;
  slug: string;
  priceMultiplier: string | number;
  sortOrder: number;
}

export interface Package {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  colorTheme: string;
  standardPricePerSqft?: number;
  volumePricePerSqft?: number;
  volumeDiscountThresholdSqft?: number;
  pricing?: {
    standardRatePerSqft: number;
    volumeDiscountThresholdSqft: number;
    volumeRatePerSqft: number;
  };
}

export interface BrandOption {
  id: number;
  slug: string;
  brandName: string;
  specification?: string;
  isDefault?: boolean;
  isPackageDefault?: boolean;
  priceDelta: number;
  priceType: string;
}

export interface SpecificationItem {
  id: number;
  slug: string;
  name: string;
  description?: string;
  unit: string;
  isCustomizable: boolean;
  isIncluded: boolean;
  additionalCostPrice: number;
  includedCoverage: string | null;
  defaultOptionId: number | null;
  options: BrandOption[];
}

export interface SpecificationCategory {
  id: number;
  slug: string;
  name: string;
  items: SpecificationItem[];
}

export interface AddonVariant {
  id?: number;
  variantSlug: string;
  variantName: string;
  packageTier: string;
  price: number;
}

export interface AddonItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  pricingUnit: string;
  defaultQuantity: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  variants: AddonVariant[];
}

export interface PackageConfigResponse {
  package?: {
    id: number;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    colorTheme: string;
  };
  packageSlug?: string;
  packageName?: string;
  standardPricePerSqft?: number;
  volumePricePerSqft?: number;
  specifications: SpecificationCategory[];
  addons: AddonItem[];
}

export interface MilestoneStage {
  stage?: number;
  stageNumber?: number;
  name?: string;
  stageName?: string;
  percentage: number;
  amount: number;
  keyDeliverables?: string;
}

export interface CalculationBreakdown {
  totalBuiltupAreaSqft?: number;
  isVolumeRateApplied?: boolean;
  basePackageRate?: number;
  locationMultiplier?: number;
  effectiveRatePerSqft?: number;
  baseConstructionCost: number;
  upgradesCost: number;
  addonsCost: number;
  subtotalCost: number;
  gstPercentage?: number;
  gstAmount: number;
  totalProjectCost: number;
  effectiveTotalCostPerSqft?: number;
}

export interface CalculationResult {
  estimateId?: string;
  estimateNumber?: string;
  customer?: {
    name: string;
    phone: string;
    email: string;
    location: string;
  };
  dimensions?: {
    plotAreaSqft: number;
    plotAreaUnit: string;
    builtupAreaPerFloorSqft: number;
    floorCount: string;
    numberOfFloors: number;
    carParkingAreaSqft: number;
    carCount: number;
    totalBuiltupAreaSqft: number;
  };
  package?: {
    id: number;
    slug: string;
    name: string;
    tagline: string;
    baseRatePerSqft: number;
    effectiveRatePerSqft: number;
    isVolumeRateApplied: boolean;
    locationMultiplier: number;
    locationName: string;
  };
  breakdown: CalculationBreakdown;
  duration?: {
    estimatedMonthsRange: string;
    minMonths: number;
    maxMonths: number;
  };
  milestones: MilestoneStage[];
  customizations?: Array<any>;
  addons?: Array<any>;
  disclaimers?: string[];
  customizationsSummary?: Array<{
    category: string;
    item: string;
    brand: string;
    cost: number;
  }>;
  addonsSummary?: Array<{
    name: string;
    variant: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
}

export interface EstimateFormState {
  // Step 0: Lead Info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  plotLocation: string;

  // Step 1: Dimensions
  plotArea: number;
  plotAreaUnit: 'sqft' | 'cents' | 'sqyards';
  builtupAreaPerFloor: number;
  carParkingAreaSqft: number;
  carCount: number;

  // Step 2: Floors
  floorCount: 'Ground' | 'G+1' | 'G+2' | 'G+3';

  // Step 3: Package
  packageSlug: 'basic' | 'standard' | 'premium' | 'luxury';

  // Step 4: Customizations & Add-Ons
  customizations: Array<{ itemSlug: string; optionSlug: string }>;
  addons: Array<{ addonSlug: string; variantSlug: string; quantity?: number }>;
}
