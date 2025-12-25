import React from 'react';

// Mock Data for Loyalize

export const customers = [
  { id: 1, name: "Sofia Rodriguez", email: "sofia.r@example.com", tier: "Platinum", visits: 42, spend: 3240, lastVisit: "2024-03-10", segment: "High Spender", avatar: "SR" },
  { id: 2, name: "James Chen", email: "james.c@example.com", tier: "Gold", visits: 18, spend: 1150, lastVisit: "2024-03-08", segment: "Regular", avatar: "JC" },
  { id: 3, name: "Emily Watson", email: "emily.w@example.com", tier: "Silver", visits: 5, spend: 240, lastVisit: "2024-02-28", segment: "Occasional", avatar: "EW" },
  { id: 4, name: "Michael Johnson", email: "michael.j@example.com", tier: "Platinum", visits: 56, spend: 4800, lastVisit: "2024-03-11", segment: "VIP", avatar: "MJ" },
  { id: 5, name: "Sarah Miller", email: "sarah.m@example.com", tier: "Gold", visits: 22, spend: 1350, lastVisit: "2024-03-01", segment: "Regular", avatar: "SM" },
  { id: 6, name: "David Kim", email: "david.k@example.com", tier: "Silver", visits: 8, spend: 450, lastVisit: "2024-03-05", segment: "Growing", avatar: "DK" },
  { id: 7, name: "Jessica Taylor", email: "jessica.t@example.com", tier: "Platinum", visits: 38, spend: 2900, lastVisit: "2024-03-09", segment: "High Spender", avatar: "JT" },
  { id: 8, name: "Robert Anderson", email: "robert.a@example.com", tier: "Silver", visits: 3, spend: 150, lastVisit: "2024-01-15", segment: "At Risk", avatar: "RA" },
];

export const recentActivity = [
  { id: 1, type: "visit", customer: "Sofia Rodriguez", amount: 120, date: "Today, 12:30 PM", rewardUsed: "Free Dessert" },
  { id: 2, type: "visit", customer: "Michael Johnson", amount: 350, date: "Today, 1:15 PM", rewardUsed: null },
  { id: 3, type: "reward", customer: "James Chen", amount: 0, date: "Yesterday", rewardUsed: "Birthday Discount (20%)" },
  { id: 4, type: "signup", customer: "New Member", amount: 0, date: "Yesterday", rewardUsed: null },
];

export const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 4500 },
  { name: 'Fri', sales: 8000 },
  { name: 'Sat', sales: 9500 },
  { name: 'Sun', sales: 7000 },
];

export const tiersData = [
  { name: 'Platinum', value: 15, color: 'hsl(var(--primary))' },
  { name: 'Gold', value: 35, color: 'hsl(173, 58%, 39%)' },
  { name: 'Silver', value: 50, color: 'hsl(215.4, 16.3%, 46.9%)' },
];

export const roiData = [
  { month: 'Jan', cost: 1200, revenue: 8500 },
  { month: 'Feb', cost: 1400, revenue: 9800 },
  { month: 'Mar', cost: 1100, revenue: 10500 },
  { month: 'Apr', cost: 1600, revenue: 12000 },
];
