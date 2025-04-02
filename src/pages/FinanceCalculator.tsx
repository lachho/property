import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, Home, Calendar, Info } from 'lucide-react';

// Form validation schema - properly transforming strings to numbers
const formSchema = z.object({
  loanAmount: z.string().min(1, "Loan amount is required").transform(val => Number(val)),
  interestRate: z.string().min(1, "Interest rate is required").transform(val => Number(val)),
  loanTerm: z.string().min(1, "Loan term is required").transform(val => Number(val)),
});

// Lead collection schema
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

const FinanceCalculator = () => {
  const { toast } = useToast();
  const [showResults, setShowResults] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repaymentDetails, setRepaymentDetails] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0,
  });

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: "",
      interestRate: "",
      loanTerm: "",
    },
  });

  // Lead Form
  const leadForm = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Calculate mortgage repayment - now using proper number types
  const calculateRepayment = (loanAmount: number, interestRate: number, loanTerm: number) => {
    // Convert annual rate to monthly rate
    const monthlyRate = interestRate / 100 / 12;
    // Convert loan term to months
    const termMonths = loanTerm * 12;
    
    // Calculate monthly payment using mortgage formula
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount,
      interestRate,
      loanTerm
    };
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const results = calculateRepayment(
      values.loanAmount,
      values.interestRate,
      values.loanTerm
    );
    
    setRepaymentDetails(results);
    setShowResults(true);
  };

  const handleRequestReport = () => {
    setShowLeadForm(true);
  };

  const closeDialog = () => {
    setShowResults(false);
    setShowLeadForm(false);
    leadForm.reset();
  };

  const submitLead = async (values: z.infer<typeof leadSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Get existing user or create new record
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', values.email)
        .maybeSingle();
      
      // Store user in the database - using upsert for safety
      const { error: dbError } = await supabase.from('profiles').upsert({
        id: existingUser?.id || crypto.randomUUID(), // Use existing ID or generate a new one
        first_name: values.name.split(' ')[0],
        last_name: values.name.split(' ').slice(1).join(' '),
        email: values.email,
        phone: values.phone,
        role: 'client'
      });

      if (dbError) throw dbError;

      // Send email report using the edge function
      const { error: emailError } = await supabase.functions.invoke('send-mortgage-report', {
        body: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          loanAmount: repaymentDetails.loanAmount,
          interestRate: repaymentDetails.interestRate,
          loanTerm: repaymentDetails.loanTerm,
          monthlyPayment: repaymentDetails.monthlyPayment,
          totalPayment: repaymentDetails.totalPayment,
          totalInterest: repaymentDetails.totalInterest
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Success!",
        description: "Your detailed mortgage report will be emailed to you shortly."
      });

      closeDialog();
    } catch (error: any) {
      console.error("Error in lead submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit your information. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Navbar />
      <main className="flex-grow section-padding">
        <div className="container-custom">
          <h1 className="heading-lg mb-6 text-amber-900">Mortgage Calculator</h1>
          <p className="text-lg text-amber-800 mb-8">
            Calculate your monthly mortgage payments, total interest, and more to plan your property financing effectively.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="p-6 bg-amber-100 border-amber-200 shadow-md">
              <div className="flex items-center mb-4 text-amber-700">
                <Home className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">Loan Amount</h3>
              </div>
              <p className="text-amber-600 text-sm mb-2">
                Enter the total amount you plan to borrow for your property purchase.
              </p>
            </Card>

            <Card className="p-6 bg-amber-100 border-amber-200 shadow-md">
              <div className="flex items-center mb-4 text-amber-700">
                <Banknote className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">Interest Rate</h3>
              </div>
              <p className="text-amber-600 text-sm mb-2">
                The annual interest rate offered by your lender as a percentage.
              </p>
            </Card>

            <Card className="p-6 bg-amber-100 border-amber-200 shadow-md">
              <div className="flex items-center mb-4 text-amber-700">
                <Calendar className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">Loan Term</h3>
              </div>
              <p className="text-amber-600 text-sm mb-2">
                The number of years you'll take to repay the loan completely.
              </p>
            </Card>
          </div>

          <Card className="p-8 bg-white border-amber-200 shadow-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-800">Loan Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 500000" {...field} className="border-amber-200 focus-visible:ring-amber-500" />
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
                        <FormLabel className="text-amber-800">Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g. 4.5" {...field} className="border-amber-200 focus-visible:ring-amber-500" />
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
                        <FormLabel className="text-amber-800">Loan Term (years)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 30" {...field} className="border-amber-200 focus-visible:ring-amber-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <Button 
                    type="submit" 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2 text-lg"
                  >
                    Calculate Repayments
                  </Button>
                </div>
              </form>
            </Form>
          </Card>

          {/* Result Dialog */}
          <Dialog open={showResults} onOpenChange={setShowResults}>
            <DialogContent className="bg-amber-50 border-amber-300 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-amber-900 text-xl">Your Mortgage Details</DialogTitle>
                <DialogDescription className="text-center text-amber-700">
                  Based on your inputs
                </DialogDescription>
              </DialogHeader>
              
              {!showLeadForm ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-md border border-amber-200">
                    <div className="text-center mb-4">
                      <p className="text-amber-800 font-semibold">Monthly Repayment</p>
                      <p className="text-2xl font-bold text-amber-900">
                        ${repaymentDetails.monthlyPayment.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-amber-800">
                      <div>
                        <p className="font-medium">Loan Amount:</p>
                        <p className="font-semibold">${repaymentDetails.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Interest Rate:</p>
                        <p className="font-semibold">{repaymentDetails.interestRate}%</p>
                      </div>
                      <div>
                        <p className="font-medium">Loan Term:</p>
                        <p className="font-semibold">{repaymentDetails.loanTerm} years</p>
                      </div>
                      <div>
                        <p className="font-medium">Total Interest:</p>
                        <p className="font-semibold">${repaymentDetails.totalInterest.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-100 p-4 rounded-md border border-amber-200 flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 text-amber-700 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Want to explore options to reduce your monthly payments or total interest? 
                      Get a detailed mortgage report with personalized recommendations!
                    </p>
                  </div>
                  
                  <div className="flex justify-center pt-2">
                    <Button 
                      onClick={handleRequestReport}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Get My Free Detailed Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-amber-800 mb-4 text-center">
                    Please provide your contact details to receive your personalized mortgage report.
                  </p>
                  
                  <Form {...leadForm}>
                    <form onSubmit={leadForm.handleSubmit(submitLead)} className="space-y-4">
                      <FormField
                        control={leadForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-800">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} className="border-amber-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={leadForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-800">Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} className="border-amber-200" />
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
                            <FormLabel className="text-amber-800">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="0400 123 456" {...field} className="border-amber-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-center pt-2">
                        <Button 
                          type="submit"
                          className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Sending...' : 'Send Me The Report'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FinanceCalculator;
