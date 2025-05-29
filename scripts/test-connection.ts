import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import postgres from 'postgres';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('Attempting to connect to the database...');
  const client = postgres(connectionString, {
    max: 1,
    connect_timeout: 30,
    idle_timeout: 20,
    ssl: 'require',
  });

  try {
    await client`SELECT 1`;
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection().catch((error) => {
  console.error('Test connection script failed:', error);
  process.exit(1);
});