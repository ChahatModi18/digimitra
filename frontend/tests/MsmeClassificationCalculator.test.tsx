import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MsmeClassificationCalculator } from "../src/components/domain/MsmeClassificationCalculator";

describe("MsmeClassificationCalculator Component", () => {
  it("renders with default micro turnover and computes Micro status correctly", () => {
    const onSelect = vi.fn();
    render(
      <MsmeClassificationCalculator
        onSelectCategory={onSelect}
        initialTurnoverCr={0.5}
        initialInvestmentCr={0.1}
      />
    );

    expect(screen.getByText(/MSME Turnover & Eligibility Checker/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Micro Enterprise/i })).toBeInTheDocument();
    expect(screen.getByText(/Qualified MSME Entity/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Micro/i)).toBeInTheDocument();
  });

  it("dynamically recalculates category when turnover preset is clicked", () => {
    const onSelect = vi.fn();
    render(<MsmeClassificationCalculator onSelectCategory={onSelect} />);

    // Click 50 Crores preset button (Small range)
    const presetBtn = screen.getByText("₹50 Crores");
    fireEvent.click(presetBtn);

    expect(screen.getByRole("heading", { name: /Small Enterprise/i })).toBeInTheDocument();
    expect(screen.getByText(/Apply Small/i)).toBeInTheDocument();
  });

  it("supports thousands unit mode for micro scale businesses", () => {
    render(<MsmeClassificationCalculator initialTurnoverCr={0.005} initialInvestmentCr={0.001} />);

    // Click ₹50 Thousand preset
    const preset50k = screen.getByRole("button", { name: /₹50 Thousand/i });
    fireEvent.click(preset50k);

    expect(screen.getByRole("heading", { name: /Micro Enterprise/i })).toBeInTheDocument();
    expect(screen.getAllByText(/₹50 Thousand/i).length).toBeGreaterThan(0);
  });

  it("toggles the Govt. of India Rules Explainer card", () => {
    render(<MsmeClassificationCalculator />);

    const explainerBtn = screen.getByText(/Govt. Rules Explainer/i);
    expect(screen.queryByText(/Gazette Notification S.O. 2119\(E\)/i)).not.toBeInTheDocument();

    // Open explainer
    fireEvent.click(explainerBtn);
    expect(screen.getByText(/Gazette Notification S.O. 2119\(E\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Composite Criteria/i).length).toBeGreaterThan(0);

    // Close explainer
    fireEvent.click(explainerBtn);
    expect(screen.queryByText(/Gazette Notification S.O. 2119\(E\)/i)).not.toBeInTheDocument();
  });

  it("displays Non-MSME warning when turnover exceeds ₹250 Crores", () => {
    render(<MsmeClassificationCalculator initialTurnoverCr={300} initialInvestmentCr={60} />);

    expect(screen.getByText(/Non-MSME \/ Large Enterprise/i)).toBeInTheDocument();
    expect(screen.getByText(/Exceeds MSME/i)).toBeInTheDocument();
  });

  it("calls onSelectCategory when user clicks the apply category button", () => {
    const onSelect = vi.fn();
    render(
      <MsmeClassificationCalculator
        onSelectCategory={onSelect}
        initialTurnoverCr={15}
        initialInvestmentCr={3}
      />
    );

    expect(screen.getByRole("heading", { name: /Small Enterprise/i })).toBeInTheDocument();
    const applyBtn = screen.getByText(/Apply Small/i);
    fireEvent.click(applyBtn);

    expect(onSelect).toHaveBeenCalledWith("Small");
  });
});
