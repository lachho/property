import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Home, ArrowLeft, Heart, TrendingUp, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import apiService from '@/services/api';

// Sample growth data for charts
const propertyGrowthData = [
  { year: '2020', value: 850000 },
  { year: '2021', value: 900000 },
  { year: '2022', value: 975000 },
  { year: '2023', value: 1050000 },
  { year: '2024', value: 1100000 },
  { year: '2025', value: 1200000, projected: true },
  { year: '2026', value: 1300000, projected: true },
  { year: '2027', value: 1425000, projected: true },
];

const rentalYieldData = [
  { year: '2020', value: 4.2 },
  { year: '2021', value: 4.3 },
  { year: '2022', value: 4.5 },
  { year: '2023', value: 4.6 },
  { year: '2024', value: 4.7 },
  { year: '2025', value: 4.9, projected: true },
  { year: '2026', value: 5.0, projected: true },
  { year: '2027', value: 5.2, projected: true },
];

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [isPropertyLoading, setIsPropertyLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId || !user) return;
      
      try {
        // Fetch property details (use string ID for UUID)
        const { data: propertyData } = await apiService.getProperty(propertyId);
        
        if (!propertyData) {
          toast({
            title: "Property not found",
            description: "The property you are looking for does not exist.",
            variant: "destructive"
          });
          navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/client-dashboard');
          return;
        }
        
        setProperty(propertyData);
        
        // Check if property is saved by user (only for clients)
        if (user.role !== 'ADMIN') {
          const { data: savedData } = await apiService.isPropertySaved(user.id, propertyId);
          setIsSaved(!!savedData);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        toast({
          title: "Error fetching property details",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsPropertyLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, user, toast, navigate]);

  const toggleSaveProperty = async () => {
    if (!user || !propertyId || isSaving) return;
    
    setIsSaving(true);
    
    try {
      if (isSaved) {
        // Remove from saved properties
        await apiService.removeSavedProperty(user.id, propertyId);
        setIsSaved(false);
        toast({
          title: "Property removed",
          description: "Property has been removed from your saved list."
        });
      } else {
        // Add to saved properties
        await apiService.addSavedProperty(user.id, propertyId);
        setIsSaved(true);
        toast({
          title: "Property saved",
          description: "Property has been added to your saved list."
        });
      }
    } catch (error) {
      console.error('Error toggling property save status:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow section-padding">
          <div className="container-custom">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Property Not Found</h2>
              <p className="text-gray-500 mb-6">The property you are looking for does not exist or has been removed.</p>
              <Button onClick={() => navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/client-dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow section-padding py-8">
        <div className="container-custom">
          <div className="mb-8">
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/client-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="heading-lg">{property.name}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}</span>
                </div>
              </div>
              <Button 
                variant={isSaved ? "default" : "outline"}
                onClick={toggleSaveProperty}
                disabled={isSaving}
              >
                <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-white' : ''}`} />
                {isSaved ? 'Saved' : 'Save Property'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="h-80 bg-gray-200 relative">
                  {property.imageUrl ? (
                    <img 
                      src={property.imageUrl} 
                      alt={property.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold">${property.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-semibold">{property.beds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-semibold">{property.baths}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-semibold">{property.area} m²</p>
                    </div>
                    {property.growthRate && (
                      <div>
                        <p className="text-sm text-gray-500">Growth Rate</p>
                        <p className="font-semibold text-green-600">{property.growthRate}%</p>
                      </div>
                    )}
                    {property.rentalYield && (
                      <div>
                        <p className="text-sm text-gray-500">Rental Yield</p>
                        <p className="font-semibold">{property.rentalYield}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {property.description && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.features && property.features.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {property.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Property Value Projection</CardTitle>
                <CardDescription>Historical and projected growth</CardDescription>
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
                  <LineChart data={propertyGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rental Yield Trends</CardTitle>
                <CardDescription>Historical and projected yield</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      theme: {
                        light: "#82ca9d",
                        dark: "#82ca9d",
                      },
                    },
                  }}
                >
                  <AreaChart data={rentalYieldData}>
                    <defs>
                      <linearGradient id="colorRental" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#82ca9d" 
                      fillOpacity={1} 
                      fill="url(#colorRental)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Purchase Price</TableCell>
                    <TableCell>${property.price.toLocaleString()}</TableCell>
                    <TableCell>Current market value</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Monthly Repayment</TableCell>
                    <TableCell>${Math.round(property.price * 0.004).toLocaleString()}</TableCell>
                    <TableCell>Based on 3.5% interest rate, 30-year term</TableCell>
                  </TableRow>
                  {property.rentalYield && (
                    <TableRow>
                      <TableCell className="font-medium">Annual Rental Income</TableCell>
                      <TableCell>${Math.round(property.price * (property.rentalYield / 100)).toLocaleString()}</TableCell>
                      <TableCell>Based on {property.rentalYield}% rental yield</TableCell>
                    </TableRow>
                  )}
                  {property.growthRate && (
                    <TableRow>
                      <TableCell className="font-medium">5-Year Projected Value</TableCell>
                      <TableCell>
                        ${Math.round(property.price * Math.pow(1 + (property.growthRate / 100), 5)).toLocaleString()}
                      </TableCell>
                      <TableCell>Based on {property.growthRate}% annual growth</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetails;
