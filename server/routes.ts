import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { insertAudioFileSchema, insertParticipantSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

// Configure upload directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(10).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [".mp3", ".wav"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .mp3 and .wav files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "cough-eval-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.user || req.session.user.isAdmin !== 1) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // Auth routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) { // In a real app, we'd use bcrypt
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };

      return res.json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.session.user);
  });

  // Audio file management routes
  app.post("/api/audio", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Generate unique ID for the audio
      const audioId = `audio_${crypto.randomBytes(4).toString("hex")}`;
      
      // For demonstration, we'll use a fixed duration
      // In a real app, we'd use audio metadata to get actual duration
      const duration = 5000; // 5 seconds in milliseconds
      
      const audioFileData = {
        audioId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        duration
      };

      const validatedData = insertAudioFileSchema.parse(audioFileData);
      const audioFile = await storage.createAudioFile(validatedData);
      
      return res.status(201).json(audioFile);
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/audio", requireAdmin, async (req, res) => {
    try {
      const audioFiles = await storage.getAudioFiles();
      return res.json(audioFiles);
    } catch (error) {
      console.error("Error fetching audio files:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/audio/:audioId", async (req, res) => {
    try {
      const { audioId } = req.params;
      const audioFile = await storage.getAudioFileById(audioId);
      
      if (!audioFile) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      const filePath = path.join(uploadsDir, audioFile.filename);
      return res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving audio file:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/audio/:audioId", requireAdmin, async (req, res) => {
    try {
      const { audioId } = req.params;
      const audioFile = await storage.getAudioFileById(audioId);
      
      if (!audioFile) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      // Delete the actual file
      const filePath = path.join(uploadsDir, audioFile.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete from storage
      await storage.deleteAudioFile(audioId);
      return res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      console.error("Error deleting audio file:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Participant routes
  app.post("/api/participants", async (req, res) => {
    try {
      const prefix = req.body.prefix || "CONF";
      const participantId = `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
      
      const participantData = {
        participantId
      };
      
      const validatedData = insertParticipantSchema.parse(participantData);
      const participant = await storage.createParticipant(validatedData);
      
      // Create a session with 5 random audio files
      const audioIds = await storage.getRandomAudioIdsForSession(5);
      if (audioIds.length === 0) {
        return res.status(400).json({ message: "No audio files available for evaluation" });
      }
      
      await storage.createSession(participantId, audioIds);
      
      return res.status(201).json(participant);
    } catch (error) {
      console.error("Error creating participant:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/participants/batch", requireAdmin, async (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 1;
      const prefix = req.query.prefix as string || "CONF";
      
      if (count < 1 || count > 100) {
        return res.status(400).json({ message: "Count must be between 1 and 100" });
      }
      
      const participants = [];
      for (let i = 0; i < count; i++) {
        const participantId = `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
        const participantData = { participantId };
        const validatedData = insertParticipantSchema.parse(participantData);
        const participant = await storage.createParticipant(validatedData);
        participants.push(participant);
      }
      
      return res.status(201).json(participants);
    } catch (error) {
      console.error("Error creating batch participants:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Evaluation session routes
  app.get("/api/sessions/:participantId", async (req, res) => {
    try {
      const { participantId } = req.params;
      
      // Check if participant exists
      const participant = await storage.getParticipantById(participantId);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      // Get or create a session
      let session = await storage.getSession(participantId);
      if (!session) {
        const audioIds = await storage.getRandomAudioIdsForSession(5);
        if (audioIds.length === 0) {
          return res.status(400).json({ message: "No audio files available for evaluation" });
        }
        
        session = await storage.createSession(participantId, audioIds);
      }
      
      // Get current audio details
      const currentAudioId = session.audioIds[session.currentIndex];
      const audioFile = await storage.getAudioFileById(currentAudioId);
      
      if (!audioFile) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      return res.json({
        session,
        currentAudio: {
          audioId: currentAudioId,
          duration: audioFile.duration
        },
        totalSteps: session.audioIds.length,
        currentStep: session.currentIndex + 1
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit response route
  app.post("/api/responses", async (req, res) => {
    try {
      const { participantId, audioId, selection } = req.body;
      
      if (!participantId || !audioId || !selection) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate selection
      if (!["cough", "throat-clear", "other"].includes(selection)) {
        return res.status(400).json({ message: "Invalid selection" });
      }
      
      // Check if participant exists
      const participant = await storage.getParticipantById(participantId);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      // Check if audio exists
      const audioFile = await storage.getAudioFileById(audioId);
      if (!audioFile) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      // Save the response
      const responseData = {
        participantId,
        audioId,
        selection
      };
      
      const validatedData = insertResponseSchema.parse(responseData);
      const response = await storage.createResponse(validatedData);
      
      // Get stats for this audio
      const stats = await storage.getAudioStats(audioId);
      
      // Get random feedback
      const feedback = storage.getRandomFeedback();
      
      // Update session
      const session = await storage.getSession(participantId);
      if (session) {
        session.currentIndex += 1;
        if (session.currentIndex >= session.audioIds.length) {
          session.completed = true;
        }
        await storage.updateSession(session);
      }
      
      return res.status(201).json({
        response,
        stats,
        feedback,
        sessionComplete: session?.completed || false
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all responses
  app.get("/api/responses", requireAdmin, async (req, res) => {
    try {
      const responses = await storage.getAllResponses();
      return res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
