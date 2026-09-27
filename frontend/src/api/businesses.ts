import { apiClient } from "./client";
import { ensureAuthenticatedSession } from "./auth";
import { APIResponse, Business } from "../types";

export interface CreateBusinessPayload {
  name: string;
  sector: string;
  enterprise_size: "Micro" | "Small" | "Medium";
  state: string;
  city: string;
  pincode?: string;
  description?: string;
  primary_language: string;
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
