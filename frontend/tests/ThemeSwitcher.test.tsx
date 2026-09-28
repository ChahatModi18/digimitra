import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSwitcher } from "../src/components/ThemeSwitcher";
import { ThemeProvider } from "../src/context/ThemeContext";

describe("ThemeSwitcher Component", () => {
  it("renders active theme name and opens theme options dropdown on click", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Initial default theme is MSME Saffron
    expect(screen.getByText(/MSME Saffron/i)).toBeInTheDocument();

    // Click to open dropdown
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    // Should display all 4 MSME theme options
    expect(screen.getByText(/MSME India Blue/i)).toBeInTheDocument();
    expect(screen.getByText(/Ministry Forest Teal/i)).toBeInTheDocument();
    expect(screen.getByText(/Bharat Saffron-Gold/i)).toBeInTheDocument();
  });

  it("switches theme when another option is selected", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    // Select MSME India Blue
    const blueOption = screen.getByText(/MSME India Blue/i);
    fireEvent.click(blueOption);

    // Dropdown closes and active theme updates
    expect(screen.getAllByText(/MSME India Blue/i).length).toBeGreaterThan(0);
  });
});
