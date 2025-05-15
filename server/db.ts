import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon to work with WebSockets
neonConfig.webSocketConstructor = ws;

// Validate that database URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create database pool and Drizzle instance
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

/**
 * Test database connection
 * @returns Whether the connection is successful
 */
export async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}