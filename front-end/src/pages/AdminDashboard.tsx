import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserCog, Home, Plus, Link as LinkIcon, FileQuestion, UserRound, DollarSign, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

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
      if (!user) return;
      
      try {
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
          setClients(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching clients:', error);
      } finally {
        setIsFetchingClients(false);
      }
    };

    const fetchProperties = async () => {
      if (!user) return;
      
      try {
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
    }
  }, [user, profile]);

  const handleResetPassword = (email: string) => {
    // This will be implemented with the API
    console.log('Reset password for:', email);
    
    toast({
      title: "Password Reset",
      description: "Function not yet implemented. This will reset the password for " + email,
    });
    
    // TODO: Implement password reset functionality
    // This is where an API call would go to trigger a password reset
    // For example:
    // resetUserPassword(email)
    //   .then(() => {
    //     toast({
    //       title: "Password Reset Email Sent",
    //       description: `A password reset email has been sent to ${email}`,
    //     });
    //   })
    //   .catch((error) => {
    //     toast({
    //       title: "Error",
    //       description: `Failed to send reset email: ${error.message}`,
    //       variant: "destructive"
    //     });
    //   });
  };

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
          
          {/* Admin Profile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Users</CardTitle>
                <CardDescription>Manage users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{clients.length}</p>
                <p className="text-sm text-gray-500">Total clients</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Properties</CardTitle>
                <CardDescription>Manage properties</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{properties.length}</p>
                <p className="text-sm text-gray-500">Total properties</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Admin Profile</CardTitle>
                <CardDescription>Your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium truncate">{profile.email}</p>
                <p className="text-sm text-gray-500">Role: {profile.role}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Admin controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild className="bg-theme-warm/5 border-theme-warm text-theme-warm hover:bg-theme-warm/10 hover:text-theme-warm">
                    <Link to="/add-property">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Property
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="bg-theme-warm/5 border-theme-warm text-theme-warm hover:bg-theme-warm/10 hover:text-theme-warm">
                    <Link to="/assign-property">
                      <LinkIcon className="mr-1 h-4 w-4" />
                      Assign Property
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="bg-theme-warm/5 border-theme-warm text-theme-warm hover:bg-theme-warm/10 hover:text-theme-warm">
                    <Link to="/admin-client-form">
                      <UserCog className="mr-1 h-4 w-4" />
                      New Client Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Clients Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Clients
              </CardTitle>
              <CardDescription>Manage client accounts and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No clients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell 
                            className="font-medium"
                            onClick={() => navigate(`/admin/client/${client.id}`)}
                          >
                            {client.first_name || ''} {client.last_name || ''} 
                            {!client.first_name && !client.last_name && '(No name provided)'}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/admin/client/${client.id}`)}
                          >
                            {client.email}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/admin/client/${client.id}`)}
                          >
                            {client.phone || 'No phone'}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResetPassword(client.email)}
                            >
                              Reset Password
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-theme-warm hover:bg-theme-warm/90"
                              onClick={() => navigate(`/admin/client/${client.id}`)}
                            >
                              View Client
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="bg-theme-blue/5 border-theme-blue text-theme-blue hover:bg-theme-blue/10 hover:text-theme-blue"
                              onClick={() => navigate(`/admin-client-form/${client.id}`)}
                            >
                              <UserCog className="mr-1 h-4 w-4" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Properties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Properties
              </CardTitle>
              <CardDescription>Manage property listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Specs</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No properties found
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties.map((property) => (
                        <TableRow key={property.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell 
                            className="font-medium"
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            {property.name}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            {property.address}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            ${property.price.toLocaleString()}
                          </TableCell>
                          <TableCell 
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            {property.beds} bed, {property.baths} bath, {property.area} m²
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              className="bg-theme-warm hover:bg-theme-warm/90"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  className="bg-theme-warm hover:bg-theme-warm/90"
                  asChild
                >
                  <Link to="/add-property">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Property
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
