
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Home, PieChart, TrendingUp, Calendar, Wallet, Plus, ChartBar, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useBorrowingCapacity } from '@/hooks/useBorrowingCapacity';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sample colors
const COLORS = ['#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#6366f1'];

// Financial update form schema
const financialFormSchema = z.object({
  grossIncome: z.string().min(1, "Income is required").transform(val => Number(val)),
  extraIncome: z.string().optional().transform(val => val ? Number(val) : 0),
  monthlyExpenses: z.string().min(1, "Monthly expenses is required").transform(val => Number(val)),
  existingLoans: z.string().min(1, "Existing loans amount is required").transform(val => Number(val)),
});

const ClientDashboard = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [isLoadingAvailableProperties, setIsLoadingAvailableProperties] = useState(true);
  const [showFinancialDialog, setShowFinancialDialog] = useState(false);
  
  const { 
    isLoading: isLoadingFinancial, 
    financialData, 
    portfolioProperties,
    calculatePropertyGrowth,
    calculateMortgage,
    calculateTotalPortfolioValue,
    calculateTotalEquity,
    calculateCashFlow
  } = useFinancialData();
  
  const { calculateCapacity } = useBorrowingCapacity();

  // Financial update form
  const financialForm = useForm<z.infer<typeof financialFormSchema>>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      grossIncome: profile?.gross_income?.toString() || "",
      extraIncome: profile?.partner_income?.toString() || "",
      monthlyExpenses: "2000", // Default value
      existingLoans: profile?.existing_loans?.toString() || "",
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      try {
        // Get saved properties for the current user
        const { data: savedPropertiesData, error: savedPropertiesError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id);
        
        if (savedPropertiesError) {
          throw savedPropertiesError;
        }

        if (savedPropertiesData.length === 0) {
          setProperties([]);
          setIsLoadingProperties(false);
          return;
        }

        const propertyIds = savedPropertiesData.map(item => item.property_id);
        
        // Get actual property data
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);
        
        if (propertiesError) {
          throw propertiesError;
        }
        
        setProperties(propertiesData || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error fetching properties",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [user, toast]);

  useEffect(() => {
    const fetchAvailableProperties = async () => {
      if (!user) return;
      
      try {
        // Get all properties not already saved by the user
        const { data: savedPropertiesData } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id);
        
        const savedIds = savedPropertiesData?.map(item => item.property_id) || [];
        
        const { data: allPropertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*');
        
        if (propertiesError) {
          throw propertiesError;
        }
        
        // Filter out already saved properties
        const available = allPropertiesData?.filter(
          property => !savedIds.includes(property.id)
        ) || [];
        
        setAvailableProperties(available);
      } catch (error) {
        console.error('Error fetching available properties:', error);
        toast({
          title: "Error fetching available properties",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoadingAvailableProperties(false);
      }
    };

    fetchAvailableProperties();
  }, [user, toast, properties]);

  const viewPropertyDetails = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const addPropertyToPortfolio = async (propertyId) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_properties')
        .insert({
          user_id: user.id,
          property_id: propertyId
        });
      
      if (error) throw error;
      
      // Refresh properties lists
      setIsLoadingProperties(true);
      setIsLoadingAvailableProperties(true);
      
      // Fetch updated properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (propertiesData) {
        setProperties(prev => [...prev, propertiesData]);
        setAvailableProperties(prev => prev.filter(p => p.id !== propertyId));
      }
      
      toast({
        title: "Property added",
        description: "The property has been added to your portfolio."
      });
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Error adding property",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingProperties(false);
      setIsLoadingAvailableProperties(false);
    }
  };

  const updateFinancialInfo = async (values) => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gross_income: values.grossIncome,
          partner_income: values.extraIncome,
          existing_loans: values.existingLoans
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Financial Info Updated",
        description: "Your financial information has been updated successfully."
      });
      
      setShowFinancialDialog(false);
    } catch (error) {
      console.error('Error updating financial info:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Calculate borrowing capacity for the user based on profile data
  const userBorrowingCapacity = profile ? calculateCapacity({
    grossIncome: profile.gross_income || 0,
    maritalStatus: profile.marital_status || 'single',
    partnerIncome: profile.partner_income || 0,
    dependants: profile.dependants || 0,
    existingLoans: profile.existing_loans || 0
  }) : 0;

  if (isLoading || isLoadingFinancial) {
    return (
      <div className="min-h-screen flex flex-col bg-amber-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-lg text-amber-800">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Navbar />
      <main className="flex-grow section-padding py-8">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="heading-lg text-amber-900">Your Property Portfolio</h1>
            <Button variant="outline" onClick={signOut} className="border-amber-600 text-amber-800 hover:bg-amber-100">Log Out</Button>
          </div>
          
          <Tabs defaultValue="portfolio" className="w-full mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-amber-100">
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                My Portfolio
              </TabsTrigger>
              <TabsTrigger value="explore" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Explore Properties
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white border-amber-200 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-900">Profile</CardTitle>
                    <CardDescription className="text-amber-700">Your account information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-amber-900">{profile.email}</p>
                    <p className="text-sm text-amber-700">Role: {profile.role}</p>
                    {profile.first_name && profile.last_name && (
                      <p className="text-sm mt-2 text-amber-800">{profile.first_name} {profile.last_name}</p>
                    )}
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowFinancialDialog(true)}
                        className="border-amber-400 text-amber-800 hover:bg-amber-100"
                      >
                        Update Financial Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-amber-200 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-900">Portfolio Summary</CardTitle>
                    <CardDescription className="text-amber-700">Overview of your investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-amber-900">${calculateTotalPortfolioValue().toLocaleString()}</p>
                        <p className="text-sm text-amber-700">Total Value</p>
                      </div>
                      <div className="text-green-600 flex items-center">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        <span>+4.2%</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-amber-700">Equity</p>
                        <p className="font-semibold text-amber-900">${calculateTotalEquity().toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-amber-700">Monthly Cashflow</p>
                        <p className="font-semibold text-amber-900">${calculateCashFlow().toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-amber-200 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-900">Borrowing Capacity</CardTitle>
                    <CardDescription className="text-amber-700">Your estimated borrowing power</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-amber-900">${userBorrowingCapacity.toLocaleString()}</p>
                        <p className="text-sm text-amber-700">Estimated Capacity</p>
                      </div>
                      <Wallet className="h-8 w-8 text-amber-400" />
                    </div>
                    <div className="mt-4 text-sm text-amber-700">
                      <p>Based on your current financial details</p>
                      <div className="mt-2">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => navigate('/borrowing-capacity')}
                          className="pl-0 text-amber-600 hover:text-amber-800"
                        >
                          Recalculate →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-white border-amber-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Portfolio Growth</CardTitle>
                    <CardDescription className="text-amber-700">Value changes over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer
                      config={{
                        value: {
                          theme: {
                            light: "#f97316",
                            dark: "#f97316",
                          },
                        },
                      }}
                    >
                      <AreaChart data={financialData.assets.map((value, index) => ({
                        month: financialData.months[index],
                        value
                      }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white border-amber-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Income & Expenses</CardTitle>
                    <CardDescription className="text-amber-700">Monthly breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer
                      config={{
                        Income: {
                          theme: {
                            light: "#84cc16",
                            dark: "#84cc16",
                          },
                        },
                        Expenses: {
                          theme: {
                            light: "#f97316",
                            dark: "#f97316",
                          },
                        },
                      }}
                    >
                      <RechartsBarChart 
                        data={financialData.months.map((month, index) => ({
                          name: month,
                          Income: financialData.income[index],
                          Expenses: financialData.expenses[index]
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="Income" fill="#84cc16" />
                        <Bar dataKey="Expenses" fill="#f97316" />
                      </RechartsBarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-amber-900">Your Properties</h2>
                {isLoadingProperties ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2 text-amber-600" />
                    <span className="text-amber-800">Loading properties...</span>
                  </div>
                ) : properties.length === 0 ? (
                  <Card className="p-6 bg-white border-amber-200">
                    <div className="text-center">
                      <p className="text-amber-700 mb-4">No saved properties yet</p>
                      <Button
                        onClick={() => document.getElementById('explore-tab-trigger')?.click()}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Properties
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <Card key={property.id} className="overflow-hidden bg-white border-amber-200 shadow-md">
                        <div className="h-48 bg-amber-100 relative">
                          {property.image_url ? (
                            <img 
                              src={property.image_url} 
                              alt={property.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-12 w-12 text-amber-400" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-amber-900">{property.name}</CardTitle>
                          <CardDescription className="text-amber-700">{property.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                              <p className="text-sm text-amber-700">Price</p>
                              <p className="font-semibold text-amber-900">${property.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-amber-700">Size</p>
                              <p className="font-semibold text-amber-900">{property.area} m²</p>
                            </div>
                            <div>
                              <p className="text-sm text-amber-700">Growth</p>
                              <p className="font-semibold text-green-600">+{property.growth_rate || 4.2}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-amber-700">Yield</p>
                              <p className="font-semibold text-amber-900">{property.rental_yield || 3.8}%</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                            onClick={() => viewPropertyDetails(property.id)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="explore" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-amber-900">Explore Properties</h2>
                <p className="text-amber-800 mb-6">
                  Discover properties that match your investment criteria. Add them to your portfolio to see how they affect your financial outlook.
                </p>
                
                {isLoadingAvailableProperties ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2 text-amber-600" />
                    <span className="text-amber-800">Loading available properties...</span>
                  </div>
                ) : availableProperties.length === 0 ? (
                  <Card className="p-6 bg-white border-amber-200">
                    <p className="text-center text-amber-700">No more properties available for your portfolio</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableProperties.map((property) => (
                      <Card key={property.id} className="overflow-hidden bg-white border-amber-200 shadow-md">
                        <div className="h-48 bg-amber-100 relative">
                          {property.image_url ? (
                            <img 
                              src={property.image_url} 
                              alt={property.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-12 w-12 text-amber-400" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-amber-900">{property.name}</CardTitle>
                          <CardDescription className="text-amber-700">{property.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                              <p className="text-sm text-amber-700">Price</p>
                              <p className="font-semibold text-amber-900">${property.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-amber-700">Size</p>
                              <p className="font-semibold text-amber-900">{property.area} m²</p>
                            </div>
                            <div>
                              <p className="text-sm text-amber-700">Growth</p>
                              <p className="font-semibold text-green-600">+{property.growth_rate || 4.2}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-amber-700">Yield</p>
                              <p className="font-semibold text-amber-900">{property.rental_yield || 3.8}%</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-white border-amber-600 text-amber-800 hover:bg-amber-100" 
                              variant="outline"
                              onClick={() => viewPropertyDetails(property.id)}
                            >
                              Details
                            </Button>
                            <Button 
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" 
                              onClick={() => addPropertyToPortfolio(property.id)}
                            >
                              Add to Portfolio
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Financial Update Dialog */}
          <Dialog open={showFinancialDialog} onOpenChange={setShowFinancialDialog}>
            <DialogContent className="sm:max-w-md bg-amber-50 border-amber-200">
              <DialogHeader>
                <DialogTitle className="text-amber-900">Update Financial Information</DialogTitle>
              </DialogHeader>
              
              <Form {...financialForm}>
                <form onSubmit={financialForm.handleSubmit(updateFinancialInfo)} className="space-y-4">
                  <FormField
                    control={financialForm.control}
                    name="grossIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-800">Annual Gross Income ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 80000" {...field} className="border-amber-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={financialForm.control}
                    name="extraIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-800">Partner/Additional Income ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 60000" {...field} className="border-amber-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={financialForm.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-800">Monthly Expenses ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 3000" {...field} className="border-amber-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={financialForm.control}
                    name="existingLoans"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-800">Existing Loans ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 400000" {...field} className="border-amber-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
