import { apiClient } from "./client";
import { APIResponse } from "../types";

export interface GovernmentInitiative {
  initiative_code: string;
  name_en: string;
  name_hi: string;
  ministry_department: string;
  purpose_en: string;
  purpose_hi: string;
  target_beneficiary_en: string;
  target_beneficiary_hi: string;
  eligibility_summary_en: string;
  eligibility_summary_hi: string;
  digitalization_relevance_en: string;
  digitalization_relevance_hi: string;
  what_digimitra_helps_with_en: string;
  what_digimitra_helps_with_hi: string;
  application_route_en: string;
  application_route_hi: string;
  official_source_url: string;
  last_verified_date: string;
  verification_status: string;
  disclaimer: string;
}

export async function fetchGovernmentInitiatives(params?: {
  state?: string;
  sector?: string;
  business_size?: string;
  rbdl_level?: number;
}): Promise<GovernmentInitiative[]> {
  const queryParams: Record<string, string | number> = {};
  if (params?.state) queryParams.state = params.state;
  if (params?.sector) queryParams.sector = params.sector;
  if (params?.business_size) queryParams.business_size = params.business_size;
  if (params?.rbdl_level !== undefined) queryParams.rbdl_level = params.rbdl_level;

  const response = await apiClient.get<APIResponse<GovernmentInitiative[]>>(
    "/government/initiatives",
    { params: queryParams }
  );
  return response.data.data || [];
}

export async function fetchInitiativeByCode(code: string): Promise<GovernmentInitiative> {
  const response = await apiClient.get<APIResponse<GovernmentInitiative>>(
    `/government/initiatives/${code}`
  );
  if (response.data.data) {
    return response.data.data;
  }
  throw new Error("Initiative not found");
}
