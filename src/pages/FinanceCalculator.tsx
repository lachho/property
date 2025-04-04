
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Check, Download, Info, Mail, PieChart as PieChartIcon, Calculator } from 'lucide-react';

// Define validation schema for the calculator
const calculatorSchema = z.object({
  loanAmount: z.number().min(10000, { message: 'Loan amount must be at least $10,000' }).max(10000000, { message: 'Loan amount cannot exceed $10,000,000' }),
  interestRate: z.number().min(0.1, { message: 'Interest rate must be at least 0.1%' }).max(20, { message: 'Interest rate cannot exceed 20%' }),
  loanTerm: z.string(),
  repaymentFrequency: z.string(),
  loanType: z.string(),
  additionalRepayment: z.number().optional(),
});

// Define validation schema for the lead form
const leadFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number' }),
  purchaseTimeframe: z.string(),
  privacyPolicy: z.boolean().refine(value => value === true, {
    message: 'You must agree to the privacy policy',
  }),
});

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format number with thousands separators
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-AU').format(value);
};

// Format percentage
const formatPercentage = (value: number) => {
  return `${value}%`;
};

const FinanceCalculator = () => {
  const { toast } = useToast();
  const [showResults, setShowResults] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const [amortizationData, setAmortizationData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);

  // Initialize calculator form
  const calculatorForm = useForm<z.infer<typeof calculatorSchema>>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      loanAmount: 500000,
      interestRate: 5.5,
      loanTerm: '30',
      repaymentFrequency: 'monthly',
      loanType: 'principal-interest',
      additionalRepayment: 0,
    },
  });

  // Initialize lead form
  const leadForm = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      purchaseTimeframe: 'next-6-months',
      privacyPolicy: false,
    },
  });

  // Watch form values to calculate progress
  const loanAmount = calculatorForm.watch('loanAmount');
  const interestRate = calculatorForm.watch('interestRate');
  const loanTerm = calculatorForm.watch('loanTerm');
  const repaymentFrequency = calculatorForm.watch('repaymentFrequency');
  const loanType = calculatorForm.watch('loanType');

  // Calculate form completion progress
  useEffect(() => {
    let progress = 0;
    if (loanAmount > 0) progress += 20;
    if (interestRate > 0) progress += 20;
    if (loanTerm) progress += 20;
    if (repaymentFrequency) progress += 20;
    if (loanType) progress += 20;
    
    setFormProgress(progress);
  }, [loanAmount, interestRate, loanTerm, repaymentFrequency, loanType]);

  // Calculate mortgage details
  const calculateMortgage = (data: z.infer<typeof calculatorSchema>) => {
    const { loanAmount, interestRate, loanTerm, repaymentFrequency, loanType, additionalRepayment = 0 } = data;
    
    // Calculate payments per year
    let paymentsPerYear;
    switch (repaymentFrequency) {
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
    
    // Calculate total number of payments
    const totalPayments = Number(loanTerm) * paymentsPerYear;
    
    // Calculate periodic interest rate
    const periodicInterestRate = (interestRate / 100) / paymentsPerYear;
    
    let paymentAmount;
    let totalPrincipal = loanAmount;
    let totalInterest = 0;
    
    // Different calculation for interest-only vs principal & interest
    if (loanType === 'interest-only') {
      // For interest-only loans, payment is just the interest component
      paymentAmount = loanAmount * periodicInterestRate;
      totalInterest = paymentAmount * totalPayments;
    } else {
      // For principal & interest loans, use standard formula
      paymentAmount = loanAmount * 
        (periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments)) / 
        (Math.pow(1 + periodicInterestRate, totalPayments) - 1);
      
      // Calculate total repayment and interest
      const totalRepayment = paymentAmount * totalPayments;
      totalInterest = totalRepayment - loanAmount;
    }
    
    // Calculate payoff date
    const today = new Date();
    const payoffDate = new Date(today);
    payoffDate.setFullYear(today.getFullYear() + Number(loanTerm));
    
    // Impact of additional repayments (if applicable)
    let yearsReduced = 0;
    let interestSaved = 0;
    
    if (additionalRepayment > 0 && loanType === 'principal-interest') {
      // Calculate new loan term with additional payments
      let balance = loanAmount;
      let newTotalPayments = 0;
      
      while (balance > 0 && newTotalPayments < totalPayments) {
        const interestPayment = balance * periodicInterestRate;
        const principalPayment = paymentAmount - interestPayment + additionalRepayment;
        
        balance -= principalPayment;
        newTotalPayments++;
        
        if (balance <= 0) break;
      }
      
      yearsReduced = (totalPayments - newTotalPayments) / paymentsPerYear;
      interestSaved = totalInterest - (newTotalPayments * paymentAmount - loanAmount);
    }
    
    // Generate amortization data for the chart
    const amortizationData = [];
    let remainingPrincipal = loanAmount;
    
    for (let year = 0; year <= Number(loanTerm); year++) {
      if (year === 0) {
        amortizationData.push({
          year,
          remainingPrincipal,
          totalPaid: 0,
        });
        continue;
      }
      
      const yearlyPayment = paymentAmount * paymentsPerYear;
      const yearlyInterest = remainingPrincipal * (interestRate / 100);
      let yearlyPrincipal;
      
      if (loanType === 'interest-only') {
        yearlyPrincipal = year === Number(loanTerm) ? loanAmount : 0;
      } else {
        yearlyPrincipal = yearlyPayment - yearlyInterest;
      }
      
      remainingPrincipal = Math.max(0, remainingPrincipal - yearlyPrincipal);
      
      amortizationData.push({
        year,
        remainingPrincipal: Math.round(remainingPrincipal),
        totalPaid: year * yearlyPayment,
      });
    }
    
    setAmortizationData(amortizationData);
    
    // Prepare data for pie chart (principal vs interest)
    setPieChartData([
      { name: 'Principal', value: loanAmount, color: '#8884d8' },
      { name: 'Interest', value: Math.round(totalInterest), color: '#82ca9d' },
    ]);
    
    // Return calculation results
    return {
      paymentAmount: Math.round(paymentAmount),
      totalRepayment: Math.round(paymentAmount * totalPayments),
      totalInterest: Math.round(totalInterest),
      paymentFrequency: repaymentFrequency,
      payoffDate: format(payoffDate, 'MMMM yyyy'),
      paymentsPerYear,
      yearsReduced: yearsReduced.toFixed(1),
      interestSaved: Math.round(interestSaved),
    };
  };

  // Handle calculator form submission
  const onCalculatorSubmit = (data: z.infer<typeof calculatorSchema>) => {
    try {
      const results = calculateMortgage(data);
      setCalculationResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "There was a problem with your calculation. Please check your inputs.",
      });
    }
  };

  // Handle lead form submission
  const onLeadFormSubmit = async (data: z.infer<typeof leadFormSchema>) => {
    if (!calculationResults) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-10);
      
      // Create a user through auth to bypass RLS
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: randomPassword,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          }
        }
      });

      if (authError) throw authError;
      
      // Get the current calculator values
      const calculatorValues = calculatorForm.getValues();
      
      // Send the email report using the edge function
      const { error: emailError } = await supabase.functions.invoke('send-mortgage-report', {
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          purchaseTimeframe: data.purchaseTimeframe,
          loanAmount: calculatorValues.loanAmount,
          interestRate: calculatorValues.interestRate,
          loanTerm: calculatorValues.loanTerm,
          repaymentFrequency: calculatorValues.repaymentFrequency,
          loanType: calculatorValues.loanType,
          monthlyPayment: calculationResults.paymentAmount,
          totalRepayment: calculationResults.totalRepayment,
          totalInterest: calculationResults.totalInterest,
          payoffDate: calculationResults.payoffDate
        }
      });

      if (emailError) throw emailError;
      
      toast({
        title: "Success!",
        description: "Your personalized mortgage report will be emailed to you shortly.",
      });
      
      setShowLeadForm(false);
      
      // Sign out automatically created user
      if (authData?.user) {
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error("Error sending mortgage report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send your report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Mortgage Repayment Calculator</h1>
        <p className="text-muted-foreground max-w-3xl">
          Plan your home loan with our comprehensive mortgage calculator. 
          Adjust the variables below to see how they affect your repayments and get a personalized strategy.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Calculator</CardTitle>
                  <CardDescription>Enter your loan details below</CardDescription>
                </div>
                <Progress value={formProgress} className="w-24 h-2" />
              </div>
            </CardHeader>
            <CardContent>
              <Form {...calculatorForm}>
                <form onSubmit={calculatorForm.handleSubmit(onCalculatorSubmit)} className="space-y-6">
                  {/* Loan Amount Field */}
                  <FormField
                    control={calculatorForm.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="flex justify-between items-center">
                          <FormLabel>Loan Amount</FormLabel>
                          <span className="text-sm font-medium">{formatCurrency(field.value)}</span>
                        </div>
                        <FormControl>
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-9">
                              <Slider
                                value={[field.value]}
                                min={10000}
                                max={2000000}
                                step={10000}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="text-right"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Interest Rate Field */}
                  <FormField
                    control={calculatorForm.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="flex justify-between items-center">
                          <FormLabel>Interest Rate</FormLabel>
                          <span className="text-sm font-medium">{formatPercentage(field.value)}</span>
                        </div>
                        <FormControl>
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-9">
                              <Slider
                                value={[field.value]}
                                min={0.1}
                                max={15}
                                step={0.05}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                step="0.05"
                                className="text-right"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Loan Term Field */}
                  <FormField
                    control={calculatorForm.control}
                    name="loanTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Term (years)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 years</SelectItem>
                            <SelectItem value="20">20 years</SelectItem>
                            <SelectItem value="25">25 years</SelectItem>
                            <SelectItem value="30">30 years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Repayment Frequency Field */}
                  <FormField
                    control={calculatorForm.control}
                    name="repaymentFrequency"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Repayment Frequency</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="weekly" id="weekly" />
                              <label htmlFor="weekly" className="text-sm font-medium">Weekly</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fortnightly" id="fortnightly" />
                              <label htmlFor="fortnightly" className="text-sm font-medium">Fortnightly</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="monthly" id="monthly" />
                              <label htmlFor="monthly" className="text-sm font-medium">Monthly</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Loan Type Field */}
                  <FormField
                    control={calculatorForm.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Loan Type</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                              <label htmlFor="loan-type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Interest Only
                              </label>
                              <Switch
                                id="loan-type"
                                checked={field.value === 'principal-interest'}
                                onCheckedChange={(checked) => field.onChange(checked ? 'principal-interest' : 'interest-only')}
                              />
                              <p className="text-sm text-muted-foreground">
                                Principal & Interest
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Repayment Field - Only show for principal & interest */}
                  {calculatorForm.watch('loanType') === 'principal-interest' && (
                    <FormField
                      control={calculatorForm.control}
                      name="additionalRepayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Repayment (per period)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value || 0}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground mt-1">
                            Additional regular repayments can significantly reduce your loan term and interest paid.
                          </p>
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full">Calculate Repayments</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-5">
          {showResults && calculationResults && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Mortgage Summary</CardTitle>
                <CardDescription>Based on your loan details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-md">
                  <div className="mb-2 text-sm text-muted-foreground">
                    {calculationResults.paymentFrequency === 'monthly' ? 'Monthly' : 
                     calculationResults.paymentFrequency === 'fortnightly' ? 'Fortnightly' : 'Weekly'} Repayment
                  </div>
                  <div className="text-4xl font-bold animate-fade-in">
                    {formatCurrency(calculationResults.paymentAmount)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Repayment</div>
                    <div className="text-xl font-semibold">{formatCurrency(calculationResults.totalRepayment)}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Interest</div>
                    <div className="text-xl font-semibold">{formatCurrency(calculationResults.totalInterest)}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground">Loan Pay-off Date</div>
                    <div className="text-xl font-semibold">{calculationResults.payoffDate}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground">Number of Payments</div>
                    <div className="text-xl font-semibold">
                      {formatNumber(Number(loanTerm) * calculationResults.paymentsPerYear)}
                    </div>
                  </div>
                </div>
                
                {calculatorForm.watch('additionalRepayment') > 0 && calculatorForm.watch('loanType') === 'principal-interest' && (
                  <div className="bg-muted/30 p-4 rounded-md border-l-4 border-primary">
                    <h4 className="font-medium mb-2">Impact of Additional Repayments</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Years Reduced</p>
                        <p className="text-lg font-medium">{calculationResults.yearsReduced} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Saved</p>
                        <p className="text-lg font-medium">{formatCurrency(calculationResults.interestSaved)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="h-60">
                  <h4 className="text-md font-medium mb-2">Principal vs Interest</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-60">
                  <h4 className="text-md font-medium mb-2">Loan Balance Over Time</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={amortizationData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value/1000}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), '']} 
                        labelFormatter={(value) => `Year ${value}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="remainingPrincipal" 
                        name="Remaining Balance" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/20 rounded-full p-2">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Get Your Personalized Repayment Strategy</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Receive a detailed analysis of your mortgage options and potential strategies to save money on your loan.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setShowLeadForm(true)}
                      >
                        Get Free Report <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!showResults && (
            <Card className="h-full flex flex-col justify-center">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Calculator className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Your Mortgage Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the calculator details to see your personalized mortgage repayment summary.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Lead Capture Form Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get Your Personalized Mortgage Report</DialogTitle>
            <DialogDescription>
              Fill in your details below and we'll send you a comprehensive mortgage report with personalized recommendations.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...leadForm}>
            <form onSubmit={leadForm.handleSubmit(onLeadFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={leadForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={leadForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={leadForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={leadForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0400 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={leadForm.control}
                name="purchaseTimeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Purchase Timeframe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="already-own">I already own property</SelectItem>
                        <SelectItem value="next-3-months">Within 3 months</SelectItem>
                        <SelectItem value="next-6-months">Within 6 months</SelectItem>
                        <SelectItem value="next-12-months">Within 12 months</SelectItem>
                        <SelectItem value="just-researching">Just researching</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={leadForm.control}
                name="privacyPolicy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Privacy Policy</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        I agree to the <a href="#" className="text-primary underline">privacy policy</a> and consent to being contacted about my mortgage needs.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowLeadForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : "Get My Report"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceCalculator;
