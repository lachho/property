
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';

interface SavedPropertiesTabProps {
  savedProperties: {
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

const SavedPropertiesTab: React.FC<SavedPropertiesTabProps> = ({ savedProperties }) => {
  const navigate = useNavigate();
  
  return (
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
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedPropertiesTab;
