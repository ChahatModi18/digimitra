import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthPage } from "../src/pages/AuthPage";
import { AuthProvider } from "../src/context/AuthContext";
import * as authApi from "../src/api/auth";

vi.mock("../src/api/auth", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  ensureAuthenticatedSession: vi.fn().mockResolvedValue("mock_token"),
  getStoredToken: vi.fn().mockReturnValue(null),
  clearStoredToken: vi.fn(),
}));

describe("AuthPage Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders login form and demo sign in button", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sign In to DigiMitra/i)).toBeInTheDocument();
      expect(screen.getByText(/1-Click Quick Demo Sign In/i)).toBeInTheDocument();
    });
  });

  it("allows switching between login and register modes", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Create MSME Account/i })).toBeInTheDocument();
    });

    const registerTab = screen.getByRole("button", { name: /Create MSME Account/i });
    fireEvent.click(registerTab);

    await waitFor(() => {
      expect(screen.getByText(/Full Name \/ Owner Name/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Free Account/i })).toBeInTheDocument();
    });
  });
});
