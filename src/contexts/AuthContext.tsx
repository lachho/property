
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          setProfile(null);
          setIsLoading(false);
          return;
        }

        console.log("Fetching profile for user:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`id, first_name, last_name, email, role, phone, gross_income, partner_income, existing_loans, dependants, marital_status`)
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.warn("Profile not found, creating new profile");
            await createDefaultProfile(user);
          } else {
            console.error("Error fetching profile:", error);
            toast({
              title: "Error loading profile",
              description: "There was a problem loading your profile. Please try again later.",
              variant: "destructive"
            });
          }
        } else {
          console.log("Profile loaded:", data);
          setProfile(data as Profile);
        }
      } catch (error: any) {
        console.error("Error in getProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      getProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const createDefaultProfile = async (user: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            role: 'client'
          }
        ]);

      if (error) {
        throw error;
      }

      // Fetch the newly created profile
      const { data: newProfile, error: fetchError } = await supabase
        .from('profiles')
        .select(`id, first_name, last_name, email, role, phone, gross_income, partner_income, existing_loans, dependants, marital_status`)
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setProfile(newProfile as Profile);
    } catch (error) {
      console.error("Error creating default profile:", error);
    }
  };

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
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setIsLoading(true);
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;

      // Create a profile for the new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              ...userData,
              role: 'client'
            }
          ]);
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            title: "Profile Creation Failed",
            description: "Your account was created but we couldn't set up your profile. Please contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created",
            description: "Your account has been created successfully.",
          });
        }
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
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
      setProfile(null);
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((oldProfile) => ({
        ...oldProfile,
        ...data,
      } as Profile));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoLoginAsAdmin = async () => {
    setIsLoading(true);
    try {
      // For testing purposes - you would replace these with actual credentials
      // for a demo admin account in your real application
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'password123',
      });
      
      if (error) {
        // If admin login fails, try to create an admin account for testing
        await createAdminUser();
      }
    } catch (error: any) {
      console.error("Error in auto login:", error);
      toast({
        title: "Auto Login Failed",
        description: "Failed to log in as admin. Please use regular login.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminUser = async () => {
    try {
      // Create an admin user for testing purposes
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'password123',
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin'
            }
          ]);
          
        if (profileError) throw profileError;
        
        // Sign in with the newly created account
        await supabase.auth.signInWithPassword({
          email: 'admin@example.com',
          password: 'password123',
        });
        
        toast({
          title: "Admin Account Created",
          description: "An admin account has been created and you are now logged in.",
        });
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
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
