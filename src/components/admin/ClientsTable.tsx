
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ClientProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: 'client' | 'admin';
};

interface ClientsTableProps {
  clients: ClientProfile[];
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients }) => {
  const navigate = useNavigate();
  
  const handleResetPassword = (email: string) => {
    console.log('Reset password for:', email);
    
    toast({
      title: "Password Reset",
      description: "Function not yet implemented. This will reset the password for " + email,
    });
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Clients
        </CardTitle>
        <CardDescription>Manage client accounts and information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell 
                      className="font-medium"
                      onClick={() => navigate(`/admin/client/${client.id}`)}
                    >
                      {client.first_name || ''} {client.last_name || ''} 
                      {!client.first_name && !client.last_name && '(No name provided)'}
                    </TableCell>
                    <TableCell 
                      onClick={() => navigate(`/admin/client/${client.id}`)}
                    >
                      {client.email}
                    </TableCell>
                    <TableCell 
                      onClick={() => navigate(`/admin/client/${client.id}`)}
                    >
                      {client.phone || 'No phone'}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResetPassword(client.email)}
                      >
                        Reset Password
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-theme-warm hover:bg-theme-warm/90"
                        onClick={() => navigate(`/admin/client/${client.id}`)}
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
      </CardContent>
    </Card>
  );
};

export default ClientsTable;
