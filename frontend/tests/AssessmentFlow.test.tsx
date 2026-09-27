import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssessmentFlow } from "../src/pages/AssessmentFlow";
import { AuthProvider } from "../src/context/AuthContext";
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

  it("renders the assessment introduction header and details", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce([
      {
        id: 1,
        name: "Sharma Silk Sarees",
        sector: "Retail & Trade",
        enterprise_size: "Small",
        state: "Uttar Pradesh",
        city: "Varanasi",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AssessmentFlow />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Evaluate Your Enterprise's Digital Maturity/i)).toBeInTheDocument();
    expect(screen.getByText(/3-5 Minute Digital Health Check/i)).toBeInTheDocument();
    expect(screen.getByText(/9 Operational Dimensions Evaluated/i)).toBeInTheDocument();
  });

  it("allows starting assessment for a selected business", async () => {
    const mockBiz = [
      {
        id: 10,
        name: "Metro Kirana Store",
        sector: "Retail & Trade",
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
        <AuthProvider>
          <BrowserRouter>
            <AssessmentFlow />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Metro Kirana Store/i)).toBeInTheDocument();
    });

    const startBtn = screen.getByRole("button", { name: /Begin Digital Assessment →/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(assessmentApi.startAssessment).toHaveBeenCalledTimes(1);
    });
  });
});
