const API_BASE = '/api/v1/admin';

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
  const res = await fetch(`${API_BASE}/auth/login`, {
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
  const res = await fetch(`${API_BASE}/auth/me`);
  return handleAdminResponse<{
    id: string;
    email: string;
    fullName: string;
    role: string;
  }>(res);
}

export async function adminLogout() {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  return handleAdminResponse<{ message: string }>(res);
}

// ----------------------------------------------------
// DASHBOARD ANALYTICS
// ----------------------------------------------------
export async function getDashboardAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  return handleAdminResponse<{
    metrics: {
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
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/enquiries?${query.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json?.error?.message || 'Failed to fetch enquiries');
  return { items: json.data, pagination: json.pagination };
}

export async function updateAdminEnquiry(id: string, payload: {
  status?: string;
  priority?: string;
  internalNotes?: string;
}) {
  const res = await fetch(`${API_BASE}/enquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function triggerLeadAlert(enquiryId: string) {
  const res = await fetch(`${API_BASE}/enquiries/${enquiryId}/notify`, {
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
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.packageSlug) query.set('packageSlug', params.packageSlug);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/estimates?${query.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json?.error?.message || 'Failed to fetch estimates');
  return { items: json.data, pagination: json.pagination };
}

export async function getAdminEstimateById(id: string) {
  const res = await fetch(`${API_BASE}/estimates/${id}`);
  return handleAdminResponse(res);
}

export async function triggerEstimateQuotation(estimateId: string, channels: string[] = ['EMAIL', 'WHATSAPP']) {
  const res = await fetch(`${API_BASE}/estimates/${estimateId}/notify`, {
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
  const res = await fetch(`${API_BASE}/config/packages`);
  return handleAdminResponse<any[]>(res);
}

export async function updatePackagePrices(packageSlug: string, payload: {
  standardPricePerSqft: number;
  volumePricePerSqft: number;
  changeReason: string;
}) {
  const res = await fetch(`${API_BASE}/config/packages/${packageSlug}/prices`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function getAdminAddonConfigs() {
  const res = await fetch(`${API_BASE}/config/addons`);
  return handleAdminResponse<any[]>(res);
}

export async function updateAddonVariantPrice(
  addonSlug: string,
  variantSlug: string,
  payload: { price: number; changeReason: string }
) {
  const res = await fetch(`${API_BASE}/config/addons/${addonSlug}/variants/${variantSlug}/price`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}

export async function getAdminLocationConfigs() {
  const res = await fetch(`${API_BASE}/config/locations`);
  return handleAdminResponse<any[]>(res);
}

export async function updateLocationMultiplier(
  id: number,
  payload: { priceMultiplier: string; isActive?: boolean }
) {
  const res = await fetch(`${API_BASE}/config/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleAdminResponse(res);
}
