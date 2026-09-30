import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { DimensionCard } from "../src/components/domain/DimensionCard";
import { DimensionFlashcardModal } from "../src/components/domain/DimensionFlashcardModal";

describe("Dimension Flashcards Feature", () => {
  it("renders DimensionCard with flashcard badge and invokes onClick handler", () => {
    const handleClick = vi.fn();
    render(
      <DimensionCard
        code="infra"
        nameEn="Digital Infrastructure"
        nameHi="डिजिटल बुनियादी ढांचा"
        descriptionEn="Hardware and connectivity readiness"
        onClick={handleClick}
      />
    );

    expect(screen.getByText("Digital Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Flashcard")).toBeInTheDocument();

    const card = screen.getByRole("button");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders DimensionFlashcardModal with all 12 attributes and navigation tabs", () => {
    const handleClose = vi.fn();
    render(
      <BrowserRouter>
        <DimensionFlashcardModal
          initialDimensionCode="infra"
          isOpen={true}
          onClose={handleClose}
          currentLang="en"
        />
      </BrowserRouter>
    );

    // Header & Badge
    expect(screen.getByText(/Digital Infrastructure & Hardware/i)).toBeInTheDocument();
    expect(screen.getByText(/INFRA • Foundational/i)).toBeInTheDocument();
    expect(screen.getByText(/Weight: 1.2x/i)).toBeInTheDocument();

    // Default Overview Tab Content
    expect(screen.getByText(/Expected Business ROI/i)).toBeInTheDocument();
    expect(screen.getByText(/Immediate Next Step/i)).toBeInTheDocument();

    // Switch to RBDL Levels 0-3 Tab
    fireEvent.click(screen.getByText("RBDL Levels 0-3"));
    expect(screen.getByText(/Level 0: Traditional Manual/i)).toBeInTheDocument();
    expect(screen.getByText(/Level 1: Basic Digitalized/i)).toBeInTheDocument();
    expect(screen.getByText(/Level 2: Integrated Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/Level 3: Strategic & Omnichannel/i)).toBeInTheDocument();

    // Switch to Recommended Tools Tab
    fireEvent.click(screen.getByText("Recommended Tools"));
    expect(screen.getByText(/Dual-SIM 4G\/5G Router/i)).toBeInTheDocument();
    expect(screen.getByText(/Handheld Bluetooth Thermal Printer/i)).toBeInTheDocument();

    // Switch to Security Tab
    fireEvent.click(screen.getByText("Security & Quick Action"));
    expect(screen.getByText(/Cybersecurity & Risk Prevention/i)).toBeInTheDocument();
    expect(screen.getByText(/DigiMitra Research Note:/i)).toBeInTheDocument();

    // Test Navigation: Next Dimension
    const nextBtn = screen.getByLabelText("Next Dimension");
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Digital Literacy & Skills/i)).toBeInTheDocument();

    // Test Close Button
    const closeBtn = screen.getByLabelText("Close modal");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
