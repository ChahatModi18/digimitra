import axios from "axios";

// Base API client
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Response interceptor for clean error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = error.response?.data?.error || {
      code: "NETWORK_ERROR",
      message: error.message || "Network communication failed.",
    };
    return Promise.reject(customError);
  }
);
