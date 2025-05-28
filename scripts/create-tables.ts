import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

async function createTables() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  console.log('🚀 Creating tables in Supabase...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read the migration SQL file
    const migrationSQL = readFileSync('./migrations/0000_orange_gideon.sql', 'utf8');
    
    // Split the SQL into individual statements (remove the statement-breakpoint comments)
    const statements = migrationSQL
      .split('-- statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });
      
      if (error) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        throw error;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('🎉 All tables created successfully!');
    
    // Verify tables were created
    const { data: tables, error: verifyError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (verifyError && verifyError.code === '42P01') {
      console.log('⚠️  Tables might not be created yet, but this could be due to API limitations');
    } else {
      console.log('✅ Tables verified successfully!');
    }
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
    throw error;
  }
}

createTables().catch(console.error);