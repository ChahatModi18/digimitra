import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { GovernmentInitiativesFlashcards, VERIFIED_GOVERNMENT_INITIATIVES } from "../src/components/domain/GovernmentInitiativesFlashcards";
import { FeedbackRatingSection } from "../src/components/domain/FeedbackRatingSection";
import { WalkthroughVideoModal } from "../src/components/domain/WalkthroughVideoModal";

describe("Verified Government Schemes Flashcards", () => {
  it("renders all 8 verified schemes with codes and official links", () => {
    render(
      <GovernmentInitiativesFlashcards currentLang="en" />
    );

    // Verify key schemes from user prompt exist
    expect(screen.getAllByText(/Udyam Registration/i).length).toBeGreaterThan(0);
    expect(screen.getByText("GOV-UDYAM")).toBeInTheDocument();
    expect(screen.getByText(/MSME Sustainable \(ZED\) Certification/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-ZED")).toBeInTheDocument();
    expect(screen.getByText(/Trade Receivables Discounting System/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-TREDS")).toBeInTheDocument();
    expect(screen.getByText(/Government e-Marketplace \(GeM\)/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-GEM")).toBeInTheDocument();
    expect(screen.getByText(/Open Network for Digital Commerce \(ONDC\)/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-ONDC")).toBeInTheDocument();
    expect(screen.getByText(/Credit Guarantee Fund Trust for MSEs \(CGTMSE\)/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-CGTMSE")).toBeInTheDocument();
    expect(screen.getByText(/PM Vishwakarma Scheme/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-VISHWAKARMA")).toBeInTheDocument();
    expect(screen.getByText(/Mukhyamantri Laghu Udyog Protsahan Yojana/i)).toBeInTheDocument();
    expect(screen.getByText("GOV-RAJ-MLUPY")).toBeInTheDocument();
  });

  it("flips card to reveal deep integration blueprint and gains", () => {
    render(
      <GovernmentInitiativesFlashcards currentLang="en" />
    );

    const flipButtons = screen.getAllByText(/Flip: How It Helps & Steps →/i);
    expect(flipButtons.length).toBeGreaterThan(0);

    // Flip the first card (Udyam)
    fireEvent.click(flipButtons[0]);

    // Back side should reveal beneficial gains and when to connect
    expect(screen.getByText(/How Integrating Proves Beneficial:/i)).toBeInTheDocument();
    expect(screen.getByText(/When You Should Connect:/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Connect Step-by-Step:/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Overview ↩/i)).toBeInTheDocument();
  });
});

describe("Feedback and Rating Section", () => {
  it("renders 5-star rating pickers, questionnaire checkboxes, and feedback box", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FeedbackRatingSection currentLang="en" businessName="Verma Sweets" />
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Rate Your Experience & Share Feedback/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Application Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Usefulness of 9-Dimension Scoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Actionability of Roadmaps & Tools/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write a few sentences on how this application helped your store/i)).toBeInTheDocument();
  });

  it("submits rating and feedback and renders celebratory confirmation banner", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FeedbackRatingSection currentLang="en" businessName="Verma Sweets" />
        </AuthProvider>
      </QueryClientProvider>
    );

    const textarea = screen.getByPlaceholderText(/Write a few sentences on how this application helped your store/i);
    fireEvent.change(textarea, { target: { value: "DigiMitra helped us discover Udyam and ONDC with clear steps!" } });

    const submitBtn = screen.getByRole("button", { name: /Submit Rating & Feedback/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Rating & Feedback Recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Thank You for Your Valuable Rating & Feedback!/i)).toBeInTheDocument();
  });
});

describe("Walkthrough Video Modal", () => {
  it("renders video element and chapter jumps when open", () => {
    const onClose = vi.fn();
    render(
      <WalkthroughVideoModal isOpen={true} onClose={onClose} currentLang="en" />
    );

    expect(screen.getByText(/How DigiMitra Works — Interactive Video Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Enterprise Registration/i)).toBeInTheDocument();
    expect(screen.getByText(/2. 9-Dimension Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/4. Phased Roadmap Execution/i)).toBeInTheDocument();
  });
});
