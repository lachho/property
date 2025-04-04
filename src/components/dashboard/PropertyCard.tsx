
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: {
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
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  return (
    <Card 
      key={property.id} 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <div className="aspect-video bg-gray-100 relative">
        {property.image_url ? (
          <img 
            src={property.image_url} 
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
        {(property.rental_yield || property.growth_rate) && (
          <div className="flex justify-between mt-3 text-sm">
            {property.rental_yield && (
              <span className="text-blue-600">
                {property.rental_yield}% yield
              </span>
            )}
            {property.growth_rate && (
              <span className="text-green-600">
                {property.growth_rate}% growth p.a.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
