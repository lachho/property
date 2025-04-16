import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDetailsForm from '@/components/ClientDetailsForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const AdminClientForm = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && profile && profile.role !== 'admin') {
      navigate('/portfolio-manager');
    }
  }, [isLoading, user, profile, navigate]);

  const handleFormSaved = () => {
    toast({
      title: "Success",
      description: "Client details saved successfully",
    });
    navigate('/admin-dashboard');
  };

  if (isLoading || isFormLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
            <p className="text-lg">Loading client form...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow section-padding">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate('/admin-dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="heading-lg">
                {clientId ? 'Edit Client Details' : 'New Client Details'}
              </h1>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {clientId ? 'Edit Client Information' : 'Create New Client'}
              </CardTitle>
              <CardDescription>
                {clientId 
                  ? 'Update client details, assets, and liabilities' 
                  : 'Enter comprehensive client information'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientDetailsForm 
                clientId={clientId} 
                onSaved={handleFormSaved}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminClientForm; 