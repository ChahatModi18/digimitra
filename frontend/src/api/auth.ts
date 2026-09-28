import { apiClient, TOKEN_STORAGE_KEY } from "./client";
import { APIResponse } from "../types";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone_number?: string;
}

export interface TokenResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export function getStoredToken(): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    // ignore in environments without localStorage
  }
  return null;
}

export function setStoredToken(token: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch (e) {
    // ignore
  }
}

export function clearStoredToken(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    // ignore
  }
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

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Expired if current time + 10s buffer > exp * 1000
    return Date.now() >= payload.exp * 1000 - 10000;
  } catch (e) {
    return true;
  }
}

/**
 * Ensures an active session token exists (auto-logs in demo MSME user if not present or expired).
 */
export async function ensureAuthenticatedSession(): Promise<string> {
  const existing = getStoredToken();
  if (existing && !isTokenExpired(existing)) {
    return existing;
  }

  // Clear stale or expired token
  if (existing) {
    clearStoredToken();
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
