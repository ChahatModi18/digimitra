import { apiClient } from "./client";
import { ensureAuthenticatedSession } from "./auth";
import { APIResponse, Business } from "../types";

export interface CreateBusinessPayload {
  name: string;
  sector: string;
  business_type?: string;
  sub_category?: string;
  owner_name?: string;
  year_established?: number;
  years_in_operation?: number;
  enterprise_size: "Micro" | "Small" | "Medium";
  employee_count?: number;
  state: string;
  city: string;
  area_locality?: string;
  business_address?: string;
  pincode?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  primary_language: string;
  additional_language?: string;
  business_model?: string;
  target_customers?: string;
  monthly_revenue?: string;
  digitalization_goal?: string;
  description?: string;
}

export async function createBusiness(payload: CreateBusinessPayload): Promise<Business> {
  await ensureAuthenticatedSession();
  const response = await apiClient.post<APIResponse<Business>>("/businesses", payload);
  if (response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Failed to register business");
}

export async function fetchBusinesses(): Promise<Business[]> {
  await ensureAuthenticatedSession();
  const response = await apiClient.get<APIResponse<Business[]>>("/businesses");
  return response.data.data || [];
}

export async function fetchBusinessById(id: number): Promise<Business> {
  await ensureAuthenticatedSession();
  const response = await apiClient.get<APIResponse<Business>>(`/businesses/${id}`);
  if (response.data.data) {
    return response.data.data;
  }
  throw new Error("Business not found");
}
