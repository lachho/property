
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Edit, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type ClientProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  marital_status: string | null;
  gross_income: number | null;
  partner_income: number | null;
  existing_loans: number | null;
  dependants: number | null;
};

const AdminClientView = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<ClientProfile>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      marital_status: '',
      gross_income: 0,
      partner_income: 0,
      existing_loans: 0,
      dependants: 0,
    }
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && profile && profile.role !== 'admin') {
      navigate('/portfolio-manager');
    }
  }, [isLoading, user, profile, navigate]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !clientId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (error) {
          console.error('Error fetching client:', error);
          toast({
            title: "Error",
            description: "Failed to load client details",
            variant: "destructive"
          });
          navigate('/admin-dashboard');
        } else if (data) {
          setClientProfile(data as ClientProfile);
          form.reset({
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            marital_status: data.marital_status,
            gross_income: data.gross_income,
            partner_income: data.partner_income,
            existing_loans: data.existing_loans,
            dependants: data.dependants,
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching client:', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (user && profile?.role === 'admin') {
      fetchClientData();
    }
  }, [user, profile, clientId, navigate, form]);

  const handleSave = async (data: ClientProfile) => {
    if (!user || !clientId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          marital_status: data.marital_status,
          gross_income: data.gross_income,
          partner_income: data.partner_income,
          existing_loans: data.existing_loans,
          dependants: data.dependants,
        })
        .eq('id', clientId);
      
      if (error) {
        console.error('Error updating client:', error);
        toast({
          title: "Error",
          description: "Failed to update client details",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Client details updated successfully",
        });
        setIsEditing(false);
        // Refresh client data
        const { data: updatedData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (updatedData) {
          setClientProfile(updatedData as ClientProfile);
        }
      }
    } catch (error) {
      console.error('Unexpected error updating client:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
            <p className="text-lg">Loading client details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'admin' || !clientProfile) {
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
              <h1 className="heading-lg">Client Profile</h1>
            </div>
            
            {isEditing ? (
              <Button 
                onClick={form.handleSubmit(handleSave)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                View and manage client details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="marital_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marital Status</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dependants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dependants</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value === null ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gross_income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gross Income ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value === null ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="partner_income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Income ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value === null ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="existing_loans"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Existing Loans ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value === null ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-500 text-sm">Full Name</Label>
                    <p className="font-medium">
                      {clientProfile.first_name || ''} {clientProfile.last_name || ''}
                      {!clientProfile.first_name && !clientProfile.last_name && '(No name provided)'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Email</Label>
                    <p className="font-medium">{clientProfile.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Phone</Label>
                    <p>{clientProfile.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Marital Status</Label>
                    <p>{clientProfile.marital_status || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Dependants</Label>
                    <p>{clientProfile.dependants !== null ? clientProfile.dependants : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Gross Income</Label>
                    <p>{clientProfile.gross_income !== null ? `$${clientProfile.gross_income.toLocaleString()}` : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Partner Income</Label>
                    <p>{clientProfile.partner_income !== null ? `$${clientProfile.partner_income.toLocaleString()}` : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 text-sm">Existing Loans</Label>
                    <p>{clientProfile.existing_loans !== null ? `$${clientProfile.existing_loans.toLocaleString()}` : 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Client Properties Section - Can be implemented later */}
          <Card>
            <CardHeader>
              <CardTitle>Client Properties</CardTitle>
              <CardDescription>
                Properties saved or related to this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No properties associated with this client yet.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminClientView;
