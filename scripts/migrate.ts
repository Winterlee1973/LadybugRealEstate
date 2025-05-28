import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema.ts';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🚀 Starting database migration...');
  
  const migrationClient = postgres(connectionString, {
    max: 1,
    ssl: 'require',
    connect_timeout: 60,
    idle_timeout: 30,
    max_lifetime: 60 * 30
  });
  const db = drizzle(migrationClient, { schema });

  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

runMigration().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});