import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Track seasonal peak MMR for each game mode
export const seasonalPeaks = pgTable("seasonal_peaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameMode: varchar("game_mode", { length: 10 }).notNull(), // '1v1' or '2v2'
  season: integer("season").notNull(),
  peakMMR: integer("peak_mmr").notNull(),
  peakRank: text("peak_rank"),
  peakDivision: text("peak_division"),
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
});

// Track daily MMR history for graphs
export const mmrHistory = pgTable("mmr_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameMode: varchar("game_mode", { length: 10 }).notNull(), // '1v1' or '2v2'
  season: integer("season").notNull(),
  mmr: integer("mmr").notNull(),
  rank: text("rank"),
  division: text("division"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertSeasonalPeakSchema = createInsertSchema(seasonalPeaks);
export const insertMmrHistorySchema = createInsertSchema(mmrHistory);

export type InsertSeasonalPeak = z.infer<typeof insertSeasonalPeakSchema>;
export type SeasonalPeak = typeof seasonalPeaks.$inferSelect;
export type InsertMmrHistory = z.infer<typeof insertMmrHistorySchema>;
export type MmrHistory = typeof mmrHistory.$inferSelect;
