import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import apiService, { LoginRequest, RegisterRequest, Profile as ApiProfile } from '@/services/api';
import { Profile } from '@/services/api';

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
          // Use id from token if available, otherwise fallback to sub
          const userId = decodedToken.id || decodedToken.sub;
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
        setProfile(profileData);
        
        // Update user info with complete data
        setUser(prev => ({
          ...prev!,
          id: profileData.id || prev?.id || '',
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
      
      // Use the id from the backend response if available
      const userId = data.id || (parseJwt(data.accessToken)?.sub);
      setUser({
        id: userId,
        email: data.email,
        role: data.role.toUpperCase() as 'ADMIN' | 'CLIENT',
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      await fetchUserProfile(userId);
      
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
      
      // Get current profile data
      const { data: currentProfile } = await apiService.getProfileById(user.id);
      
      // Merge current data with updates
      const updatedData: Profile = {
        ...currentProfile,
        ...data
      };
      
      // Update profile data through API
      const { data: responseData } = await apiService.updateProfile(user.id, updatedData);
      
      // Update local profile state
      setProfile(responseData);
      
      // Update user info if name or email changed
      if (data.firstName || data.lastName || data.email) {
        setUser(prev => ({
          ...prev!,
          email: data.email || prev?.email || '',
          firstName: data.firstName || prev?.firstName,
          lastName: data.lastName || prev?.lastName,
        }));
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
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
