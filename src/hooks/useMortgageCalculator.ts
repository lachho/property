
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MortgageFormData {
  loanAmount: number;
  interestRate: number;
  loanTerm: string;
  repaymentFrequency: 'weekly' | 'fortnightly' | 'monthly';
  loanType: 'principal_and_interest' | 'interest_only';
  additionalRepayments?: number;
}

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  purchaseTimeframe: string;
  privacyPolicy: boolean;
  mortgageDetails: any; // This includes the form data and results
}

export const useMortgageCalculator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate mortgage repayments based on form inputs
  const calculateMortgage = (formData: MortgageFormData) => {
    const { loanAmount, interestRate, loanTerm, repaymentFrequency, loanType, additionalRepayments = 0 } = formData;
    
    // Convert interest rate to decimal and then to per payment period
    const years = parseInt(loanTerm);
    const monthlyInterestRate = interestRate / 100 / 12;
    
    // Calculate number of payment periods
    let numberOfPayments = years * 12; // Monthly payments by default
    let interestRatePerPeriod = monthlyInterestRate;
    let additionalPerPeriod = additionalRepayments;
    
    if (repaymentFrequency === 'weekly') {
      numberOfPayments = years * 52;
      interestRatePerPeriod = interestRate / 100 / 52;
      additionalPerPeriod = additionalRepayments * 12 / 52;
    } else if (repaymentFrequency === 'fortnightly') {
      numberOfPayments = years * 26;
      interestRatePerPeriod = interestRate / 100 / 26;
      additionalPerPeriod = additionalRepayments * 12 / 26;
    }
    
    // Calculate repayment amount using the formula
    let repaymentAmount = 0;
    if (loanType === 'interest_only') {
      repaymentAmount = loanAmount * monthlyInterestRate;
    } else {
      repaymentAmount = loanAmount * 
        (interestRatePerPeriod * Math.pow(1 + interestRatePerPeriod, numberOfPayments)) / 
        (Math.pow(1 + interestRatePerPeriod, numberOfPayments) - 1);
    }
    
    // Convert back to monthly for display purposes
    let monthlyRepayment = repaymentAmount;
    if (repaymentFrequency === 'weekly') {
      monthlyRepayment = repaymentAmount * 52 / 12;
    } else if (repaymentFrequency === 'fortnightly') {
      monthlyRepayment = repaymentAmount * 26 / 12;
    }
    
    // Calculate total repayments
    const totalRepayments = repaymentAmount * numberOfPayments;
    
    // Calculate total interest
    const totalInterest = totalRepayments - loanAmount;
    
    // Calculate payoff date
    const payoffDate = new Date();
    payoffDate.setFullYear(payoffDate.getFullYear() + years);
    
    // Calculate principal and interest percentages
    const principalPercentage = (loanAmount / totalRepayments) * 100;
    const interestPercentage = (totalInterest / totalRepayments) * 100;
    
    // Calculate potential savings with additional repayments
    let potentialSavings = 0;
    if (additionalRepayments > 0 && loanType !== 'interest_only') {
      // Simplified calculation for savings
      // This is a rough approximation - a full amortization schedule would be more accurate
      const reducedTerm = calculateReducedTerm(loanAmount, interestRatePerPeriod, repaymentAmount, additionalPerPeriod, numberOfPayments);
      const reducedTotalPayments = (repaymentAmount + additionalPerPeriod) * reducedTerm;
      potentialSavings = totalRepayments - reducedTotalPayments;
    }
    
    return {
      repaymentAmount: monthlyRepayment,
      totalRepayments,
      totalInterest,
      payoffDate,
      principalPercentage,
      interestPercentage,
      potentialSavings: potentialSavings > 0 ? potentialSavings : undefined,
    };
  };
  
  // Helper function to calculate reduced term with additional repayments
  const calculateReducedTerm = (principal: number, rate: number, payment: number, additionalPayment: number, originalTerm: number) => {
    let balance = principal;
    let term = 0;
    
    while (balance > 0 && term < originalTerm) {
      term++;
      balance = balance * (1 + rate) - payment - additionalPayment;
      if (balance < 0) balance = 0;
    }
    
    return term;
  };

  // Submit lead data to Supabase and send email
  const submitLead = async (data: LeadData) => {
    setIsSubmitting(true);
    
    try {
      // 1. Create user account with email/password
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: generateRandomPassword(), // Generate a secure random password
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // 2. Update profile with financial details
      if (authData.user) {
        const mortgageDetails = data.mortgageDetails;
        
        await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          })
          .eq('id', authData.user.id);
          
        // 3. Send email with mortgage report (using send-email edge function)
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: data.email,
            subject: "Your Personalized Mortgage Report",
            html: generateMortgageReportEmail(data),
            from: "Property Pathfinder <noreply@example.com>"
          }
        });
        
        if (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
      
      toast({
        title: "Success!",
        description: "Your report has been sent to your email.",
      });
      
      return true;
    } catch (error) {
      console.error("Error submitting lead:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your information. Please try again.",
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate a random secure password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Generate HTML email template for mortgage report
  const generateMortgageReportEmail = (data: LeadData) => {
    const { mortgageDetails, firstName } = data;
    const results = mortgageDetails.results;
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      }).format(amount);
    };
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin-bottom: 10px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            .highlight { background-color: #f0f9ff; padding: 15px; border-radius: 5px; }
            .repayment { font-size: 24px; font-weight: bold; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            table th, table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280; }
            .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Personalized Mortgage Report</h1>
              <p>Prepared exclusively for ${firstName}</p>
            </div>
            
            <div class="section highlight">
              <h2>Your Mortgage Summary</h2>
              <p>Based on your inputs, here's what your mortgage looks like:</p>
              <p>Monthly Repayment: <span class="repayment">${formatCurrency(results.repaymentAmount)}</span></p>
              <p>Loan Amount: ${formatCurrency(mortgageDetails.loanAmount)}</p>
              <p>Interest Rate: ${mortgageDetails.interestRate}%</p>
              <p>Loan Term: ${mortgageDetails.loanTerm} years</p>
            </div>
            
            <div class="section">
              <h2>Key Insights</h2>
              <table>
                <tr>
                  <th>Total Repayments</th>
                  <td>${formatCurrency(results.totalRepayments)}</td>
                </tr>
                <tr>
                  <th>Total Interest</th>
                  <td>${formatCurrency(results.totalInterest)}</td>
                </tr>
                <tr>
                  <th>Principal Percentage</th>
                  <td>${results.principalPercentage.toFixed(2)}%</td>
                </tr>
                <tr>
                  <th>Interest Percentage</th>
                  <td>${results.interestPercentage.toFixed(2)}%</td>
                </tr>
                ${results.potentialSavings ? `
                <tr>
                  <th>Potential Savings with Additional Repayments</th>
                  <td>${formatCurrency(results.potentialSavings)}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div class="section">
              <h2>Next Steps</h2>
              <p>A mortgage specialist will contact you shortly to discuss your options and help you find the best mortgage solution for your needs.</p>
              <p>In the meantime, here are some strategies to optimize your mortgage:</p>
              <ul>
                <li>Consider making additional repayments to reduce your interest and loan term</li>
                <li>Set up an offset account to reduce interest calculations</li>
                <li>Review your mortgage regularly to ensure you're getting the best rate</li>
              </ul>
              <center>
                <a href="#" class="cta-button">Book a Free Consultation</a>
              </center>
            </div>
            
            <div class="footer">
              <p>Property Pathfinder | 123 Finance Street, Sydney NSW 2000 | 1800 123 456</p>
              <p>This is a personalized report based on the information you provided. Actual loan terms and conditions may vary.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return {
    calculateMortgage,
    submitLead,
    isSubmitting,
  };
};
