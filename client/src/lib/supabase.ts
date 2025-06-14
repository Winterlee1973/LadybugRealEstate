import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file and Netlify environment variables.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  if (file.size > MAX_FILE_SIZE) {
    alert("File size exceeds 10MB");
    return null;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Error uploading image:", error);
      alert(`Error uploading image: ${error.message}`);
      return null;
    }

    const publicUrl = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath).data.publicUrl;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Error uploading image");
    return null;
  }
}

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: number
          property_id: string
          title: string
          description: string
          price: string
          address: string
          city: string
          state: string
          zip_code: string
          bedrooms: number
          bathrooms: string
          square_footage: number
          lot_size: string | null
          year_built: number | null
          property_type: string
          status: string
          images: string[]
          features: string[]
          hoa_fees: string | null
          property_tax: string | null
          agent_name: string | null
          agent_phone: string | null
          agent_email: string | null
          agent_photo: string | null
          agent_rating: string | null
          agent_reviews: number | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          property_id: string
          title: string
          description: string
          price: string
          address: string
          city: string
          state: string
          zip_code: string
          bedrooms: number
          bathrooms: string
          square_footage: number
          lot_size?: string | null
          year_built?: number | null
          property_type: string
          status?: string
          images?: string[]
          features?: string[]
          hoa_fees?: string | null
          property_tax?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          agent_email?: string | null
          agent_photo?: string | null
          agent_rating?: string | null
          agent_reviews?: number | null
          user_id?: string | null
        }
        Update: {
          property_id?: string
          title?: string
          description?: string
          price?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          bedrooms?: number
          bathrooms?: string
          square_footage?: number
          lot_size?: string | null
          year_built?: number | null
          property_type?: string
          status?: string
          images?: string[]
          features?: string[]
          hoa_fees?: string | null
          property_tax?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          agent_email?: string | null
          agent_photo?: string | null
          agent_rating?: string | null
          agent_reviews?: number | null
          user_id?: string | null
        }
      }
      favorites: {
        Row: {
          id: number
          property_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          property_id: string
          user_id: string
        }
        Update: {
          property_id?: string
          user_id?: string
        }
      }
      inquiries: {
        Row: {
          id: number
          property_id: string
          name: string
          email: string
          phone: string | null
          message: string
          inquiry_type: string
          created_at: string
        }
        Insert: {
          property_id: string
          name: string
          email: string
          phone?: string | null
          message: string
          inquiry_type: string
        }
        Update: {
          property_id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          inquiry_type?: string
        }
      }
    }
  }
}