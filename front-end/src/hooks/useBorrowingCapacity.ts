
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface BorrowingFormData {
  grossIncome: number;
  maritalStatus: string;
  partnerIncome?: number;
  dependants: number;
  existingLoans: number;
}

export interface LeadData {
  name: string;
  email: string;
  phone: string;
}

export const useBorrowingCapacity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const calculateCapacity = (data: BorrowingFormData): number => {
    const totalIncome = data.grossIncome + (data.partnerIncome || 0) - 5000 * data.dependants;
    const borrowingCapacity = totalIncome * 6 - data.existingLoans;
    return Math.max(0, borrowingCapacity);
  };

  const submitLead = async (
    leadData: LeadData, 
    formData: BorrowingFormData, 
    borrowingCapacity: number
  ) => {
    setIsSubmitting(true);
    
    try {
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-10);
      
      // Create a user account through auth to bypass RLS
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: leadData.email,
        password: randomPassword,
        options: {
          data: {
            first_name: leadData.name.split(' ')[0],
            last_name: leadData.name.split(' ').slice(1).join(' '),
            phone: leadData.phone,
            gross_income: formData.grossIncome,
            partner_income: formData.partnerIncome || null,
            dependants: formData.dependants,
            existing_loans: formData.existingLoans,
            marital_status: formData.maritalStatus
          }
        }
      });

      if (authError) throw authError;

      // Send email report using the edge function
      const { error: emailError } = await supabase.functions.invoke('send-borrowing-report', {
        body: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          grossIncome: formData.grossIncome,
          partnerIncome: formData.partnerIncome,
          dependants: formData.dependants,
          existingLoans: formData.existingLoans,
          maritalStatus: formData.maritalStatus,
          borrowingCapacity: borrowingCapacity
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Success!",
        description: "Your report will be emailed to you shortly."
      });
      
      // Sign out the user if they were automatically signed in
      if (authData.user) {
        await supabase.auth.signOut();
      }

      return true;
    } catch (error: any) {
      console.error("Error in lead submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit your information. Please try again."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    calculateCapacity,
    submitLead,
    isSubmitting
  };
};
