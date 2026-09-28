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

  it("auto-fills Queen's Book World sample profile and displays success banner upon registration", async () => {
    (businessApi.fetchBusinesses as any).mockResolvedValue([]);
    const mockQueensBiz = {
      id: 99,
      owner_id: 1,
      name: "Queen's Book World",
      sector: "Retail & Trade",
      business_type: "Bookstore & Stationery Shop",
      sub_category: "Books, Stationery & Educational Supplies",
      owner_name: "Neha Sharma",
      year_established: 2018,
      enterprise_size: "Small",
      employee_count: 4,
      state: "Rajasthan",
      city: "Jaipur",
      area_locality: "Mansarovar",
      business_address: "123, Shipra Path, Mansarovar, Jaipur, Rajasthan – 302020",
      pincode: "302020",
      contact_phone: "+91 98765 43210",
      contact_email: "queensbookworld@example.com",
      website: "Not available",
      primary_language: "hi",
      additional_language: "en",
      business_model: "Offline retail",
      target_customers: "Students, parents, teachers and local residents",
      monthly_revenue: "₹2,00,000–₹3,00,000",
      digitalization_goal: "Increase sales and attract more local customers",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (businessApi.createBusiness as any).mockResolvedValueOnce(mockQueensBiz);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <BusinessRegistration />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    // 1. Click "Fill Sample (Queen's Book World)" button
    const sampleBtn = screen.getByRole("button", { name: /Fill Sample \(Queen's Book World\)/i });
    fireEvent.click(sampleBtn);

    // 2. Verify form is populated
    const nameInput = screen.getByDisplayValue("Queen's Book World");
    expect(nameInput).toBeInTheDocument();

    const ownerInput = screen.getByDisplayValue("Neha Sharma");
    expect(ownerInput).toBeInTheDocument();

    // 3. Submit form
    const submitBtn = screen.getByRole("button", { name: /^Register Enterprise$/i });
    fireEvent.click(submitBtn);

    // 4. Verify API was called with Queen's Book World parameters
    await waitFor(() => {
      expect(businessApi.createBusiness).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Queen's Book World",
          owner_name: "Neha Sharma",
          enterprise_size: "Small",
          city: "Jaipur",
          contact_email: "queensbookworld@example.com",
        })
      );
    });

    // 5. Verify success notification banner is rendered
    await waitFor(() => {
      expect(screen.getByText(/Registration Successful!/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Take Assessment/i })).toBeInTheDocument();
    });
  });
});

