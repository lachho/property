
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Plus } from 'lucide-react';

type Property = {
  id: string;
  name: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
};

interface PropertiesTableProps {
  properties: Property[];
}

const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Properties
        </CardTitle>
        <CardDescription>Manage property listings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No properties found
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell 
                      className="font-medium"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      {property.name}
                    </TableCell>
                    <TableCell 
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      {property.address}
                    </TableCell>
                    <TableCell 
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      ${property.price.toLocaleString()}
                    </TableCell>
                    <TableCell 
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      {property.beds} bed, {property.baths} bath, {property.area} m²
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        className="bg-theme-warm hover:bg-theme-warm/90"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            className="bg-theme-warm hover:bg-theme-warm/90"
            asChild
          >
            <Link to="/add-property">
              <Plus className="mr-2 h-4 w-4" />
              Add New Property
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertiesTable;
