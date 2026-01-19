import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  type: text("type").notNull(),
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

export const restaurantTables = pgTable("restaurant_tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").default(4).notNull(),
  location: text("location").default("Main").notNull(),
  status: text("status").default("available").notNull(),
  currentCustomerId: integer("current_customer_id"),
  notes: text("notes"),
});

export const tableSessions = pgTable("table_sessions", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull(),
  customerId: integer("customer_id"),
  partySize: integer("party_size").default(2).notNull(),
  status: text("status").default("seated").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  rating: integer("rating").notNull(),
  channel: text("channel").default("in-app").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, lastVisit: true });
export const insertActivitySchema = createInsertSchema(activity).omit({ id: true, createdAt: true });
export const insertTierSchema = createInsertSchema(tiers).omit({ id: true });
export const insertRestaurantTableSchema = createInsertSchema(restaurantTables).omit({ id: true });
export const insertTableSessionSchema = createInsertSchema(tableSessions).omit({ id: true, startedAt: true, endedAt: true });
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Activity = typeof activity.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Tier = typeof tiers.$inferSelect;
export type InsertTier = z.infer<typeof insertTierSchema>;
export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type InsertRestaurantTable = z.infer<typeof insertRestaurantTableSchema>;
export type TableSession = typeof tableSessions.$inferSelect;
export type InsertTableSession = z.infer<typeof insertTableSessionSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
