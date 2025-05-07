import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, FileCog, FileEdit, LineChart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PortfolioValueChart from '@/components/charts/PortfolioValueChart';
import PropertyAllocationChart from '@/components/charts/PropertyAllocationChart';
import CashFlowChart from '@/components/charts/CashFlowChart';
import apiService from '@/services/api';
import ClientDetailsForm from '@/components/ClientDetailsForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import SummarySection from '@/components/SummarySection';
import InvestmentAllocation from '@/components/dashboard/InvestmentAllocation';
import MortgageDetails from '@/components/dashboard/MortgageDetails';
import TaxAnalysis from '@/components/dashboard/TaxAnalysis';
import LiabilitiesBreakdown from '@/components/dashboard/LiabilitiesBreakdown';
import Retirement from '@/components/dashboard/Retirement';

type Property = {
  id: string;
  name: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  imageUrl: string | null;
  rentalYield: number | null;
  growthRate: number | null;
  features: string[] | null;
};

const ClientDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [isFetchingProperties, setIsFetchingProperties] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>(null);

  // Chart data (still dummy for now)
  const portfolioValueData = [];
  const propertyAllocationData = [];
  const cashFlowData = [];

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  // Move fetchPortfolio out of useEffect so it can be reused
  const fetchPortfolio = async () => {
    if (!user) return;
    setIsFetchingProperties(true);
    try {
      // Fetch portfolio summary and properties
      const { data: portfolio } = await apiService.getPortfolio(user.id);
      setPortfolioSummary(portfolio);
      // Properties owned by user
      setProperties(
        (portfolio.properties || []).map((property: any) => ({
          id: property.id?.toString() || '',
          name: property.name || '',
          address: [property.street, property.suburb, property.state, property.postcode].filter(Boolean).join(', '),
          price: property.price ? Number(property.price) : 0,
          beds: property.beds || 0,
          baths: property.baths || 0,
          area: property.area || 0,
          imageUrl: property.imageUrl || '',
          rentalYield: property.rentalYield ? Number(property.rentalYield) : 0,
          growthRate: property.growthRate ? Number(property.growthRate) : 0,
          features: property.features || [],
        }))
      );
      // Optionally, fetch saved properties as before
      const { data: savedData } = await apiService.getSavedProperties(user.id, false);
      if (savedData && savedData.length > 0) {
        const savedIds = savedData.map((item: any) => item.property_id);
        const { data: savedPropsData } = await apiService.getPropertiesByIds(savedIds);
        setSavedProperties(savedPropsData.map((property: any) => ({
          id: property.id?.toString() || '',
          name: property.name || '',
          address: [property.street, property.suburb, property.state, property.postcode].filter(Boolean).join(', '),
          price: property.price ? Number(property.price) : 0,
          beds: property.beds || 0,
          baths: property.baths || 0,
          area: property.area || 0,
          imageUrl: property.imageUrl || '',
          rentalYield: property.rentalYield ? Number(property.rentalYield) : 0,
          growthRate: property.growthRate ? Number(property.growthRate) : 0,
          features: property.features || [],
        })));
      } else {
        setSavedProperties([]);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive"
      });
    } finally {
      setIsFetchingProperties(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch full profile details for summary section
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!user) return;
      try {
        const { data } = await apiService.getProfileDetails(user.id);
        setProfileDetails(data);
      } catch (error) {
        console.error('Error fetching profile details:', error);
      }
    };
    if (user) {
      fetchProfileDetails();
    }
  }, [user]);

  // Add a handler to refresh portfolio after editing
  const handleEditSaved = () => {
    setShowEditForm(false);
    // Optionally, refresh portfolio data
    if (user) {
      // Re-fetch portfolio
      fetchPortfolio();
    }
  };

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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Portfolio Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {profile?.firstName || 'Investor'}! Here's an overview of your property investments.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/modeling')}>
                <LineChart className="w-4 h-4 mr-2" />
                Modeling Dashboard
              </Button>
              <Button variant="outline" onClick={() => setShowEditForm(true)}>
                Edit Details
              </Button>
            </div>
          </div>

          {/* Summary Section */}
          <SummarySection 
            assets={profileDetails?.assets ?? []}
            liabilities={profileDetails?.liabilities ?? []}
            profile={profileDetails?.profile ?? {}}
            portfolioSummary={portfolioSummary}
          />

          {/* Edit Details Modal */}
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Your Details</DialogTitle>
              </DialogHeader>
              <ClientDetailsForm clientId={user?.id} onSaved={handleEditSaved} />
              <DialogClose asChild>
                <Button variant="outline" className="mt-4 w-full">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        
          {/* Portfolio Charts and Property Management */}
          <div className="mt-8">
            <Tabs defaultValue="overview">
              <div className="mb-6">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
                  <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
                  <TabsTrigger value="mortgage">Mortgage Details</TabsTrigger>
                  <TabsTrigger value="tax">Tax Analysis</TabsTrigger>
                  <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
                  <TabsTrigger value="retirement">Retirement</TabsTrigger>
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
              
              <TabsContent value="investment" className="space-y-6">
                <InvestmentAllocation assets={profileDetails?.assets ?? []} />
              </TabsContent>

              <TabsContent value="mortgage" className="space-y-6">
                <MortgageDetails 
                  primaryMortgage={profileDetails?.liabilities?.find(l => l.isPrimaryResidence)} 
                  dateOfBirth={profileDetails?.profile?.dateOfBirth} 
                />
              </TabsContent>

              <TabsContent value="tax" className="space-y-6">
                <TaxAnalysis 
                  assets={profileDetails?.assets ?? []}
                  liabilities={profileDetails?.liabilities ?? []}
                  profile={profileDetails?.profile ?? {}}
                />
              </TabsContent>

              <TabsContent value="liabilities" className="space-y-6">
                <LiabilitiesBreakdown liabilities={profileDetails?.liabilities ?? []} />
              </TabsContent>

              <TabsContent value="retirement" className="space-y-6">
                <Retirement 
                  profile={profileDetails?.profile ?? {}}
                  assets={profileDetails?.assets ?? []}
                  liabilities={profileDetails?.liabilities ?? []}
                />
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
                              {property.imageUrl ? (
                                <img 
                                  src={property.imageUrl} 
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
                              {(property.rentalYield || property.growthRate) && (
                                <div className="flex justify-between mt-3 text-sm">
                                  {property.rentalYield && (
                                    <span className="text-blue-600">
                                      {property.rentalYield}% yield
                                    </span>
                                  )}
                                  {property.growthRate && (
                                    <span className="text-green-600">
                                      {property.growthRate}% growth p.a.
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
                              {property.imageUrl ? (
                                <img 
                                  src={property.imageUrl} 
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
                              {(property.rentalYield || property.growthRate) && (
                                <div className="flex justify-between mt-3 text-sm">
                                  {property.rentalYield && (
                                    <span className="text-blue-600">
                                      {property.rentalYield}% yield
                                    </span>
                                  )}
                                  {property.growthRate && (
                                    <span className="text-green-600">
                                      {property.growthRate}% growth p.a.
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
