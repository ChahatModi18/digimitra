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

// Response interceptor with auto-recovery on expired JWT
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthError =
      error.response?.status === 401 ||
      error.response?.data?.error?.message?.toLowerCase().includes("expired") ||
      error.response?.data?.detail?.toLowerCase().includes("expired");

    if (isAuthError && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      localStorage.removeItem(TOKEN_STORAGE_KEY);

      try {
        const { ensureAuthenticatedSession } = await import("./auth");
        const newToken = await ensureAuthenticatedSession();
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const customError = error.response?.data?.error || {
      code: error.response?.status ? `HTTP_${error.response.status}` : "NETWORK_ERROR",
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Network communication failed.",
      details: error.response?.data?.error?.details || null,
    };
    return Promise.reject(customError);
  }
);
