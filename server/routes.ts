import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve demo page - static HTML that doesn't rely on WebSockets or React
  app.get('/demo', (req, res) => {
    try {
      const demoPath = path.join(process.cwd(), "client", "public", "demo.html");
      if (fs.existsSync(demoPath)) {
        res.sendFile(demoPath);
      } else {
        res.status(404).send("Demo page not found");
      }
    } catch (error) {
      console.error("Error serving demo page:", error);
      res.status(500).send("An error occurred");
    }
  });

  // API Routes
  const apiRouter = app.route('/api');
  
  // Timeline endpoints
  app.get('/api/timeline', async (req, res) => {
    try {
      const timelineItems = await storage.getTimelineItems();
      res.json(timelineItems);
    } catch (error) {
      console.error('Error fetching timeline items:', error);
      res.status(500).json({ error: 'Failed to fetch timeline items' });
    }
  });

  app.post('/api/timeline', async (req, res) => {
    try {
      const newItem = req.body;
      const savedItem = await storage.addTimelineItem(newItem);
      res.status(201).json(savedItem);
    } catch (error) {
      console.error('Error adding timeline item:', error);
      res.status(500).json({ error: 'Failed to add timeline item' });
    }
  });

  // Task endpoints
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const newTask = req.body;
      const savedTask = await storage.addTask(newTask);
      res.status(201).json(savedTask);
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Failed to add task' });
    }
  });

  // Chat endpoints
  app.get('/api/chats', async (req, res) => {
    try {
      const chats = await storage.getChats();
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });

  app.post('/api/chats', async (req, res) => {
    try {
      const newChat = req.body;
      const savedChat = await storage.addChat(newChat);
      res.status(201).json(savedChat);
    } catch (error) {
      console.error('Error adding chat:', error);
      res.status(500).json({ error: 'Failed to add chat' });
    }
  });

  app.post('/api/chats/:chatId/messages', async (req, res) => {
    try {
      const { chatId } = req.params;
      const newMessage = req.body;
      const savedMessage = await storage.addMessage(chatId, newMessage);
      res.status(201).json(savedMessage);
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  });

  // Document endpoints
  app.get('/api/documents', async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', async (req, res) => {
    try {
      const newDocument = req.body;
      const savedDocument = await storage.addDocument(newDocument);
      res.status(201).json(savedDocument);
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(500).json({ error: 'Failed to add document' });
    }
  });

  // Meeting endpoints
  app.get('/api/meetings', async (req, res) => {
    try {
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ error: 'Failed to fetch meetings' });
    }
  });

  app.post('/api/meetings', async (req, res) => {
    try {
      const newMeeting = req.body;
      const savedMeeting = await storage.addMeeting(newMeeting);
      res.status(201).json(savedMeeting);
    } catch (error) {
      console.error('Error adding meeting:', error);
      res.status(500).json({ error: 'Failed to add meeting' });
    }
  });

  // Email endpoints
  app.get('/api/emails', async (req, res) => {
    try {
      const emails = await storage.getEmails();
      res.json(emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  });

  app.post('/api/emails', async (req, res) => {
    try {
      const newEmail = req.body;
      const savedEmail = await storage.addEmail(newEmail);
      res.status(201).json(savedEmail);
    } catch (error) {
      console.error('Error adding email:', error);
      res.status(500).json({ error: 'Failed to add email' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log('Received message:', message);
      // Handle different message types here
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return httpServer;
}
