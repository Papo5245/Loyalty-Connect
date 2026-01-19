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

// Restaurant Tables
export interface RestaurantTable {
  id: number;
  name: string;
  capacity: number;
  location: string;
  status: string;
  currentCustomerId: number | null;
  notes: string | null;
}

export const tablesApi = {
  getAll: () => fetchApi<RestaurantTable[]>("/tables"),
  create: (data: Omit<RestaurantTable, "id">) =>
    fetchApi<RestaurantTable>("/tables", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<RestaurantTable>) =>
    fetchApi<RestaurantTable>(`/tables/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/tables/${id}`, {
      method: "DELETE",
    }),
};

// Table Sessions
export interface TableSession {
  id: number;
  tableId: number;
  customerId: number | null;
  partySize: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
}

export const tableSessionsApi = {
  getAll: (activeOnly?: boolean) => fetchApi<TableSession[]>(`/table-sessions${activeOnly ? '?active=true' : ''}`),
  create: (data: Omit<TableSession, "id" | "startedAt" | "endedAt">) =>
    fetchApi<TableSession>("/table-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<TableSession>) =>
    fetchApi<TableSession>(`/table-sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Feedback
export interface Feedback {
  id: number;
  customerId: number | null;
  rating: number;
  channel: string;
  comment: string | null;
  createdAt: string;
}

export interface FeedbackStats {
  avgRating: number;
  totalReviews: number;
  positivePercent: number;
  byChannel: { channel: string; count: number }[];
  byRating: { rating: number; count: number }[];
}

export const feedbackApi = {
  getAll: () => fetchApi<Feedback[]>("/feedback"),
  create: (data: Omit<Feedback, "id" | "createdAt">) =>
    fetchApi<Feedback>("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStats: () => fetchApi<FeedbackStats>("/feedback/stats"),
};
