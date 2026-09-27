/**
 * Frontend TypeScript Type Definitions
 */

export interface ComponentStatus {
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, any>;
}

export interface SystemInfo {
  python_version: string;
  platform: string;
  framework: string;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  components: Record<string, ComponentStatus>;
  system_info: SystemInfo;
}

export interface Business {
  id: number;
  name: string;
  sector: string;
  enterprise_size: "Micro" | "Small" | "Medium";
  state: string;
  city: string;
  pincode?: string;
  description?: string;
  primary_language: string;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export enum RBDLLevel {
  LEVEL_0 = 0,
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}
