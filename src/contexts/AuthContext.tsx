
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a proper Profile interface with all needed properties
interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'client' | 'admin';
  phone?: string;
  gross_income?: number;
  partner_income?: number;
  existing_loans?: number;
  dependants?: number;
  marital_status?: string;
}

interface AuthContextType {
  user: any;
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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    session()

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    const getProfile = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          setProfile(null);
          return;
        }

        let { data, error, status } = await supabase
          .from('profiles')
          .select(`id, first_name, last_name, email, role, phone, gross_income, partner_income, existing_loans, dependants, marital_status`)
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error;
        }

        setProfile(data as Profile);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getProfile()
  }, [user])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      if (error) throw error;

      if (data.user) {
        await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              ...userData,
              role: 'client'
            }
          ])
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((oldProfile) => ({
        ...oldProfile,
        ...data,
      } as Profile));
    } catch (error: any) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add the autoLoginAsAdmin function
  const autoLoginAsAdmin = async () => {
    setIsLoading(true);
    try {
      // Use a test admin account for demo purposes
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'password123',
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error in auto login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = { 
    user, 
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
      {!isLoading && children}
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
