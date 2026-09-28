import { apiClient } from "./client";

export interface DiscoveryCategory {
  id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  icon_name: string;
  relevant_dimensions: string[];
}

export interface ServiceProviderItem {
  id: string;
  name: string;
  category_id: string;
  locality: string;
  district?: string;
  state: string;
  pincode?: string;
  short_description_en: string;
  short_description_hi?: string;
  is_official_resource: boolean;
  website_url?: string;
  contact_phone?: string;
  action_label_en?: string;
  action_label_hi?: string;
  action_url?: string;
  is_mock_data: boolean;
}

export interface ServiceSearchQueryParams {
  category?: string;
  search?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  business_id?: number;
  page?: number;
  page_size?: number;
  test_mock?: boolean;
}

export interface ServiceSearchResponse {
  items: ServiceProviderItem[];
  total_count: number;
  page: number;
  page_size: number;
  provider_status: "live" | "empty_unconfigured" | "mock_test";
  provider_message_en: string;
  provider_message_hi: string;
  applied_location?: {
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  suggested_categories: string[];
}

/**
 * Fetch all 8 canonical discovery categories.
 */
export const fetchDiscoveryCategories = async (): Promise<DiscoveryCategory[]> => {
  const res = await apiClient.get<DiscoveryCategory[]>("/explore/categories");
  return res.data;
};

/**
 * Search localized digital services and resources.
 */
export const searchServices = async (
  params: ServiceSearchQueryParams = {}
): Promise<ServiceSearchResponse> => {
  const res = await apiClient.get<ServiceSearchResponse>("/explore/services", {
    params,
  });
  return res.data;
};

/**
 * Fetch single service details by ID.
 */
export const fetchServiceById = async (
  serviceId: string,
  testMock: boolean = false
): Promise<ServiceProviderItem> => {
  const res = await apiClient.get<ServiceProviderItem>(`/explore/services/${serviceId}`, {
    params: { test_mock: testMock },
  });
  return res.data;
};
