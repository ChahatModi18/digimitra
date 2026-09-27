import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoadmapView } from "../src/pages/RoadmapView";
import { AuthProvider } from "../src/context/AuthContext";
import * as businessApi from "../src/api/businesses";
import * as roadmapApi from "../src/api/roadmap";

vi.mock("../src/api/businesses", () => ({
  fetchBusinesses: vi.fn(),
}));

vi.mock("../src/api/roadmap", () => ({
  getActiveRoadmap: vi.fn(),
  getBusinessRecommendations: vi.fn(),
  getRoadmapHistory: vi.fn(),
  updateRoadmapTaskStatus: vi.fn(),
  getProgressSummary: vi.fn(),
}));

describe("RoadmapView Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders the active roadmap with phased tasks and progress summary", async () => {
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

    (roadmapApi.getActiveRoadmap as any).mockResolvedValueOnce({
      id: 10,
      business_id: 1,
      classification_result_id: 20,
      version: 1,
      status: "active",
      current_rbdl_level: 0,
      target_rbdl_level: 1,
      total_tasks: 2,
      completed_tasks: 0,
      phase_1: {
        phase_number: 1,
        phase_name_en: "Quick Wins",
        phase_name_hi: "त्वरित परिणाम",
        total_tasks: 1,
        tasks: [],
      },
      phase_2: {
        phase_number: 2,
        phase_name_en: "Core Next Steps",
        phase_name_hi: "मुख्य अगले कदम",
        total_tasks: 1,
        tasks: [],
      },
      phase_3: {
        phase_number: 3,
        phase_name_en: "Longer Term",
        phase_name_hi: "दीर्घकालिक योजना",
        total_tasks: 0,
        tasks: [],
      },
      all_tasks: [
        {
          id: 101,
          roadmap_id: 10,
          recommendation_code: "REC-INFRA-01",
          title_en: "Adopt Dedicated Business Smartphone",
          title_hi: "समर्पित व्यावसायिक स्मार्टफोन अपनाएं",
          description_en: "Ensure at least one dedicated smartphone with daily mobile data access.",
          description_hi: "दैनिक मोबाइल डेटा के साथ कम से कम एक समर्पित स्मार्टफोन सुनिश्चित करें।",
          phase_number: 1,
          phase_name_en: "Quick Wins",
          phase_name_hi: "त्वरित परिणाम",
          sequence_order: 1,
          status: "pending",
          estimated_cost_level: "low",
          estimated_effort_level: "low",
          impact_level: "high",
          priority_score: 2.5,
          reason_en: "Recommended because your Digital Infrastructure score is below 4.0.",
          reason_hi: "डिजिटल इन्फ्रास्ट्रक्चर स्कोर 4.0 से कम है।",
        },
      ],
      generated_at: new Date().toISOString(),
    });

    (roadmapApi.getProgressSummary as any).mockResolvedValueOnce({
      business_id: 1,
      roadmap_id: 10,
      roadmap_version: 1,
      current_rbdl_level: 0,
      target_rbdl_level: 1,
      total_tasks: 1,
      completed_tasks: 0,
      in_progress_tasks: 0,
      pending_tasks: 1,
      skipped_tasks: 0,
      completion_percentage: 0.0,
      phase_breakdown: {
        phase_1: { name: "Quick Wins", total: 1, completed: 0, in_progress: 0, pending: 1, skipped: 0 },
        phase_2: { name: "Core Next Steps", total: 0, completed: 0, in_progress: 0, pending: 0, skipped: 0 },
        phase_3: { name: "Longer Term", total: 0, completed: 0, in_progress: 0, pending: 0, skipped: 0 },
      },
      is_ready_for_reassessment: false,
    });

    (roadmapApi.getBusinessRecommendations as any).mockResolvedValueOnce({
      business_id: 1,
      assessment_id: 5,
      current_rbdl_level: 0,
      target_rbdl_level: 1,
      total_recommendations: 1,
      recommendations: [],
    });

    (roadmapApi.getRoadmapHistory as any).mockResolvedValueOnce([]);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <RoadmapView />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    // Header check
    expect(screen.getByText(/Transformation Roadmap & Progress/i)).toBeInTheDocument();

    // Task check
    await waitFor(() => {
      expect(screen.getByText(/Adopt Dedicated Business Smartphone/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Phase 1: Quick Wins/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Recommended because your Digital Infrastructure score is below 4.0/i)).toBeInTheDocument();
    });
  });
});
