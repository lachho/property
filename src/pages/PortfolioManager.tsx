
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
      
      // If we have both user and profile, or we've already attempted routing
      if (profile) {
        console.log(`PortfolioManager: Routing user with role ${profile.role} to appropriate dashboard`);
        if (profile.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else if (routingAttempted) {
        // If we've tried to get the profile but still don't have it, 
        // assume client role as default and redirect
        console.log("PortfolioManager: Profile not available after retry, defaulting to client dashboard");
        navigate('/client-dashboard');
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
