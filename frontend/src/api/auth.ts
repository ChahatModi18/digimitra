import { apiClient, TOKEN_STORAGE_KEY } from "./client";
import { APIResponse } from "../types";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface TokenResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function loginUser(email: string, password: string): Promise<TokenResponseData> {
  const response = await apiClient.post<APIResponse<TokenResponseData>>("/auth/login", {
    email,
    password,
  });
  if (response.data.data) {
    setStoredToken(response.data.data.access_token);
    return response.data.data;
  }
  throw new Error(response.data.message || "Login failed");
}

export async function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role?: string;
}): Promise<User> {
  const response = await apiClient.post<APIResponse<User>>("/auth/register", payload);
  if (response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Registration failed");
}

/**
 * Ensures an active session token exists (auto-logs in demo MSME user if not present).
 */
export async function ensureAuthenticatedSession(): Promise<string> {
  const existing = getStoredToken();
  if (existing) {
    return existing;
  }

  const demoEmail = "demo_owner@digimitra.in";
  const demoPass = "DemoMSME2026!";

  try {
    const authData = await loginUser(demoEmail, demoPass);
    return authData.access_token;
  } catch (loginErr) {
    // If user does not exist, auto-register then login
    try {
      await registerUser({
        email: demoEmail,
        password: demoPass,
        full_name: "Demo MSME Owner",
        role: "business_owner",
      });
      const authData = await loginUser(demoEmail, demoPass);
      return authData.access_token;
    } catch (regErr) {
      throw new Error("Could not initialize authenticated session.");
    }
  }
}
