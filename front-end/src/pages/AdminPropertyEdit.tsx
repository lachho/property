import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Edit, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';

type Property = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  price: number;
  beds: number;
  baths: number;
  area: number;
  image_url: string | null;
  features: string[] | null;
  growth_rate: number | null;
  rental_yield: number | null;
  purchasePrice: number;
  currentValue: number;
  deposit: number;
  userId: string;
  status: string;
};

const AdminPropertyEdit = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<Property>({
    defaultValues: {
      name: '',
      address: '',
      description: '',
      price: 0,
      beds: 0,
      baths: 0,
      area: 0,
      image_url: '',
      features: [],
      growth_rate: 0,
      rental_yield: 0,
      purchasePrice: 0,
      currentValue: 0,
      deposit: 0,
      userId: '',
      status: '',
    }
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && profile && profile.role !== 'ADMIN') {
      navigate('/portfolio-manager');
    }
  }, [isLoading, user, profile, navigate]);

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!user) return;
      try {
        const { data } = await apiService.getProperty(Number(propertyId));
        setProperty({
          id: data.id?.toString() || '',
          name: data.name || '',
          address: data.address || '',
          description: data.description || '',
          price: data.currentValue || 0,
          beds: (data as any).beds || 0,
          baths: (data as any).baths || 0,
          area: (data as any).area || 0,
          image_url: (data as any).image_url || '',
          features: (data as any).features || [],
          growth_rate: (data as any).growth_rate || 0,
          rental_yield: (data as any).rental_yield || 0,
          purchasePrice: data.purchasePrice || 0,
          currentValue: data.currentValue || 0,
          deposit: data.deposit || 0,
          userId: data.userId?.toString() || '',
          status: data.status || '',
        });
      } catch (error) {
        console.error('Unexpected error fetching property:', error);
        toast({
          title: "Error",
          description: "Failed to load property",
          variant: "destructive"
        });
      } finally {
        setIsFetching(false);
      }
    };
    if (user && profile?.role === 'ADMIN') {
      fetchPropertyData();
    }
  }, [user, profile, propertyId]);

  const handleSave = async (data: Property) => {
    setIsSaving(true);
    try {
      await apiService.updateProperty(Number(propertyId), {
        ...data,
        id: data.id ? Number(data.id) : 0,
        userId: data.userId ? Number(data.userId) : undefined,
      });
      setIsEditing(false);
      // Refresh property data
      const { data: updatedData } = await apiService.getProperty(Number(propertyId));
      setProperty({
        id: updatedData.id?.toString() || '',
        name: updatedData.name || '',
        address: updatedData.address || '',
        description: updatedData.description || '',
        price: updatedData.currentValue || 0,
        beds: (updatedData as any).beds || 0,
        baths: (updatedData as any).baths || 0,
        area: (updatedData as any).area || 0,
        image_url: (updatedData as any).image_url || '',
        features: (updatedData as any).features || [],
        growth_rate: (updatedData as any).growth_rate || 0,
        rental_yield: (updatedData as any).rental_yield || 0,
        purchasePrice: updatedData.purchasePrice || 0,
        currentValue: updatedData.currentValue || 0,
        deposit: updatedData.deposit || 0,
        userId: updatedData.userId?.toString() || '',
        status: updatedData.status || '',
      });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive"
      });
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
            <p className="text-lg">Loading property details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'ADMIN' || !property) {
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
              <h1 className="heading-lg">Property Details</h1>
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
                Edit Property
              </Button>
            )}
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>
                View and manage property details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="beds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bedrooms</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="baths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bathrooms</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area (m²)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="growth_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Growth Rate (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value === null ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rental_yield"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rental Yield (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                value={field.value === null ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={4}
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {property.image_url && (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={property.image_url} 
                        alt={property.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold">{property.name}</h3>
                      <p className="text-gray-500">{property.address}</p>
                    </div>
                    
                    <div>
                      <p className="text-2xl font-bold">${property.price.toLocaleString()}</p>
                      <div className="flex gap-4 text-gray-500">
                        <span>{property.beds} beds</span>
                        <span>{property.baths} baths</span>
                        <span>{property.area} m²</span>
                      </div>
                    </div>
                    
                    {property.description && (
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-gray-700">{property.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">Growth Rate</h4>
                      <p>{property.growth_rate !== null ? `${property.growth_rate}%` : 'Not available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Rental Yield</h4>
                      <p>{property.rental_yield !== null ? `${property.rental_yield}%` : 'Not available'}</p>
                    </div>
                    
                    {property.features && property.features.length > 0 && (
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Features</h4>
                        <ul className="list-disc list-inside">
                          {property.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPropertyEdit;
