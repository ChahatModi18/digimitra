import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HistoryView } from "../src/pages/HistoryView";
import { AuthProvider } from "../src/context/AuthContext";
import * as businessApi from "../src/api/businesses";
import * as assessmentApi from "../src/api/assessments";
import * as roadmapApi from "../src/api/roadmap";

vi.mock("../src/api/businesses", () => ({
  fetchBusinesses: vi.fn(),
}));

vi.mock("../src/api/assessments", () => ({
  getAssessmentHistory: vi.fn(),
  compareAssessments: vi.fn(),
}));

vi.mock("../src/api/roadmap", () => ({
  getRoadmapHistory: vi.fn(),
  getRoadmapById: vi.fn(),
}));

describe("HistoryView Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders the assessment timeline and comparison buttons", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce([
      {
        id: 1,
        name: "Sharma General Store",
        sector: "Retail & Trade",
        enterprise_size: "Micro",
        state: "Uttar Pradesh",
        city: "Lucknow",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    (assessmentApi.getAssessmentHistory as any).mockResolvedValueOnce([
      {
        id: 10,
        business_id: 1,
        question_bank_version: 1,
        language_used: "en",
        status: "submitted",
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        rbdl_level: 0,
        level_name_en: "Level 0: Traditional Operations",
        level_name_hi: "स्तर 0: पारंपरिक संचालन",
        composite_score: 2.1,
      },
      {
        id: 11,
        business_id: 1,
        question_bank_version: 1,
        language_used: "en",
        status: "submitted",
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        rbdl_level: 1,
        level_name_en: "Level 1: Digitally Aware",
        level_name_hi: "स्तर 1: डिजिटल रूप से जागरूक",
        composite_score: 3.8,
        previous_assessment_id: 10,
      },
    ]);

    (roadmapApi.getRoadmapHistory as any).mockResolvedValueOnce([
      {
        id: 101,
        business_id: 1,
        classification_result_id: 20,
        version: 1,
        status: "superseded",
        current_rbdl_level: 0,
        target_rbdl_level: 1,
        total_tasks: 3,
        completed_tasks: 3,
        completion_rate: 100.0,
        generated_at: new Date().toISOString(),
      },
      {
        id: 102,
        business_id: 1,
        classification_result_id: 21,
        version: 2,
        status: "active",
        current_rbdl_level: 1,
        target_rbdl_level: 2,
        total_tasks: 4,
        completed_tasks: 1,
        completion_rate: 25.0,
        generated_at: new Date().toISOString(),
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <HistoryView />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    // Header check
    expect(screen.getByText(/Assessment & Progress History/i)).toBeInTheDocument();

    // Verify assessment history items appear
    await waitFor(() => {
      expect(screen.getByText(/Assessment #11/i)).toBeInTheDocument();
      expect(screen.getByText(/Assessment #10/i)).toBeInTheDocument();
    });

    // Check compare CTA button is present
    expect(screen.getByText(/Compare Reassessments/i)).toBeInTheDocument();
  });
});
