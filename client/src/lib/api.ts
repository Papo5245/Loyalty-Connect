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

// Wallets
export interface Wallet {
  id: number;
  customerId: number;
  balancePuntos: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export const walletsApi = {
  getAll: () => fetchApi<Wallet[]>("/wallets"),
  getOne: (id: number) => fetchApi<Wallet>(`/wallets/${id}`),
  getByCustomerId: (customerId: number) => fetchApi<Wallet | null>(`/wallets/customer/${customerId}`),
  create: (data: Omit<Wallet, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<Wallet>("/wallets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getTransactions: (walletId: number) => fetchApi<WalletTransaction[]>(`/wallets/${walletId}/transactions`),
  createTransaction: (walletId: number, data: Omit<WalletTransaction, "id" | "walletId" | "createdAt">) =>
    fetchApi<WalletTransaction>(`/wallets/${walletId}/transactions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Tags
export interface Tag {
  id: number;
  name: string;
  color: string;
  category: string;
}

export const tagsApi = {
  getAll: () => fetchApi<Tag[]>("/tags"),
  create: (data: Omit<Tag, "id">) =>
    fetchApi<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Tag>) =>
    fetchApi<Tag>(`/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<{ success: boolean }>(`/tags/${id}`, { method: "DELETE" }),
};

// Customer Tags
export const customerTagsApi = {
  getCustomerTags: (customerId: number) => fetchApi<Tag[]>(`/customers/${customerId}/tags`),
  addTag: (customerId: number, tagId: number) =>
    fetchApi<{ id: number; customerId: number; tagId: number }>(`/customers/${customerId}/tags/${tagId}`, {
      method: "POST",
    }),
  removeTag: (customerId: number, tagId: number) =>
    fetchApi<{ success: boolean }>(`/customers/${customerId}/tags/${tagId}`, {
      method: "DELETE",
    }),
};

// Customer Stats
export interface CustomerStats {
  totalSpend: number;
  orderCount: number;
  visits: number;
  avgRating: number;
}

export const customerStatsApi = {
  getStats: (customerId: number) => fetchApi<CustomerStats>(`/customers/${customerId}/stats`),
};

// Orders
export interface Order {
  id: number;
  customerId: number;
  total: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemName: string;
  quantity: number;
  price: string;
}

export const ordersApi = {
  getCustomerOrders: (customerId: number) => fetchApi<Order[]>(`/customers/${customerId}/orders`),
  getOrderItems: (orderId: number) => fetchApi<OrderItem[]>(`/orders/${orderId}/items`),
  createOrder: (customerId: number, data: { total: string; items: Omit<OrderItem, "id" | "orderId">[] }) =>
    fetchApi<Order>(`/customers/${customerId}/orders`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
