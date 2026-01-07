import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("manager").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  tier: text("tier").default("Silver").notNull(),
  segment: text("segment").default("Occasional").notNull(),
  visits: integer("visits").default(0).notNull(),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0").notNull(),
  lastVisit: timestamp("last_visit"),
  avatar: text("avatar"),
});

export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  type: text("type").notNull(), // 'visit', 'reward', 'signup'
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0"),
  rewardUsed: text("reward_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tiers = pgTable("tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  requirement: text("requirement").notNull(),
  threshold: decimal("threshold", { precision: 10, scale: 2 }).notNull(),
  benefits: text("benefits").array().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, lastVisit: true });
export const insertActivitySchema = createInsertSchema(activity).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type Tier = typeof tiers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
