import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // MMR tracking API routes
  app.post("/api/mmr/seasonal-peak", async (req, res) => {
    try {
      const { userId, gameMode, season, mmr, rank, division } = req.body;
      await storage.updateSeasonalPeak(userId, gameMode, season, mmr, rank, division);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update seasonal peak" });
    }
  });

  app.get("/api/mmr/seasonal-peaks/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const peaks = await storage.getSeasonalPeaks(userId);
      res.json(peaks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get seasonal peaks" });
    }
  });

  app.post("/api/mmr/history", async (req, res) => {
    try {
      const { userId, gameMode, season, mmr, rank, division } = req.body;
      await storage.recordMmrHistory(userId, gameMode, season, mmr, rank, division);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record MMR history" });
    }
  });

  app.get("/api/mmr/history/:userId/:gameMode", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gameMode = req.params.gameMode as '1v1' | '2v2';
      const season = req.query.season ? parseInt(req.query.season as string) : undefined;
      const history = await storage.getMmrHistory(userId, gameMode, season);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get MMR history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
