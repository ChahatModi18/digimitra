import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecommendationsView } from "../src/pages/RecommendationsView";
import { AuthProvider } from "../src/context/AuthContext";
import * as businessApi from "../src/api/businesses";
import * as roadmapApi from "../src/api/roadmap";

vi.mock("../src/api/businesses", () => ({
  fetchBusinesses: vi.fn(),
}));

vi.mock("../src/api/roadmap", () => ({
  getBusinessRecommendations: vi.fn(),
}));

describe("RecommendationsView Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders personalized recommendations with priority scores and explainability", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce([
      {
        id: 1,
        name: "Verma Traders",
        city: "Delhi",
        sector: "Retail & Trade",
      },
    ]);

    (roadmapApi.getBusinessRecommendations as any).mockResolvedValueOnce({
      business_id: 1,
      assessment_id: 10,
      current_rbdl_level: 1,
      target_rbdl_level: 2,
      total_recommendations: 1,
      recommendations: [
        {
          id: 50,
          recommendation_code: "REC-PRES-01",
          title_en: "Create and Verify Google Business Profile",
          title_hi: "गूगल बिजनेस प्रोफाइल बनाएं",
          description_en: "Register your enterprise on Google Maps and Search.",
          description_hi: "गूगल मैप्स और सर्च पर अपने उद्यम को पंजीकृत करें।",
          rank_order: 1,
          priority_score: 2.6,
          target_rbdl_level: 2,
          dimension_code: "presence",
          category: "online_presence",
          impact_level: "high",
          estimated_effort_level: "low",
          estimated_cost_level: "low",
          reason_en: "Recommended because your Online Presence score is below 4.0.",
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <RecommendationsView />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Personalized Recommendations/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Create and Verify Google Business Profile/i)).toBeInTheDocument();
      expect(screen.getByText("2.60")).toBeInTheDocument();
      expect(screen.getByText(/Recommended because your Online Presence score is below 4.0/i)).toBeInTheDocument();
    });
  });
});
