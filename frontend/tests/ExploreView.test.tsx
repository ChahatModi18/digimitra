import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ExploreView } from "../src/pages/ExploreView";
import * as discoveryApi from "../src/api/discovery";
import * as businessApi from "../src/api/businesses";

vi.mock("../src/api/discovery", () => ({
  fetchDiscoveryCategories: vi.fn(),
  searchServices: vi.fn(),
  fetchServiceById: vi.fn(),
}));

vi.mock("../src/api/businesses", () => ({
  fetchBusinesses: vi.fn(),
}));

describe("ExploreView Component", () => {
  let queryClient: QueryClient;

  const mockCategories: discoveryApi.DiscoveryCategory[] = [
    {
      id: "payments",
      name_en: "Digital Payments & POS",
      name_hi: "डिजिटल भुगतान एवं पीओएस",
      description_en: "Merchant QR codes and POS",
      description_hi: "मर्चेंट क्यूआर कोड",
      icon_name: "CreditCard",
      relevant_dimensions: ["payments"],
    },
    {
      id: "accounting",
      name_en: "Accounting & GST Billing",
      name_hi: "अकाउंटिंग एवं जीएसटी बिलिंग",
      description_en: "Digital bookkeeping and invoicing",
      description_hi: "डिजिटल बहीखाता",
      icon_name: "FileSpreadsheet",
      relevant_dimensions: ["records"],
    },
  ];

  const mockBusinesses = [
    {
      id: 1,
      name: "Sharma General Store",
      business_name: "Sharma General Store",
      business_size: "micro",
      state: "Rajasthan",
      district: "Jaipur",
      city: "Jaipur",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(discoveryApi.fetchDiscoveryCategories).mockResolvedValue(mockCategories);
    vi.mocked(businessApi.fetchBusinesses).mockResolvedValue(mockBusinesses as any);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ExploreView />
        </BrowserRouter>
      </QueryClientProvider>
    );

  it("renders explore header, search input, and category chips", async () => {
    vi.mocked(discoveryApi.searchServices).mockResolvedValue({
      items: [],
      total_count: 0,
      page: 1,
      page_size: 20,
      provider_status: "empty_unconfigured",
      provider_message_en: "No third-party local service providers configured.",
      provider_message_hi: "कोई सेवा प्रदाता कॉन्फ़िगर नहीं है।",
      suggested_categories: [],
    });

    renderComponent();

    expect(screen.getByText(/Local Digital Services & MSME Support/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search services \(e\.g\. UPI soundbox/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Digital Payments & POS/i)).toBeInTheDocument();
      expect(screen.getByText(/Accounting & GST Billing/i)).toBeInTheDocument();
    });
  });

  it("renders official MSME portal resources in unconfigured empty state", async () => {
    vi.mocked(discoveryApi.searchServices).mockResolvedValue({
      items: [],
      total_count: 0,
      page: 1,
      page_size: 20,
      provider_status: "empty_unconfigured",
      provider_message_en: "No third-party local service providers configured.",
      provider_message_hi: "कोई सेवा प्रदाता कॉन्फ़िगर नहीं है।",
      suggested_categories: [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No Local Digital Services Found/i)).toBeInTheDocument();
      expect(screen.getByText(/Udyam Registration & Assist Portal/i)).toBeInTheDocument();
      expect(screen.getByText(/District Industries Centres \(DIC\)/i)).toBeInTheDocument();
    });
  });

  it("renders service cards when provider returns results", async () => {
    vi.mocked(discoveryApi.searchServices).mockResolvedValue({
      items: [
        {
          id: "mock-1",
          name: "Bharat Merchant QR Hub",
          category_id: "payments",
          locality: "Civil Lines",
          district: "Jaipur",
          state: "Rajasthan",
          pincode: "302006",
          short_description_en: "Instant UPI QR soundbox setup.",
          short_description_hi: "त्वरित यूपीआई साउंडबॉक्स।",
          is_official_resource: true,
          action_label_en: "Open Portal",
          action_url: "https://example.com",
          is_mock_data: true,
        },
      ],
      total_count: 1,
      page: 1,
      page_size: 20,
      provider_status: "mock_test",
      provider_message_en: "Found 1 test provider.",
      provider_message_hi: "1 प्रदाता मिला।",
      suggested_categories: ["payments"],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Bharat Merchant QR Hub")).toBeInTheDocument();
      expect(screen.getByText(/Civil Lines, Jaipur, Rajasthan - 302006/i)).toBeInTheDocument();
      expect(screen.getByText(/Official Resource/i)).toBeInTheDocument();
    });
  });
});
