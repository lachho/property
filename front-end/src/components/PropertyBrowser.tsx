
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Home, Filter, ChevronDown, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const PropertyBrowser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [bedrooms, setBedrooms] = useState<string>('any');
  const [propertyType, setPropertyType] = useState<string>('any');
  const [sortBy, setSortBy] = useState<string>('price_asc');

  // Fetch properties from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('properties').select('*');
        
        // Apply filters if they exist
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
        }
        
        if (priceRange[0] > 0 || priceRange[1] < 2000000) {
          query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
        }
        
        if (bedrooms && bedrooms !== 'any') {
          query = query.eq('beds', parseInt(bedrooms));
        }
        
        // Apply sorting
        if (sortBy === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'yield') {
          query = query.order('rental_yield', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load properties.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [searchQuery, priceRange, bedrooms, propertyType, sortBy, toast]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle adding a property to portfolio
  const handleAddToPortfolio = async (propertyId: string) => {
    try {
      toast({
        title: "Success",
        description: "Property added to your portfolio.",
      });
      
      // In a real implementation, this would add the property to the user's saved_properties
      // await supabase.from('saved_properties').insert({ user_id: user.id, property_id: propertyId });
      
      // Navigate to property details
      navigate(`/property/${propertyId}`);
    } catch (error) {
      console.error("Error adding property to portfolio:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add property to portfolio.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-2/3 justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Price Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Price Range</h4>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setPriceRange([0, 2000000])}>Reset</Button>
                  <Button>Apply</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+ Bedrooms</SelectItem>
              <SelectItem value="2">2+ Bedrooms</SelectItem>
              <SelectItem value="3">3+ Bedrooms</SelectItem>
              <SelectItem value="4">4+ Bedrooms</SelectItem>
              <SelectItem value="5">5+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="yield">Highest Yield</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                {property.image_url ? (
                  <img 
                    src={property.image_url} 
                    alt={property.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardHeader className="py-4">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <span className="font-bold text-primary">{formatCurrency(property.price)}</span>
                </div>
                <CardDescription>{property.address}</CardDescription>
              </CardHeader>
              <CardContent className="py-0">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div>{property.beds} Beds</div>
                  <div>{property.baths} Baths</div>
                  <div>{property.area} m²</div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.rental_yield && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {property.rental_yield}% Yield
                    </Badge>
                  )}
                  {property.growth_rate && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {property.growth_rate}% Growth
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleAddToPortfolio(property.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Portfolio
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Home className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search filters to find more properties</p>
          <Button onClick={() => {
            setSearchQuery('');
            setPriceRange([0, 2000000]);
            setBedrooms('any');
            setPropertyType('any');
          }}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyBrowser;
