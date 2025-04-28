import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import apiService, { LoginRequest, RegisterRequest, Profile as ApiProfile } from '@/services/api';

// Simple function to decode JWT tokens
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT token", e);
    return null;
  }
}

interface User {
  id?: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  firstName?: string;
  lastName?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// Define a proper Profile interface with all needed properties
interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
  gross_income?: number;
  partner_income?: number | null;
  existing_loans?: number | null;
  dependants?: number | null;
  marital_status?: string;
  date_of_birth?: string | null;
  // Calculator fields
  borrowing_capacity?: number | null;
  purchase_timeframe?: string | null;
  loan_amount?: number | null;
  interest_rate?: number | null;
  loan_term?: string | null;
  repayment_frequency?: string | null;
  loan_type?: string | null;
  additional_repayments?: number | null;
  monthly_repayment?: number | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, lastName: string, email: string, password: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  autoLoginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Auth provider initialized");
    
    // Check if there's a token to determine if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          // Decode the token to get user information
          const decodedToken = parseJwt(token);
          const userId = decodedToken.sub;
          const userEmail = decodedToken.email;
          const userRole = decodedToken.role as 'ADMIN' | 'CLIENT';
          
          console.log("Decoded token:", decodedToken);
          
          // Set basic user info from token
          setUser({
            id: userId,
            email: userEmail,
            role: userRole
          });
          
          // Try to fetch complete profile
          await fetchUserProfile(userId);
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        // Clear potentially invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      
      console.log("Fetching user profile for ID:", userId);
      
      // Get user profile from API using the ID from the token
      const { data: profileData } = await apiService.getProfileById(userId);
      
      console.log("Profile data received:", profileData);
      
      if (profileData) {
        // Convert API profile to our internal Profile type
        const userProfile: Profile = {
          id: profileData.id?.toString() || '',
          email: profileData.email || '',
          role: (profileData.role?.toUpperCase() as 'ADMIN' | 'CLIENT') || 'CLIENT',
          first_name: profileData.firstName || '',
          last_name: profileData.lastName || '',
          phone: profileData.phone || '',
          gross_income: profileData.grossIncome || 0,
          partner_income: profileData.partnerIncome || null,
          dependants: profileData.dependants || null,
          date_of_birth: profileData.dateOfBirth as string | null || null,
        };
        
        console.log("Converted user profile:", userProfile);
        
        setProfile(userProfile);
        
        // Update user info with complete data
        setUser(prev => ({
          ...prev!,
          id: profileData.id?.toString() || prev?.id || '',
          email: profileData.email || prev?.email || '',
          role: (profileData.role?.toUpperCase() as 'ADMIN' | 'CLIENT') || prev?.role || 'CLIENT',
          firstName: profileData.firstName || prev?.firstName,
          lastName: profileData.lastName || prev?.lastName,
        }));
        
        console.log("User and profile state updated");
      } else {
        console.warn("No profile data received from API");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Don't clear user state here, since we already have basic info from token
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Signing in:", email);
      
      const loginRequest: LoginRequest = { email, password };
      const { data } = await apiService.login(loginRequest);
      
      // Store tokens
      localStorage.setItem('token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      try {
        // Decode the token to get user ID
        const decodedToken = parseJwt(data.accessToken);
        const userId = decodedToken.sub;
        
        // Create basic user info
        setUser({
          id: userId,
          email: data.email,
          role: data.role.toUpperCase() as 'ADMIN' | 'CLIENT',
          firstName: data.firstName,
          lastName: data.lastName
        });
        
        // Fetch complete user profile
        await fetchUserProfile(userId);
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        // Create basic user from response data if token decode fails
        setUser({
          email: data.email,
          role: data.role.toUpperCase() as 'ADMIN' | 'CLIENT',
          firstName: data.firstName,
          lastName: data.lastName
        });
      }
      
      console.log("Sign in successful");
    } catch (error: any) {
      console.error("Error signing in:", error.message, error);
      toast({
        title: "Sign In Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (firstName: string, lastName: string, email: string, password: string, phone: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Signing up:", email);
      
      // Create register request with required fields
      const registerRequest: RegisterRequest = {
        firstName,
        lastName,
        email,
        password,
        phone
      };
      
      console.log("Registration request:", JSON.stringify(registerRequest));
      
      const { data } = await apiService.register(registerRequest);
      
      // Store tokens
      localStorage.setItem('token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      try {
        // Decode the token to get user ID
        const decodedToken = parseJwt(data.accessToken);
        const userId = decodedToken.sub;
        
        // Create basic user info
        setUser({
          id: userId,
          email: data.email,
          role: data.role.toUpperCase() as 'ADMIN' | 'CLIENT',
          firstName: data.firstName || firstName,
          lastName: data.lastName || lastName
        });
        
        // Fetch complete user profile
        await fetchUserProfile(userId);
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        // Create basic user from response data if token decode fails
        setUser({
          email: data.email,
          role: data.role.toUpperCase() as 'ADMIN' | 'CLIENT',
          firstName: data.firstName || firstName,
          lastName: data.lastName || lastName
        });
      }
      
      console.log("Sign up successful");
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully"
      });
    } catch (error: any) {
      console.error("Error signing up:", error.message, error);
      
      let errorMessage = "Could not create account";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Signing out");
      
      // Clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Clear state
      setUser(null);
      setProfile(null);
      
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<void> => {
    if (!user?.id) {
      console.error("Cannot update profile: No user ID available");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Updating profile for user:", user.id, data);
      
      // Convert our internal Profile to API Profile format
      const apiProfileData: Partial<ApiProfile> = {
        id: profile?.id ? parseInt(profile.id) : undefined,
        email: data.email || profile?.email,
        firstName: data.first_name || profile?.first_name,
        lastName: data.last_name || profile?.last_name,
        phone: data.phone || profile?.phone,
        grossIncome: data.gross_income || profile?.gross_income,
        partnerIncome: data.partner_income || profile?.partner_income,
        dependants: data.dependants || profile?.dependants,
        dateOfBirth: data.date_of_birth || profile?.date_of_birth,
        role: data.role || profile?.role
      };
      
      // Update profile data through API
      const { data: responseData } = await apiService.updateProfile(user.id, apiProfileData as ApiProfile);
      
      // Convert API response back to our Profile format
      const updatedProfile: Profile = {
        ...profile!,
        ...data,
        id: responseData.id?.toString() || profile?.id || '',
        email: responseData.email,
        role: (responseData.role?.toUpperCase() as 'ADMIN' | 'CLIENT') || profile?.role || 'CLIENT',
        first_name: responseData.firstName,
        last_name: responseData.lastName,
        phone: responseData.phone,
        gross_income: responseData.grossIncome,
        partner_income: responseData.partnerIncome,
        dependants: responseData.dependants,
        date_of_birth: responseData.dateOfBirth as string | null,
      };
      
      // Update local profile state
      setProfile(updatedProfile);
      
      // Update user state with new info
      setUser(prev => ({
        ...prev!,
        email: responseData.email || prev?.email || '',
        role: (responseData.role?.toUpperCase() as 'ADMIN' | 'CLIENT') || prev?.role || 'CLIENT',
        firstName: responseData.firstName || prev?.firstName,
        lastName: responseData.lastName || prev?.lastName,
      }));
      
      console.log("Profile updated successfully");
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update profile",
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
      // Always use admin@example.com for consistency
      await signIn('admin@example.com', 'admin123');
      console.log("Admin auto login successful");
    } catch (error: any) {
      console.error("Error in auto login:", error.message);
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
    autoLoginAsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
