/**
 * Frontend TypeScript Type Definitions
 */

export interface ComponentStatus {
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, any>;
}

export interface SystemInfo {
  python_version: string;
  platform: string;
  framework: string;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  components: Record<string, ComponentStatus>;
  system_info: SystemInfo;
}

export interface Business {
  id: number;
  name: string;
  sector: string;
  enterprise_size: "Micro" | "Small" | "Medium";
  state: string;
  city: string;
  pincode?: string;
  description?: string;
  primary_language: string;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export enum RBDLLevel {
  LEVEL_0 = 0,
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_code: string;
  label_en: string;
  label_hi: string;
  score_value: number;
  display_order: number;
}

export interface Question {
  id: number;
  question_code: string;
  dimension_code: string;
  question_text_en: string;
  question_text_hi: string;
  question_type: "single_choice" | "multi_choice" | "boolean" | "numeric" | "text";
  applies_to_business_size?: string;
  display_order: number;
  version: number;
  is_active: boolean;
  options: QuestionOption[];
}

export interface Assessment {
  id: number;
  business_id: number;
  previous_assessment_id?: number;
  question_bank_version: number;
  language_used: string;
  status: "in_progress" | "submitted" | "abandoned";
  started_at: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  id?: number;
  assessment_id?: number;
  question_id: number;
  question_code?: string;
  selected_option_id?: number | null;
  selected_option_ids?: number[] | null;
  numeric_answer?: number | null;
  text_answer?: string | null;
  is_na: boolean;
  answered_at?: string;
}

export interface AssessmentWithQuestions {
  assessment: Assessment;
  questions: Question[];
  answers: AssessmentAnswer[];
}

export interface DimensionScore {
  dimension_code: string;
  dimension_name_en: string;
  dimension_name_hi: string;
  raw_score: number;
  max_possible_score: number;
  dimension_score: number;
  weight: number;
  answered_count: number;
  na_count: number;
  missing_count: number;
}

export interface AssessmentScoresResponse {
  assessment_id: number;
  composite_score: number;
  dimension_scores: DimensionScore[];
  is_complete: boolean;
}

export interface ClassificationEvidence {
  id?: number;
  rule_id: number;
  rule_code?: string;
  rule_name?: string;
  rule_version_snapshot: number;
  fired_order: number;
  condition_snapshot_json: Record<string, any>;
  matched_answers_snapshot_json: Record<string, any>;
  created_at?: string;
}

export interface ClassificationResult {
  id?: number;
  assessment_id: number;
  method: string;
  rbdl_level: number;
  level_name_en: string;
  level_name_hi: string;
  ruleset_version?: number;
  is_primary: boolean;
  classified_at?: string;
  composite_score: number;
  dimension_scores: Record<string, number>;
  certainty_tier: "HIGH" | "MEDIUM" | "LOW";
  certainty_reasons: string[];
  contradictions: Array<{
    code: string;
    name: string;
    description_en: string;
    description_hi: string;
    involved_questions: string[];
    detected_answers: Record<string, any>;
  }>;
  satisfied_requirements: Array<{
    requirement_name: string;
    dimension_code: string;
    required_threshold: number;
    actual_score: number;
    is_satisfied: boolean;
    is_exempt?: boolean;
    exemption_reason?: string;
    gap?: number;
  }>;
  blocking_requirements: Array<{
    requirement_name: string;
    dimension_code: string;
    required_threshold: number;
    actual_score: number;
    is_satisfied: boolean;
    is_exempt?: boolean;
    exemption_reason?: string;
    gap?: number;
  }>;
  category_exemptions: string[];
  explanation_summary_en: string;
  explanation_summary_hi: string;
  evidence_traces: ClassificationEvidence[];
}

export interface AssessmentHistoryItem {
  id: number;
  business_id: number;
  question_bank_version: number;
  language_used: string;
  status: "in_progress" | "submitted" | "abandoned";
  rbdl_level?: number | null;
  level_name_en?: string | null;
  level_name_hi?: string | null;
  composite_score?: number | null;
  certainty_tier?: string | null;
  started_at: string;
  submitted_at?: string | null;
  previous_assessment_id?: number | null;
}

export interface DimensionComparison {
  dimension_code: string;
  dimension_name_en: string;
  dimension_name_hi: string;
  previous_score: number;
  current_score: number;
  score_delta: number;
  percentage_change: number;
  status: "improved" | "declined" | "maintained";
}

export interface AssessmentComparison {
  business_id: number;
  business_name: string;
  previous_assessment_id: number;
  previous_submitted_at?: string | null;
  previous_rbdl_level: number;
  previous_level_name_en: string;
  previous_level_name_hi: string;
  previous_composite_score: number;
  current_assessment_id: number;
  current_submitted_at?: string | null;
  current_rbdl_level: number;
  current_level_name_en: string;
  current_level_name_hi: string;
  current_composite_score: number;
  composite_score_delta: number;
  level_change: number;
  dimension_comparisons: DimensionComparison[];
  completed_tasks_count: number;
  completed_task_titles_en: string[];
  completed_task_titles_hi: string[];
  disclaimer_en: string;
  disclaimer_hi: string;
}

export interface ProgressSummary {
  roadmap_id: number;
  business_id: number;
  version: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  skipped_tasks: number;
  completion_percentage: number;
  phase_1_total: number;
  phase_1_completed: number;
  phase_2_total: number;
  phase_2_completed: number;
  phase_3_total: number;
  phase_3_completed: number;
  is_ready_for_reassessment: boolean;
  last_activity_at?: string;
}

