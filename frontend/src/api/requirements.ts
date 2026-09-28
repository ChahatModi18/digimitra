/**
 * Business Requirement Profile and Taxonomies API Client (Research Instrument V1).
 */

import { apiClient } from "./client";
import { APIResponse } from "../types";


export interface RequirementTaxonomies {
  framework_version: string;
  requirement_profile_version: number;
  research_status_disclosure: string;
  business_goals: Record<
    string,
    {
      code: string;
      name_en: string;
      name_hi: string;
      description_en: string;
      description_hi: string;
      primary_dimensions: string[];
    }
  >;
  pain_points: Record<
    string,
    {
      code: string;
      name_en: string;
      name_hi: string;
      target_dimension: string;
      secondary_dimension?: string | null;
    }
  >;
  urgency_tiers: Record<
    string,
    {
      code: string;
      level: number;
      name_en: string;
      name_hi: string;
      description_en: string;
      description_hi: string;
    }
  >;
  budget_tiers: Record<
    string,
    {
      code: string;
      tier_level: number;
      name_en: string;
      name_hi: string;
      description_en: string;
      description_hi: string;
      illustrative_range: string;
      compatible_cost_levels: string[];
    }
  >;
  existing_tools: Record<
    string,
    {
      code: string;
      name_en: string;
      name_hi: string;
      related_rec_codes: string[];
    }
  >;
}

export interface BusinessRequirementProfile {
  id?: number;
  assessment_id: number;
  business_id?: number;
  profile_version?: number;
  business_goal: string;
  primary_pain_point: string;
  urgency: string;
  budget_tier: string;
  existing_tools?: string[];
  preferred_solution_type?: string;
  created_at?: string;
}

export const fetchRequirementTaxonomies = async (): Promise<APIResponse<RequirementTaxonomies>> => {
  const response = await apiClient.get<APIResponse<RequirementTaxonomies>>("/requirements/taxonomies");
  return response.data;
};

export const saveRequirementProfile = async (
  payload: BusinessRequirementProfile
): Promise<APIResponse<BusinessRequirementProfile>> => {
  const response = await apiClient.post<APIResponse<BusinessRequirementProfile>>(
    "/requirements/profile",
    payload
  );
  return response.data;
};

export const fetchRequirementProfile = async (
  assessmentId: number
): Promise<APIResponse<BusinessRequirementProfile | null>> => {
  const response = await apiClient.get<APIResponse<BusinessRequirementProfile | null>>(
    `/requirements/profile/${assessmentId}`
  );
  return response.data;
};
