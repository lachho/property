
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Define a proper Profile interface with all needed properties
interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'client' | 'admin';
  phone?: string;
  gross_income?: number;
  partner_income?: number | null;
  existing_loans?: number | null;
  dependants?: number | null;
  marital_status?: string;
  date_of_birth?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  autoLoginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Auth provider initialized");
    // Set up auth state listener FIRST to catch all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
    });

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) {
        console.log("No user, setting profile to null");
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log("Fetching profile for user:", user.id);
      
      try {
        // Query the profiles table for the current user
        let { data, error, status } = await supabase
          .from('profiles')
          .select(`id, first_name, last_name, email, role, phone, gross_income, partner_income, existing_loans, dependants, marital_status, date_of_birth`)
          .eq('id', user.id)
          .single();

        if (error) {
          if (status === 406) {
            console.warn("No profile found, user may be new");
          } else {
            throw error;
          }
        }

        if (data) {
          console.log("Profile fetched successfully:", data);
          setProfile(data as Profile);
        } else {
          console.log("No profile data returned");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error.message, error);
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();
  }, [user]);

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Signing in:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful:", data?.user?.id);
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Signing up:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {} // Include any additional user metadata
        }
      });
      
      if (error) throw error;
      console.log("Sign up successful, user created:", data?.user?.id);
      
      // Profile is created via database trigger
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Signing out");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<void> => {
    if (!user) {
      console.error("Cannot update profile: No user logged in");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Updating profile for user:", user.id, data);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      console.log("Profile updated successfully");
      setProfile((oldProfile) => ({
        ...oldProfile,
        ...data,
      } as Profile));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoLoginAsAdmin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Auto login as admin");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'password123',
      });
      
      if (error) throw error;
      console.log("Admin auto login successful:", data?.user?.id);
    } catch (error: any) {
      console.error("Error in auto login:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = { 
    user, 
    session,
    profile, 
    isLoading, 
    signIn, 
    signUp, 
    signOut, 
    updateProfile, 
    autoLoginAsAdmin 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
