import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

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
      console.log("Submitting borrowing capacity lead data:", { leadData, formData, borrowingCapacity });
      
      // Submit to backend API
      const response = await apiService.submitBorrowingLead({
        firstName: leadData.name.split(' ')[0],
        lastName: leadData.name.split(' ').slice(1).join(' '),
          email: leadData.email,
          phone: leadData.phone,
          grossIncome: formData.grossIncome,
        partnerIncome: formData.partnerIncome || null,
          dependants: formData.dependants,
          existingLoans: formData.existingLoans,
          maritalStatus: formData.maritalStatus,
          borrowingCapacity: borrowingCapacity
      });

      console.log("Borrowing capacity lead submitted to backend:", response.data);

      toast({
        title: "Success!",
        description: "Your report will be emailed to you shortly."
      });

      return true;
    } catch (error: unknown) {
      console.error("Error in lead submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit your information. Please try again."
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
