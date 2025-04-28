import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Home } from 'lucide-react';
import apiService from '@/services/api';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  gross_income: number;
  borrowing_capacity: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  image_url: string;
  beds: number;
  baths: number;
  area: number;
}

const AssignProperty = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [clientDetails, setClientDetails] = useState<Client | null>(null);
  const [downPayment, setDownPayment] = useState<number>(20);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  
  // Calculate monthly repayment
  const calculateMonthlyRepayment = () => {
    if (!propertyDetails || downPayment === undefined) return 0;
    
    const principal = propertyDetails.price * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    const repayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
                     (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return repayment;
  };
  
  // Calculate future value
  const calculateFutureValue = (years: number) => {
    if (!propertyDetails) return 0;
    
    // Assuming growth_rate is stored as percentage value
    const growthRate = 3.5 / 100; // Default to 3.5% if not available
    return propertyDetails.price * Math.pow(1 + growthRate, years);
  };
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || (profile && profile.role !== 'ADMIN'))) {
      navigate('/auth');
    }
  }, [isLoading, user, profile, navigate]);
  
  // Fetch clients and properties
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      try {
        const { data } = await apiService.getAllClients();
        setClients((data || []).map((profile) => ({
          id: profile.id?.toString() || '',
          first_name: profile.firstName || '',
          last_name: profile.lastName || '',
          email: profile.email,
          role: (profile.role?.toUpperCase() as 'CLIENT' | 'ADMIN') || 'CLIENT',
          gross_income: profile.grossIncome || 0,
          borrowing_capacity: 0,
        })));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive"
        });
      } finally {
        setIsFetching(false);
      }
    };
    const fetchProperties = async () => {
      if (!user) return;
      try {
        const { data } = await apiService.getAllProperties();
        setProperties((data || []).map((property) => ({
          id: property.id?.toString() || '',
          name: property.name || '',
          address: property.address || '',
          price: property.currentValue || 0,
          image_url: '',
          beds: 0,
          baths: 0,
          area: 0,
        })));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive"
        });
      } finally {
        setIsFetching(false);
      }
    };
    if (user && profile?.role === 'ADMIN') {
      fetchClients();
      fetchProperties();
    }
  }, [user, profile]);
  
  // Update property details when selection changes
  useEffect(() => {
    if (selectedProperty) {
      const property = properties.find(p => p.id === selectedProperty);
      setPropertyDetails(property || null);
    } else {
      setPropertyDetails(null);
    }
  }, [selectedProperty, properties]);
  
  // Update client details when selection changes
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      setClientDetails(client || null);
    } else {
      setClientDetails(null);
    }
  }, [selectedClient, clients]);
  
  const handleAssignment = async () => {
    if (!selectedClient || !selectedProperty) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a client and a property."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement checkPropertyAssignment in apiService if needed
      // For now, just proceed to assign
      
      // Save the property for the client
      await apiService.assignPropertyToClient(selectedClient, selectedProperty);
      
      toast({
        title: "Success!",
        description: "Property has been assigned to the client successfully."
      });
      
      // Navigate to client view
      navigate(`/admin/client/${selectedClient}`);
    } catch (error: any) {
      console.error('Error assigning property:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign property. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || isFetching) {
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
            <h1 className="heading-lg">Assign Property to Client</h1>
            <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Client and Property</CardTitle>
                <CardDescription>Assign a property to a client's portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length > 0 ? (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name} ({client.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients">No clients available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger id="property">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.length > 0 ? (
                        properties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - ${property.price.toLocaleString()}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-properties">No properties available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleAssignment} 
                    disabled={isSubmitting || !selectedClient || !selectedProperty}
                    className="w-full bg-theme-warm hover:bg-theme-warm/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Home className="mr-2 h-4 w-4" />
                        Assign Property to Client
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Property and client financial details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {clientDetails && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Client Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p>{clientDetails.first_name} {clientDetails.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Borrowing Capacity</p>
                        <p className="font-medium">${clientDetails.borrowing_capacity?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {propertyDetails && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Property Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Property</p>
                        <p>{propertyDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">${propertyDetails.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {propertyDetails && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mortgage Calculator</h3>
                    
                    <div>
                      <Label htmlFor="downPayment">Down Payment (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="downPayment" 
                          type="number" 
                          min={0} 
                          max={100} 
                          value={downPayment} 
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                        />
                        <span>%</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="loanTerm">Loan Term (years)</Label>
                      <Input 
                        id="loanTerm" 
                        type="number" 
                        min={1} 
                        max={50} 
                        value={loanTerm} 
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="interestRate" 
                          type="number" 
                          step="0.1" 
                          min={0} 
                          value={interestRate} 
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                        />
                        <span>%</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="bg-muted p-3 rounded-md">
                        <div className="flex justify-between mb-2">
                          <span>Monthly Repayment:</span>
                          <span className="font-bold">${calculateMonthlyRepayment().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Loan Amount:</span>
                          <span>${(propertyDetails.price * (1 - downPayment / 100)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Value in 10 years:</span>
                          <span>${calculateFutureValue(10).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {clientDetails && propertyDetails && (
                  <div className="pt-2">
                    <div className={`p-3 rounded-md ${clientDetails.borrowing_capacity && clientDetails.borrowing_capacity >= propertyDetails.price ? 'bg-green-100' : 'bg-red-100'}`}>
                      <p className="font-medium">
                        {clientDetails.borrowing_capacity && clientDetails.borrowing_capacity >= propertyDetails.price
                          ? 'This client can likely afford this property.'
                          : 'This client may struggle to afford this property.'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AssignProperty;
