
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MortgageReportRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  purchaseTimeframe: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: string;
  repaymentFrequency: string;
  loanType: string;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  payoffDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const data: MortgageReportRequest = await req.json();
    
    console.log("Received mortgage report request:", data);

    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    // Format the purchase timeframe to be more readable
    let purchaseTimeframeText = "Unknown";
    switch (data.purchaseTimeframe) {
      case "already-own":
        purchaseTimeframeText = "Already owns property";
        break;
      case "next-3-months":
        purchaseTimeframeText = "Within 3 months";
        break;
      case "next-6-months":
        purchaseTimeframeText = "Within 6 months";
        break;
      case "next-12-months":
        purchaseTimeframeText = "Within 12 months";
        break;
      case "just-researching":
        purchaseTimeframeText = "Just researching";
        break;
    }

    // Format loan type
    const loanTypeText = data.loanType === 'interest-only' ? 'Interest Only' : 'Principal & Interest';
    
    // Format payment frequency
    let frequencyText = "Monthly";
    switch (data.repaymentFrequency) {
      case "weekly":
        frequencyText = "Weekly";
        break;
      case "fortnightly":
        frequencyText = "Fortnightly";
        break;
    }

    // Format email content
    const emailContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background-color: #f8f4e5;
              padding: 20px;
              text-align: center;
            }
            .logo {
              max-width: 150px;
            }
            h1 {
              color: #9b5c00;
              margin-top: 5px;
            }
            .container {
              padding: 20px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #9b5c00;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #eee;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f5f5f5;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              text-align: right;
            }
            .highlight {
              background-color: #f8f4e5;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .cta {
              background-color: #9b5c00;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin-top: 15px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://example.com/logo.png" alt="Company Logo" class="logo">
            <h1>Your Mortgage Report</h1>
          </div>
          
          <div class="container">
            <p>Hello ${data.firstName},</p>
            
            <p>Thank you for using our Mortgage Calculator. Here's your personalized mortgage report based on the information you provided.</p>
            
            <div class="section">
              <div class="section-title">Your Loan Details</div>
              <div class="detail-row">
                <span class="label">Loan Amount:</span>
                <span class="value">$${data.loanAmount.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Interest Rate:</span>
                <span class="value">${data.interestRate}%</span>
              </div>
              <div class="detail-row">
                <span class="label">Loan Term:</span>
                <span class="value">${data.loanTerm} years</span>
              </div>
              <div class="detail-row">
                <span class="label">Repayment Frequency:</span>
                <span class="value">${frequencyText}</span>
              </div>
              <div class="detail-row">
                <span class="label">Loan Type:</span>
                <span class="value">${loanTypeText}</span>
              </div>
              <div class="detail-row">
                <span class="label">Purchase Timeframe:</span>
                <span class="value">${purchaseTimeframeText}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Your Repayment Summary</div>
              <div class="highlight">
                <div class="detail-row" style="border-bottom: none;">
                  <span class="label">${frequencyText} Repayment:</span>
                  <span class="value" style="font-size: 20px; font-weight: bold;">$${data.monthlyPayment.toLocaleString()}</span>
                </div>
              </div>
              <div class="detail-row">
                <span class="label">Total Repayment:</span>
                <span class="value">$${data.totalRepayment.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Interest:</span>
                <span class="value">$${data.totalInterest.toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Loan Payoff Date:</span>
                <span class="value">${data.payoffDate}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Next Steps</div>
              <p>Based on your mortgage calculation, here are some recommendations:</p>
              <ul>
                <li>Consider seeking pre-approval if you're planning to purchase within the next 3-6 months.</li>
                <li>Compare different loan products and features to find the best fit for your situation.</li>
                <li>Consider making additional repayments to reduce the total interest paid over the life of the loan.</li>
                <li>Review your budget to ensure the repayments are sustainable long-term.</li>
              </ul>
              
              <p>Would you like personalized advice from our mortgage specialists? Our team can help you find the best loan options and strategies to save money on your mortgage.</p>
              
              <center>
                <a href="https://example.com/consultation" class="cta">Book a Free Consultation</a>
              </center>
            </div>
            
            <div class="footer">
              <p>This report is based on the information you provided and current market rates. Actual loan terms may vary.</p>
              <p>© 2025 Your Company Name. All rights reserved.</p>
              <p>123 Financial Street, Sydney NSW 2000 | (02) 9876 5432</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const { error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to: data.email,
        subject: "Your Personalized Mortgage Report",
        html: emailContent,
      }
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Mortgage report email sent successfully to:", data.email);

    return new Response(
      JSON.stringify({ success: true, message: "Mortgage report email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in send-mortgage-report function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
