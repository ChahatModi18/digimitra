import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareModal } from "../src/components/ui/ShareModal";

describe("ShareModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders social share channels and allows copying the share link", async () => {
    const handleClose = vi.fn();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ShareModal
        isOpen={true}
        onClose={handleClose}
        title="Check out DigiMitra"
        description="Empowering MSMEs with digital transformation roadmaps"
        shareUrl="http://localhost:5173/roadmap"
        currentLang="en"
      />
    );

    // Channels present
    expect(screen.getByText("Share DigiMitra")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Twitter / X")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();

    // Verify copy button
    const copyButton = screen.getByRole("button", { name: /Copy/i });
    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith("http://localhost:5173/roadmap");

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });

    // Close button
    const closeBtn = screen.getByLabelText("Close share dialog");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ShareModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
