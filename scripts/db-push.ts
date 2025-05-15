import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Configure Neon to use WebSockets for secure connections
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Pushing schema to database...');
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);

    // Execute push by direct schema execution 
    // (simpler alternative to migrations for initial setup)
    await pool.query(`
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS meeting_participants CASCADE;
      DROP TABLE IF EXISTS document_collaborators CASCADE;
      DROP TABLE IF EXISTS timeline CASCADE;
      DROP TABLE IF EXISTS meetings CASCADE;
      DROP TABLE IF EXISTS emails CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS chats CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        initials TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        assignee_id TEXT NOT NULL REFERENCES users(id),
        due_date TEXT NOT NULL,
        project TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create chats table
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        channel TEXT NOT NULL,
        priority TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create messages table
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES chats(id),
        author_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        time TEXT NOT NULL,
        code_snippet TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create documents table
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        last_edited TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create document collaborators table
      CREATE TABLE IF NOT EXISTS document_collaborators (
        document_id TEXT NOT NULL REFERENCES documents(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        PRIMARY KEY (document_id, user_id)
      );

      -- Create meetings table
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        summary TEXT NOT NULL,
        summary_confidence INTEGER NOT NULL,
        action_items TEXT[] NOT NULL,
        recording_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create meeting participants table
      CREATE TABLE IF NOT EXISTS meeting_participants (
        meeting_id TEXT NOT NULL REFERENCES meetings(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        PRIMARY KEY (meeting_id, user_id)
      );

      -- Create emails table
      CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        sender_id TEXT NOT NULL REFERENCES users(id),
        recipient TEXT NOT NULL,
        time TEXT NOT NULL,
        paragraphs TEXT[] NOT NULL,
        summary TEXT NOT NULL,
        summary_confidence INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Create timeline table
      CREATE TABLE IF NOT EXISTS timeline (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Schema pushed successfully!');
    
    // Insert test user if needed
    console.log('Adding test data...');
    await pool.query(`
      -- Insert a test user if none exists
      INSERT INTO users (id, username, name, initials, avatar)
      VALUES ('usr_test1', 'testuser', 'Test User', 'TU', NULL)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Test data added successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();