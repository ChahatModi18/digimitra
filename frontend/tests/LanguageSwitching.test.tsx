import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LevelBadge } from "../src/components/domain/LevelBadge";
import { ResearchDisclosureBanner } from "../src/components/domain/ResearchDisclosureBanner";
import { RecommendationCard } from "../src/components/domain/RecommendationCard";

describe("Frontend Language & Localized Presentation Tests", () => {
  it("renders LevelBadge in English and Hindi accurately", () => {
    const { rerender } = render(<LevelBadge level={1} showName={true} currentLang="en" />);
    expect(screen.getByText(/Basic Digital Presence/i)).toBeInTheDocument();

    rerender(<LevelBadge level={1} showName={true} currentLang="hi" />);
    expect(screen.getByText(/बुनियादी डिजिटल उपस्थिति/i)).toBeInTheDocument();
  });

  it("renders ResearchDisclosureBanner with explicit proposed framework notice in English", () => {
    render(<ResearchDisclosureBanner />);
    expect(
      screen.getByText(/Academic & Diagnostic Methodology Disclosure/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/proposed exploratory diagnostic instrument/i)
    ).toBeInTheDocument();
  });


  it("renders RecommendationCard bilingually with feasibility badges", () => {
    const { rerender } = render(
      <RecommendationCard
        code="REC-PAY-01"
        titleEn="Set Up Basic Merchant QR Code"
        titleHi="व्यापारी क्यूआर कोड स्थापित करें"
        descriptionEn="Accept digital payments via UPI."
        descriptionHi="यूपीआई के माध्यम से डिजिटल भुगतान स्वीकार करें।"
        reasonEn="Unlocks operational digitization."
        reasonHi="परिचालन डिजिटलीकरण को सक्षम बनाता है।"
        feasibilityStatus="FEASIBLE_NOW"
        currentLang="en"
      />
    );

    expect(screen.getByText("Set Up Basic Merchant QR Code")).toBeInTheDocument();
    expect(screen.getByText("Feasible Now")).toBeInTheDocument();
    expect(screen.getByText("Why Recommended:")).toBeInTheDocument();

    rerender(
      <RecommendationCard
        code="REC-PAY-01"
        titleEn="Set Up Basic Merchant QR Code"
        titleHi="व्यापारी क्यूआर कोड स्थापित करें"
        descriptionEn="Accept digital payments via UPI."
        descriptionHi="यूपीआई के माध्यम से डिजिटल भुगतान स्वीकार करें।"
        reasonEn="Unlocks operational digitization."
        reasonHi="परिचालन डिजिटलीकरण को सक्षम बनाता है।"
        feasibilityStatus="FEASIBLE_NOW"
        currentLang="hi"
      />
    );

    expect(screen.getByText("व्यापारी क्यूआर कोड स्थापित करें")).toBeInTheDocument();
    expect(screen.getByText("तुरंत संभव")).toBeInTheDocument();
    expect(screen.getByText("यह क्यों महत्वपूर्ण है:")).toBeInTheDocument();
  });
});
