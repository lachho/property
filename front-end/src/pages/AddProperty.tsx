import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, UploadCloud } from 'lucide-react';
import { useForm } from 'react-hook-form';
import apiService from '@/services/api';

interface PropertyFormData {
  name: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  description: string;
  growth_rate: number;
  rental_yield: number;
  image_url?: string;
  features?: string[];
}

const AddProperty = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: {
      growth_rate: 3.5,
      rental_yield: 4.2
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    // Image upload logic is not supported with the current backend API
    // You can implement image upload to your backend in the future if needed
    return null;
  };

  const handleAddProperty = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      await apiService.createProperty({
        name: data.name,
        address: data.address,
        description: data.description,
        purchasePrice: data.price,
        currentValue: data.price,
        deposit: 0,
        userId: undefined,
        status: '',
      });
      toast({
        title: "Success",
        description: "Property added successfully!",
      });
      navigate('/admin-dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect non-admin users
  React.useEffect(() => {
    if (!isLoading && (!user || (profile && profile.role !== 'ADMIN'))) {
      navigate('/auth');
    }
  }, [isLoading, user, profile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-theme-warm" />
            <p className="text-lg">Loading...</p>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="heading-lg">Add Property</h1>
            <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
          </div>
          
          <Card className="p-6">
            <form onSubmit={handleSubmit(handleAddProperty)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Property Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter property name" 
                    {...register('name', { required: "Property name is required" })}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    placeholder="Enter full address" 
                    {...register('address', { required: "Address is required" })}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="500000" 
                    {...register('price', { 
                      required: "Price is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Price must be positive" }
                    })}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="beds">Bedrooms</Label>
                    <Input 
                      id="beds" 
                      type="number" 
                      placeholder="3" 
                      {...register('beds', { 
                        required: "Required", 
                        valueAsNumber: true,
                        min: { value: 0, message: "Min 0" }
                      })}
                    />
                    {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="baths">Bathrooms</Label>
                    <Input 
                      id="baths" 
                      type="number" 
                      placeholder="2" 
                      {...register('baths', { 
                        required: "Required", 
                        valueAsNumber: true,
                        min: { value: 0, message: "Min 0" }
                      })}
                    />
                    {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="area">Area (m²)</Label>
                    <Input 
                      id="area" 
                      type="number" 
                      placeholder="120" 
                      {...register('area', { 
                        required: "Required", 
                        valueAsNumber: true,
                        min: { value: 1, message: "Min 1" }
                      })}
                    />
                    {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="growth_rate">Growth Rate (% per year)</Label>
                  <Input 
                    id="growth_rate" 
                    type="number" 
                    step="0.1" 
                    placeholder="3.5" 
                    {...register('growth_rate', { 
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be positive" }
                    })}
                  />
                  {errors.growth_rate && <p className="text-red-500 text-sm mt-1">{errors.growth_rate.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="rental_yield">Rental Yield (%)</Label>
                  <Input 
                    id="rental_yield" 
                    type="number" 
                    step="0.1" 
                    placeholder="4.2" 
                    {...register('rental_yield', { 
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be positive" }
                    })}
                  />
                  {errors.rental_yield && <p className="text-red-500 text-sm mt-1">{errors.rental_yield.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter property description" 
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <Label>Property Image</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-theme-warm hover:bg-theme-warm/5 transition-colors">
                    <input
                      type="file"
                      id="property-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="property-image" className="cursor-pointer block">
                      {previewUrl ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={previewUrl} 
                            alt="Property preview" 
                            className="mt-2 max-h-48 object-contain"
                          />
                          <span className="mt-2 text-sm text-gray-500">Click to change image</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                          <p className="text-xs text-gray-400">(JPG, PNG, WebP, maximum 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-theme-warm hover:bg-theme-warm/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Property...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;
