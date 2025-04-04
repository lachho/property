
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define schema for financial profile
const financialProfileSchema = z.object({
  gross_income: z.coerce.number().min(0, "Must be a positive number"),
  partner_income: z.coerce.number().min(0, "Must be a positive number").optional().nullable(),
  dependants: z.coerce.number().min(0, "Must be a positive number"),
  existing_loans: z.coerce.number().min(0, "Must be a positive number"),
  marital_status: z.string().min(1, "Please select an option"),
});

type FinancialProfileData = z.infer<typeof financialProfileSchema>;

interface FinancialProfileFormProps {
  defaultValues: FinancialProfileData;
  onSubmit: (data: FinancialProfileData) => Promise<void>;
  isSubmitting: boolean;
}

const FinancialProfileForm: React.FC<FinancialProfileFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<FinancialProfileData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Financial Profile</CardTitle>
        <CardDescription>
          Update your financial details to get accurate borrowing capacity calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
  );
};

export default FinancialProfileForm;
