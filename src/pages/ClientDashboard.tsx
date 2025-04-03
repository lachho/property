import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define FormData interface for type safety
interface FormData {
  gross_income: string;
  partner_income: string;
  dependants: string;
  existing_loans: string;
  marital_status: string;
}

const ClientDashboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [financialFormOpen, setFinancialFormOpen] = useState(false);

  // Function to handle form submission with proper type conversions
  const handleFinancialUpdate = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Convert string values to numbers
      const updatedData = {
        gross_income: Number(data.gross_income),
        partner_income: data.partner_income ? Number(data.partner_income) : null,
        dependants: Number(data.dependants),
        existing_loans: Number(data.existing_loans),
        marital_status: data.marital_status
      };

      await updateProfile(updatedData);
      
      toast({
        title: "Success",
        description: "Your financial information has been updated.",
      });
      
      setFinancialFormOpen(false);
    } catch (error) {
      console.error("Error updating financial info:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your financial information.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Make sure form default values properly convert to string types for the form
  const form = useForm<FormData>({
    defaultValues: {
      gross_income: profile?.gross_income ? String(profile.gross_income) : "",
      marital_status: profile?.marital_status || "",
      partner_income: profile?.partner_income ? String(profile.partner_income) : "",
      dependants: profile?.dependants ? String(profile.dependants) : "0",
      existing_loans: profile?.existing_loans ? String(profile.existing_loans) : "0",
    },
  });

  return (
    <div>
      <h1>Client Dashboard</h1>
      {/* Rest of your UI components */}
    </div>
  );
};

export default ClientDashboard;
