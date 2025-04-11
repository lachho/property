
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
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

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
});

interface BorrowingCapacityResultProps {
  borrowingCapacity: number;
  onClose: () => void;
  onLeadSubmit: (data: z.infer<typeof leadFormSchema>) => void;
  isSubmitting?: boolean;
}

const BorrowingCapacityResult: React.FC<BorrowingCapacityResultProps> = ({
  borrowingCapacity,
  onClose,
  onLeadSubmit,
  isSubmitting = false,
}) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  const form = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const formattedAmount = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(borrowingCapacity);

  const handleGetReportClick = () => {
    setShowLeadForm(true);
  };

  const onSubmit = (data: z.infer<typeof leadFormSchema>) => {
    onLeadSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Your Borrowing Capacity</DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-3">
              {formattedAmount}
            </div>
            <p className="text-gray-500">Estimated Borrowing Capacity</p>
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

          {!showLeadForm ? (
            <div className="text-center">
              <h3 className="font-medium mb-2">Want to know how to increase your borrowing power?</h3>
              <Button onClick={handleGetReportClick} className="mt-2">
                Get Your Free Customized Report
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="font-medium mb-4 text-center">Complete your details to receive your free report</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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

export default BorrowingCapacityResult;
