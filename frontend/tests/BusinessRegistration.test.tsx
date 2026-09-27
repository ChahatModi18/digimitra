import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BusinessRegistration } from "../src/pages/BusinessRegistration";
import * as businessApi from "../src/api/businesses";

// Mock the business API module
vi.mock("../src/api/businesses", () => ({
  createBusiness: vi.fn(),
}));

describe("BusinessRegistration Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the MSME registration form with all required fields", () => {
    render(
      <BrowserRouter>
        <BusinessRegistration />
      </BrowserRouter>
    );

    expect(screen.getByText(/MSME Business Registration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enterprise Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sector \/ Industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/MSME Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City \/ Town/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register Enterprise in DigiMitra/i })
    ).toBeInTheDocument();
  });

  it("submits the form successfully and displays the registered business details", async () => {
    const mockCreatedBusiness = {
      id: 42,
      owner_id: 1,
      name: "Gupta Electronics & Hardware",
      sector: "Retail",
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
      <BrowserRouter>
        <BusinessRegistration />
      </BrowserRouter>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Enterprise Name/i), {
      target: { value: "Gupta Electronics & Hardware" },
    });
    fireEvent.change(screen.getByLabelText(/State/i), {
      target: { value: "Uttar Pradesh" },
    });
    fireEvent.change(screen.getByLabelText(/City \/ Town/i), {
      target: { value: "Varanasi" },
    });

    // Submit form
    fireEvent.click(
      screen.getByRole("button", { name: /Register Enterprise in DigiMitra/i })
    );

    // Verify API called with right payload
    await waitFor(() => {
      expect(businessApi.createBusiness).toHaveBeenCalledTimes(1);
      expect(businessApi.createBusiness).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Gupta Electronics & Hardware",
          state: "Uttar Pradesh",
          city: "Varanasi",
        })
      );
    });

    // Assert success view is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Enterprise Registered Successfully!/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Persisted to MySQL Database with ID #42/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText("Gupta Electronics & Hardware")
      ).toBeInTheDocument();
      expect(screen.getByText(/Proceed to Digital Assessment/i)).toBeInTheDocument();
    });
  });

  it("displays an error alert when the backend rejects registration", async () => {
    (businessApi.createBusiness as any).mockRejectedValueOnce(
      new Error("Enterprise name already registered for this owner.")
    );

    render(
      <BrowserRouter>
        <BusinessRegistration />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Enterprise Name/i), {
      target: { value: "Existing Shop" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Register Enterprise in DigiMitra/i })
    );

    await waitFor(() => {
      expect(screen.getByTestId("error-banner")).toBeInTheDocument();
      expect(
        screen.getByText(/Enterprise name already registered for this owner./i)
      ).toBeInTheDocument();
    });
  });
});
