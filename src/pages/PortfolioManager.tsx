
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

const PortfolioManager = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!isLoading && user && profile) {
      if (profile.role === 'admin') {
        console.log('Navigating to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Navigating to client dashboard');
        navigate('/client-dashboard');
      }
    } else if (!isLoading && user && !profile) {
      // This handles the case where user exists but profile is null
      console.error('User authenticated but profile is missing');
      toast({
        title: "Error loading profile",
        description: "Your profile information could not be loaded. Please try logging in again.",
        variant: "destructive"
      });
    }
  }, [isLoading, user, profile, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioManager;
