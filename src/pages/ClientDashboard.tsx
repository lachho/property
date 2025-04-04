
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortfolioSummarySection from '@/components/dashboard/PortfolioSummarySection';
import PortfolioOverviewTab from '@/components/dashboard/PortfolioOverviewTab';
import PropertiesTab from '@/components/dashboard/PropertiesTab';
import SavedPropertiesTab from '@/components/dashboard/SavedPropertiesTab';

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
        console.log('Fetching properties for user:', user.id);
        
        // Fetch all properties assigned to the user through saved_properties
        const { data: savedPropertiesData, error: savedPropertiesError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id)
          .eq('purchased', true);
        
        if (savedPropertiesError) {
          throw savedPropertiesError;
        }
        
        console.log('Saved properties data:', savedPropertiesData);
        
        if (savedPropertiesData && savedPropertiesData.length > 0) {
          const propertyIds = savedPropertiesData.map(item => item.property_id);
          
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);
          
          if (propertiesError) {
            throw propertiesError;
          }
          
          console.log('Properties data:', propertiesData);
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
        
        console.log('Saved properties (not purchased):', savedData);
        
        if (savedData && savedData.length > 0) {
          const savedIds = savedData.map(item => item.property_id);
          
          const { data: savedPropsData, error: savedPropsError } = await supabase
            .from('properties')
            .select('*')
            .in('id', savedIds);
          
          if (savedPropsError) {
            throw savedPropsError;
          }
          
          console.log('Saved properties data:', savedPropsData);
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
    } else {
      setIsFetchingProperties(false);
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
          <PortfolioSummarySection 
            totalPortfolioValue={totalPortfolioValue || 0}
            portfolioGrowthPercentage={portfolioGrowthPercentage}
            monthlyCashflow={monthlyCashflow}
            cashflowPercentage={cashflowPercentage}
            totalEquity={totalEquity}
            equityPercentage={equityPercentage}
            propertiesCount={properties.length}
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
              
              <TabsContent value="overview">
                <PortfolioOverviewTab 
                  portfolioValueData={portfolioValueData}
                  propertyAllocationData={propertyAllocationData}
                  cashFlowData={cashFlowData}
                />
              </TabsContent>
              
              <TabsContent value="properties">
                <PropertiesTab properties={properties} />
              </TabsContent>
              
              <TabsContent value="watchlist">
                <SavedPropertiesTab savedProperties={savedProperties} />
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
