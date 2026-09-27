/** Frontend Roadmap & Recommendations API Client (Claude C4). */
import { apiClient } from "./client";


export interface PriorityScoreBreakdown {
  impact_level: number;
  feasibility_level: number;
  cost_level: number;
  readiness_alignment: number;
  impact_component: number;
  feasibility_component: number;
  cost_component: number;
  readiness_component: number;
  final_priority_score: number;
}

export interface BusinessRecommendationItem {
  id: number;
  business_id: number;
  classification_result_id: number;
  recommendation_id: number;
  recommendation_code: string;
  dimension_code?: string;
  category?: string;
  target_rbdl_level: number;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  rank_order: number;
  priority_score?: number;
  impact_score?: number;
  feasibility_score?: number;
  cost_score?: number;
  readiness_score?: number;
  estimated_cost_level: string;
  estimated_effort_level: string;
  impact_level: string;
  reason_en?: string;
  reason_hi?: string;
  status: string;
  generated_at: string;
}

export interface RoadmapTaskItem {
  id: number;
  roadmap_id: number;
  recommendation_id?: number;
  recommendation_code?: string;
  title_en: string;
  title_hi: string;
  description_en?: string;
  description_hi?: string;
  phase_number: number;
  phase_name_en: string;
  phase_name_hi: string;
  sequence_order: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
  skip_reason?: string;
  due_date_estimate?: string;
  estimated_cost_level?: string;
  estimated_effort_level?: string;
  impact_level?: string;
  priority_score?: number;
  reason_en?: string;
  reason_hi?: string;
  created_at?: string;
}

export interface PhasedGroup {
  phase_number: number;
  phase_name_en: string;
  phase_name_hi: string;
  total_tasks: number;
  tasks: RoadmapTaskItem[];
}

export interface PhasedRoadmapData {
  id: number;
  business_id: number;
  classification_result_id: number;
  version: number;
  status: string;
  current_rbdl_level: number;
  target_rbdl_level: number;
  total_tasks: number;
  completed_tasks: number;
  phase_1: PhasedGroup;
  phase_2: PhasedGroup;
  phase_3: PhasedGroup;
  all_tasks: RoadmapTaskItem[];
  generated_at: string;
}

export interface RoadmapHistoryItem {
  id: number;
  business_id: number;
  version: number;
  status: string;
  total_tasks: number;
  completed_tasks: number;
  generated_at: string;
}

export const getActiveRoadmap = async (businessId: number): Promise<PhasedRoadmapData> => {
  const resp = await apiClient.get<{ success: boolean; data: PhasedRoadmapData }>(
    `/roadmap/business/${businessId}`
  );
  return resp.data.data;
};

export const getBusinessRecommendations = async (businessId: number) => {
  const resp = await apiClient.get<{
    success: boolean;
    data: {
      business_id: number;
      assessment_id: number;
      current_rbdl_level: number;
      target_rbdl_level: number;
      total_recommendations: number;
      recommendations: BusinessRecommendationItem[];
    };
  }>(`/recommendations/business/${businessId}`);
  return resp.data.data;
};

export const getRoadmapHistory = async (businessId: number): Promise<RoadmapHistoryItem[]> => {
  const resp = await apiClient.get<{ success: boolean; data: RoadmapHistoryItem[] }>(
    `/roadmap/business/${businessId}/history`
  );
  return resp.data.data;
};

export const updateRoadmapTaskStatus = async (
  taskId: number,
  status: "pending" | "in_progress" | "completed" | "skipped",
  skipReason?: string
): Promise<RoadmapTaskItem> => {
  const resp = await apiClient.patch<{ success: boolean; data: RoadmapTaskItem }>(
    `/roadmap/tasks/${taskId}/status`,
    {
      status,
      skip_reason: skipReason,
    }
  );
  return resp.data.data;
};
