import { apiClient } from "./client";
import { HealthResponse } from "../types";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>("/health");
  return response.data;
}

export * from "./businesses";
export * from "./auth";
