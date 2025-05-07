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
  imageUrl: string | null;
  features: string[] | null;
  growthRate: number | null;
  rentalYield: number | null;
  // Future fields (not yet in backend, but planned)
  purchasePrice?: number;
  currentValue?: number;
  deposit?: number;
  userId?: string;
  status?: string;
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
      imageUrl: '',
      features: [],
      growthRate: 0,
      rentalYield: 0,
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
        const { data } = await apiService.getProperty(propertyId);
        setProperty({
          id: data.id?.toString() || '',
          name: data.name || '',
          address: [data.street, data.suburb, data.state, data.postcode].filter(Boolean).join(', '),
          description: data.description || '',
          price: data.price ? Number(data.price) : 0,
          beds: data.beds || 0,
          baths: data.baths || 0,
          area: data.area || 0,
          imageUrl: data.imageUrl || '',
          features: data.features || [],
          growthRate: data.growthRate ? Number(data.growthRate) : 0,
          rentalYield: data.rentalYield ? Number(data.rentalYield) : 0,
          // Future fields (fallbacks for now)
          purchasePrice: (data as any).purchasePrice ?? 0,
          currentValue: (data as any).currentValue ?? 0,
          deposit: (data as any).deposit ?? 0,
          userId: (data as any).userId ? (data as any).userId.toString() : '',
          status: (data as any).status ?? '',
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
      // Only send future fields if present
      const updatePayload: any = {
        ...data,
        id: data.id ? data.id : '',
      };
      if (data.purchasePrice !== undefined) updatePayload.purchasePrice = data.purchasePrice;
      if (data.currentValue !== undefined) updatePayload.currentValue = data.currentValue;
      if (data.deposit !== undefined) updatePayload.deposit = data.deposit;
      if (data.userId !== undefined) updatePayload.userId = data.userId;
      if (data.status !== undefined) updatePayload.status = data.status;
      await apiService.updateProperty(propertyId, updatePayload);
      setIsEditing(false);
      // Refresh property data
      const { data: updatedData } = await apiService.getProperty(propertyId);
      setProperty({
        id: updatedData.id?.toString() || '',
        name: updatedData.name || '',
        address: [updatedData.street, updatedData.suburb, updatedData.state, updatedData.postcode].filter(Boolean).join(', '),
        description: updatedData.description || '',
        price: updatedData.price ? Number(updatedData.price) : 0,
        beds: updatedData.beds || 0,
        baths: updatedData.baths || 0,
        area: updatedData.area || 0,
        imageUrl: updatedData.imageUrl || '',
        features: updatedData.features || [],
        growthRate: updatedData.growthRate ? Number(updatedData.growthRate) : 0,
        rentalYield: updatedData.rentalYield ? Number(updatedData.rentalYield) : 0,
        // Future fields (fallbacks for now)
        purchasePrice: (updatedData as any).purchasePrice ?? 0,
        currentValue: (updatedData as any).currentValue ?? 0,
        deposit: (updatedData as any).deposit ?? 0,
        userId: (updatedData as any).userId ? (updatedData as any).userId.toString() : '',
        status: (updatedData as any).status ?? '',
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
                        name="growthRate"
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
                        name="rentalYield"
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
                        name="imageUrl"
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
                  {property.imageUrl && (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={property.imageUrl} 
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
                      <p>{property.growthRate !== null ? `${property.growthRate}%` : 'Not available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Rental Yield</h4>
                      <p>{property.rentalYield !== null ? `${property.rentalYield}%` : 'Not available'}</p>
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
