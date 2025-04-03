import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  loanAmount: z.string().min(1, { message: 'Loan amount is required' }),
  interestRate: z.string().min(1, { message: 'Interest rate is required' }),
  loanTerm: z.string().min(1, { message: 'Loan term is required' }),
  paymentFrequency: z.string().min(1, { message: 'Payment frequency is required' }),
});

const FinanceCalculator = () => {
  const { toast } = useToast();
  const [results, setResults] = useState(null);
  const [amortizationData, setAmortizationData] = useState([]);
  const [activeTab, setActiveTab] = useState('mortgage');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: '500000',
      interestRate: '5.5',
      loanTerm: '30',
      paymentFrequency: 'monthly',
    },
  });

  // Convert string form values to numbers when processing them
  const processFormValues = (data) => {
    return {
      // Convert the string values to numbers
      loanAmount: Number(data.loanAmount),
      interestRate: Number(data.interestRate),
      loanTerm: Number(data.loanTerm),
      paymentFrequency: data.paymentFrequency,
    };
  };

  const calculateMortgage = (values) => {
    const { loanAmount, interestRate, loanTerm, paymentFrequency } = values;
    
    // Calculate payments based on frequency
    let paymentsPerYear;
    switch (paymentFrequency) {
      case 'weekly':
        paymentsPerYear = 52;
        break;
      case 'fortnightly':
        paymentsPerYear = 26;
        break;
      case 'monthly':
      default:
        paymentsPerYear = 12;
        break;
    }
    
    const totalPayments = loanTerm * paymentsPerYear;
    const periodicInterestRate = (interestRate / 100) / paymentsPerYear;
    
    // Calculate periodic payment amount
    const paymentAmount = loanAmount * 
      (periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments)) / 
      (Math.pow(1 + periodicInterestRate, totalPayments) - 1);
    
    // Calculate total interest paid
    const totalRepayment = paymentAmount * totalPayments;
    const totalInterest = totalRepayment - loanAmount;
    
    // Generate amortization schedule for the chart
    const amortizationSchedule = [];
    let remainingPrincipal = loanAmount;
    let yearlyData = [];
    
    for (let i = 1; i <= totalPayments; i++) {
      const interestPayment = remainingPrincipal * periodicInterestRate;
      const principalPayment = paymentAmount - interestPayment;
      remainingPrincipal -= principalPayment;
      
      // Group data by year for the chart
      if (i % paymentsPerYear === 0) {
        const year = i / paymentsPerYear;
        yearlyData.push({
          year,
          remainingPrincipal: Math.max(0, remainingPrincipal),
          totalPaid: year * paymentsPerYear * paymentAmount,
        });
      }
    }
    
    setAmortizationData(yearlyData);
    
    return {
      paymentAmount: paymentAmount.toFixed(2),
      totalRepayment: totalRepayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      paymentsPerYear,
      totalPayments,
    };
  };

  const onSubmit = (data) => {
    try {
      const processedValues = processFormValues(data);
      const results = calculateMortgage(processedValues);
      setResults(results);
      
      toast({
        title: "Calculation Complete",
        description: "Your mortgage calculation has been updated.",
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "There was a problem with your calculation. Please check your inputs.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Finance Calculator</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mortgage">Mortgage Calculator</TabsTrigger>
          <TabsTrigger value="investment">Investment Calculator</TabsTrigger>
          <TabsTrigger value="savings">Savings Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mortgage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Calculator</CardTitle>
              <CardDescription>
                Calculate your mortgage repayments and see how much interest you'll pay over the life of your loan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="5.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="loanTerm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Term (years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="fortnightly">Fortnightly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">Calculate</Button>
                </form>
              </Form>
              
              {results && (
                <div className="mt-6 p-4 border rounded-md bg-muted">
                  <h3 className="text-lg font-medium mb-2">Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Amount</p>
                      <p className="text-2xl font-bold">${results.paymentAmount}</p>
                      <p className="text-xs text-muted-foreground">
                        {results.paymentsPerYear === 12 ? 'per month' : 
                         results.paymentsPerYear === 26 ? 'per fortnight' : 'per week'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Repayment</p>
                      <p className="text-2xl font-bold">${results.totalRepayment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="text-2xl font-bold">${results.totalInterest}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 h-80">
                    <h4 className="text-md font-medium mb-2">Loan Balance Over Time</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={amortizationData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => ['$' + value.toLocaleString(), '']} />
                        <Legend />
                        <Line type="monotone" dataKey="remainingPrincipal" name="Remaining Balance" stroke="#8884d8" />
                        <Line type="monotone" dataKey="totalPaid" name="Total Paid" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investment">
          <Card>
            <CardHeader>
              <CardTitle>Investment Calculator</CardTitle>
              <CardDescription>
                Calculate potential returns on your investments over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Investment calculator coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <CardTitle>Savings Calculator</CardTitle>
              <CardDescription>
                Plan your savings goals and see how your money can grow over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Savings calculator coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceCalculator;
