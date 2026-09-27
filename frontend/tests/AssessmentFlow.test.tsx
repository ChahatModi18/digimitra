import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssessmentFlow } from "../src/pages/AssessmentFlow";
import * as businessApi from "../src/api/businesses";
import * as assessmentApi from "../src/api/assessments";

// Mock APIs
vi.mock("../src/api/businesses", () => ({
  fetchBusinesses: vi.fn(),
}));

vi.mock("../src/api/assessments", () => ({
  startAssessment: vi.fn(),
  getAssessmentQuestions: vi.fn(),
  saveAssessmentAnswers: vi.fn(),
  submitAssessment: vi.fn(),
}));

describe("AssessmentFlow Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders the assessment header and language toggle", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce([
      {
        id: 1,
        name: "Sharma Silk Sarees",
        sector: "Retail",
        enterprise_size: "Small",
        state: "Uttar Pradesh",
        city: "Varanasi",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <AssessmentFlow />
      </QueryClientProvider>
    );

    expect(screen.getByText(/RBDL Digital Readiness Assessment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "हिंदी" })).toBeInTheDocument();

    // Toggle Hindi language
    fireEvent.click(screen.getByRole("button", { name: "हिंदी" }));
    expect(screen.getByText(/आरबीडीएल डिजिटल तैयारी मूल्यांकन/i)).toBeInTheDocument();
  });

  it("allows starting assessment for a selected business", async () => {
    const mockBiz = [
      {
        id: 10,
        name: "Metro Kirana Store",
        sector: "Retail",
        enterprise_size: "Micro",
        state: "Maharashtra",
        city: "Pune",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce(mockBiz);
    (assessmentApi.startAssessment as any).mockResolvedValueOnce({
      success: true,
      data: {
        id: 101,
        business_id: 10,
        status: "in_progress",
        question_bank_version: 1,
        language_used: "en",
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AssessmentFlow />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Metro Kirana Store/i)).toBeInTheDocument();
    });

    const startBtn = screen.getByRole("button", { name: /Begin Assessment →/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(assessmentApi.startAssessment).toHaveBeenCalledTimes(1);
      expect(assessmentApi.startAssessment).toHaveBeenCalledWith(10, "en");
    });
  });
});
