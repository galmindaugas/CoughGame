import { 
  User, InsertUser, 
  Participant, InsertParticipant,
  AudioFile, InsertAudioFile,
  Response, InsertResponse,
  ParticipantSession, AudioStats,
  humorousFeedback
} from "@shared/schema";

// Storage interface with all necessary CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Participant operations
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantById(participantId: string): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  
  // Audio file operations
  getAudioFile(id: number): Promise<AudioFile | undefined>;
  getAudioFileById(audioId: string): Promise<AudioFile | undefined>;
  getAudioFiles(): Promise<AudioFile[]>;
  createAudioFile(audioFile: InsertAudioFile): Promise<AudioFile>;
  deleteAudioFile(audioId: string): Promise<boolean>;
  
  // Response operations
  getResponse(id: number): Promise<Response | undefined>;
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByParticipant(participantId: string): Promise<Response[]>;
  getResponsesByAudio(audioId: string): Promise<Response[]>;
  getAllResponses(): Promise<Response[]>;
  
  // Application-specific operations
  getRandomAudioIdsForSession(count: number): Promise<string[]>;
  getAudioStats(audioId: string): Promise<AudioStats>;
  getRandomFeedback(): string;

  // Session management
  createSession(participantId: string, audioIds: string[]): Promise<ParticipantSession>;
  getSession(participantId: string): Promise<ParticipantSession | undefined>;
  updateSession(session: ParticipantSession): Promise<ParticipantSession>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private participants: Map<number, Participant>;
  private audioFiles: Map<number, AudioFile>;
  private responses: Map<number, Response>;
  private sessions: Map<string, ParticipantSession>;
  
  private userIdCounter: number;
  private participantIdCounter: number;
  private audioFileIdCounter: number;
  private responseIdCounter: number;

  constructor() {
    this.users = new Map();
    this.participants = new Map();
    this.audioFiles = new Map();
    this.responses = new Map();
    this.sessions = new Map();
    
    this.userIdCounter = 1;
    this.participantIdCounter = 1;
    this.audioFileIdCounter = 1;
    this.responseIdCounter = 1;

    // Add an admin user by default
    this.createUser({
      username: "admin",
      password: "admin123", // In a real application, this would be hashed
      isAdmin: 1
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Participant operations
  async getParticipant(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantById(participantId: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.participantId === participantId
    );
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantIdCounter++;
    const createdAt = new Date();
    const participant: Participant = { ...insertParticipant, id, createdAt };
    this.participants.set(id, participant);
    return participant;
  }

  // Audio file operations
  async getAudioFile(id: number): Promise<AudioFile | undefined> {
    return this.audioFiles.get(id);
  }

  async getAudioFileById(audioId: string): Promise<AudioFile | undefined> {
    return Array.from(this.audioFiles.values()).find(
      (audioFile) => audioFile.audioId === audioId
    );
  }

  async getAudioFiles(): Promise<AudioFile[]> {
    return Array.from(this.audioFiles.values()).sort((a, b) => {
      // Sort by uploadedAt descending (newest first)
      return b.uploadedAt.getTime() - a.uploadedAt.getTime();
    });
  }

  async createAudioFile(insertAudioFile: InsertAudioFile): Promise<AudioFile> {
    const id = this.audioFileIdCounter++;
    const uploadedAt = new Date();
    const audioFile: AudioFile = { ...insertAudioFile, id, uploadedAt };
    this.audioFiles.set(id, audioFile);
    return audioFile;
  }

  async deleteAudioFile(audioId: string): Promise<boolean> {
    const audioFileEntry = Array.from(this.audioFiles.entries()).find(
      ([_, audioFile]) => audioFile.audioId === audioId
    );
    
    if (!audioFileEntry) {
      return false;
    }
    
    const [id] = audioFileEntry;
    return this.audioFiles.delete(id);
  }

  // Response operations
  async getResponse(id: number): Promise<Response | undefined> {
    return this.responses.get(id);
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = this.responseIdCounter++;
    const timestamp = new Date();
    const response: Response = { ...insertResponse, id, timestamp };
    this.responses.set(id, response);
    return response;
  }

  async getResponsesByParticipant(participantId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter((response) => response.participantId === participantId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getResponsesByAudio(audioId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter((response) => response.audioId === audioId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAllResponses(): Promise<Response[]> {
    return Array.from(this.responses.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Application-specific operations
  async getRandomAudioIdsForSession(count: number): Promise<string[]> {
    const allAudios = await this.getAudioFiles();
    
    if (allAudios.length <= count) {
      return allAudios.map(audio => audio.audioId);
    }
    
    // Shuffle and pick random audios
    const shuffled = [...allAudios].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(audio => audio.audioId);
  }

  async getAudioStats(audioId: string): Promise<AudioStats> {
    const responses = await this.getResponsesByAudio(audioId);
    const totalResponses = responses.length;
    
    if (totalResponses === 0) {
      return {
        coughPercentage: 0,
        throatClearPercentage: 0,
        otherPercentage: 0,
        totalResponses: 0
      };
    }
    
    const coughCount = responses.filter(r => r.selection === 'cough').length;
    const throatClearCount = responses.filter(r => r.selection === 'throat-clear').length;
    const otherCount = responses.filter(r => r.selection === 'other').length;
    
    return {
      coughPercentage: Math.round((coughCount / totalResponses) * 100),
      throatClearPercentage: Math.round((throatClearCount / totalResponses) * 100),
      otherPercentage: Math.round((otherCount / totalResponses) * 100),
      totalResponses
    };
  }

  getRandomFeedback(): string {
    return humorousFeedback[Math.floor(Math.random() * humorousFeedback.length)];
  }

  // Session management
  async createSession(participantId: string, audioIds: string[]): Promise<ParticipantSession> {
    const session: ParticipantSession = {
      participantId,
      audioIds,
      currentIndex: 0,
      completed: false
    };
    
    this.sessions.set(participantId, session);
    return session;
  }

  async getSession(participantId: string): Promise<ParticipantSession | undefined> {
    return this.sessions.get(participantId);
  }

  async updateSession(session: ParticipantSession): Promise<ParticipantSession> {
    this.sessions.set(session.participantId, session);
    return session;
  }
}

export const storage = new MemStorage();
