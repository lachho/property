
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';

interface PropertiesTabProps {
  properties: {
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
  }[];
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ properties }) => {
  const navigate = useNavigate();
  
  return (
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
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertiesTab;
