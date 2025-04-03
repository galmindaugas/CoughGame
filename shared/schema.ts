import { pgTable, text, serial, integer, timestamp, json, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin user table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
});

// Audio snippets table
export const audioSnippets = pgTable("audio_snippets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  duration: integer("duration").notNull(), // Duration in milliseconds
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
});

export const insertAudioSnippetSchema = createInsertSchema(audioSnippets).pick({
  filename: true, 
  originalName: true,
  mimeType: true,
  duration: true,
});

// Participants (users) table
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(), // Generated unique identifier for QR code
  sessionName: text("session_name"), // Optional grouping name
  createDate: timestamp("create_date").defaultNow().notNull(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  sessionId: true,
  sessionName: true,
});

// Responses table for participant evaluations
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull(), // Foreign key to participants
  audioSnippetId: integer("audio_snippet_id").notNull(), // Foreign key to audioSnippets
  selectedOption: text("selected_option").notNull(), // "cough", "throat-clear", "other"
  responseDate: timestamp("response_date").defaultNow().notNull(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  participantId: true,
  audioSnippetId: true,
  selectedOption: true,
});

// Define response options type for consistent usage
export const responseOptions = ["cough", "throat-clear", "other"] as const;
export const ResponseOptionEnum = z.enum(responseOptions);
export type ResponseOption = typeof responseOptions[number];

// Export type definitions for use in application
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type AudioSnippet = typeof audioSnippets.$inferSelect;
export type InsertAudioSnippet = z.infer<typeof insertAudioSnippetSchema>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

// Define statistics type for response aggregation
export type ResponseStats = {
  audioSnippetId: number;
  filename: string;
  originalName: string;
  totalResponses: number;
  coughCount: number;
  throatClearCount: number;
  otherCount: number;
  coughPercentage: number;
  throatClearPercentage: number;
  otherPercentage: number;
};

// Define audio snippet with stats for participant evaluation
export type AudioSnippetWithStats = AudioSnippet & {
  stats?: {
    coughPercentage: number;
    throatClearPercentage: number;
    otherPercentage: number;
    totalResponses: number;
  }
};

// Funny feedback messages for participants
export const feedbackMessages = [
  "Tricky, isn't it? Even experts argue about this one!",
  "Hmm, that was a challenging sound to identify!",
  "Are you sure? Just kidding, there's no right answer!",
  "Did you know coughs can be as unique as fingerprints?",
  "That's a tough one! It's like the 'Yanny or Laurel' of respiratory sounds.",
  "Interesting choice! The world of respiratory sounds is complex.",
  "Your ears are being put to the test today!",
  "That's the kind of sound that divides opinion at cough conferences!",
  "Trust your ears - they're surprisingly good at this!",
  "This one keeps our research team debating too!"
];
