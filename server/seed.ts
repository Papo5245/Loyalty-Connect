import { db } from "./db";
import { customers, tiers, activity } from "@shared/schema";

const seedCustomers = [
  { name: "Sofia Rodriguez", email: "sofia.r@example.com", tier: "Platinum", visits: 42, spend: "3240", segment: "High Spender", avatar: "SR" },
  { name: "James Chen", email: "james.c@example.com", tier: "Gold", visits: 18, spend: "1150", segment: "Regular", avatar: "JC" },
  { name: "Emily Watson", email: "emily.w@example.com", tier: "Silver", visits: 5, spend: "240", segment: "Occasional", avatar: "EW" },
  { name: "Michael Johnson", email: "michael.j@example.com", tier: "Platinum", visits: 56, spend: "4800", segment: "VIP", avatar: "MJ" },
  { name: "Sarah Miller", email: "sarah.m@example.com", tier: "Gold", visits: 22, spend: "1350", segment: "Regular", avatar: "SM" },
  { name: "David Kim", email: "david.k@example.com", tier: "Silver", visits: 8, spend: "450", segment: "Growing", avatar: "DK" },
  { name: "Jessica Taylor", email: "jessica.t@example.com", tier: "Platinum", visits: 38, spend: "2900", segment: "High Spender", avatar: "JT" },
  { name: "Robert Anderson", email: "robert.a@example.com", tier: "Silver", visits: 3, spend: "150", segment: "At Risk", avatar: "RA" },
];

const seedTiers = [
  { name: "Silver", requirement: "Join Loyalize", threshold: "0", benefits: ["5% Cashback", "Birthday Dessert", "Exclusive Newsletter"] },
  { name: "Gold", requirement: "Spend $500+", threshold: "500", benefits: ["10% Cashback", "Priority Seating", "Free Drink every visit", "Skip the Line"] },
  { name: "Platinum", requirement: "Spend $2,500+", threshold: "2500", benefits: ["15% Cashback", "Chef's Table Access", "Personal Concierge", "Private Event Invite", "Zero Service Fees"] },
];

async function seed() {
  console.log("Seeding database...");

  // Check if data already exists
  const existingCustomers = await db.select().from(customers);
  if (existingCustomers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Insert tiers
  await db.insert(tiers).values(seedTiers);
  console.log("Inserted tiers");

  // Insert customers
  const insertedCustomers = await db.insert(customers).values(seedCustomers).returning();
  console.log("Inserted customers");

  // Insert some sample activities
  const activities = [
    { customerId: insertedCustomers[0].id, type: "visit", amount: "120", rewardUsed: "Free Dessert" },
    { customerId: insertedCustomers[3].id, type: "visit", amount: "350", rewardUsed: null },
    { customerId: insertedCustomers[1].id, type: "reward", amount: "0", rewardUsed: "Birthday Discount (20%)" },
  ];
  
  await db.insert(activity).values(activities);
  console.log("Inserted activities");

  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));
