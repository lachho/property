
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PortfolioManager = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [routingAttempted, setRoutingAttempted] = useState(false);

  useEffect(() => {
    console.log("PortfolioManager: Auth state:", { 
      user: user?.id, 
      profile: profile?.id,
      role: profile?.role,
      isLoading
    });

    // Only proceed with routing if we're not loading
    if (!isLoading) {
      if (!user) {
        console.log("PortfolioManager: No user, redirecting to auth");
        navigate('/auth');
        return;
      }

      // If we have a user but no profile, wait a bit and check again
      if (!profile) {
        console.log("PortfolioManager: Have user but no profile yet");
        
        if (!routingAttempted) {
          // Set a delay to try again in case profile is still loading
          const timer = setTimeout(() => {
            console.log("PortfolioManager: Retrying routing decision");
            setRoutingAttempted(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      }
      
      // If we have both user and profile
      if (profile) {
        console.log(`PortfolioManager: Routing user with role ${profile.role} to appropriate dashboard`);
        if (profile.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else if (routingAttempted) {
        // If we've tried to get the profile but still don't have it, 
        // something might be wrong - let's create a profile if needed
        console.log("PortfolioManager: Profile not available after retry, checking if profile exists");
        
        // Double-check if profile exists in the database
        const checkAndCreateProfile = async () => {
          try {
            const { supabase } = await import('@/integrations/supabase/client');
            
            // Check if profile exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();
            
            if (!existingProfile) {
              console.log("PortfolioManager: Profile doesn't exist, creating one");
              
              // Create profile if it doesn't exist
              const { error } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email,
                  role: 'client' // Default role
                });
              
              if (error) {
                console.error("Failed to create profile:", error);
                // Default to client dashboard if we can't create a profile
                navigate('/client-dashboard');
              } else {
                // Redirect to client dashboard after creating profile
                navigate('/client-dashboard');
              }
            } else {
              // Profile exists but wasn't loaded for some reason
              console.log("PortfolioManager: Profile exists but wasn't loaded, defaulting to client dashboard");
              navigate('/client-dashboard');
            }
          } catch (error) {
            console.error("Error checking/creating profile:", error);
            navigate('/client-dashboard'); // Default fallback
          }
        };
        
        checkAndCreateProfile();
      }
    }
  }, [isLoading, user, profile, navigate, routingAttempted]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
          <p className="text-lg">Loading your portfolio...</p>
          <p className="text-sm text-gray-500">
            {!user ? "Checking authentication..." : 
             !profile ? "Loading your profile..." : 
             "Preparing your dashboard..."}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioManager;
