import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Loader2 } from 'lucide-react';
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
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBorrowingCapacity, BorrowingFormData, LeadData } from '@/hooks/useBorrowingCapacity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  grossIncome: z.coerce.number().min(1, "Income must be greater than 0"),
  maritalStatus: z.string().min(1, "Please select marital status"),
  partnerIncome: z.coerce.number().optional(),
  dependants: z.coerce.number().min(0, "Cannot be negative"),
  existingLoans: z.coerce.number().min(0, "Cannot be negative"),
});

// Lead form schema
const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
});

const BorrowingCapacity = () => {
  const [formStep, setFormStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [borrowingCapacity, setBorrowingCapacity] = useState(0);
  const [formData, setFormData] = useState<BorrowingFormData | null>(null);
  const { calculateCapacity, submitLead, isSubmitting } = useBorrowingCapacity();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossIncome: 0,
      maritalStatus: "",
      partnerIncome: 0,
      dependants: 0,
      existingLoans: 0,
    },
  });

  const leadForm = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Create a properly typed BorrowingFormData object
      const borrowingFormData: BorrowingFormData = {
        grossIncome: values.grossIncome,
        maritalStatus: values.maritalStatus,
        partnerIncome: values.partnerIncome,
        dependants: values.dependants,
        existingLoans: values.existingLoans,
      };
      
      const calculatedCapacity = calculateCapacity(borrowingFormData);
      setBorrowingCapacity(calculatedCapacity);
      setFormData(borrowingFormData);
      setShowResults(true);
    } catch (error) {
      console.error("Error calculating borrowing capacity:", error);
    }
  };

  const handleResultsClose = (open: boolean) => {
    setShowResults(open);
  };

  const handleGetReportClick = () => {
    // Show lead form inside the dialog
  };

  const handleLeadSubmit = async (data: z.infer<typeof leadFormSchema>) => {
    if (!formData) return;
    
    // Ensure data has all required fields for LeadData type
    const leadData: LeadData = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || ""
    };
    
    const success = await submitLead(leadData, formData, borrowingCapacity);
    if (success) {
      // Close modal after successful submission
      setShowResults(false);
      setFormStep(3);
    }
  };

  // Function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow section-padding">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="heading-lg mb-3">Borrowing Capacity Calculator</h1>
            <p className="text-lg text-gray-600">
              Find out how much you could borrow in less than a minute. Complete this quick form to get your estimate instantly!
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {formStep === 1 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-blue-50 text-blue-800 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-6 w-6" />
                    <CardTitle className="text-xl">Calculate Your Borrowing Capacity</CardTitle>
                  </div>
                  <CardDescription className="text-blue-600">
                    Enter your financial details to see how much you might be able to borrow
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="grossIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gross Annual Income</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    {...field} 
                                    className="pl-7"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maritalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marital Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="single">Single</SelectItem>
                                  <SelectItem value="married">Married</SelectItem>
                                  <SelectItem value="de-facto">De Facto</SelectItem>
                                  <SelectItem value="divorced">Divorced</SelectItem>
                                  <SelectItem value="widowed">Widowed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {(form.watch("maritalStatus") === "married" || form.watch("maritalStatus") === "de-facto") && (
                          <FormField
                            control={form.control}
                            name="partnerIncome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Partner's Annual Income</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      {...field} 
                                      className="pl-7"
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="dependants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Dependants</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <FormField
                          control={form.control}
                          name="existingLoans"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Existing Loans/Debts ($)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    {...field} 
                                    className="pl-7"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Calculate My Borrowing Capacity
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
                      We've sent your personalized borrowing capacity report to your email. 
                      A lending specialist will contact you shortly to discuss your options.
                    </p>
                    <div className="pt-6">
                      <Button onClick={() => {
                        setFormStep(1);
                        form.reset();
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

      {showResults && (
        <Dialog open={showResults} onOpenChange={handleResultsClose}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Your Borrowing Capacity Results</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Your Estimated Borrowing Capacity
                </h3>
                <p className="text-4xl font-bold text-blue-900">
                  {formatCurrency(borrowingCapacity)}
                </p>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Total Income</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(form.getValues().grossIncome + (form.getValues().partnerIncome || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Existing Debts</p>
                    <p className="text-xl font-semibold">{formatCurrency(form.getValues().existingLoans)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">What does this mean?</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Based on the information you provided, this is an estimate of how much you may be able to borrow. The actual amount may vary based on:
                </p>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Your credit score</li>
                  <li>Employment history</li>
                  <li>Specific lender requirements</li>
                  <li>Additional financial commitments</li>
                </ul>
              </div>

              {!leadForm.formState.isSubmitted ? (
                <div>
                  <h3 className="font-medium mb-4 text-center">Want to know how to increase your borrowing power?</h3>
                  <Form {...leadForm}>
                    <form onSubmit={leadForm.handleSubmit(handleLeadSubmit)} className="space-y-4">
                      <FormField
                        control={leadForm.control}
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
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Get Your Free Customized Report"
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-green-600">Thank you! Your report is on its way.</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="secondary" 
                className="flex-1"
                onClick={handleResultsClose.bind(null, false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </div>
  );
};

export default BorrowingCapacity;
