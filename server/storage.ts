import { 
  type User, type InsertUser, 
  type Customer, type InsertCustomer,
  type Activity, type InsertActivity,
  type Tier, type InsertTier,
  users, customers, activity, tiers
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  getActivities(limit?: number): Promise<Activity[]>;
  getCustomerActivities(customerId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  getTiers(): Promise<Tier[]>;
  createTier(tier: InsertTier): Promise<Tier>;
  updateTier(id: number, tier: Partial<InsertTier>): Promise<Tier | undefined>;
  
  getDashboardStats(): Promise<{
    totalRevenue: number;
    activeMembers: number;
    loyaltyVisits: number;
    rewardsRedeemed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.id));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const avatar = insertCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const [customer] = await db.insert(customers).values({ ...insertCustomer, avatar }).returning();
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return customer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id)).returning({ id: customers.id });
    return result.length > 0;
  }

  async getActivities(limit = 10): Promise<Activity[]> {
    return db.select().from(activity).orderBy(desc(activity.createdAt)).limit(limit);
  }

  async getCustomerActivities(customerId: number): Promise<Activity[]> {
    return db.select().from(activity).where(eq(activity.customerId, customerId)).orderBy(desc(activity.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [act] = await db.insert(activity).values(insertActivity).returning();
    
    if (insertActivity.type === 'visit') {
      const amount = parseFloat(insertActivity.amount?.toString() || "0");
      await db.update(customers)
        .set({ 
          visits: sql`${customers.visits} + 1`,
          spend: sql`${customers.spend} + ${amount}`,
          lastVisit: new Date()
        })
        .where(eq(customers.id, insertActivity.customerId));
    }
    
    return act;
  }

  async getTiers(): Promise<Tier[]> {
    return db.select().from(tiers).orderBy(tiers.threshold);
  }

  async createTier(insertTier: InsertTier): Promise<Tier> {
    const [tier] = await db.insert(tiers).values(insertTier).returning();
    return tier;
  }

  async updateTier(id: number, updates: Partial<InsertTier>): Promise<Tier | undefined> {
    const [tier] = await db.update(tiers).set(updates).where(eq(tiers.id, id)).returning();
    return tier;
  }

  async getDashboardStats(): Promise<{
    totalRevenue: number;
    activeMembers: number;
    loyaltyVisits: number;
    rewardsRedeemed: number;
  }> {
    const [revenueResult] = await db.select({ 
      total: sql<string>`COALESCE(SUM(${customers.spend}), 0)` 
    }).from(customers);
    
    const [membersResult] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(customers);
    
    const [visitsResult] = await db.select({ 
      total: sql<number>`COALESCE(SUM(${customers.visits}), 0)` 
    }).from(customers);
    
    const [rewardsResult] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(activity).where(eq(activity.type, 'reward'));

    return {
      totalRevenue: parseFloat(revenueResult?.total || "0"),
      activeMembers: membersResult?.count || 0,
      loyaltyVisits: visitsResult?.total || 0,
      rewardsRedeemed: rewardsResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
