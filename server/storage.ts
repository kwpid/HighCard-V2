import { users, seasonalPeaks, mmrHistory, type User, type InsertUser, type SeasonalPeak, type MmrHistory, type InsertSeasonalPeak, type InsertMmrHistory } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Seasonal peak MMR tracking
  updateSeasonalPeak(userId: number, gameMode: '1v1' | '2v2', season: number, mmr: number, rank?: string, division?: string): Promise<void>;
  getSeasonalPeaks(userId: number): Promise<SeasonalPeak[]>;
  
  // MMR history tracking
  recordMmrHistory(userId: number, gameMode: '1v1' | '2v2', season: number, mmr: number, rank?: string, division?: string): Promise<void>;
  getMmrHistory(userId: number, gameMode: '1v1' | '2v2', season?: number): Promise<MmrHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, level: 1, xp: 0 };
    this.users.set(id, user);
    return user;
  }
  
  // Memory storage implementations for seasonal peaks and MMR history
  async updateSeasonalPeak(userId: number, gameMode: '1v1' | '2v2', season: number, mmr: number, rank?: string, division?: string): Promise<void> {
    // In memory storage - would need a separate Map for peaks in real implementation
    console.log(`Memory: Updated seasonal peak for user ${userId}, mode ${gameMode}, season ${season}, MMR ${mmr}`);
  }
  
  async getSeasonalPeaks(userId: number): Promise<SeasonalPeak[]> {
    return [];
  }
  
  async recordMmrHistory(userId: number, gameMode: '1v1' | '2v2', season: number, mmr: number, rank?: string, division?: string): Promise<void> {
    console.log(`Memory: Recorded MMR history for user ${userId}, mode ${gameMode}, season ${season}, MMR ${mmr}`);
  }
  
  async getMmrHistory(userId: number, gameMode: '1v1' | '2v2', season?: number): Promise<MmrHistory[]> {
    return [];
  }
}

// Database storage implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Seasonal peak MMR tracking
  async updateSeasonalPeak(userId: number, gameMode: '1v1' | '2v2', season: number, mmr: number, rank?: string, division?: string): Promise<void> {
    // Check if we already have a peak for this user/mode/season
    const existingPeak = await this.db
      .select()
      .from(seasonalPeaks)
      .where(
        and(
          eq(seasonalPeaks.userId, userId),
          eq(seasonalPeaks.gameMode, gameMode),
          eq(seasonalPeaks.season, season)
        )
      )
      .limit(1);
    
    if (existingPeak.length > 0 && existingPeak[0].peakMMR >= mmr) {
      return; // Current peak is higher, no update needed
    }
    
    const peakData: InsertSeasonalPeak = {
      userId,
      gameMode,
      season,
      peakMMR: mmr,
      peakRank: rank,
      peakDivision: division
    };
    
    if (existingPeak.length > 0) {
      // Update existing peak
      await this.db
        .update(seasonalPeaks)
        .set({
          peakMMR: mmr,
          peakRank: rank,
          peakDivision: division,
          achievedAt: new Date()
        })
        .where(eq(seasonalPeaks.id, existingPeak[0].id));
    } else {
      // Insert new peak
      await this.db.insert(seasonalPeaks).values(peakData);
    }
  }
  
  async getSeasonalPeaks(userId: number): Promise<SeasonalPeak[]> {
    return await this.db
      .select()
      .from(seasonalPeaks)
      .where(eq(seasonalPeaks.userId, userId))
      .orderBy(desc(seasonalPeaks.season), desc(seasonalPeaks.peakMMR));
  }
  
  // MMR history tracking
  async recordMmrHistory(userId: number, gameMode: '1v1' | '2v2', season: number, mmr: number, rank?: string, division?: string): Promise<void> {
    const historyData: InsertMmrHistory = {
      userId,
      gameMode,
      season,
      mmr,
      rank,
      division
    };
    
    await this.db.insert(mmrHistory).values(historyData);
  }
  
  async getMmrHistory(userId: number, gameMode: '1v1' | '2v2', season?: number): Promise<MmrHistory[]> {
    const conditions = [
      eq(mmrHistory.userId, userId),
      eq(mmrHistory.gameMode, gameMode)
    ];
    
    if (season !== undefined) {
      conditions.push(eq(mmrHistory.season, season));
    }
    
    return await this.db
      .select()
      .from(mmrHistory)
      .where(and(...conditions))
      .orderBy(mmrHistory.recordedAt);
  }
}

// Use database storage for production, memory storage for development fallback
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
