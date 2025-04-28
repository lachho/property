import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';

export interface MortgageFormData {
  loanAmount: number;
  interestRate: number;
  loanTerm: string;
  repaymentFrequency: "weekly" | "fortnightly" | "monthly";
  loanType: "principal_and_interest" | "interest_only";
  additionalRepayments: number;
}

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  purchaseTimeframe: string;
  privacyPolicy: boolean;
  mortgageDetails: {
    loanAmount: number;
    interestRate: number;
    loanTerm: string;
    repaymentFrequency: "weekly" | "fortnightly" | "monthly";
    loanType: "principal_and_interest" | "interest_only";
    additionalRepayments: number;
    results: any;
  };
}

export const useMortgageCalculator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateMortgage = (data: MortgageFormData) => {
    const { loanAmount, interestRate, loanTerm, repaymentFrequency, loanType, additionalRepayments } = data;
    
    // Convert interest rate from percentage to decimal
    const rate = interestRate / 100;
    
    // Convert years to number of payment periods
    const numberOfPayments = parseInt(loanTerm) * getPaymentsPerYear(repaymentFrequency);
    
    // Calculate interest rate per payment period
    const ratePerPeriod = rate / getPaymentsPerYear(repaymentFrequency);
    
    // Calculate repayment amount
    let repaymentAmount = 0;
    
    if (loanType === "interest_only") {
      repaymentAmount = loanAmount * ratePerPeriod;
    } else {
      // principal_and_interest: M = P[r(1+r)^n]/[(1+r)^n-1]
      const numerator = ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments);
      const denominator = Math.pow(1 + ratePerPeriod, numberOfPayments) - 1;
      repaymentAmount = loanAmount * (numerator / denominator);
    }
    
    // Calculate total repayments
    const regularTotalRepayments = repaymentAmount * numberOfPayments;
    
    // Calculate total interest
    const totalInterest = regularTotalRepayments - (loanType === "principal_and_interest" ? loanAmount : 0);
    
    // Calculate time saved with additional repayments (if any)
    let timeWithAdditionalRepayments = 0;
    let interestSaved = 0;
    
    if (additionalRepayments > 0 && loanType === "principal_and_interest") {
      const totalMonthlyRepayment = 
        convertPaymentToMonthly(repaymentAmount, repaymentFrequency) + 
        additionalRepayments;
      
      // Simplified calculation - in reality this would be more complex
      const yearsWithAdditional = 
        Math.log(totalMonthlyRepayment / (totalMonthlyRepayment - (loanAmount * (rate / 12)))) / 
        Math.log(1 + (rate / 12));
      
      timeWithAdditionalRepayments = yearsWithAdditional * 12; // In months
      
      // Calculate interest saved
      const totalRepaymentsWithAdditional = totalMonthlyRepayment * timeWithAdditionalRepayments;
      interestSaved = totalInterest - (totalRepaymentsWithAdditional - loanAmount);
    }
    
    // Calculate loan payoff date
    const now = new Date();
    const payoffDate = new Date();
    
    if (loanType === "principal_and_interest") {
      if (additionalRepayments > 0 && timeWithAdditionalRepayments > 0) {
        payoffDate.setMonth(now.getMonth() + Math.round(timeWithAdditionalRepayments));
      } else {
        payoffDate.setFullYear(now.getFullYear() + parseInt(loanTerm));
      }
    } else {
      // For interest only, the loan is not paid off within the term
      payoffDate.setFullYear(now.getFullYear() + parseInt(loanTerm));
    }
    
    return {
      repaymentAmount,
      repaymentFrequency,
      totalRepayments: regularTotalRepayments,
      totalInterest,
      payoffDate,
      loanType,
      additionalRepayments,
      interestSaved: additionalRepayments > 0 ? interestSaved : 0,
      timeSaved: additionalRepayments > 0 ? parseInt(loanTerm) * 12 - timeWithAdditionalRepayments : 0,
      marketComparisonRate: (interestRate + 0.5) // Simplified - just adding 0.5% for comparison
    };
  };
  
  const submitLead = async (data: LeadData) => {
    try {
      setIsSubmitting(true);
      
      console.log("Submitting lead data:", data);
      
      // Submit basic lead information to Spring Boot backend
      const response = await apiService.submitMortgageLead({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        loanAmount: data.mortgageDetails.loanAmount,
        interestRate: data.mortgageDetails.interestRate,
        loanTerm: data.mortgageDetails.loanTerm,
        repaymentFrequency: data.mortgageDetails.repaymentFrequency,
        loanType: data.mortgageDetails.loanType
      });
      
      console.log("Lead submitted to backend:", response.data);
      
      toast({
        title: "Lead Submitted",
        description: "Thank you for your submission. We'll be in touch soon."
      });
      
      return { success: true };
    } catch (error: unknown) {
      console.error("Error submitting lead:", error);
      
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive"
      });
      
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get number of payments per year
  const getPaymentsPerYear = (frequency: "weekly" | "fortnightly" | "monthly") => {
    switch (frequency) {
      case "weekly": return 52;
      case "fortnightly": return 26;
      case "monthly": return 12;
    }
  };
  
  // Helper function to convert any payment to monthly equivalent
  const convertPaymentToMonthly = (
    amount: number, 
    frequency: "weekly" | "fortnightly" | "monthly"
  ) => {
    switch (frequency) {
      case "weekly": return amount * 52 / 12;
      case "fortnightly": return amount * 26 / 12;
      case "monthly": return amount;
    }
  };
  
  // Helper to generate a random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };
  
  return {
    calculateMortgage,
    submitLead,
    isSubmitting
  };
};
