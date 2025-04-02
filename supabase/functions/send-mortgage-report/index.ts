
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the expected request body structure
interface MortgageReportRequest {
  name: string;
  email: string;
  phone: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

// Handler function for the edge function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData: MortgageReportRequest = await req.json();

    // Log the received data
    console.log("Received mortgage report request:", requestData);

    // Format the mortgage data for better readability
    const formattedLoanAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(requestData.loanAmount);

    const formattedMonthlyPayment = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(requestData.monthlyPayment);

    const formattedTotalInterest = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(requestData.totalInterest);

    // In a real implementation, you would send an email here
    // For now, we're just logging what would be sent
    console.log(`
      Would send email to: ${requestData.email}
      Subject: Your Personalized Mortgage Report
      
      Dear ${requestData.name},
      
      Thank you for using our Mortgage Calculator. Below is your personalized mortgage report:
      
      Loan Details:
      - Loan Amount: ${formattedLoanAmount}
      - Interest Rate: ${requestData.interestRate}%
      - Loan Term: ${requestData.loanTerm} years
      
      Payment Information:
      - Monthly Payment: ${formattedMonthlyPayment}
      - Total Interest: ${formattedTotalInterest}
      
      Here are some ways you might be able to improve your mortgage terms:
      1. Consider making extra payments to reduce the principal faster
      2. Explore refinancing options if interest rates drop
      3. Investigate different loan terms (15 vs 30 year)
      4. Look into mortgage points to buy down your interest rate
      
      Would you like to discuss these options with a mortgage specialist? Contact us to explore how we can help you save money on your mortgage.
      
      Best regards,
      The Property Investment Team
    `);

    // Return a success response
    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Mortgage report prepared successfully" 
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    // Log and return any errors
    console.error("Error in send-mortgage-report function:", error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error.message || "An error occurred processing your request" 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
};

// Start the HTTP server
serve(handler);
