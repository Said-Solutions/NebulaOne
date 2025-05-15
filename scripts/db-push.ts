import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';
import ws from 'ws';
import * as schema from '../shared/schema';

// Configure neon to use ws for WebSocket connections
neonConfig.webSocketConstructor = ws;

// Verify that the database URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

async function main() {
  console.log('Starting database setup...');
  
  // Create a connection pool
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  // Create drizzle orm instance
  const db = drizzle(pool, { schema });
  
  // Push schema changes to the database (tables will be created if they don't exist)
  console.log('Pushing schema to database...');
  try {
    // Use pushSchema operation from drizzle-kit
    await migrate(db, { migrationsFolder: './' });
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
  
  // Create some initial data if needed
  console.log('Creating initial data...');
  try {
    // Check if users table is empty
    const users = await db.select().from(schema.users);
    
    if (users.length === 0) {
      console.log('Creating sample users...');
      
      // Create some initial users
      const initialUsers = [
        {
          id: nanoid(),
          username: 'thibault',
          name: 'Thibault Bridel',
          initials: 'TB',
          avatar: null,
          createdAt: new Date()
        },
        {
          id: nanoid(),
          username: 'omar',
          name: 'Omar Said',
          initials: 'OS',
          avatar: null,
          createdAt: new Date()
        },
        {
          id: nanoid(),
          username: 'jose',
          name: 'Jose Monteiro',
          initials: 'JM',
          avatar: null,
          createdAt: new Date()
        }
      ];
      
      await db.insert(schema.users).values(initialUsers);
      console.log('Sample users created successfully!');
    } else {
      console.log('Users table already has data, skipping initial data creation.');
    }
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
  
  console.log('Database setup complete!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Database setup failed:', error);
  process.exit(1);
});