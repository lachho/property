
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarRange, PiggyBank, Calculator, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useMortgageCalculator, MortgageFormData, LeadData } from '@/hooks/useMortgageCalculator';
import { MortgageResultsDialog } from '@/components/MortgageResultsDialog';

// Validations for the forms
const mortgageFormSchema = z.object({
  loanAmount: z.coerce.number().min(10000, "Minimum loan amount is $10,000").max(10000000, "Maximum loan amount is $10,000,000"),
  interestRate: z.coerce.number().min(0.1, "Minimum interest rate is 0.1%").max(15, "Maximum interest rate is 15%"),
  loanTerm: z.string().min(1, "Please select a loan term"),
  repaymentFrequency: z.enum(["weekly", "fortnightly", "monthly"]),
  loanType: z.enum(["principal_and_interest", "interest_only"]),
  additionalRepayments: z.coerce.number().min(0, "Additional repayments cannot be negative").optional().default(0),
});

const leadFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  purchaseTimeframe: z.string().min(1, "Please select a timeframe"),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy",
  }),
});

// Helper function to format currency with spaces between thousands
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format large numbers with spaces
const formatNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const FinanceCalculator = () => {
  const [formStep, setFormStep] = useState(1);
  const [formProgress, setFormProgress] = useState(33);
  const [showResults, setShowResults] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  const { 
    calculateMortgage, 
    submitLead,
    isSubmitting,
  } = useMortgageCalculator();
  
  const [calculationResults, setCalculationResults] = useState<any>(null);
  
  const mortgageForm = useForm<z.infer<typeof mortgageFormSchema>>({
    resolver: zodResolver(mortgageFormSchema),
    defaultValues: {
      loanAmount: 500000,
      interestRate: 4.5,
      loanTerm: "30",
      repaymentFrequency: "monthly",
      loanType: "principal_and_interest",
      additionalRepayments: 0,
    },
  });

  const leadForm = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      purchaseTimeframe: "6-12 months", // Set a default value for the select
      privacyPolicy: false,
    },
  });

  // Update the progress bar as the user fills out the form
  useEffect(() => {
    if (formStep === 1) setFormProgress(33);
    else if (formStep === 2) setFormProgress(66);
    else if (formStep === 3) setFormProgress(100);
  }, [formStep]);

  // Watch form values for loan amount to update the slider
  const watchedLoanAmount = mortgageForm.watch("loanAmount");

  const handleMortgageSubmit = (data: MortgageFormData) => {
    const results = calculateMortgage(data);
    setCalculationResults(results);
    setShowResults(true);
  };

  const handleLeadSubmit = async (data: z.infer<typeof leadFormSchema>) => {
    if (!calculationResults) return;
    
    try {
      const mortgageDetails = {
        ...mortgageForm.getValues(),
        results: calculationResults
      };
      
      const leadData: LeadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        purchaseTimeframe: data.purchaseTimeframe,
        privacyPolicy: data.privacyPolicy,
        mortgageDetails: mortgageDetails
      };
      
      await submitLead(leadData);
      
      // Show thank you message or redirect
      setShowLeadForm(false);
      setShowResults(false);
      setFormStep(3); // Move to thank you step
    } catch (error) {
      console.error("Error submitting lead:", error);
    }
  };

  const handleGetReportClick = () => {
    setShowLeadForm(true);
  };

  const handleResultsClose = () => {
    setShowResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Mortgage Repayment Calculator</h1>
              <p className="text-gray-600 mb-6">Understand your repayments and get a personalized mortgage strategy</p>
              <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {formStep === 1 && "Step 1: Enter your loan details"}
                {formStep === 2 && "Step 2: View your results and get your report"}
                {formStep === 3 && "Step 3: Thank you for your submission"}
              </p>
            </div>
            
            {formStep === 1 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Mortgage Calculator</CardTitle>
                  <CardDescription>Fill in the details below to calculate your mortgage repayments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...mortgageForm}>
                    <form onSubmit={mortgageForm.handleSubmit(handleMortgageSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={mortgageForm.control}
                          name="loanAmount"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel className="text-base">Loan Amount</FormLabel>
                                <span className="text-xl font-semibold">{formatCurrency(field.value)}</span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={10000}
                                  max={2000000}
                                  step={10000}
                                  value={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <div className="pt-2">
                                <Input
                                  type="number"
                                  {...field}
                                  className="mt-2"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      field.onChange(value);
                                    }
                                  }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mortgageForm.control}
                          name="interestRate"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel className="text-base">Interest Rate (%)</FormLabel>
                                <span className="text-xl font-semibold">{field.value}%</span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0.1}
                                  max={15}
                                  step={0.05}
                                  value={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <div className="pt-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  className="mt-2"
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) {
                                      field.onChange(value);
                                    }
                                  }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mortgageForm.control}
                          name="loanTerm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Loan Term (Years)</FormLabel>
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

                        <FormField
                          control={mortgageForm.control}
                          name="repaymentFrequency"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-base">Repayment Frequency</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="weekly" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Weekly</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="fortnightly" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Fortnightly</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="monthly" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Monthly</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mortgageForm.control}
                          name="loanType"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-base">Loan Type</FormLabel>
                                <div className="flex items-center space-x-2">
                                  <span className={field.value === "interest_only" ? "font-medium text-primary" : "text-gray-500"}>Interest Only</span>
                                  <FormControl>
                                    <Switch
                                      checked={field.value === "principal_and_interest"}
                                      onCheckedChange={(checked) => 
                                        field.onChange(checked ? "principal_and_interest" : "interest_only")
                                      }
                                    />
                                  </FormControl>
                                  <span className={field.value === "principal_and_interest" ? "font-medium text-primary" : "text-gray-500"}>Principal & Interest</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mortgageForm.control}
                          name="additionalRepayments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Additional Monthly Repayments (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full py-6 text-lg"
                        size="lg"
                      >
                        Calculate Repayments
                        <Calculator className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {formStep === 3 && (
              <Card className="border-0 shadow-lg text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-full bg-green-100 p-3">
                      <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Thank You For Your Submission!</h2>
                    <p className="text-gray-600 max-w-md">
                      We've sent your personalized mortgage strategy report to your email. 
                      A mortgage specialist will contact you shortly to discuss your options.
                    </p>
                    <div className="pt-6">
                      <Button onClick={() => {
                        setFormStep(1);
                        mortgageForm.reset();
                        leadForm.reset();
                      }}>
                        Start New Calculation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Mortgage Results Dialog */}
      {calculationResults && (
        <MortgageResultsDialog
          open={showResults}
          onOpenChange={handleResultsClose}
          results={calculationResults}
          onGetReportClick={handleGetReportClick}
          showLeadForm={showLeadForm}
          leadForm={leadForm}
          onLeadSubmit={handleLeadSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <Footer />
    </div>
  );
};

export default FinanceCalculator;
