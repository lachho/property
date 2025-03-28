
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// TODO: Add your Resend API key as a secret in the Supabase dashboard
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BorrowingReportRequest {
  name: string;
  email: string;
  phone: string;
  grossIncome: number;
  partnerIncome?: number;
  dependants: number;
  existingLoans: number;
  maritalStatus: string;
  borrowingCapacity: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      name,
      email,
      phone,
      grossIncome,
      partnerIncome,
      dependants,
      existingLoans,
      maritalStatus,
      borrowingCapacity
    }: BorrowingReportRequest = await req.json();

    // Split the name into first name for personalization
    const firstName = name.split(' ')[0];

    // Generate tips based on the user's data
    const tips = [];
    
    if (existingLoans > 0) {
      tips.push("Consider paying down existing debts to increase your borrowing capacity.");
    }
    
    if (partnerIncome === 0 || !partnerIncome) {
      tips.push("Including a partner's income can significantly increase your borrowing power.");
    }
    
    if (dependants > 2) {
      tips.push("Having multiple dependants impacts your borrowing capacity - consider this when planning.");
    }

    // Add general tips
    tips.push("Maintaining a good credit score can improve your loan terms and borrowing capacity.");
    tips.push("Consider speaking with a St Trinity advisor for personalized strategies to boost your borrowing power.");

    const emailResponse = await resend.emails.send({
      from: "St Trinity Financial <onboarding@resend.dev>", // TODO: Update with your domain once verified in Resend
      to: [email],
      subject: "Your Personalized Borrowing Capacity Report",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Your Borrowing Capacity Report</h1>
          
          <p>Hello ${firstName},</p>
          
          <p>Thank you for using our Borrowing Capacity Calculator. Based on the information you provided, we've prepared this personalized report for you.</p>
          
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Your Estimated Borrowing Capacity</h2>
            <p style="font-size: 24px; font-weight: bold; color: #0066cc; margin: 10px 0;">${formatCurrency(borrowingCapacity)}</p>
            
            <h3>Based on the following information:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li>Gross Annual Income: ${formatCurrency(grossIncome)}</li>
              ${partnerIncome ? `<li>Partner's Income: ${formatCurrency(partnerIncome)}</li>` : ''}
              <li>Marital Status: ${maritalStatus}</li>
              <li>Number of Dependants: ${dependants}</li>
              <li>Existing Loans/Debts: ${formatCurrency(existingLoans)}</li>
            </ul>
          </div>
          
          <h2 style="color: #333;">How to Improve Your Borrowing Capacity</h2>
          
          <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
          
          <div style="background-color: #e6f2ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #0066cc; margin-top: 0;">Take the Next Step</h2>
            <p>For a comprehensive assessment and personalized strategies to maximize your borrowing potential, speak with a St Trinity Financial advisor today.</p>
            <p>Call us at <strong>1800 ST TRINITY</strong> or reply to this email to schedule your complimentary consultation.</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            This is an estimated calculation and does not constitute a loan offer. 
            The actual borrowing capacity may vary based on lender criteria, credit history, and other factors.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-borrowing-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
