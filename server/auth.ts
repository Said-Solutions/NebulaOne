import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserSchema } from "@shared/schema";
import memorystore from "memorystore";

// TypeScript Declaration Merging for Express User
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserSchema {}
  }
}

// Promisify scrypt
const scryptAsync = promisify(scrypt);

// Create a memory store for sessions
const MemoryStore = memorystore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000, // prune expired entries every 24h
});

// Password hashing function
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password comparison function
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Set up authentication middleware
export function setupAuth(app: Express): void {
  // Session configuration
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "nebulaone-secret-key", // use environment variable in production
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
    },
  };

  // Set up sessions and Passport
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport to use local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // First try to find user by username
        let user = await storage.getUserByUsername(username);
        
        // If not found by username, try by email
        if (!user && username.includes("@")) {
          user = await storage.getUserByEmail(username);
        }
        
        // If user not found or password doesn't match
        if (!user || !user.password || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Success - return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Create user with hashed password
      const user = await storage.createUser({
        ...req.body,
        id: `user_${Date.now()}`, // simple ID generation
        password: await hashPassword(req.body.password),
        createdAt: new Date(),
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Log the user in and indicate this is a new registration
      req.login(userWithoutPassword, (err) => {
        if (err) return next(err);
        // Send a flag to indicate this is a new user that needs to go through subscription flow
        res.status(201).json({ ...userWithoutPassword, isNewRegistration: true });
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }

      // Set session cookie expiration based on "Remember me" option
      if (req.body.rememberMe) {
        // If rememberMe is true, make the session valid for 30 days
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        // Otherwise, make the session expire when the browser is closed
        req.session.cookie.maxAge = undefined; 
      }

      req.login(user, (err: Error | null) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}