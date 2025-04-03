import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User/Admin table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: integer("is_admin").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Participants (QR code users)
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  participantId: varchar("participant_id", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  participantId: true,
});

// Audio files table
export const audioFiles = pgTable("audio_files", {
  id: serial("id").primaryKey(),
  audioId: varchar("audio_id", { length: 50 }).notNull().unique(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  duration: integer("duration").notNull(), // duration in milliseconds
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertAudioFileSchema = createInsertSchema(audioFiles).pick({
  audioId: true,
  filename: true,
  originalName: true,
  duration: true,
});

// Responses table (to store participant evaluations)
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  participantId: varchar("participant_id", { length: 50 }).references(() => participants.participantId).notNull(),
  audioId: varchar("audio_id", { length: 50 }).references(() => audioFiles.audioId).notNull(),
  selection: varchar("selection", { length: 20 }).notNull(), // "cough", "throat-clear", or "other"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  participantId: true,
  audioId: true,
  selection: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export type AudioFile = typeof audioFiles.$inferSelect;
export type InsertAudioFile = z.infer<typeof insertAudioFileSchema>;

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

// Custom types for the application
export type AudioStats = {
  coughPercentage: number;
  throatClearPercentage: number;
  otherPercentage: number;
  totalResponses: number;
};

export type ParticipantSession = {
  participantId: string;
  audioIds: string[];
  currentIndex: number;
  completed: boolean;
};

export const humorousFeedback = [
  "Tricky, isn't it? Even experts argue about this one!",
  "That's a challenging one! Some professors have heated debates over this sound.",
  "Hmm, interesting choice! Did you know this sound confuses many specialists?",
  "Good ear! This is one of those sounds that keeps researchers up at night.",
  "Well done! That's a sound that often divides the cough conference attendees.",
  "Fascinating, right? This sound has characteristics that overlap categories.",
  "That was a tough one! It has elements that make classification challenging.",
  "Nice job! This sample shows why we need your expert ears to help us.",
  "Interesting classification! This type of sound is why we're doing this research.",
  "Great work! This is exactly the kind of ambiguous sound we're studying."
];
