import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { ContactView } from "../src/pages/ContactView";

describe("ContactView & FAQs Component", () => {
  it("renders helpdesk details, helpline numbers, and FAQs section", () => {
    render(
      <BrowserRouter>
        <ContactView />
      </BrowserRouter>
    );

    expect(screen.getByText(/Reach Out to DigiMitra Support/i)).toBeInTheDocument();
    expect(screen.getByText("1800-180-2026")).toBeInTheDocument();
    expect(screen.getByText("support@digimitra.gov.in")).toBeInTheDocument();
    expect(screen.getByText("Jaipur Innovation Hub")).toBeInTheDocument();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("filters FAQs based on search input and category pills", () => {
    render(
      <BrowserRouter>
        <ContactView />
      </BrowserRouter>
    );

    // Initial state: default FAQ open
    expect(screen.getByText(/How long does the DigiMitra assessment take/i)).toBeInTheDocument();

    // Type in search bar
    const searchInput = screen.getByPlaceholderText(/Search FAQs/i);
    fireEvent.change(searchInput, { target: { value: "tax authorities" } });

    // Matching FAQ remains, non-matching filtered out
    expect(screen.getByText(/Is my business financial or sales data shared with government tax authorities/i)).toBeInTheDocument();
    expect(screen.queryByText(/How long does the DigiMitra assessment take/i)).not.toBeInTheDocument();

    // Clear search
    fireEvent.click(screen.getByText("Clear"));
    expect(screen.getByText(/How long does the DigiMitra assessment take/i)).toBeInTheDocument();

    // Filter by Govt Schemes category
    fireEvent.click(screen.getByText("Govt Schemes"));
    expect(screen.getByText(/Does DigiMitra guarantee loan or subsidy approvals/i)).toBeInTheDocument();
    expect(screen.queryByText(/What are RBDL Maturity Levels/i)).not.toBeInTheDocument();
  });

  it("validates form fields and submits contact inquiry successfully", async () => {
    render(
      <BrowserRouter>
        <ContactView />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole("button", { name: /Send Inquiry/i });

    // Fill valid form fields
    const nameInput = screen.getByPlaceholderText(/e.g. Ramesh Kumar Sharma/i);
    const emailInput = screen.getByPlaceholderText(/name@business.com/i);
    const phoneInput = screen.getByPlaceholderText(/9876543210/i);
    const messageInput = screen.getByPlaceholderText(/Please describe how we can assist/i);

    fireEvent.change(nameInput, { target: { value: "Aarav Gupta" } });
    fireEvent.change(emailInput, { target: { value: "aarav@guptatraders.in" } });
    fireEvent.change(phoneInput, { target: { value: "9829012345" } });
    fireEvent.change(messageInput, { target: { value: "We want guidance on adopting barcode billing and ZED certification." } });

    fireEvent.click(submitBtn);

    // Expect ticket confirmation banner
    await waitFor(() => {
      expect(screen.getByText(/Inquiry Submitted Successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/Your support reference tracking ID is:/i)).toBeInTheDocument();
      expect(screen.getByText(/DM-2026-/i)).toBeInTheDocument();
    });
  });
});
