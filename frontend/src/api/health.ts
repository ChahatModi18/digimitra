import { apiClient } from "./client";
import { APIResponse, Business, HealthResponse } from "../types";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>("/health");
  return response.data;
}

export async function fetchBusinesses(): Promise<Business[]> {
  const response = await apiClient.get<APIResponse<Business[]>>("/businesses");
  return response.data.data || [];
}

export async function createBusiness(payload: Partial<Business>): Promise<Business> {
  const response = await apiClient.post<APIResponse<Business>>("/businesses", payload);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to create business");
  }
  return response.data.data;
}
