import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertActivitySchema, insertTierSchema, insertRestaurantTableSchema, insertTableSessionSchema, insertFeedbackSchema, insertWalletSchema, insertWalletTransactionSchema } from "@shared/schema";
import { z } from "zod";

const idParamSchema = z.coerce.number().int().positive();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const customer = await storage.getCustomer(parseResult.data);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(parseResult.data, updates);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const deleted = await storage.deleteCustomer(parseResult.data);
      if (!deleted) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limitParam = req.query.limit as string | undefined;
      let limit = 10;
      if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (!Number.isFinite(parsed) || parsed < 1) {
          return res.status(400).json({ error: "Invalid limit parameter" });
        }
        limit = parsed;
      }
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const data = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(data);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // Tiers
  app.get("/api/tiers", async (req, res) => {
    try {
      const tiers = await storage.getTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tiers" });
    }
  });

  app.post("/api/tiers", async (req, res) => {
    try {
      const data = insertTierSchema.parse(req.body);
      const tier = await storage.createTier(data);
      res.status(201).json(tier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create tier" });
    }
  });

  app.patch("/api/tiers/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid tier ID" });
      }
      const updates = insertTierSchema.partial().parse(req.body);
      const tier = await storage.updateTier(parseResult.data, updates);
      if (!tier) {
        return res.status(404).json({ error: "Tier not found" });
      }
      res.json(tier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update tier" });
    }
  });

  // Restaurant Tables
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const data = insertRestaurantTableSchema.parse(req.body);
      const table = await storage.createTable(data);
      res.status(201).json(table);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create table" });
    }
  });

  app.patch("/api/tables/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid table ID" });
      }
      const updates = insertRestaurantTableSchema.partial().parse(req.body);
      const table = await storage.updateTable(parseResult.data, updates);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update table" });
    }
  });

  app.delete("/api/tables/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid table ID" });
      }
      const deleted = await storage.deleteTable(parseResult.data);
      if (!deleted) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete table" });
    }
  });

  // Table Sessions
  app.get("/api/table-sessions", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const sessions = await storage.getTableSessions(activeOnly);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch table sessions" });
    }
  });

  app.post("/api/table-sessions", async (req, res) => {
    try {
      const data = insertTableSessionSchema.parse(req.body);
      const session = await storage.createTableSession(data);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create table session" });
    }
  });

  app.patch("/api/table-sessions/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const session = await storage.updateTableSession(parseResult.data, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update table session" });
    }
  });

  // Feedback
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedbackList = await storage.getFeedback();
      res.json(feedbackList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const fb = await storage.createFeedback(data);
      res.status(201).json(fb);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  app.get("/api/feedback/stats", async (req, res) => {
    try {
      const stats = await storage.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback stats" });
    }
  });

  // Wallets
  app.get("/api/wallets", async (req, res) => {
    try {
      const walletsList = await storage.getWallets();
      res.json(walletsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  app.get("/api/wallets/:id", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.id);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid wallet ID" });
      }
      const wallet = await storage.getWallet(parseResult.data);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.get("/api/wallets/customer/:customerId", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.customerId);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const wallet = await storage.getWalletByCustomerId(parseResult.data);
      res.json(wallet || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.post("/api/wallets", async (req, res) => {
    try {
      const data = insertWalletSchema.parse(req.body);
      const wallet = await storage.createWallet(data);
      res.status(201).json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create wallet" });
    }
  });

  // Wallet Transactions
  app.get("/api/wallets/:walletId/transactions", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.walletId);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid wallet ID" });
      }
      const transactions = await storage.getWalletTransactions(parseResult.data);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/wallets/:walletId/transactions", async (req, res) => {
    try {
      const parseResult = idParamSchema.safeParse(req.params.walletId);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid wallet ID" });
      }
      const data = insertWalletTransactionSchema.parse({
        ...req.body,
        walletId: parseResult.data,
      });
      const transaction = await storage.createWalletTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  return httpServer;
}
