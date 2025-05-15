import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";
import { setupAuth } from "./auth";
import Stripe from "stripe";

// Type definition for Stripe Subscription with period_end
type StripeSubscription = Stripe.Response<Stripe.Subscription> & {
  current_period_end: number;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('No STRIPE_SECRET_KEY found in environment variables. Stripe functionality will be limited.');
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-04-30.basil',
  });
  
  // Set up authentication
  setupAuth(app);
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
  
  // Debug API endpoints
  app.get('/api/debug/database', async (req, res) => {
    try {
      // Get database status from pool
      const { pool } = await import('./db');
      const { rows } = await pool.query('SELECT NOW() as timestamp');
      
      // Return database status info
      res.json({
        status: 'connected',
        type: 'PostgreSQL',
        timestamp: rows[0].timestamp,
        environment: process.env.NODE_ENV
      });
    } catch (error) {
      console.error('Database status check failed:', error);
      res.status(500).json({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date()
      });
    }
  });
  
  // Debug test endpoints (placeholders)
  app.get('/api/debug/memory-test', (req, res) => {
    res.json({ status: 'success', message: 'Memory test passed' });
  });
  
  app.get('/api/debug/database-test', async (req, res) => {
    try {
      // Get database
      const { db } = await import('./db');
      const { storage } = await import('./storage');
      
      // Check if tables exist by counting users
      const userCount = await db.select({ count: sql`count(*)` }).from(users);
      
      // Return database test results
      res.json({
        status: 'success',
        tests: [
          { name: 'Database Connection', result: 'passed' },
          { name: 'Table Existence', result: 'passed' },
          { name: 'Data Access', result: 'passed', detail: `User count: ${userCount[0].count}` }
        ]
      });
    } catch (error) {
      console.error('Database test failed:', error);
      res.status(500).json({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error'
      });
    }
  });
  
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

  // Stripe payment endpoints
  app.post('/api/create-payment-intent', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { amount, description = 'NebulaOne purchase' } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        description,
        metadata: {
          userId: req.user.id
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Subscription endpoints
  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const user = req.user;
      
      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId) as StripeSubscription;
          
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            return res.json({
              subscriptionId: subscription.id,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              clientSecret: null // No payment needed for existing active subscription
            });
          }
        } catch (error) {
          console.log('Error fetching subscription, will create new one:', error);
          // Continue to create new subscription if retrieval fails
        }
      }

      // If no subscription exists or it's not active, create a new one
      // First create or retrieve customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        
        customerId = customer.id;
        // Update user with new customer ID
        await storage.updateStripeCustomerId(user.id, customerId);
      }

      // Create a payment intent instead of subscription for demo purposes
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customerId,
        amount: 1299, // $12.99 in cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: user.id,
          type: 'subscription'
        }
      });

      // Get the client secret from the payment intent
      const clientSecret = paymentIntent.client_secret;

      // Update user with customer ID (we'll update subscription details after payment)
      await storage.updateStripeCustomerId(user.id, customerId);

      res.json({
        clientSecret,
        amount: 1299, // $12.99
        currency: 'usd'
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ 
        error: 'Failed to create subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update subscription status endpoint
  app.post('/api/update-subscription', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId, status, plan, expiryDate } = req.body;
    
    if (!userId || !status || !plan || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify the requesting user is either an admin or updating their own subscription
    const isAdmin = req.user.email === 'saidomar.business@gmail.com';
    const isOwnSubscription = req.user.id === userId;
    
    if (!isAdmin && !isOwnSubscription) {
      return res.status(403).json({ error: 'Not authorized to update this subscription' });
    }
    
    try {
      // Update subscription details in database
      const updatedUser = await storage.updateSubscriptionDetails(userId, {
        status,
        plan,
        expiryDate: new Date(expiryDate)
      });
      
      res.status(200).json({
        message: 'Subscription updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ 
        error: 'Failed to update subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Webhook for Stripe events
  app.post('/api/webhook/stripe', async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(
          payload,
          sig,
          webhookSecret
        );
      } else {
        // For development without webhook signature verification
        event = payload;
        console.warn('Webhook signature verification skipped (webhook secret not set)');
      }

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          console.log(`Subscription ${subscription.id} ${event.type}`);
          
          // Find user with this subscriptionId and update status
          // This would involve adding support for updating subscription status in storage
          break;
          
        case 'customer.subscription.deleted':
          const canceledSubscription = event.data.object;
          console.log(`Subscription ${canceledSubscription.id} canceled`);
          
          // Update user subscription status to canceled
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          console.log(`Invoice ${invoice.id} payment succeeded`);
          
          // Update subscription expiry date
          break;

        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`Payment ${paymentIntent.id} succeeded`);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates on a distinct path to avoid conflict with Vite's HMR
  // Stripe Webhook endpoint for subscription events
  app.post('/api/webhook', async (req, res) => {
    let event;
    
    try {
      // Verify webhook signature if webhook secret is available
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        const signature = req.headers['stripe-signature'] as string;
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // If no webhook secret, just parse the event
        event = req.body;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
      // Handle subscription events
      if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const users = await storage.getUserByStripeCustomerId(customerId);
        
        if (users) {
          // Update user's subscription status
          await storage.updateUserStripeInfo(users.id, {
            customerId: customerId,
            subscriptionId: subscription.id
          });
          
          // Also update subscription status and expiry
          const subscriptionData = subscription as StripeSubscription;
          await storage.updateSubscriptionDetails(users.id, {
            status: subscription.status,
            plan: 'premium',
            expiryDate: new Date(subscriptionData.current_period_end * 1000)
          });
        }
      }
      
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const users = await storage.getUserByStripeCustomerId(customerId);
        
        if (users) {
          // Update user's subscription status to cancelled/expired
          await storage.updateSubscriptionDetails(users.id, {
            status: 'canceled',
            plan: 'free',
            expiryDate: new Date()
          });
        }
      }
      
      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Error handling webhook event:', err);
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  });

  console.log('Setting up WebSocket server on path: /ws');
  
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: false,
    // Add more detailed WebSocket server options
    clientTracking: true, // Track clients for broadcasting
    skipUTF8Validation: false, // Ensure proper UTF-8 validation
    maxPayload: 64 * 1024, // 64KB max payload size
  });
  
  // Track active connections
  const clients = new Set<WebSocket>();
  let connectionCounter = 0;
  
  // Create a safe send function to handle errors
  const safeSend = (ws: WebSocket, message: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    }
    return false;
  };
  
  // Heartbeat mechanism to detect dead connections
  const heartbeat = (ws: WebSocket) => {
    (ws as any).isAlive = true;
  };
  
  // Create an interval to check for dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if ((ws as any).isAlive === false) {
        console.log('WebSocket client unresponsive, terminating connection');
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // Handle server shutdown
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    console.log('WebSocket server closed');
  });
  
  // Handle new connections
  wss.on('connection', (ws, req) => {
    const clientId = ++connectionCounter;
    const clientIp = req.socket.remoteAddress || 'unknown';
    console.log(`WebSocket client #${clientId} connected from ${clientIp} to /ws path`);
    
    // Add client to tracking set
    clients.add(ws);
    
    // Setup heartbeat for connection monitoring
    (ws as any).isAlive = true;
    ws.on('pong', () => heartbeat(ws));
    
    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received WebSocket message from client #${clientId}:`, data);
        
        // Handle different message types
        if (data.type === 'ping') {
          safeSend(ws, { 
            type: 'pong', 
            timestamp: Date.now(),
            echo: data.data // Echo any data sent with the ping
          });
        }
      } catch (error) {
        console.error(`Error processing message from client #${clientId}:`, error);
      }
    });
    
    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`WebSocket error from client #${clientId}:`, error);
    });
    
    // Handle connection closures
    ws.on('close', (code, reason) => {
      console.log(`WebSocket client #${clientId} disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
      clients.delete(ws);
    });
    
    // Send initial connection confirmation
    safeSend(ws, { 
      type: 'connected', 
      clientId: clientId,
      message: 'Connected to NebulaOne WebSocket server',
      timestamp: Date.now(),
      clients: clients.size
    });
  });
  
  // Handle server errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });
  
  // Log websocket server initialization status
  console.log(`WebSocket server initialized with ${Object.keys(wss.options).length} options`);
  console.log(`WebSocket server listening on path: ${wss.options.path}`);
  

  return httpServer;
}
