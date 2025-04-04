
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  PlusCircle, 
  PieChart, 
  LineChart, 
  BarChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Home,
  DollarSign,
  Building,
  Plus,
  Loader2
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioSummary from '@/components/PortfolioSummary';
import FinancialProfileForm from '@/components/FinancialProfileForm';
import PropertyBrowser from '@/components/PropertyBrowser';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define FormData interface for type safety
const financialProfileSchema = z.object({
  gross_income: z.coerce.number().min(0, "Must be a positive number"),
  partner_income: z.coerce.number().min(0, "Must be a positive number").optional().nullable(),
  dependants: z.coerce.number().min(0, "Must be a positive number"),
  existing_loans: z.coerce.number().min(0, "Must be a positive number"),
  marital_status: z.string().min(1, "Please select an option"),
});

type FinancialProfileData = z.infer<typeof financialProfileSchema>;

// Sample data for the portfolio charts
const portfolioValueData = [
  { month: 'Jan', value: 1200000 },
  { month: 'Feb', value: 1220000 },
  { month: 'Mar', value: 1240000 },
  { month: 'Apr', value: 1235000 },
  { month: 'May', value: 1270000 },
  { month: 'Jun', value: 1310000 },
  { month: 'Jul', value: 1380000 },
  { month: 'Aug', value: 1420000 },
  { month: 'Sep', value: 1450000 },
  { month: 'Oct', value: 1480000 },
  { month: 'Nov', value: 1520000 },
  { month: 'Dec', value: 1550000 },
];

const assetAllocationData = [
  { name: 'Residential', value: 65, color: '#2563eb' },
  { name: 'Commercial', value: 20, color: '#3b82f6' },
  { name: 'Land', value: 10, color: '#60a5fa' },
  { name: 'Other', value: 5, color: '#93c5fd' },
];

const cashFlowData = [
  { month: 'Jan', income: 8500, expenses: 6200 },
  { month: 'Feb', income: 8500, expenses: 6300 },
  { month: 'Mar', income: 8600, expenses: 6200 },
  { month: 'Apr', income: 8500, expenses: 6400 },
  { month: 'May', income: 8500, expenses: 6200 },
  { month: 'Jun', income: 8700, expenses: 6300 },
  { month: 'Jul', income: 8800, expenses: 6400 },
  { month: 'Aug', income: 8800, expenses: 6200 },
  { month: 'Sep', income: 8800, expenses: 6300 },
  { month: 'Oct', income: 8900, expenses: 6400 },
  { month: 'Nov', income: 8900, expenses: 6500 },
  { month: 'Dec', income: 9000, expenses: 6400 },
];

const ClientDashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [financialFormOpen, setFinancialFormOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Make sure form default values properly convert to string types for the form
  const form = useForm<FinancialProfileData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      gross_income: profile?.gross_income || 0,
      marital_status: profile?.marital_status || "",
      partner_income: profile?.partner_income || null,
      dependants: profile?.dependants || 0,
      existing_loans: profile?.existing_loans || 0,
    },
  });

  // Fetch user's saved properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch properties (simulated for now)
        // This would normally fetch from a saved_properties join table
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(5);
          
        if (error) throw error;
        
        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load portfolio properties.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [user, toast]);

  // Function to handle form submission with proper type conversions
  const handleFinancialUpdate = async (data: FinancialProfileData) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      
      toast({
        title: "Success",
        description: "Your financial information has been updated.",
      });
      
      setFinancialFormOpen(false);
    } catch (error) {
      console.error("Error updating financial info:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your financial information.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate portfolio summary stats
  const totalPortfolioValue = 1550000; // This would be calculated from actual properties
  const portfolioGrowth = 29.17; // Percentage growth
  const totalCashflow = 2600; // Monthly positive cashflow
  const totalEquity = 620000; // Total equity across all properties

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-theme-blue" />
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
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {profile.first_name || 'Client'}</h1>
              <p className="text-gray-600">Manage your investment property portfolio</p>
            </div>
            <Button onClick={() => navigate('/borrowing-capacity')}>
              Calculate Borrowing Capacity
              <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="dashboard">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="financial-profile">Financial Profile</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-8">
              {/* Portfolio Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm text-gray-500 font-normal">Total Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center">
                      <Home className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</span>
                    </div>
                    <div className="flex items-center mt-2 text-green-600">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">{portfolioGrowth}% growth</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm text-gray-500 font-normal">Monthly Cashflow</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{formatCurrency(totalCashflow)}</span>
                    </div>
                    <div className="flex items-center mt-2 text-green-600">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">12.5% increase</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm text-gray-500 font-normal">Total Equity</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center">
                      <Building className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{formatCurrency(totalEquity)}</span>
                    </div>
                    <div className="flex items-center mt-2 text-green-600">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm">8.3% growth</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm text-gray-500 font-normal">Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center">
                      <Building className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{properties.length}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Button variant="link" className="p-0 h-auto text-primary" 
                        onClick={() => navigate('/add-property')}>
                        <Plus className="h-3 w-3 mr-1" />
                        <span className="text-sm">Add property</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Value Over Time</CardTitle>
                    <CardDescription>12 month performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ChartContainer
                        config={{
                          area: { label: "Portfolio Value" },
                        }}
                      >
                        <AreaChart
                          data={portfolioValueData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                          <YAxis
                            tickFormatter={(value) => `$${value / 1000}k`}
                            stroke="#888888"
                            fontSize={12}
                          />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <ChartTooltip>
                            <ChartTooltipContent
                              formatter={(value: any) => formatCurrency(value)}
                            />
                          </ChartTooltip>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Asset Allocation</CardTitle>
                      <CardDescription>By property type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ChartContainer
                          config={{
                            pie: { label: "Asset Allocation" },
                          }}
                        >
                          <RechartsPieChart>
                            <Pie
                              data={assetAllocationData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {assetAllocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip>
                              <ChartTooltipContent />
                            </ChartTooltip>
                            <Legend 
                              formatter={(value, entry, index) => (
                                <span className="text-xs">{value}</span>
                              )}
                            />
                          </RechartsPieChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Cash Flow</CardTitle>
                      <CardDescription>Income vs. Expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ChartContainer
                          config={{
                            bar1: { label: "Income", color: "#2563eb" },
                            bar2: { label: "Expenses", color: "#f97316" },
                          }}
                        >
                          <RechartsBarChart
                            data={cashFlowData}
                            margin={{
                              top: 5,
                              right: 5,
                              left: 5,
                              bottom: 0,
                            }}
                          >
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <ChartTooltip>
                              <ChartTooltipContent />
                            </ChartTooltip>
                            <Bar dataKey="income" fill="var(--color-bar1)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="var(--color-bar2)" radius={[4, 4, 0, 0]} />
                          </RechartsBarChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Recent Properties */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Properties</CardTitle>
                  <CardDescription>Recently added properties in your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : properties.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Purchase Price</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead className="text-right">Growth</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property: any) => (
                          <TableRow key={property.id} 
                            className="cursor-pointer hover:bg-gray-50" 
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {property.image_url ? (
                                  <img 
                                    src={property.image_url} 
                                    alt={property.name} 
                                    className="w-10 h-10 object-cover rounded-md mr-3"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                    <Home className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <div>{property.name}</div>
                                  <div className="text-sm text-gray-500">{property.address}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(property.price)}</TableCell>
                            <TableCell>{formatCurrency(property.price * (1 + (property.growth_rate || 0) / 100))}</TableCell>
                            <TableCell className="text-right">
                              <span className={property.growth_rate > 0 ? "text-green-600" : "text-red-600"}>
                                {property.growth_rate > 0 ? "+" : ""}{property.growth_rate || 0}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't added any properties to your portfolio yet.</p>
                      <Button onClick={() => navigate('/borrowing-capacity')}>
                        Calculate Your Borrowing Capacity
                      </Button>
                    </div>
                  )}
                </CardContent>
                {properties.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/portfolio-manager')}>
                      View All Properties
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="financial-profile">
              <Card>
                <CardHeader>
                  <CardTitle>Your Financial Profile</CardTitle>
                  <CardDescription>
                    Update your financial details to get accurate borrowing capacity calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFinancialUpdate)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="gross_income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Gross Income ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Your annual income before tax" 
                                {...field} 
                                onChange={(e) => {
                                  const value = e.target.value === "" ? 0 : Number(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="marital_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marital Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your marital status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="de facto">De Facto</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="partner_income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner's Annual Income ($) (If applicable)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Partner's annual income before tax" 
                                {...field} 
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? null : Number(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dependants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Dependants</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Number of children or other dependants" 
                                {...field} 
                                onChange={(e) => {
                                  const value = e.target.value === "" ? 0 : Number(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="existing_loans"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Existing Loans/Debts ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Total of existing loans, credit cards, and other debts" 
                                {...field} 
                                onChange={(e) => {
                                  const value = e.target.value === "" ? 0 : Number(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Changes
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="properties">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Property Browser</CardTitle>
                  <CardDescription>
                    Browse available properties or add your own to simulate portfolio impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PropertyBrowser />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
