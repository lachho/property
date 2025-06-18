import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PropertyGrowthRate, PortfolioProperty } from './types';

interface PropertyCardProps {
  property: PortfolioProperty;
  index: number;
  onUpdate: (id: string, field: 'propertyValue' | 'growthRate', value: any) => void;
  onDelete: (id: string) => void;
  acquiredYear: number | null;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  index,
  onUpdate,
  onDelete,
  acquiredYear
}) => {
  const handleUpdate = (field: 'propertyValue' | 'growthRate', value: any) => {
    onUpdate(property.id, field, value);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Property {index + 1}</h3>
          {index > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(property.id)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          )}
        </div>
        
        {acquiredYear !== null && (
          <div className="mb-4 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            Acquired: Year {acquiredYear}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor={`property-${property.id}-value`}>Property Value</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">$</span>
              <Input
                id={`property-${property.id}-value`}
                type="number"
                value={property.propertyValue}
                onChange={(e) => handleUpdate('propertyValue', Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`property-${property.id}-growth`}>Capital Growth Rate</Label>
            <Select
              value={property.growthRate}
              onValueChange={(value) => handleUpdate('growthRate', value as PropertyGrowthRate)}
            >
              <SelectTrigger id={`property-${property.id}-growth`}>
                <SelectValue placeholder="Select growth rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (3% per annum)</SelectItem>
                <SelectItem value="medium">Medium (5% per annum)</SelectItem>
                <SelectItem value="high">High (7% per annum)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard; 