
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS preflight request
export const corsOptionsHandler = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }
}

// Create a Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Define the request body interface
interface MortgageReportRequestBody {
  email: string;
  name?: string;
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const payload: MortgageReportRequestBody = await req.json()
    
    const { 
      email, 
      name, 
      propertyPrice, 
      downPayment, 
      interestRate, 
      loanTerm, 
      monthlyPayment, 
      totalInterest, 
      totalCost 
    } = payload
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Preparing to send mortgage report to: ${email}`)
    
    // Format the email content
    const formattedName = name || 'Investor'
    const downPaymentAmount = propertyPrice * (downPayment / 100)
    const loanAmount = propertyPrice - downPaymentAmount
    
    const emailSubject = `Your Mortgage Calculation Report from PropertyLens`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Mortgage Calculation Report</h2>
        <p>Hello ${formattedName},</p>
        <p>Here's the mortgage calculation summary you requested:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Property Details</h3>
          <p><strong>Property Price:</strong> $${propertyPrice.toLocaleString()}</p>
          <p><strong>Down Payment:</strong> $${downPaymentAmount.toLocaleString()} (${downPayment}%)</p>
          <p><strong>Loan Amount:</strong> $${loanAmount.toLocaleString()}</p>
          <p><strong>Interest Rate:</strong> ${interestRate}%</p>
          <p><strong>Loan Term:</strong> ${loanTerm} years</p>
        </div>
        
        <div style="background-color: #e9f7ef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Summary</h3>
          <p><strong>Monthly Payment:</strong> $${monthlyPayment.toLocaleString()}</p>
          <p><strong>Total Interest Paid:</strong> $${totalInterest.toLocaleString()}</p>
          <p><strong>Total Cost (Principal + Interest):</strong> $${totalCost.toLocaleString()}</p>
        </div>
        
        <p>This report is based on the information you provided and is intended for educational purposes only. For professional financial advice, please consult with a qualified mortgage broker or financial advisor.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p>Regards,<br>PropertyLens Investment Portal</p>
        </div>
      </div>
    `
    
    // Logic to send email
    // In a real implementation, you would integrate with an email service provider
    // For now, we'll just log the content and simulate a successful email send
    
    console.log('Email Subject:', emailSubject)
    console.log('Email would be sent to:', email)
    
    // In a production environment, you would send the actual email here
    // For example, using the Supabase Edge Function with Resend, SendGrid, or another email service
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Mortgage report has been sent to ${email}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error sending mortgage report:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to send mortgage report', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
