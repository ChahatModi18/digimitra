import { apiClient } from "./client";
import { ensureAuthenticatedSession } from "./auth";
import {
  APIResponse,
  Assessment,
  AssessmentAnswer,
  AssessmentScoresResponse,
  AssessmentWithQuestions,
  ClassificationResult,
} from "../types";

export interface AnswerSubmissionItem {
  question_id: number;
  selected_option_id?: number | null;
  selected_option_ids?: number[] | null;
  numeric_answer?: number | null;
  text_answer?: string | null;
  is_na?: boolean;
}

export const startAssessment = async (
  businessId: number,
  languageUsed: string = "en"
): Promise<APIResponse<Assessment>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.post<APIResponse<Assessment>>("/assessments", {
    business_id: businessId,
    language_used: languageUsed,
  });
  return response.data;
};

export const getAssessment = async (
  assessmentId: number
): Promise<APIResponse<Assessment>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.get<APIResponse<Assessment>>(
    `/assessments/${assessmentId}`
  );
  return response.data;
};

export const getAssessmentQuestions = async (
  assessmentId: number
): Promise<APIResponse<AssessmentWithQuestions>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.get<APIResponse<AssessmentWithQuestions>>(
    `/assessments/${assessmentId}/questions`
  );
  return response.data;
};

export const saveAssessmentAnswers = async (
  assessmentId: number,
  answers: AnswerSubmissionItem[],
  languageUsed: string = "en"
): Promise<APIResponse<AssessmentAnswer[]>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.put<APIResponse<AssessmentAnswer[]>>(
    `/assessments/${assessmentId}/answers`,
    {
      answers,
      language_used: languageUsed,
    }
  );
  return response.data;
};

export const submitAssessment = async (
  assessmentId: number
): Promise<APIResponse<ClassificationResult>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.post<APIResponse<ClassificationResult>>(
    `/assessments/${assessmentId}/submit`
  );
  return response.data;
};

export const getAssessmentScores = async (
  assessmentId: number
): Promise<APIResponse<AssessmentScoresResponse>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.get<APIResponse<AssessmentScoresResponse>>(
    `/assessments/${assessmentId}/scores`
  );
  return response.data;
};

export const getAssessmentClassification = async (
  assessmentId: number
): Promise<APIResponse<ClassificationResult>> => {
  await ensureAuthenticatedSession();
  const response = await apiClient.get<APIResponse<ClassificationResult>>(
    `/assessments/${assessmentId}/classification`
  );
  return response.data;
};
