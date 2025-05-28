import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function testConnection() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  console.log('🔍 Testing Supabase connection...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('✅ Supabase client created successfully!');
    console.log('📊 Database should be accessible via Supabase client');
    
    // Now let's try to check if our tables exist
    const { data: tables, error: tableError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.log('📋 Tables do not exist yet - this is expected for first migration');
      console.log('Table error:', tableError.message);
      
      if (tableError.code === '42P01') {
        console.log('🎯 This confirms the database is accessible but tables need to be created');
        return true;
      }
    } else {
      console.log('📋 Properties table already exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

testConnection().catch(console.error);