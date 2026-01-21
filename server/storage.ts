import { 
  type User, type InsertUser, 
  type Customer, type InsertCustomer,
  type Activity, type InsertActivity,
  type Tier, type InsertTier,
  type RestaurantTable, type InsertRestaurantTable,
  type TableSession, type InsertTableSession,
  type Feedback, type InsertFeedback,
  type Wallet, type InsertWallet,
  type WalletTransaction, type InsertWalletTransaction,
  users, customers, activity, tiers, restaurantTables, tableSessions, feedback, wallets, walletTransactions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

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
  
  getTables(): Promise<RestaurantTable[]>;
  getTable(id: number): Promise<RestaurantTable | undefined>;
  createTable(table: InsertRestaurantTable): Promise<RestaurantTable>;
  updateTable(id: number, table: Partial<InsertRestaurantTable>): Promise<RestaurantTable | undefined>;
  deleteTable(id: number): Promise<boolean>;
  
  getTableSessions(activeOnly?: boolean): Promise<TableSession[]>;
  createTableSession(session: InsertTableSession): Promise<TableSession>;
  updateTableSession(id: number, updates: Partial<TableSession>): Promise<TableSession | undefined>;
  
  getFeedback(): Promise<Feedback[]>;
  createFeedback(fb: InsertFeedback): Promise<Feedback>;
  getFeedbackStats(): Promise<{
    avgRating: number;
    totalReviews: number;
    positivePercent: number;
    byChannel: { channel: string; count: number }[];
    byRating: { rating: number; count: number }[];
  }>;
  
  getDashboardStats(): Promise<{
    totalRevenue: number;
    activeMembers: number;
    loyaltyVisits: number;
    rewardsRedeemed: number;
  }>;
  
  getWallets(): Promise<Wallet[]>;
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByCustomerId(customerId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, amount: number, type: 'add' | 'subtract'): Promise<Wallet | undefined>;
  
  getWalletTransactions(walletId: number): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
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

  async getTables(): Promise<RestaurantTable[]> {
    return db.select().from(restaurantTables).orderBy(restaurantTables.name);
  }

  async getTable(id: number): Promise<RestaurantTable | undefined> {
    const [table] = await db.select().from(restaurantTables).where(eq(restaurantTables.id, id));
    return table;
  }

  async createTable(insertTable: InsertRestaurantTable): Promise<RestaurantTable> {
    const [table] = await db.insert(restaurantTables).values(insertTable).returning();
    return table;
  }

  async updateTable(id: number, updates: Partial<InsertRestaurantTable>): Promise<RestaurantTable | undefined> {
    const [table] = await db.update(restaurantTables).set(updates).where(eq(restaurantTables.id, id)).returning();
    return table;
  }

  async deleteTable(id: number): Promise<boolean> {
    const result = await db.delete(restaurantTables).where(eq(restaurantTables.id, id)).returning({ id: restaurantTables.id });
    return result.length > 0;
  }

  async getTableSessions(activeOnly = false): Promise<TableSession[]> {
    if (activeOnly) {
      return db.select().from(tableSessions).where(eq(tableSessions.status, 'seated')).orderBy(desc(tableSessions.startedAt));
    }
    return db.select().from(tableSessions).orderBy(desc(tableSessions.startedAt));
  }

  async createTableSession(insertSession: InsertTableSession): Promise<TableSession> {
    const [session] = await db.insert(tableSessions).values(insertSession).returning();
    await db.update(restaurantTables).set({ status: 'occupied', currentCustomerId: insertSession.customerId }).where(eq(restaurantTables.id, insertSession.tableId));
    return session;
  }

  async updateTableSession(id: number, updates: Partial<TableSession>): Promise<TableSession | undefined> {
    const [session] = await db.update(tableSessions).set(updates).where(eq(tableSessions.id, id)).returning();
    if (session && updates.status === 'cleared') {
      await db.update(restaurantTables).set({ status: 'available', currentCustomerId: null }).where(eq(restaurantTables.id, session.tableId));
    }
    return session;
  }

  async getFeedback(): Promise<Feedback[]> {
    return db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [fb] = await db.insert(feedback).values(insertFeedback).returning();
    return fb;
  }

  async getFeedbackStats(): Promise<{
    avgRating: number;
    totalReviews: number;
    positivePercent: number;
    byChannel: { channel: string; count: number }[];
    byRating: { rating: number; count: number }[];
  }> {
    const [avgResult] = await db.select({
      avg: sql<string>`COALESCE(AVG(${feedback.rating}), 0)`,
      count: sql<number>`COUNT(*)`,
      positive: sql<number>`COUNT(*) FILTER (WHERE ${feedback.rating} >= 4)`
    }).from(feedback);

    const byChannelResult = await db.select({
      channel: feedback.channel,
      count: sql<number>`COUNT(*)`
    }).from(feedback).groupBy(feedback.channel);

    const byRatingResult = await db.select({
      rating: feedback.rating,
      count: sql<number>`COUNT(*)`
    }).from(feedback).groupBy(feedback.rating).orderBy(feedback.rating);

    const total = avgResult?.count || 0;
    const positive = avgResult?.positive || 0;

    return {
      avgRating: parseFloat(avgResult?.avg || "0"),
      totalReviews: total,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      byChannel: byChannelResult.map(r => ({ channel: r.channel, count: Number(r.count) })),
      byRating: byRatingResult.map(r => ({ rating: r.rating, count: Number(r.count) })),
    };
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

  async getWallets(): Promise<Wallet[]> {
    return db.select().from(wallets).orderBy(desc(wallets.id));
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletByCustomerId(customerId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.customerId, customerId));
    return wallet;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async updateWalletBalance(id: number, amount: number, type: 'add' | 'subtract'): Promise<Wallet | undefined> {
    const operation = type === 'add' 
      ? sql`${wallets.balancePuntos} + ${amount}`
      : sql`${wallets.balancePuntos} - ${amount}`;
    
    const [wallet] = await db.update(wallets)
      .set({ 
        balancePuntos: operation,
        updatedAt: new Date()
      })
      .where(eq(wallets.id, id))
      .returning();
    return wallet;
  }

  async getWalletTransactions(walletId: number): Promise<WalletTransaction[]> {
    return db.select().from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [transaction] = await db.insert(walletTransactions).values(insertTransaction).returning();
    
    const type = insertTransaction.type === 'credit' ? 'add' : 'subtract';
    await this.updateWalletBalance(insertTransaction.walletId, insertTransaction.amount, type);
    
    return transaction;
  }
}

export const storage = new DatabaseStorage();
