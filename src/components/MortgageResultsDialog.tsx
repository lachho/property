
import React from 'react';
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Loader2, ChevronsRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Reuse the same lead form schema from FinanceCalculator
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

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format percentage
const formatPercentage = (value: number): string => {
  return value.toFixed(2) + '%';
};

// Helper to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

interface MortgageResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: {
    repaymentAmount: number;
    totalRepayments: number;
    totalInterest: number;
    payoffDate: Date;
    principalPercentage: number;
    interestPercentage: number;
    potentialSavings?: number;
  };
  onGetReportClick: () => void;
  showLeadForm: boolean;
  leadForm: UseFormReturn<z.infer<typeof leadFormSchema>>;
  onLeadSubmit: (data: z.infer<typeof leadFormSchema>) => void;
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
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Your Mortgage Repayment Results</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {!showLeadForm ? (
            <>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-3">
                  {formatCurrency(results.repaymentAmount)}
                  <span className="text-lg font-normal text-gray-500 ml-2">per month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Repayments:</span>
                        <span className="font-semibold">{formatCurrency(results.totalRepayments)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Interest:</span>
                        <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan Payoff Date:</span>
                        <span className="font-semibold">{formatDate(results.payoffDate)}</span>
                      </div>
                      {results.potentialSavings && (
                        <div className="flex justify-between mt-2 text-green-600">
                          <span>Potential Savings with Additional Repayments:</span>
                          <span className="font-bold">{formatCurrency(results.potentialSavings)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-3">Payment Breakdown</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Principal</span>
                          <span>{formatPercentage(results.principalPercentage)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${results.principalPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Interest</span>
                          <span>{formatPercentage(results.interestPercentage)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-orange-400 h-2.5 rounded-full" 
                            style={{ width: `${results.interestPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3 text-lg">Get Your Personalized Repayment Strategy</h3>
                <p className="text-gray-600 mb-4">
                  Receive a detailed report with custom strategies to pay off your mortgage faster 
                  and save on interest. Our mortgage specialists will analyze your situation and 
                  provide tailored recommendations.
                </p>
                <Button 
                  onClick={onGetReportClick} 
                  className="w-full py-6" 
                  size="lg"
                >
                  Get Your Free Personalized Report
                  <ChevronsRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div>
              <h3 className="font-medium mb-4 text-lg text-center">Complete your details to receive your free report</h3>
              <Separator className="my-4" />
              <Form {...leadForm}>
                <form onSubmit={leadForm.handleSubmit(onLeadSubmit)} className="space-y-4">
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
                  
                  <FormField
                    control={leadForm.control}
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
                    control={leadForm.control}
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
                  
                  <FormField
                    control={leadForm.control}
                    name="purchaseTimeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>When are you looking to purchase?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-3_months">0-3 months</SelectItem>
                            <SelectItem value="3-6_months">3-6 months</SelectItem>
                            <SelectItem value="6-12_months">6-12 months</SelectItem>
                            <SelectItem value="12+_months">12+ months</SelectItem>
                            <SelectItem value="just_researching">Just researching</SelectItem>
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the <a href="#" className="text-primary underline">privacy policy</a> and consent to being contacted about my mortgage options.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Send Me My Free Report"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
