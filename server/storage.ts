import { 
  Admin, InsertAdmin, AudioSnippet, InsertAudioSnippet, 
  Participant, InsertParticipant, Response, InsertResponse,
  ResponseStats, AudioSnippetWithStats, responseOptions,
  admins, audioSnippets, participants, responses
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Audio snippet methods
  createAudioSnippet(snippet: InsertAudioSnippet): Promise<AudioSnippet>;
  getAudioSnippetById(id: number): Promise<AudioSnippet | undefined>;
  getAllAudioSnippets(): Promise<AudioSnippet[]>;
  deleteAudioSnippet(id: number): Promise<boolean>;
  
  // Participant methods
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantBySessionId(sessionId: string): Promise<Participant | undefined>;
  getParticipantById(id: number): Promise<Participant | undefined>;
  getAllParticipants(): Promise<Participant[]>;
  
  // Response methods
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByParticipantId(participantId: number): Promise<Response[]>;
  getResponsesByAudioSnippetId(audioSnippetId: number): Promise<Response[]>;
  getAllResponses(): Promise<Response[]>;
  
  // Analytics methods
  getResponseStatsByAudioSnippet(audioSnippetId: number): Promise<ResponseStats | undefined>;
  getAllResponseStats(): Promise<ResponseStats[]>;
  getRandomAudioSnippetsForEvaluation(count: number): Promise<AudioSnippetWithStats[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    // Create default admin if not exists
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if default admin exists
      const admin = await this.getAdminByUsername("admin");
      if (!admin) {
        // Create default admin
        await this.createAdmin({
          username: "admin",
          password: "password" // In a real app, this would be hashed
        });
        console.log("Created default admin user");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }
  
  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }
  
  // Audio snippet methods
  async createAudioSnippet(snippet: InsertAudioSnippet): Promise<AudioSnippet> {
    const [audioSnippet] = await db.insert(audioSnippets).values({
      ...snippet,
      uploadDate: new Date()
    }).returning();
    return audioSnippet;
  }
  
  async getAudioSnippetById(id: number): Promise<AudioSnippet | undefined> {
    const [audioSnippet] = await db.select().from(audioSnippets).where(eq(audioSnippets.id, id));
    return audioSnippet;
  }
  
  async getAllAudioSnippets(): Promise<AudioSnippet[]> {
    return await db.select().from(audioSnippets).orderBy(desc(audioSnippets.uploadDate));
  }
  
  async deleteAudioSnippet(id: number): Promise<boolean> {
    const [deleted] = await db.delete(audioSnippets).where(eq(audioSnippets.id, id)).returning();
    return !!deleted;
  }
  
  // Participant methods
  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const sessionId = participant.sessionId || nanoid(8);
    const [newParticipant] = await db.insert(participants).values({
      sessionId,
      sessionName: participant.sessionName || null,
      createDate: new Date()
    }).returning();
    return newParticipant;
  }
  
  async getParticipantBySessionId(sessionId: string): Promise<Participant | undefined> {
    const [participant] = await db.select().from(participants).where(eq(participants.sessionId, sessionId));
    return participant;
  }
  
  async getParticipantById(id: number): Promise<Participant | undefined> {
    const [participant] = await db.select().from(participants).where(eq(participants.id, id));
    return participant;
  }
  
  async getAllParticipants(): Promise<Participant[]> {
    return await db.select().from(participants);
  }
  
  // Response methods
  async createResponse(response: InsertResponse): Promise<Response> {
    const [newResponse] = await db.insert(responses).values({
      ...response,
      responseDate: new Date()
    }).returning();
    return newResponse;
  }
  
  async getResponsesByParticipantId(participantId: number): Promise<Response[]> {
    return await db.select().from(responses).where(eq(responses.participantId, participantId));
  }
  
  async getResponsesByAudioSnippetId(audioSnippetId: number): Promise<Response[]> {
    return await db.select().from(responses).where(eq(responses.audioSnippetId, audioSnippetId));
  }
  
  async getAllResponses(): Promise<Response[]> {
    return await db.select().from(responses);
  }
  
  // Analytics methods
  async getResponseStatsByAudioSnippet(audioSnippetId: number): Promise<ResponseStats | undefined> {
    const audioSnippet = await this.getAudioSnippetById(audioSnippetId);
    if (!audioSnippet) return undefined;
    
    const responses = await this.getResponsesByAudioSnippetId(audioSnippetId);
    const totalResponses = responses.length;
    
    if (totalResponses === 0) {
      return {
        audioSnippetId,
        filename: audioSnippet.filename,
        originalName: audioSnippet.originalName,
        totalResponses: 0,
        coughCount: 0,
        throatClearCount: 0,
        otherCount: 0,
        coughPercentage: 0,
        throatClearPercentage: 0,
        otherPercentage: 0
      };
    }
    
    const coughCount = responses.filter(r => r.selectedOption === "cough").length;
    const throatClearCount = responses.filter(r => r.selectedOption === "throat-clear").length;
    const otherCount = responses.filter(r => r.selectedOption === "other").length;
    
    return {
      audioSnippetId,
      filename: audioSnippet.filename,
      originalName: audioSnippet.originalName,
      totalResponses,
      coughCount,
      throatClearCount,
      otherCount,
      coughPercentage: Math.round((coughCount / totalResponses) * 100),
      throatClearPercentage: Math.round((throatClearCount / totalResponses) * 100),
      otherPercentage: Math.round((otherCount / totalResponses) * 100)
    };
  }
  
  async getAllResponseStats(): Promise<ResponseStats[]> {
    const audioSnippets = await this.getAllAudioSnippets();
    const statsPromises = audioSnippets.map(snippet => 
      this.getResponseStatsByAudioSnippet(snippet.id)
    );
    
    const allStats = await Promise.all(statsPromises);
    return allStats.filter((stat): stat is ResponseStats => stat !== undefined);
  }
  
  async getRandomAudioSnippetsForEvaluation(count: number): Promise<AudioSnippetWithStats[]> {
    const allSnippets = await this.getAllAudioSnippets();
    
    // If we don't have enough snippets, return what we have
    if (allSnippets.length <= count) {
      const snippetsWithStats = await Promise.all(
        allSnippets.map(async (snippet) => {
          const stats = await this.getResponseStatsByAudioSnippet(snippet.id);
          return {
            ...snippet,
            stats: stats ? {
              coughPercentage: stats.coughPercentage,
              throatClearPercentage: stats.throatClearPercentage,
              otherPercentage: stats.otherPercentage,
              totalResponses: stats.totalResponses
            } : undefined
          };
        })
      );
      return snippetsWithStats;
    }
    
    // Randomly select 'count' snippets
    const shuffled = [...allSnippets].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    // Add stats to the selected snippets
    const snippetsWithStats = await Promise.all(
      selected.map(async (snippet) => {
        const stats = await this.getResponseStatsByAudioSnippet(snippet.id);
        return {
          ...snippet,
          stats: stats ? {
            coughPercentage: stats.coughPercentage,
            throatClearPercentage: stats.throatClearPercentage,
            otherPercentage: stats.otherPercentage,
            totalResponses: stats.totalResponses
          } : undefined
        };
      })
    );
    
    return snippetsWithStats;
  }
}

export const storage = new DatabaseStorage();
