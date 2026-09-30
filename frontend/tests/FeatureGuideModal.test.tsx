import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { FeatureGuideModal } from "../src/components/domain/FeatureGuideModal";

describe("FeatureGuideModal Component", () => {
  it("renders Transformation Roadmap guide with inspiring thought, 3 phases, and action navigation", () => {
    const handleClose = vi.fn();
    render(
      <BrowserRouter>
        <FeatureGuideModal
          type="roadmap"
          isOpen={true}
          onClose={handleClose}
          currentLang="en"
        />
      </BrowserRouter>
    );

    // Header & Badge
    expect(screen.getByText(/Transformation Roadmap Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Phased MSME Digitalization Roadmap/i)).toBeInTheDocument();

    // Inspiring thought
    expect(
      screen.getByText(/Digitalization is not about buying every complicated software at once/i)
    ).toBeInTheDocument();

    // Switch to 3 Phases Tab
    fireEvent.click(screen.getByText(/The 3 Phases/i));
    expect(screen.getByText(/Phase 1: Quick Wins/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2: Operational Core/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 3: Strategic Growth/i)).toBeInTheDocument();

    // Switch to Key Principles Tab
    fireEvent.click(screen.getByText(/Key Principles/i));
    expect(screen.getByText(/One-Level-Above Rule/i)).toBeInTheDocument();
    expect(screen.getByText(/Auditable Progress Tracking/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByLabelText("Close dialog");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders Recommendations guide with 80/20 rule, explainability, and priority formula", () => {
    const handleClose = vi.fn();
    render(
      <BrowserRouter>
        <FeatureGuideModal
          type="recommendations"
          isOpen={true}
          onClose={handleClose}
          currentLang="en"
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/Deterministic, Explainable MSME Recommendations/i)).toBeInTheDocument();
    expect(
      screen.getByText(/A single right digital tool suited to your shop will give you 10x more peace of mind/i)
    ).toBeInTheDocument();

    // Check Priority Formula Tab
    fireEvent.click(screen.getByText(/Priority Formula/i));
    expect(screen.getByText(/Goal Alignment Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Pain Point Relief Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/RBDL Readiness & Prerequisites/i)).toBeInTheDocument();
  });
});
