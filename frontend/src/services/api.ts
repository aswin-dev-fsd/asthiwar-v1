import {
  Location,
  Package,
  PackageConfigResponse,
  CalculationResult,
  EstimateFormState,
} from '../types';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || !json.success) {
    const message = json?.error?.message || 'An unexpected error occurred';
    throw new Error(message);
  }
  return json.data;
}

export async function getLocations(): Promise<Location[]> {
  const res = await fetch(`${API_BASE}/calculator/locations`);
  return handleResponse<Location[]>(res);
}

export async function getPackages(): Promise<Package[]> {
  const res = await fetch(`${API_BASE}/calculator/packages`);
  return handleResponse<Package[]>(res);
}

export async function getPackageConfig(packageSlug: string): Promise<PackageConfigResponse> {
  const res = await fetch(`${API_BASE}/calculator/config/${packageSlug}`);
  return handleResponse<PackageConfigResponse>(res);
}

export async function calculatePreview(payload: Partial<EstimateFormState>): Promise<CalculationResult> {
  const res = await fetch(`${API_BASE}/calculator/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<CalculationResult>(res);
}

export async function createAuthoritativeEstimate(payload: EstimateFormState): Promise<CalculationResult> {
  const res = await fetch(`${API_BASE}/calculator/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<CalculationResult>(res);
}

export async function getEstimateSnapshot(estimateNumber: string): Promise<CalculationResult> {
  const res = await fetch(`${API_BASE}/calculator/estimate/${estimateNumber}`);
  return handleResponse<CalculationResult>(res);
}

export async function submitEnquiry(payload: {
  fullName: string;
  phone: string;
  email: string;
  plotLocation: string;
  estimateNumber?: string;
  preferredContactTime?: string;
  requirementNotes?: string;
}) {
  const res = await fetch(`${API_BASE}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
