
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Home, PieChart, BarChart, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';

// Sample data for charts
const portfolioGrowthData = [
  { month: 'Jan', value: 1000000 },
  { month: 'Feb', value: 1050000 },
  { month: 'Mar', value: 1080000 },
  { month: 'Apr', value: 1150000 },
  { month: 'May', value: 1200000 },
  { month: 'Jun', value: 1250000 },
];

const repaymentData = [
  { month: 'Jul', amount: 3200 },
  { month: 'Aug', amount: 3200 },
  { month: 'Sep', amount: 3200 },
  { month: 'Oct', amount: 3200 },
  { month: 'Nov', amount: 3200 },
  { month: 'Dec', amount: 3200 },
];

const investmentDistribution = [
  { name: 'Residential', value: 60 },
  { name: 'Commercial', value: 25 },
  { name: 'Land', value: 15 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const ClientDashboard = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
            <p className="text-lg">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect in useEffect
  }

  const viewPropertyDetails = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow section-padding py-8">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="heading-lg">Client Dashboard</h1>
            <Button variant="outline" onClick={signOut}>Log Out</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{profile.email}</p>
                <p className="text-sm text-gray-500">Role: {profile.role}</p>
                {profile.first_name && profile.last_name && (
                  <p className="text-sm mt-2">{profile.first_name} {profile.last_name}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Portfolio Summary</CardTitle>
                <CardDescription>Overview of your investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">$1,250,000</p>
                    <p className="text-sm text-gray-500">Total Value</p>
                  </div>
                  <div className="text-green-500 flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    <span>+4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Payment</CardTitle>
                <CardDescription>Upcoming repayment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">$3,200</p>
                    <p className="text-sm text-gray-500">Due: July 15, 2025</p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Growth</CardTitle>
                <CardDescription>Value changes over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      theme: {
                        light: "#8884d8",
                        dark: "#8884d8",
                      },
                    },
                  }}
                >
                  <AreaChart data={portfolioGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>Property type allocation</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  config={{
                    pie: {
                      theme: {
                        light: "#8884d8",
                        dark: "#8884d8",
                      },
                    },
                  }}
                >
                  <PieChart>
                    <Pie
                      data={investmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {investmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Repayments</CardTitle>
              <CardDescription>Next 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  amount: {
                    theme: {
                      light: "#82ca9d",
                      dark: "#82ca9d",
                    },
                  },
                }}
              >
                <BarChart data={repaymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Your Properties</h2>
            {isLoadingProperties ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading properties...</span>
              </div>
            ) : properties.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-gray-500">No saved properties yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="h-48 bg-gray-200 relative">
                      {property.image_url ? (
                        <img 
                          src={property.image_url} 
                          alt={property.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Home className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <CardDescription>{property.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold">${property.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Size</p>
                          <p className="font-semibold">{property.area} m²</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Beds</p>
                          <p className="font-semibold">{property.beds}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Baths</p>
                          <p className="font-semibold">{property.baths}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
