
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioSummary from '@/components/PortfolioSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, FileCog, FileEdit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PortfolioValueChart from '@/components/charts/PortfolioValueChart';
import PropertyAllocationChart from '@/components/charts/PropertyAllocationChart';
import CashFlowChart from '@/components/charts/CashFlowChart';

type Property = {
  id: string;
  name: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  image_url: string | null;
  rental_yield: number | null;
  growth_rate: number | null;
};

const generatePortfolioValueData = () => {
  const data = [];
  const now = new Date();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now);
    month.setMonth(now.getMonth() - i);
    const monthName = monthNames[month.getMonth()];
    const year = month.getFullYear().toString().substr(-2);
    
    // Start with a base value, then add random growth
    const baseValue = 1500000;
    // Each month adds 0.5-1.5% growth
    const growthFactor = 1 + (0.005 + Math.random() * 0.01) * (12 - i);
    
    data.push({
      month: `${monthName} '${year}`,
      value: Math.round(baseValue * growthFactor)
    });
  }
  
  return data;
};

const generatePropertyAllocationData = () => {
  return [
    { name: 'Residential', value: 1200000, color: '#8884d8' },
    { name: 'Commercial', value: 800000, color: '#82ca9d' },
    { name: 'Industrial', value: 600000, color: '#ffc658' },
  ];
};

const generateCashFlowData = () => {
  const data = [];
  const now = new Date();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now);
    month.setMonth(now.getMonth() - i);
    const monthName = monthNames[month.getMonth()];
    const year = month.getFullYear().toString().substr(-2);
    
    // Random income between 15000-25000
    const income = 15000 + Math.random() * 10000;
    // Random expenses between 10000-18000
    const expenses = 10000 + Math.random() * 8000;
    
    data.push({
      month: `${monthName} '${year}`,
      income: Math.round(income),
      expenses: Math.round(expenses)
    });
  }
  
  return data;
};

const ClientDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [isFetchingProperties, setIsFetchingProperties] = useState(true);
  
  // Chart data
  const portfolioValueData = generatePortfolioValueData();
  const propertyAllocationData = generatePropertyAllocationData();
  const cashFlowData = generateCashFlowData();

  // Calculate total portfolio value
  const totalPortfolioValue = properties.reduce((total, property) => total + property.price, 0);
  
  // Calculate growth - using a placeholder growth percentage
  const portfolioGrowthPercentage = 12.5;
  
  // Calculate cashflow - simplified placeholder
  const monthlyCashflow = 5200;
  const cashflowPercentage = 3.8;
  
  // Calculate equity - simplified placeholder
  const totalEquity = totalPortfolioValue * 0.35;
  const equityPercentage = 7.2;

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      try {
        // Fetch all properties assigned to the user through saved_properties
        const { data: savedPropertiesData, error: savedPropertiesError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id);
        
        if (savedPropertiesError) {
          throw savedPropertiesError;
        }
        
        if (savedPropertiesData && savedPropertiesData.length > 0) {
          const propertyIds = savedPropertiesData.map(item => item.property_id);
          
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);
          
          if (propertiesError) {
            throw propertiesError;
          }
          
          setProperties(propertiesData || []);
        } else {
          setProperties([]);
        }
        
        // Fetch saved properties (not yet purchased)
        const { data: savedData, error: savedError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id)
          .is('purchased', false);
          
        if (savedError) {
          throw savedError;
        }
        
        if (savedData && savedData.length > 0) {
          const savedIds = savedData.map(item => item.property_id);
          
          const { data: savedPropsData, error: savedPropsError } = await supabase
            .from('properties')
            .select('*')
            .in('id', savedIds);
          
          if (savedPropsError) {
            throw savedPropsError;
          }
          
          setSavedProperties(savedPropsData || []);
        } else {
          setSavedProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive"
        });
      } finally {
        setIsFetchingProperties(false);
      }
    };

    if (user) {
      fetchProperties();
    }
  }, [user]);

  if (isLoading || isFetchingProperties) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Loading portfolio data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Your Portfolio Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.first_name || 'Investor'}! Here's an overview of your property investments.
            </p>
          </div>
          
          {/* Portfolio Summary Cards */}
          <PortfolioSummary 
            totalValue={totalPortfolioValue || 0}
            growthPercentage={portfolioGrowthPercentage}
            cashflow={monthlyCashflow}
            cashflowPercentage={cashflowPercentage}
            equity={totalEquity}
            equityPercentage={equityPercentage}
            propertyCount={properties.length}
          />
          
          {/* Portfolio Charts and Property Management */}
          <div className="mt-8">
            <Tabs defaultValue="overview">
              <div className="mb-6">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
                  <TabsTrigger value="properties">Your Properties</TabsTrigger>
                  <TabsTrigger value="watchlist">Saved Properties</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PortfolioValueChart data={portfolioValueData} />
                  <PropertyAllocationChart data={propertyAllocationData} />
                </div>
                
                <CashFlowChart data={cashFlowData} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Management</CardTitle>
                    <CardDescription>
                      Update your financial information to get more accurate portfolio projections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline" className="flex items-center gap-2">
                        <FileEdit className="h-4 w-4" />
                        Update Income Details
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <FileCog className="h-4 w-4" />
                        Manage Loan Information
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add External Asset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="properties">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Property Portfolio</CardTitle>
                    <CardDescription>
                      Properties you currently own or have invested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {properties.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You haven't added any properties to your portfolio yet.</p>
                        <Button onClick={() => navigate('/portfolio-manager')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Find Properties
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {properties.map(property => (
                          <Card key={property.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/property/${property.id}`)}>
                            <div className="aspect-video bg-gray-100 relative">
                              {property.image_url ? (
                                <img 
                                  src={property.image_url} 
                                  alt={property.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <CardContent className="pt-4">
                              <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
                              <p className="text-gray-500 text-sm mb-2">{property.address}</p>
                              <p className="font-bold text-lg">${property.price.toLocaleString()}</p>
                              <div className="flex justify-between mt-2 text-sm text-gray-600">
                                <span>{property.beds} beds</span>
                                <span>{property.baths} baths</span>
                                <span>{property.area} m²</span>
                              </div>
                              {(property.rental_yield || property.growth_rate) && (
                                <div className="flex justify-between mt-3 text-sm">
                                  {property.rental_yield && (
                                    <span className="text-blue-600">
                                      {property.rental_yield}% yield
                                    </span>
                                  )}
                                  {property.growth_rate && (
                                    <span className="text-green-600">
                                      {property.growth_rate}% growth p.a.
                                    </span>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="watchlist">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Properties</CardTitle>
                    <CardDescription>
                      Properties you're interested in but haven't added to your portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedProperties.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You haven't saved any properties yet.</p>
                        <Button onClick={() => navigate('/portfolio-manager')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Browse Properties
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedProperties.map(property => (
                          <Card key={property.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/property/${property.id}`)}>
                            <div className="aspect-video bg-gray-100 relative">
                              {property.image_url ? (
                                <img 
                                  src={property.image_url} 
                                  alt={property.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <CardContent className="pt-4">
                              <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
                              <p className="text-gray-500 text-sm mb-2">{property.address}</p>
                              <p className="font-bold text-lg">${property.price.toLocaleString()}</p>
                              <div className="flex justify-between mt-2 text-sm text-gray-600">
                                <span>{property.beds} beds</span>
                                <span>{property.baths} baths</span>
                                <span>{property.area} m²</span>
                              </div>
                              {(property.rental_yield || property.growth_rate) && (
                                <div className="flex justify-between mt-3 text-sm">
                                  {property.rental_yield && (
                                    <span className="text-blue-600">
                                      {property.rental_yield}% yield
                                    </span>
                                  )}
                                  {property.growth_rate && (
                                    <span className="text-green-600">
                                      {property.growth_rate}% growth p.a.
                                    </span>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
