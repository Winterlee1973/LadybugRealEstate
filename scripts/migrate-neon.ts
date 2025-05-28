import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '../shared/schema.ts';

async function runMigrationWithNeon() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🚀 Starting database migration with Neon driver...');
  
  try {
    // Use Neon's HTTP-based connection
    const sql = neon(connectionString);
    const db = drizzle(sql, { schema });

    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migration completed successfully with Neon driver!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runMigrationWithNeon().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});