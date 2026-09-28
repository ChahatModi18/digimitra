import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MsmeClassificationCalculator } from "../src/components/domain/MsmeClassificationCalculator";

describe("MsmeClassificationCalculator Component", () => {
  it("renders with default micro turnover and computes Micro status correctly", () => {
    const onSelect = vi.fn();
    render(<MsmeClassificationCalculator onSelectCategory={onSelect} initialTurnoverCr={0.5} initialInvestmentCr={0.1} />);

    expect(screen.getByText(/MSME Turnover & Eligibility Checker/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Micro Enterprise/i })).toBeInTheDocument();
    expect(screen.getByText(/Qualified MSME Entity/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Micro/i)).toBeInTheDocument();
  });

  it("dynamically recalculates category when turnover is updated to Medium range", () => {
    const onSelect = vi.fn();
    render(<MsmeClassificationCalculator onSelectCategory={onSelect} />);

    // Click 100 Crores preset button
    const presetBtn = screen.getByText("₹100 Crores");
    fireEvent.click(presetBtn);

    expect(screen.getByRole("heading", { name: /Medium Enterprise/i })).toBeInTheDocument();
    expect(screen.getByText(/Apply Medium/i)).toBeInTheDocument();
  });

  it("displays Non-MSME warning when turnover exceeds ₹250 Crores", () => {
    render(<MsmeClassificationCalculator initialTurnoverCr={300} initialInvestmentCr={60} />);

    expect(screen.getByText(/Non-MSME \/ Large Enterprise/i)).toBeInTheDocument();
    expect(screen.getByText(/Exceeds MSME/i)).toBeInTheDocument();
  });

  it("calls onSelectCategory when user clicks the apply category button", () => {
    const onSelect = vi.fn();
    render(<MsmeClassificationCalculator onSelectCategory={onSelect} initialTurnoverCr={15} initialInvestmentCr={3} />);

    expect(screen.getByRole("heading", { name: /Small Enterprise/i })).toBeInTheDocument();
    const applyBtn = screen.getByText(/Apply Small/i);
    fireEvent.click(applyBtn);

    expect(onSelect).toHaveBeenCalledWith("Small");
  });
});
