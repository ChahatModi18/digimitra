import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BusinessRegistration } from "../src/pages/BusinessRegistration";
import { AuthProvider } from "../src/context/AuthContext";
import * as businessApi from "../src/api/businesses";

// Mock the business API module
vi.mock("../src/api/businesses", () => ({
  fetchBusinesses: vi.fn(),
  createBusiness: vi.fn(),
}));

describe("BusinessRegistration Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders the MSME enterprise management page with registered list", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValueOnce([
      {
        id: 1,
        name: "Ramesh Kirana Store",
        sector: "Retail & Trade",
        enterprise_size: "Micro",
        state: "Maharashtra",
        city: "Mumbai",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <BusinessRegistration />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Enterprise Profile & Management/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Ramesh Kirana Store")[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Take Assessment/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/View Roadmap/i)[0]).toBeInTheDocument();
    });
  });

  it("submits the registration form successfully and adds enterprise", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValue([]);
    const mockCreatedBusiness = {
      id: 42,
      owner_id: 1,
      name: "Gupta Electronics & Hardware",
      sector: "Retail & Trade",
      enterprise_size: "Micro",
      state: "Uttar Pradesh",
      city: "Varanasi",
      pincode: "221001",
      description: "Consumer electronics and lighting shop",
      primary_language: "hi",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (businessApi.createBusiness as any).mockResolvedValueOnce(mockCreatedBusiness);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <BusinessRegistration />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Register New MSME Enterprise/i)).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/e.g. Ramesh Kirana & General Store/i), {
      target: { value: "Gupta Electronics & Hardware" },
    });

    // Submit form (target submit button)
    fireEvent.click(screen.getByRole("button", { name: /^Register Enterprise$/i }));

    // Verify API called with right payload
    await waitFor(() => {
      expect(businessApi.createBusiness).toHaveBeenCalledTimes(1);
      expect(businessApi.createBusiness).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Gupta Electronics & Hardware",
        })
      );
    });
  });
});
