import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: "buyer" | "seller" | null; // Add role to context type
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  supabase: typeof supabase;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"buyer" | "seller" | null>(null); // Add role state

  // Function to ensure user profile exists and fetch role
  const ensureUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (response.ok) {
        // Profile exists, fetch and set role
        const data = await response.json();
        setRole(data.role);
        console.log(`Profile exists and role fetched for user ${userId}`);
      } else if (response.status === 404) {
        // Profile does not exist, create it with default role 'buyer'
        console.log(`Profile not found for user ${userId}, creating...`);
        const createResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: userId, role: 'buyer' }),
        });
        if (createResponse.ok) {
          setRole('buyer'); // Set default role after creation
          console.log(`Profile created for user ${userId}`);
        } else {
          console.error(`Failed to create profile for user ${userId}:`, await createResponse.text());
        }
      } else {
        // Other error
        console.error(`Error checking profile for user ${userId}:`, await response.text());
      }
    } catch (error) {
      console.error(`Exception when ensuring profile for user ${userId}:`, error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session with retry mechanism
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await ensureUserProfile(currentUser.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    getInitialSession();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  useEffect(() => {

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        // Ensure user profile exists and fetch role on auth change
        if (currentUser) {
          ensureUserProfile(currentUser.id);
        } else {
          setRole(null); // Clear role on sign out
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      // Ensure user profile exists
      ensureUserProfile(data.user.id);
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    role, // Include role in the context value
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}