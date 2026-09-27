import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoadmapView } from "../src/pages/RoadmapView";
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

  it("renders the active roadmap with phased tasks and level progress", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce([
      {
        id: 1,
        name: "Sharma General Store",
        sector: "Retail",
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
        <RoadmapView />
      </QueryClientProvider>
    );

    // Header check
    expect(screen.getByText(/Personalized Transformation Roadmap/i)).toBeInTheDocument();

    // Task check
    await waitFor(() => {
      expect(screen.getByText(/Adopt Dedicated Business Smartphone/i)).toBeInTheDocument();
      expect(screen.getByText(/Phase 1: Quick Wins/i)).toBeInTheDocument();
      expect(screen.getByText(/Recommended because your Digital Infrastructure score is below 4.0/i)).toBeInTheDocument();
    });

    // Language switch to Hindi
    fireEvent.click(screen.getByText(/हिन्दी \(HI\)/i));
    expect(screen.getByText(/व्यक्तिगत डिजिटलीकरण रोडमैप/i)).toBeInTheDocument();
    expect(screen.getByText(/समर्पित व्यावसायिक स्मार्टफोन अपनाएं/i)).toBeInTheDocument();
  });
});
