
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    const fetchPropertyData = async () => {
      if (!user || !propertyId) return;
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();
        
        if (error) {
          console.error('Error fetching property:', error);
          toast({
            title: "Error",
            description: "Failed to load property details",
            variant: "destructive"
          });
          navigate('/admin-dashboard');
        } else if (data) {
          setProperty(data as Property);
          form.reset({
            id: data.id,
            name: data.name,
            address: data.address,
            description: data.description,
            price: data.price,
            beds: data.beds,
            baths: data.baths,
            area: data.area,
            image_url: data.image_url,
            features: data.features,
            growth_rate: data.growth_rate,
            rental_yield: data.rental_yield,
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching property:', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (user && profile?.role === 'admin') {
      fetchPropertyData();
    }
  }, [user, profile, propertyId, navigate, form]);

  const handleSave = async (data: Property) => {
    if (!user || !propertyId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          name: data.name,
          address: data.address,
          description: data.description,
          price: data.price,
          beds: data.beds,
          baths: data.baths,
          area: data.area,
          image_url: data.image_url,
          features: data.features,
          growth_rate: data.growth_rate,
          rental_yield: data.rental_yield,
        })
        .eq('id', propertyId);
      
      if (error) {
        console.error('Error updating property:', error);
        toast({
          title: "Error",
          description: "Failed to update property details",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Property details updated successfully",
        });
        setIsEditing(false);
        // Refresh property data
        const { data: updatedData } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();
        
        if (updatedData) {
          setProperty(updatedData as Property);
        }
      }
    } catch (error) {
      console.error('Unexpected error updating property:', error);
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

  if (!user || !profile || profile.role !== 'admin' || !property) {
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
