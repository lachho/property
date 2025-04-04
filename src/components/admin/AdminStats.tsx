
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, LinkIcon } from 'lucide-react';

interface AdminStatsProps {
  clients: number;
  properties: number;
  userEmail: string;
  userRole: string;
}

const AdminStats: React.FC<AdminStatsProps> = ({ clients, properties, userEmail, userRole }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>Manage users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{clients}</p>
          <p className="text-sm text-gray-500">Total clients</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Properties</CardTitle>
          <CardDescription>Manage properties</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{properties}</p>
          <p className="text-sm text-gray-500">Total properties</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Admin Profile</CardTitle>
          <CardDescription>Your account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-medium truncate">{userEmail}</p>
          <p className="text-sm text-gray-500">Role: {userRole}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Admin controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild className="bg-theme-warm/5 border-theme-warm text-theme-warm hover:bg-theme-warm/10 hover:text-theme-warm">
              <Link to="/add-property">
                <Plus className="mr-1 h-4 w-4" />
                Add Property
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="bg-theme-warm/5 border-theme-warm text-theme-warm hover:bg-theme-warm/10 hover:text-theme-warm">
              <Link to="/assign-property">
                <LinkIcon className="mr-1 h-4 w-4" />
                Assign Property
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
