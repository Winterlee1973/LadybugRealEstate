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
  updateRole: (newRole: "buyer" | "seller") => Promise<{ error: any | null }>;
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
      // Validate Supabase configuration before making requests
      if (!supabase || !supabase.from) {
        console.error('Supabase client not properly initialized');
        return;
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, other errors are actual problems
        console.error(`Error checking profile for user ${userId}:`, fetchError);
        return;
      }

      if (existingProfile) {
        // Profile exists, set role
        setRole(existingProfile.role);
        console.log(`Profile exists and role fetched for user ${userId}`);
      } else {
        // Profile does not exist, create it with default role 'buyer'
        console.log(`Profile not found for user ${userId}, creating...`);
        const { error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, role: 'buyer' });

        if (!createError) {
          setRole('buyer'); // Set default role after creation
          console.log(`Profile created for user ${userId}`);
        } else {
          console.error(`Failed to create profile for user ${userId}:`, createError);
        }
      }
    } catch (error) {
      // Enhanced error logging to help debug the JSON parsing issue
      if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
        console.error(`JSON parsing error when ensuring profile for user ${userId}. This usually means an API call returned HTML instead of JSON. Check Netlify redirects and environment variables.`, error);
      } else {
        console.error(`Exception when ensuring profile for user ${userId}:`, error);
      }
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

  const updateRole = async (newRole: "buyer" | "seller") => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Update local role state immediately
      setRole(newRole);
      return { error: null };
    } catch (error) {
      return { error };
    }
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
    updateRole,
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