import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RequirementProfilingSection } from "../src/components/domain/RequirementProfilingSection";
import { RequirementTaxonomies } from "../src/api/requirements";

const mockTaxonomies: RequirementTaxonomies = {
  framework_version: "RBDL_V1",
  requirement_profile_version: 1,
  research_status_disclosure: "Proposed research instrument for Requirement-Based Digitalization V1.",
  business_goals: {
    G1_CUSTOMER_REACH: {
      code: "G1_CUSTOMER_REACH",
      name_en: "Increase customer reach",
      name_hi: "नए ग्राहकों तक पहुंच बढ़ाना",
      description_en: "Get discovered by more local customers online.",
      description_hi: "ऑनलाइन और सोशल मीडिया के माध्यम से अधिक स्थानीय ग्राहकों तक पहुंचें।",
      primary_dimensions: ["presence", "comms"],
    },
    G2_INCREASE_SALES: {
      code: "G2_INCREASE_SALES",
      name_en: "Increase sales & repeat orders",
      name_hi: "बिक्री और दोबारा ऑर्डर बढ़ाना",
      description_en: "Drive revenue growth through digital engagement.",
      description_hi: "डिजिटल जुड़ाव और कैटलॉग के जरिए आमदनी बढ़ाना।",
      primary_dimensions: ["comms", "presence"],
    },
  },
  pain_points: {
    P1_FIND_CONTACT: {
      code: "P1_FIND_CONTACT",
      name_en: "Customers cannot easily find or contact us online",
      name_hi: "ग्राहक हमें ऑनलाइन आसानी से खोज या संपर्क नहीं कर पाते",
      target_dimension: "presence",
    },
  },
  urgency_tiers: {
    U1_NOT_URGENT: {
      code: "U1_NOT_URGENT",
      level: 1,
      name_en: "Not urgent / Exploratory",
      name_hi: "कोई जल्दबाजी नहीं / प्रारंभिक खोज",
      description_en: "Planning for long-term improvement.",
      description_hi: "दीर्घकालिक सुधार की योजना।",
    },
    U4_IMMEDIATE: {
      code: "U4_IMMEDIATE",
      level: 4,
      name_en: "Immediate / As soon as possible",
      name_hi: "तत्काल / यथाशीघ्र",
      description_en: "Critical immediate need to adopt solutions.",
      description_hi: "समाधान अपनाने की अत्यंत आवश्यकता।",
    },
  },
  budget_tiers: {
    B0_FREE: {
      code: "B0_FREE",
      tier_level: 0,
      name_en: "No additional budget / Free solutions only",
      name_hi: "कोई अतिरिक्त बजट नहीं / केवल निःशुल्क समाधान",
      description_en: "Willing to adopt zero-cost tools only.",
      description_hi: "केवल शून्य-लागत मोबाइल टूल्स।",
      illustrative_range: "₹0 / month (Illustrative)",
      compatible_cost_levels: ["low"],
    },
    B1_LOW: {
      code: "B1_LOW",
      tier_level: 1,
      name_en: "Low budget",
      name_hi: "कम बजट",
      description_en: "Small monthly amount.",
      description_hi: "छोटा मासिक खर्च।",
      illustrative_range: "< ₹1,000 / month (Illustrative)",
      compatible_cost_levels: ["low"],
    },
  },
  existing_tools: {
    TOOL_UPI_QR: {
      code: "TOOL_UPI_QR",
      name_en: "Static / Soundbox UPI QR Code",
      name_hi: "स्टेटिक / साउंडबॉक्स यूपीआई क्यूआर कोड",
      related_rec_codes: ["REC-PAY-01"],
    },
    TOOL_NONE: {
      code: "TOOL_NONE",
      name_en: "No digital tools used currently",
      name_hi: "वर्तमान में किसी डिजिटल टूल का उपयोग नहीं",
      related_rec_codes: [],
    },
  },
};

describe("RequirementProfilingSection Component", () => {
  it("renders controlled research categories in English by default", () => {
    const handleChange = vi.fn();
    render(
      <RequirementProfilingSection
        taxonomies={mockTaxonomies}
        profileState={{
          business_goal: "G1_CUSTOMER_REACH",
          primary_pain_point: "P1_FIND_CONTACT",
          urgency: "U1_NOT_URGENT",
          budget_tier: "B0_FREE",
          existing_tools: ["TOOL_NONE"],
        }}
        onChange={handleChange}
        currentLang="en"
      />
    );

    expect(screen.getByText("Increase customer reach")).toBeInTheDocument();
    expect(screen.getByText("Customers cannot easily find or contact us online")).toBeInTheDocument();
    expect(screen.getByText("No additional budget / Free solutions only")).toBeInTheDocument();
    expect(screen.getByText("₹0 / month (Illustrative)")).toBeInTheDocument();
    expect(screen.getByText("Proposed Research Instrument V1 — Indicative Categories")).toBeInTheDocument();
  });

  it("renders in Hindi when currentLang is hi", () => {
    const handleChange = vi.fn();
    render(
      <RequirementProfilingSection
        taxonomies={mockTaxonomies}
        profileState={{
          business_goal: "G1_CUSTOMER_REACH",
          primary_pain_point: "P1_FIND_CONTACT",
          urgency: "U1_NOT_URGENT",
          budget_tier: "B0_FREE",
          existing_tools: ["TOOL_NONE"],
        }}
        onChange={handleChange}
        currentLang="hi"
      />
    );

    expect(screen.getByText("नए ग्राहकों तक पहुंच बढ़ाना")).toBeInTheDocument();
    expect(screen.getByText("ग्राहक हमें ऑनलाइन आसानी से खोज या संपर्क नहीं कर पाते")).toBeInTheDocument();
    expect(screen.getByText("कोई अतिरिक्त बजट नहीं / केवल निःशुल्क समाधान")).toBeInTheDocument();
  });

  it("calls onChange when selecting a goal or budget tier", () => {
    const handleChange = vi.fn();
    render(
      <RequirementProfilingSection
        taxonomies={mockTaxonomies}
        profileState={{
          business_goal: "G1_CUSTOMER_REACH",
          primary_pain_point: "P1_FIND_CONTACT",
          urgency: "U1_NOT_URGENT",
          budget_tier: "B0_FREE",
          existing_tools: ["TOOL_NONE"],
        }}
        onChange={handleChange}
        currentLang="en"
      />
    );

    const increaseSalesBtn = screen.getByText("Increase sales & repeat orders");
    fireEvent.click(increaseSalesBtn);
    expect(handleChange).toHaveBeenCalledWith({ business_goal: "G2_INCREASE_SALES" });

    const lowBudgetBtn = screen.getByText("Low budget");
    fireEvent.click(lowBudgetBtn);
    expect(handleChange).toHaveBeenCalledWith({ budget_tier: "B1_LOW" });
  });
});
