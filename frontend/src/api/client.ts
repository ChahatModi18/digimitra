import axios from "axios";

export const TOKEN_STORAGE_KEY = "digimitra_access_token";

// Base API client
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for clean error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = error.response?.data?.error || {
      code: error.response?.status ? `HTTP_${error.response.status}` : "NETWORK_ERROR",
      message: error.response?.data?.error?.message || error.message || "Network communication failed.",
      details: error.response?.data?.error?.details || null,
    };
    return Promise.reject(customError);
  }
);
