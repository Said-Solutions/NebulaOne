// Script to push database schema changes to the database
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

async function main() {
  // Validate DATABASE_URL environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set.');
    console.error('Please set DATABASE_URL and try again.');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  
  const connectionString = process.env.DATABASE_URL;
  // Initialize postgres and drizzle
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  console.log('🔄 Pushing schema changes to database...');
  
  try {
    // Push all schema changes directly to the database
    // Note: In production, you'd typically use migrations instead of push
    for (const table of Object.values(schema)) {
      if (typeof table === 'object' && table !== null && 'name' in table) {
        console.log(`- Ensuring table: ${table.name}`);
      }
    }
    
    // Execute the schema push
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
    
    console.log('✅ Schema changes applied successfully!');
  } catch (error) {
    console.error('❌ Error applying schema changes:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });