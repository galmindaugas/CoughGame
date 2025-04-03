import { 
  Admin, InsertAdmin, AudioSnippet, InsertAudioSnippet, 
  Participant, InsertParticipant, Response, InsertResponse,
  ResponseStats, AudioSnippetWithStats, responseOptions
} from "@shared/schema";
import { nanoid } from "nanoid";

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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private audioSnippets: Map<number, AudioSnippet>;
  private participants: Map<number, Participant>;
  private responses: Map<number, Response>;
  
  private adminCurrentId: number;
  private audioSnippetCurrentId: number;
  private participantCurrentId: number;
  private responseCurrentId: number;
  
  constructor() {
    this.admins = new Map();
    this.audioSnippets = new Map();
    this.participants = new Map();
    this.responses = new Map();
    
    this.adminCurrentId = 1;
    this.audioSnippetCurrentId = 1;
    this.participantCurrentId = 1;
    this.responseCurrentId = 1;
    
    // Create default admin user
    this.createAdmin({
      username: "admin",
      password: "password" // In a real app, this would be hashed
    });
  }
  
  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }
  
  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminCurrentId++;
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }
  
  // Audio snippet methods
  async createAudioSnippet(snippet: InsertAudioSnippet): Promise<AudioSnippet> {
    const id = this.audioSnippetCurrentId++;
    const audioSnippet: AudioSnippet = { 
      ...snippet, 
      id,
      uploadDate: new Date() 
    };
    this.audioSnippets.set(id, audioSnippet);
    return audioSnippet;
  }
  
  async getAudioSnippetById(id: number): Promise<AudioSnippet | undefined> {
    return this.audioSnippets.get(id);
  }
  
  async getAllAudioSnippets(): Promise<AudioSnippet[]> {
    return Array.from(this.audioSnippets.values()).sort((a, b) => 
      b.uploadDate.getTime() - a.uploadDate.getTime()
    );
  }
  
  async deleteAudioSnippet(id: number): Promise<boolean> {
    return this.audioSnippets.delete(id);
  }
  
  // Participant methods
  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const id = this.participantCurrentId++;
    const sessionId = participant.sessionId || nanoid(8);
    const newParticipant: Participant = { 
      ...participant,
      id,
      sessionId,
      sessionName: participant.sessionName || null,
      createDate: new Date() 
    };
    this.participants.set(id, newParticipant);
    return newParticipant;
  }
  
  async getParticipantBySessionId(sessionId: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.sessionId === sessionId
    );
  }
  
  async getParticipantById(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }
  
  async getAllParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }
  
  // Response methods
  async createResponse(response: InsertResponse): Promise<Response> {
    const id = this.responseCurrentId++;
    const newResponse: Response = { 
      ...response, 
      id, 
      responseDate: new Date() 
    };
    this.responses.set(id, newResponse);
    return newResponse;
  }
  
  async getResponsesByParticipantId(participantId: number): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.participantId === participantId
    );
  }
  
  async getResponsesByAudioSnippetId(audioSnippetId: number): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.audioSnippetId === audioSnippetId
    );
  }
  
  async getAllResponses(): Promise<Response[]> {
    return Array.from(this.responses.values());
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

export const storage = new MemStorage();
