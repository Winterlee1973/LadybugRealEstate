import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.ts';
import { profiles } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function backfillProfiles() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🚀 Starting backfill for user profiles...');
  
  const client = postgres(connectionString, {
    max: 1,
    ssl: 'require',
    connect_timeout: 60,
    idle_timeout: 30,
    max_lifetime: 60 * 30
  });
  const db = drizzle(client, { schema });

  try {
    // Fetch all user IDs from auth.users (assuming 'auth.users' is accessible via a raw query or a Drizzle table)
    // Note: Drizzle ORM doesn't directly expose auth.users. You might need to use a raw SQL query.
    // For demonstration, let's assume we can query it or have a way to get user IDs.
    // In a real Supabase environment, you'd typically use the Supabase client library on the server.
    // For this script, we'll simulate fetching user IDs.
    
    // This is a placeholder. In a real application, you'd fetch user IDs from Supabase auth.
    // For example, using the Supabase Admin client:
    // const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    // const userIds = users.map(user => user.id);

    // For now, let's assume we have a way to get existing user IDs.
    // If you have a 'users' table in your Drizzle schema that mirrors auth.users, you could use that.
    // Since we don't have 'auth.users' in our Drizzle schema, we'll use a raw query.
    const existingAuthUsers = await client`SELECT id FROM auth.users` as { id: string }[];
    const authUserIds = existingAuthUsers.map(user => user.id);

    for (const userId of authUserIds) {
      const existingProfile = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

      if (!existingProfile.length) {
        console.log(`Creating profile for user ID: ${userId}`);
        await db.insert(profiles).values({ id: userId, role: 'buyer' }).execute();
      } else {
        console.log(`Profile already exists for user ID: ${userId}`);
      }
    }
    
    console.log('✅ Profile backfill completed successfully!');
  } catch (error) {
    console.error('❌ Profile backfill failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

backfillProfiles().catch((error) => {
  console.error('Backfill script failed:', error);
  process.exit(1);
});