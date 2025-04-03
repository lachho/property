import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Home, DollarSign, Briefcase, Users } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

// Form schema for financial information
const financialFormSchema = z.object({
  grossIncome: z.string().transform(val => Number(val) || 0),
  partnerIncome: z.string().transform(val => Number(val) || 0),
  existingLoans: z.string().transform(val => Number(val) || 0),
  dependants: z.string().transform(val => Number(val) || 0),
  maritalStatus: z.string().optional(),
});

const ClientDashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);

  // Initialize form with profile data
  const form = useForm<z.infer<typeof financialFormSchema>>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      grossIncome: profile?.gross_income?.toString() || "0",
      partnerIncome: profile?.partner_income?.toString() || "0",
      existingLoans: profile?.existing_loans?.toString() || "0",
      dependants: profile?.dependants?.toString() || "0",
      maritalStatus: profile?.marital_status || "",
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch saved properties
  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: savedPropertyIds, error: savedError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id);
        
        if (savedError) throw savedError;
        
        if (savedPropertyIds && savedPropertyIds.length > 0) {
          const propertyIds = savedPropertyIds.map(item => item.property_id);
          
          const { data: properties, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);
          
          if (propertiesError) throw propertiesError;
          
          setSavedProperties(properties || []);
        }
      } catch (error) {
        console.error('Error fetching saved properties:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your saved properties."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedProperties();
  }, [user, toast]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof financialFormSchema>) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Convert form values to numbers for database storage
      const updatedProfile = {
        gross_income: Number(values.grossIncome),
        partner_income: Number(values.partnerIncome),
        existing_loans: Number(values.existingLoans),
        dependants: Number(values.dependants),
        marital_status: values.maritalStatus
      };
      
      await updateProfile(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your financial information has been saved."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating your profile."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle property click
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  // Remove property from saved list
  const handleRemoveProperty = async (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      
      if (error) throw error;
      
      setSavedProperties(prev => prev.filter(property => property.id !== propertyId));
      
      toast({
        title: "Property Removed",
        description: "Property has been removed from your saved list."
      });
    } catch (error) {
      console.error('Error removing property:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove the property."
      });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Client Dashboard</h1>
          
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome, {profile.first_name || 'Client'}
                </h2>
                <p className="text-gray-600">
                  Manage your property portfolio and financial information
                </p>
              </div>
              <Button 
                onClick={() => navigate('/portfolio-manager')}
                className="bg-theme-blue hover:bg-theme-blue-dark"
              >
                Browse Properties
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="properties">Saved Properties</TabsTrigger>
              <TabsTrigger value="financial">Financial Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>Your Saved Properties</CardTitle>
                  <CardDescription>
                    Properties you've saved for future reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
                    </div>
                  ) : savedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedProperties.map((property) => (
                        <div 
                          key={property.id}
                          onClick={() => handlePropertyClick(property.id)}
                          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="h-40 bg-gray-200 relative">
                            {property.image_url ? (
                              <img 
                                src={property.image_url} 
                                alt={property.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Home className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1">{property.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-theme-blue">
                                ${property.price.toLocaleString()}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleRemoveProperty(property.id, e)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No saved properties</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't saved any properties yet. Browse our listings to find your next investment.
                      </p>
                      <Button 
                        onClick={() => navigate('/portfolio-manager')}
                        className="bg-theme-blue hover:bg-theme-blue-dark"
                      >
                        Browse Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financial">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                  <CardDescription>
                    Update your financial details to get more accurate borrowing estimates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="grossIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Gross Income ($)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Your annual income before taxes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="partnerIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partner's Annual Income ($)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                If applicable
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="existingLoans"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Existing Loan Repayments ($/month)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Monthly payments for existing loans
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dependants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Dependants</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Children or others financially dependent on you
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="maritalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marital Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="single">Single</SelectItem>
                                  <SelectItem value="married">Married</SelectItem>
                                  <SelectItem value="defacto">De Facto</SelectItem>
                                  <SelectItem value="divorced">Divorced</SelectItem>
                                  <SelectItem value="widowed">Widowed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Your current marital status
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-theme-blue hover:bg-theme-blue-dark"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          'Save Information'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
