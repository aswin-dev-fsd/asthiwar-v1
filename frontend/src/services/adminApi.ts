const API_BASE = '/api/v1/admin';

async function adminFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}

async function handleAdminResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || !json.success) {
    const message = json?.error?.message || 'An administrative error occurred';
    throw new Error(message);
  }
  return json.data;
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
export async function adminLogin(payload: { email: string; password: string }) {
  const res = await adminFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse<{
    user: { id: string; email: string; fullName: string; role: string };
    token: string;
  }>(res);
}

export async function adminGetMe() {
  const res = await adminFetch(`${API_BASE}/auth/me`);
  const data = await handleAdminResponse<{
    user: { id: string; email: string; fullName: string; role: string };
  }>(res);
  return data.user;
}

export async function adminLogout() {
  const res = await adminFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  return handleAdminResponse<{ message: string }>(res);
}

// ----------------------------------------------------
// DASHBOARD ANALYTICS
// ----------------------------------------------------
export async function getDashboardAnalytics() {
  const res = await adminFetch(`${API_BASE}/analytics/dashboard`);
  return handleAdminResponse<{
    kpis?: {
      totalEstimates: number;
      totalEnquiries: number;
      newEnquiriesCount: number;
      totalPipelineValue: number;
      avgProjectValue: number;
    };
    metrics?: {
      totalEstimates: number;
      totalEnquiries: number;
      newEnquiriesCount: number;
      totalPipelineValue: number;
      averageEstimateValue: number;
    };
    recentEnquiries: any[];
    estimatesByPackage: Array<{ packageSlug: string; count: number; totalValue: number }>;
  }>(res);
}

// ----------------------------------------------------
// ENQUIRIES & LEADS MANAGEMENT
// ----------------------------------------------------
export async function getAdminEnquiries(params: {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await adminFetch(`${API_BASE}/enquiries?${query.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json?.error?.message || 'Failed to fetch enquiries');
  return { items: json.data, pagination: json.pagination };
}

export async function updateAdminEnquiry(id: string, payload: {
  status?: string;
  priority?: string;
  internalNotes?: string;
}) {
  const res = await adminFetch(`${API_BASE}/enquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function triggerLeadAlert(enquiryId: string) {
  const res = await adminFetch(`${API_BASE}/enquiries/${enquiryId}/notify`, {
    method: 'POST',
  });
  return handleAdminResponse(res);
}

// ----------------------------------------------------
// ESTIMATES EXPLORER
// ----------------------------------------------------
export async function getAdminEstimates(params: {
  packageSlug?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.packageSlug) query.set('packageSlug', params.packageSlug);
  if (params.search) query.set('search', params.search);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await adminFetch(`${API_BASE}/estimates?${query.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json?.error?.message || 'Failed to fetch estimates');
  return { items: json.data, pagination: json.pagination };
}

export async function getAdminEstimateById(id: string) {
  const res = await adminFetch(`${API_BASE}/estimates/${id}`);
  return handleAdminResponse(res);
}

export async function triggerEstimateQuotation(estimateId: string, channels: string[] = ['EMAIL', 'WHATSAPP']) {
  const res = await adminFetch(`${API_BASE}/estimates/${estimateId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channels }),
  });
  return handleAdminResponse(res);
}

// ----------------------------------------------------
// PRICING & MATRIX CONFIGURATION
// ----------------------------------------------------
export async function getAdminPackageConfigs() {
  const res = await adminFetch(`${API_BASE}/config/packages`);
  return handleAdminResponse<any[]>(res);
}

export async function updatePackagePrices(packageIdOrSlug: number | string, payload: {
  pricePerSqft?: number;
  standardPricePerSqft?: number;
  volumePricePerSqft?: number;
  volumeDiscountThresholdSqft?: number;
  changeReason?: string;
}) {
  const stdPrice = payload.standardPricePerSqft ?? payload.pricePerSqft ?? 0;
  const volPrice = payload.volumePricePerSqft ?? 0;
  const res = await adminFetch(`${API_BASE}/config/packages/${packageIdOrSlug}/price`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pricePerSqft: stdPrice,
      volumePricePerSqft: volPrice,
      volumeDiscountThresholdSqft: payload.volumeDiscountThresholdSqft ?? 3500,
      changeReason: payload.changeReason,
    }),
  });
  return handleAdminResponse(res);
}

export async function getAdminAddonConfigs() {
  const res = await adminFetch(`${API_BASE}/config/addons`);
  return handleAdminResponse<any[]>(res);
}

export async function updateAddonVariantPrice(
  addonIdOrSlug: number | string,
  variantSlug: string,
  payload: { price: number; changeReason?: string; packageTier?: string }
) {
  const res = await adminFetch(`${API_BASE}/config/addons/${addonIdOrSlug}/price`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variantSlug,
      packageTier: payload.packageTier || 'all',
      price: payload.price,
      changeReason: payload.changeReason,
    }),
  });
  return handleAdminResponse(res);
}

export async function getAdminLocationConfigs() {
  const res = await adminFetch(`${API_BASE}/config/locations`);
  return handleAdminResponse<any[]>(res);
}

export async function createAdminLocation(payload: {
  name: string;
  slug: string;
  priceMultiplier: number | string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const res = await adminFetch(`${API_BASE}/config/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function updateLocationMultiplier(
  id: number,
  payload: { priceMultiplier: string | number; isActive?: boolean }
) {
  const res = await adminFetch(`${API_BASE}/config/locations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function deleteAdminLocation(id: number) {
  const res = await adminFetch(`${API_BASE}/config/locations/${id}`, {
    method: 'DELETE',
  });
  return handleAdminResponse(res);
}

export async function getAdminMilestoneConfigs() {
  const res = await adminFetch(`${API_BASE}/config/milestones`);
  return handleAdminResponse<any[]>(res);
}

export async function updateAdminMilestones(milestones: Array<{
  id?: number;
  stageNumber: number;
  stageName: string;
  percentage: number;
  keyDeliverables: string;
  isActive?: boolean;
}>) {
  const res = await adminFetch(`${API_BASE}/config/milestones`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ milestones }),
  });
  return handleAdminResponse(res);
}

export async function getAdminSpecificationConfigs() {
  const res = await adminFetch(`${API_BASE}/config/specifications`);
  return handleAdminResponse<any[]>(res);
}

export async function createAdminOption(payload: {
  itemId: number;
  name: string;
  slug: string;
  description?: string;
  priceDelta?: number;
  prices?: { packageId: number | null; priceDelta: number }[];
}) {
  const res = await adminFetch(`${API_BASE}/config/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function updateAdminOptionPrice(
  optionId: number,
  payload: { name?: string; priceDelta?: number; prices?: { packageId: number | null; priceDelta: number }[] }
) {
  const res = await adminFetch(`${API_BASE}/config/options/${optionId}/price`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function deleteAdminOption(optionId: number) {
  const res = await adminFetch(`${API_BASE}/config/options/${optionId}`, {
    method: 'DELETE',
  });
  return handleAdminResponse(res);
}

