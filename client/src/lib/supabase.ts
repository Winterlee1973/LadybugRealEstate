import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
}

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