import { apiClient } from "./client";
import { APIResponse } from "../types";

export interface Flashcard {
  card_id: string;
  recommendation_code?: string;
  target_level: number;
  topic: string;
  title_en: string;
  title_hi: string;
  what_is_it_en: string;
  what_is_it_hi: string;
  why_matters_en: string;
  why_matters_hi: string;
  who_needs_it_en: string;
  who_needs_it_hi: string;
  when_to_adopt_en: string;
  when_to_adopt_hi: string;
  prerequisites_en: string[];
  prerequisites_hi: string[];
  complexity: string;
  implementation_steps_en: string[];
  implementation_steps_hi: string[];
  common_mistakes_en: string[];
  common_mistakes_hi: string[];
  expected_benefit_en: string;
  expected_benefit_hi: string;
  what_to_measure_en: string[];
  what_to_measure_hi: string[];
  low_cost_alternative_en: string;
  low_cost_alternative_hi: string;
  next_action_en: string;
  next_action_hi: string;
}

export async function fetchFlashcards(params?: {
  level?: number;
  recommendation_code?: string;
}): Promise<Flashcard[]> {
  const queryParams: Record<string, string | number> = {};
  if (params?.level !== undefined) queryParams.level = params.level;
  if (params?.recommendation_code) queryParams.recommendation_code = params.recommendation_code;

  const response = await apiClient.get<APIResponse<Flashcard[]>>(
    "/learning/flashcards",
    { params: queryParams }
  );
  return response.data.data || [];
}

export async function fetchFlashcardById(cardId: string): Promise<Flashcard> {
  const response = await apiClient.get<APIResponse<Flashcard>>(
    `/learning/flashcards/${cardId}`
  );
  if (response.data.data) {
    return response.data.data;
  }
  throw new Error("Flashcard not found");
}
