
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BorrowingCapacityResult from '@/components/BorrowingCapacityResult';
import { useBorrowingCapacity, BorrowingFormData, LeadData } from '@/hooks/useBorrowingCapacity';

const formSchema = z.object({
  grossIncome: z.coerce.number().min(1, "Income must be greater than 0"),
  maritalStatus: z.string().min(1, "Please select marital status"),
  partnerIncome: z.coerce.number().optional(),
  dependants: z.coerce.number().min(0, "Cannot be negative"),
  existingLoans: z.coerce.number().min(0, "Cannot be negative"),
});

const BorrowingCapacity = () => {
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const calculatedCapacity = calculateCapacity(data);
      setBorrowingCapacity(calculatedCapacity);
      setFormData(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error calculating borrowing capacity:", error);
    }
  };

  const closeResults = () => {
    setShowResults(false);
  };

  const handleLeadSubmission = async (leadData: LeadData) => {
    if (!formData) return;
    
    const success = await submitLead(leadData, formData, borrowingCapacity);
    if (success) {
      // Close modal after successful submission
      setShowResults(false);
    }
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

          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="grossIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Annual Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
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
                  name="partnerIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner's Annual Income ($) (If applicable)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
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
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="existingLoans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Loans/Debts ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Calculate My Borrowing Capacity
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      {showResults && (
        <BorrowingCapacityResult 
          borrowingCapacity={borrowingCapacity} 
          onClose={closeResults}
          onLeadSubmit={handleLeadSubmission}
          isSubmitting={isSubmitting}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default BorrowingCapacity;
