
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AdminStats from '@/components/admin/AdminStats';
import ClientsTable from '@/components/admin/ClientsTable';
import PropertiesTable from '@/components/admin/PropertiesTable';

// Types
type ClientProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: 'client' | 'admin';
};

type Property = {
  id: string;
  name: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
};

const AdminDashboard = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [isFetchingProperties, setIsFetchingProperties] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && profile && profile.role !== 'admin') {
      // Redirect non-admin users away from admin dashboard
      navigate('/portfolio-manager');
    }
  }, [isLoading, user, profile, navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user || !profile || profile.role !== 'admin') return;
      
      try {
        console.log('Fetching clients...');
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, role')
          .eq('role', 'client');
        
        if (error) {
          console.error('Error fetching clients:', error);
          toast({
            title: "Error",
            description: "Failed to load clients",
            variant: "destructive"
          });
        } else {
          console.log('Clients loaded:', data);
          setClients(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching clients:', error);
      } finally {
        setIsFetchingClients(false);
      }
    };

    const fetchProperties = async () => {
      if (!user || !profile || profile.role !== 'admin') return;
      
      try {
        console.log('Fetching properties...');
        const { data, error } = await supabase
          .from('properties')
          .select('id, name, address, price, beds, baths, area');
        
        if (error) {
          console.error('Error fetching properties:', error);
          toast({
            title: "Error",
            description: "Failed to load properties",
            variant: "destructive"
          });
        } else {
          console.log('Properties loaded:', data);
          setProperties(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching properties:', error);
      } finally {
        setIsFetchingProperties(false);
      }
    };

    if (user && profile?.role === 'admin') {
      fetchClients();
      fetchProperties();
    } else {
      setIsFetchingClients(false);
      setIsFetchingProperties(false);
    }
  }, [user, profile]);

  if (isLoading || isFetchingClients || isFetchingProperties) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-theme-warm" />
            <p className="text-lg">Loading admin dashboard...</p>
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
            <h1 className="heading-lg">Admin Dashboard</h1>
            <Button variant="outline" onClick={signOut}>Log Out</Button>
          </div>
          
          {/* Admin Statistics */}
          <AdminStats 
            clients={clients.length}
            properties={properties.length}
            userEmail={profile.email}
            userRole={profile.role}
          />
          
          {/* Clients Section */}
          <ClientsTable clients={clients} />
          
          {/* Properties Section */}
          <PropertiesTable properties={properties} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
