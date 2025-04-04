import React, { useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Download, ArrowRight, FileText, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
import { Checkbox } from "@/components/ui/checkbox";

// Lead form schema
const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
});

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface MortgageResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: any;
  onGetReportClick: () => void;
  showLeadForm: boolean;
  leadForm: UseFormReturn<any>;
  onLeadSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export const MortgageResultsDialog: React.FC<MortgageResultsDialogProps> = ({
  open,
  onOpenChange,
  results,
  onGetReportClick,
  showLeadForm,
  leadForm,
  onLeadSubmit,
  isSubmitting
}) => {
  // New state for the simple lead form
  const [showSimpleLeadForm, setShowSimpleLeadForm] = useState(false);
  
  // Create a form for the simple lead capture
  const simpleLeadForm = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const handleSimpleLeadSubmit = (data: z.infer<typeof leadFormSchema>) => {
    // You can handle the submission here or call an external function
    console.log("Simple lead form submitted:", data);
    // Close the dialog after submission
    onOpenChange(false);
  };
  
  if (!results) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const renderPaymentFrequency = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'fortnightly': return 'Fortnightly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Mortgage Repayment Results</DialogTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        
        {!showLeadForm && !showSimpleLeadForm ? (
          <>
            <div className="grid gap-6 py-4">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Your {renderPaymentFrequency(results.repaymentFrequency)} Repayment
                </h3>
                <p className="text-4xl font-bold text-blue-900">
                  {formatCurrency(results.repaymentAmount)}
                  <span className="text-sm font-normal text-blue-700 ml-2">per {results.repaymentFrequency.slice(0, -2)}</span>
                </p>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Total Repayments</p>
                    <p className="text-xl font-semibold">{formatCurrency(results.totalRepayments)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Total Interest</p>
                    <p className="text-xl font-semibold">{formatCurrency(results.totalInterest)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-gray-700 flex items-center">
                    <CalendarRange className="mr-2 h-5 w-5 text-blue-600" />
                    Loan Details
                  </h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Loan Type:</span>
                      <span className="font-medium">
                        {results.loanType === 'interest_only' ? 'Interest Only' : 'Principal & Interest'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Payoff Date:</span>
                      <span className="font-medium">{formatDate(results.payoffDate)}</span>
                    </p>
                    {results.additionalRepayments > 0 && (
                      <>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Additional Monthly:</span>
                          <span className="font-medium">{formatCurrency(results.additionalRepayments)}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Time Saved:</span>
                          <span className="font-medium text-green-600">
                            {Math.floor(results.timeSaved / 12)} years, {Math.round(results.timeSaved % 12)} months
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Interest Saved:</span>
                          <span className="font-medium text-green-600">{formatCurrency(results.interestSaved)}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-gray-700">Market Comparison</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Your Rate:</span>
                      <span className="font-medium">{results.marketComparisonRate - 0.5}%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Average Market Rate:</span>
                      <span className="font-medium">{results.marketComparisonRate}%</span>
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                      Based on our analysis, your selected interest rate is lower than the current market average.
                      Speak to our mortgage specialists to see if we can help secure this rate for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
              {/* Replace the close button with a CTA button */}
              <Button
                variant="secondary" 
                className="flex-1"
                onClick={() => setShowSimpleLeadForm(true)}
              >
                Get Your Free Customized Report
              </Button>
              <Button 
                className="flex-1 py-6 bg-theme-blue hover:bg-theme-blue/90"
                onClick={onGetReportClick}
              >
                <div className="flex items-center justify-center">
                  <FileText className="mr-2 h-5 w-5" />
                  <span>Get Your Personalized Strategy Report</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </Button>
            </DialogFooter>
          </>
        ) : showSimpleLeadForm ? (
          <div>
            <h3 className="font-medium mb-4 text-center">Complete your details to receive your free report</h3>
            <Form {...simpleLeadForm}>
              <form onSubmit={simpleLeadForm.handleSubmit(handleSimpleLeadSubmit)} className="space-y-4">
                <FormField
                  control={simpleLeadForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={simpleLeadForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={simpleLeadForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0412 345 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSimpleLeadForm(false)}
                  >
                    Back
                  </Button>
                  
                  <Button type="submit" className="bg-theme-blue hover:bg-theme-blue/90" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Me My Free Report"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4 text-center">
              Get Your Personalized Mortgage Strategy Report
            </h3>
            <p className="text-gray-500 mb-6 text-center">
              Fill in your details below, and we'll send you a detailed report with personalized mortgage strategies.
            </p>
            
            <Form {...leadForm}>
              <form onSubmit={leadForm.handleSubmit(onLeadSubmit)} className="space-y-4">
                {/* Original lead form content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                {/* Rest of the original form */}
                {/* ... */}
                
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="bg-theme-blue hover:bg-theme-blue/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Send Me The Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
