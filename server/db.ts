import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not found. Using fallback connection for development.');
  // This will be set when you provide the Supabase credentials
  connectionString = 'postgresql://placeholder';
}

// Create the connection
const client = postgres(connectionString, {
  connect_timeout: 10,
  ssl: {
    rejectUnauthorized: false, // WARNING: Do not use in production. This is for development with self-signed certs.
  },
});

export const db = drizzle(client, { schema });

// Export types for use throughout the application
export type Database = typeof db;
export * from '../shared/schema';