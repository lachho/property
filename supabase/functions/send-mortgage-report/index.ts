
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { firstName, email, mortgageDetails } = await req.json();

    // Format currency for emails
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const paymentFrequencyText = {
      weekly: "Weekly",
      fortnightly: "Fortnightly",
      monthly: "Monthly"
    }[mortgageDetails.repaymentFrequency] || "Monthly";

    const loanTypeText = mortgageDetails.loanType === 'principal_and_interest' 
      ? 'Principal and Interest' 
      : 'Interest Only';

    // Construct email content
    const emailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .summary { background-color: #f3f4f6; padding: 15px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            table, th, td { border: 1px solid #e5e7eb; }
            th, td { padding: 10px; text-align: left; }
            th { background-color: #f9fafb; }
            .highlight { font-weight: bold; color: #1a56db; }
            .cta { background-color: #1a56db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Personalized Mortgage Report</h1>
            </div>
            <div class="content">
              <p>Dear ${firstName},</p>
              
              <p>Thank you for using our Mortgage Calculator. Here's your personalized report based on the details you provided:</p>
              
              <div class="summary">
                <h2>Loan Summary</h2>
                <p>Loan Amount: <span class="highlight">${formatCurrency(mortgageDetails.loanAmount)}</span></p>
                <p>Interest Rate: <span class="highlight">${mortgageDetails.interestRate}%</span></p>
                <p>Loan Term: <span class="highlight">${mortgageDetails.loanTerm} years</span></p>
                <p>Repayment Type: <span class="highlight">${loanTypeText}</span></p>
              </div>
              
              <h2>Repayment Details</h2>
              <table>
                <tr>
                  <th>${paymentFrequencyText} Repayment</th>
                  <td>${formatCurrency(mortgageDetails.results.repaymentAmount)}</td>
                </tr>
                <tr>
                  <th>Total Interest</th>
                  <td>${formatCurrency(mortgageDetails.results.totalInterest)}</td>
                </tr>
                <tr>
                  <th>Total Repayments</th>
                  <td>${formatCurrency(mortgageDetails.results.totalRepayments)}</td>
                </tr>
              </table>
              
              <h2>How This Compares</h2>
              <p>Your selected interest rate of ${mortgageDetails.interestRate}% is ${mortgageDetails.interestRate < mortgageDetails.results.marketComparisonRate ? 'below' : 'above'} the current market average of ${mortgageDetails.results.marketComparisonRate}%.</p>
              
              <h2>Optimize Your Mortgage</h2>
              <p>Our mortgage specialists can help you:</p>
              <ul>
                <li>Find the best interest rates available</li>
                <li>Structure your loan for optimal tax benefits</li>
                <li>Create a repayment strategy that could save you thousands</li>
              </ul>
              
              <p>Would you like to explore how to further optimize your mortgage? Our experts are ready to help.</p>
              
              <a href="#" class="cta">Schedule a Free Consultation</a>
            </div>
            <div class="footer">
              <p>This report is based on the information you provided and current market conditions. It is meant for illustrative purposes only and does not constitute a loan offer.</p>
              <p>© 2025 PropertyPathfinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // In a real implementation, you would use an email service here
    // For this demonstration, we'll log the email and return success
    console.log(`Would send email to ${email} with mortgage report`);
    
    // Simulate email sending
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Mortgage report sent to ${email}` 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in send-mortgage-report function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 400
      }
    );
  }
});
