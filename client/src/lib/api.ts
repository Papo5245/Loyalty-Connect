import { queryClient } from "./queryClient";

const API_BASE = "/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Dashboard
export const dashboardApi = {
  getStats: () => fetchApi<{
    totalRevenue: number;
    activeMembers: number;
    loyaltyVisits: number;
    rewardsRedeemed: number;
  }>("/dashboard/stats"),
};

// Customers
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  tier: string;
  segment: string;
  visits: number;
  spend: string;
  lastVisit: string | null;
  avatar: string | null;
}

export const customersApi = {
  getAll: () => fetchApi<Customer[]>("/customers"),
  getOne: (id: number) => fetchApi<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, "id" | "lastVisit" | "avatar">) =>
    fetchApi<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Customer>) =>
    fetchApi<Customer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/customers/${id}`, {
      method: "DELETE",
    }),
};

// Activities
export interface Activity {
  id: number;
  customerId: number;
  type: string;
  amount: string | null;
  rewardUsed: string | null;
  createdAt: string;
}

export const activitiesApi = {
  getAll: (limit?: number) => fetchApi<Activity[]>(`/activities${limit ? `?limit=${limit}` : ""}`),
  create: (data: Omit<Activity, "id" | "createdAt">) =>
    fetchApi<Activity>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Tiers
export interface Tier {
  id: number;
  name: string;
  requirement: string;
  threshold: string;
  benefits: string[];
}

export const tiersApi = {
  getAll: () => fetchApi<Tier[]>("/tiers"),
  create: (data: Omit<Tier, "id">) =>
    fetchApi<Tier>("/tiers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Tier>) =>
    fetchApi<Tier>(`/tiers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
