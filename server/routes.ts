import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { 
  insertAudioSnippetSchema, 
  insertParticipantSchema, 
  insertResponseSchema,
  ResponseOptionEnum
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import express from "express";

// Create uploads directory if it doesn't exist
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    // Accept only audio files (mp3, wav with different mime types)
    const allowedMimeTypes = [
      "audio/mpeg",        // MP3
      "audio/wav",         // WAV
      "audio/wave",        // WAV alternative
      "audio/x-wav",       // WAV alternative
      "audio/x-pn-wav",    // WAV alternative
      "audio/vnd.wave"     // WAV alternative
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log("Rejected file with mimetype:", file.mimetype);
      cb(new Error("Only .mp3 and .wav files are allowed!"));
    }
  },
});

// Login schema
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// QR Code generation schema
const qrGenerationSchema = z.object({
  count: z.number().int().min(1).max(100),
  sessionName: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/api/uploads", express.static(uploadsDir));
  
  // API routes
  
  // Admin authentication is now bypassed
  // Always return authenticated for auth check (since login is bypassed)
  app.get("/api/auth/check", (_req, res) => {
    return res.status(200).json({ 
      authenticated: true,
      admin: { id: 1, username: "admin" }
    });
  });
  
  // Keep login endpoint for backward compatibility
  app.post("/api/auth/login", async (req, res) => {
    // Always success
    return res.status(200).json({ 
      success: true, 
      message: "Login successful",
      admin: { id: 1, username: "admin" }
    });
  });
  
  // Audio snippet upload
  app.post("/api/audio", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file was uploaded" });
      }
      
      // Log file details to help diagnose MIME type issues
      console.log("Received file upload:", {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      });
      
      // Get audio file duration (in a real app we would use a library like music-metadata)
      const duration = 5000; // Placeholder duration of 5 seconds (5000ms)
      
      const audioData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        duration: duration,
      };
      
      const validation = insertAudioSnippetSchema.safeParse(audioData);
      if (!validation.success) {
        // Delete the uploaded file if validation fails
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
        return res.status(400).json({ message: "Invalid audio data", errors: validation.error.errors });
      }
      
      const audioSnippet = await storage.createAudioSnippet(validation.data);
      return res.status(201).json(audioSnippet);
    } catch (error) {
      console.error("Audio upload error:", error);
      if (req.file) {
        // Clean up the file if there was an error
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      }
      return res.status(500).json({ message: "Error uploading audio file" });
    }
  });
  
  // Get all audio snippets
  app.get("/api/audio", async (_req, res) => {
    try {
      const audioSnippets = await storage.getAllAudioSnippets();
      return res.status(200).json(audioSnippets);
    } catch (error) {
      console.error("Error fetching audio snippets:", error);
      return res.status(500).json({ message: "Error fetching audio snippets" });
    }
  });
  
  // Delete audio snippet
  app.delete("/api/audio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const audioSnippet = await storage.getAudioSnippetById(id);
      if (!audioSnippet) {
        return res.status(404).json({ message: "Audio snippet not found" });
      }
      
      // Delete the file from the filesystem
      const filePath = path.join(uploadsDir, audioSnippet.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await storage.deleteAudioSnippet(id);
      return res.status(200).json({ message: "Audio snippet deleted successfully" });
    } catch (error) {
      console.error("Error deleting audio snippet:", error);
      return res.status(500).json({ message: "Error deleting audio snippet" });
    }
  });
  
  // Generate QR codes for participants
  app.post("/api/participants/generate", async (req, res) => {
    try {
      const validation = qrGenerationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.errors });
      }
      
      const { count, sessionName } = validation.data;
      const participants = [];
      
      for (let i = 0; i < count; i++) {
        const sessionId = nanoid(8);
        const participant = await storage.createParticipant({
          sessionId,
          sessionName: sessionName || null,
        });
        
        // Generate QR code data URL
        const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
        const evaluationUrl = `${baseUrl}/evaluate/${sessionId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(evaluationUrl);
        
        participants.push({
          ...participant,
          qrCode: qrCodeDataUrl,
          evaluationUrl
        });
      }
      
      return res.status(201).json(participants);
    } catch (error) {
      console.error("Error generating QR codes:", error);
      return res.status(500).json({ message: "Error generating QR codes" });
    }
  });
  
  // Get all participants
  app.get("/api/participants", async (_req, res) => {
    try {
      const participants = await storage.getAllParticipants();
      return res.status(200).json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      return res.status(500).json({ message: "Error fetching participants" });
    }
  });
  
  // Get participant by session ID
  app.get("/api/participants/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const participant = await storage.getParticipantBySessionId(sessionId);
      
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      return res.status(200).json(participant);
    } catch (error) {
      console.error("Error fetching participant:", error);
      return res.status(500).json({ message: "Error fetching participant" });
    }
  });
  
  // Get random audio snippets for evaluation
  app.get("/api/evaluation/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const participant = await storage.getParticipantBySessionId(sessionId);
      
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      // Get 5 random audio snippets with their stats
      const audioSnippets = await storage.getRandomAudioSnippetsForEvaluation(5);
      
      // Check if participant has already responded to these snippets
      const existingResponses = await storage.getResponsesByParticipantId(participant.id);
      const existingAudioIds = new Set(existingResponses.map(r => r.audioSnippetId));
      
      // For each audio snippet, check if this participant has already responded
      const snippetsWithStatus = audioSnippets.map(snippet => ({
        ...snippet,
        hasResponded: existingAudioIds.has(snippet.id)
      }));
      
      return res.status(200).json({
        participant,
        audioSnippets: snippetsWithStatus
      });
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      return res.status(500).json({ message: "Error fetching evaluation data" });
    }
  });
  
  // Submit response to audio snippet
  app.post("/api/responses", async (req, res) => {
    try {
      // If request contains participantId, use that directly;
      // otherwise, look up participant using sessionId
      const responseSchema = insertResponseSchema.extend({
        sessionId: z.string(),
        participantId: z.number().optional(), // Allow participantId to be passed directly
        selectedOption: ResponseOptionEnum,
      });
      
      const validationResult = responseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.errors });
      }
      
      const { sessionId, participantId, audioSnippetId, selectedOption } = validationResult.data;
      
      let participant;
      
      // Use participantId if provided, otherwise look up by sessionId
      if (participantId) {
        participant = await storage.getParticipantById(participantId);
      } else {
        participant = await storage.getParticipantBySessionId(sessionId);
      }
      
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      // Check if audio snippet exists
      const audioSnippet = await storage.getAudioSnippetById(audioSnippetId);
      if (!audioSnippet) {
        return res.status(404).json({ message: "Audio snippet not found" });
      }
      
      // Check if participant has already responded to this audio snippet
      const existingResponses = await storage.getResponsesByParticipantId(participant.id);
      const hasResponded = existingResponses.some(r => r.audioSnippetId === audioSnippetId);
      
      if (hasResponded) {
        return res.status(400).json({ message: "Participant has already responded to this audio snippet" });
      }
      
      // Create response
      const response = await storage.createResponse({
        participantId: participant.id,
        audioSnippetId,
        selectedOption,
      });
      
      // Get updated stats for this audio snippet
      const stats = await storage.getResponseStatsByAudioSnippet(audioSnippetId);
      
      return res.status(201).json({
        response,
        stats
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      return res.status(500).json({ message: "Error submitting response" });
    }
  });
  
  // Get all responses
  app.get("/api/responses", async (req, res) => {
    try {
      const responses = await storage.getAllResponses();
      
      // If there are query parameters for filtering
      const { audioId, responseType, date } = req.query;
      
      let filteredResponses = responses;
      
      if (audioId && typeof audioId === 'string' && audioId !== 'all') {
        const audioIdNum = parseInt(audioId);
        if (!isNaN(audioIdNum)) {
          filteredResponses = filteredResponses.filter(r => r.audioSnippetId === audioIdNum);
        }
      }
      
      if (responseType && typeof responseType === 'string' && responseType !== 'all') {
        filteredResponses = filteredResponses.filter(r => r.selectedOption === responseType);
      }
      
      if (date && typeof date === 'string') {
        const filterDate = new Date(date);
        if (!isNaN(filterDate.getTime())) {
          filteredResponses = filteredResponses.filter(r => {
            const responseDate = new Date(r.responseDate);
            return responseDate.toDateString() === filterDate.toDateString();
          });
        }
      }
      
      // Expand each response with audio and participant data
      const expandedResponses = await Promise.all(
        filteredResponses.map(async (response) => {
          const audioSnippet = await storage.getAudioSnippetById(response.audioSnippetId);
          const participant = await storage.getParticipantById(response.participantId);
          
          return {
            ...response,
            audioSnippet,
            participant,
          };
        })
      );
      
      return res.status(200).json(expandedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      return res.status(500).json({ message: "Error fetching responses" });
    }
  });
  
  // Get response statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getAllResponseStats();
      
      // Calculate overall distribution
      const allResponses = await storage.getAllResponses();
      const totalResponses = allResponses.length;
      
      let coughCount = 0;
      let throatClearCount = 0;
      let otherCount = 0;
      
      allResponses.forEach(response => {
        if (response.selectedOption === "cough") {
          coughCount++;
        } else if (response.selectedOption === "throat-clear") {
          throatClearCount++;
        } else if (response.selectedOption === "other") {
          otherCount++;
        }
      });
      
      const overallStats = {
        totalResponses,
        coughCount,
        throatClearCount,
        otherCount,
        coughPercentage: totalResponses > 0 ? Math.round((coughCount / totalResponses) * 100) : 0,
        throatClearPercentage: totalResponses > 0 ? Math.round((throatClearCount / totalResponses) * 100) : 0,
        otherPercentage: totalResponses > 0 ? Math.round((otherCount / totalResponses) * 100) : 0,
      };
      
      return res.status(200).json({
        audioStats: stats,
        overallStats
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).json({ message: "Error fetching stats" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
