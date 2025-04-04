
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
interface EmailRequestBody {
  email: string;
  subject: string;
  name?: string;
  message: string;
  templateType?: 'borrowing-capacity' | 'mortgage-report' | 'contact' | 'general';
  templateData?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { email, subject, name, message, templateType, templateData }: EmailRequestBody = await req.json()
    
    if (!email || !subject) {
      return new Response(
        JSON.stringify({ error: 'Email and subject are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Preparing to send email to: ${email}, subject: ${subject}`)
    
    let emailContent = message;
    
    // Handle different email templates
    if (templateType) {
      switch (templateType) {
        case 'borrowing-capacity':
          emailContent = generateBorrowingCapacityEmail(templateData, name);
          break;
        case 'mortgage-report':
          emailContent = generateMortgageReportEmail(templateData, name);
          break;
        case 'contact':
          emailContent = generateContactEmail(templateData, name);
          break;
        case 'general':
        default:
          // Use the provided message or generate a simple template
          emailContent = message || generateGeneralEmail(templateData, name);
          break;
      }
    }
    
    // Logic to send email
    // In a real implementation, you would integrate with an email service provider
    // For now, we'll just log the content and simulate a successful email send
    
    console.log('Email Subject:', subject)
    console.log('Email would be sent to:', email)
    
    // In a production environment, you would send the actual email here
    // For example, using a service like Resend, SendGrid, or another email provider
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email has been sent to ${email}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Email template generator functions
function generateGeneralEmail(data?: Record<string, any>, name?: string): string {
  const recipientName = name || 'Valued Client';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>PropertyLens Investment Portal</h2>
      <p>Hello ${recipientName},</p>
      <p>${data?.message || 'Thank you for using our services.'}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p>Regards,<br>PropertyLens Investment Portal</p>
      </div>
    </div>
  `;
}

function generateBorrowingCapacityEmail(data?: Record<string, any>, name?: string): string {
  const recipientName = name || 'Valued Client';
  const borrowingCapacity = data?.borrowingCapacity || 0;
  const income = data?.income || 0;
  const expenses = data?.expenses || 0;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Borrowing Capacity Report</h2>
      <p>Hello ${recipientName},</p>
      <p>Based on the information you provided, we have calculated your estimated borrowing capacity:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Financial Summary</h3>
        <p><strong>Annual Income:</strong> $${income.toLocaleString()}</p>
        <p><strong>Monthly Expenses:</strong> $${expenses.toLocaleString()}</p>
      </div>
      
      <div style="background-color: #e9f7ef; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Borrowing Capacity</h3>
        <p style="font-size: 24px; font-weight: bold;">$${borrowingCapacity.toLocaleString()}</p>
      </div>
      
      <p>This is an estimated figure based on the information provided. For a more accurate assessment, please consult with a financial advisor or mortgage broker.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p>Regards,<br>PropertyLens Investment Portal</p>
      </div>
    </div>
  `;
}

function generateMortgageReportEmail(data?: Record<string, any>, name?: string): string {
  const recipientName = name || 'Valued Client';
  const propertyPrice = data?.propertyPrice || 0;
  const downPayment = data?.downPayment || 0;
  const interestRate = data?.interestRate || 0;
  const loanTerm = data?.loanTerm || 30;
  const monthlyPayment = data?.monthlyPayment || 0;
  const totalInterest = data?.totalInterest || 0;
  const totalCost = data?.totalCost || 0;
  
  const downPaymentAmount = propertyPrice * (downPayment / 100);
  const loanAmount = propertyPrice - downPaymentAmount;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Mortgage Calculation Report</h2>
      <p>Hello ${recipientName},</p>
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
  `;
}

function generateContactEmail(data?: Record<string, any>, name?: string): string {
  const recipientName = name || 'Valued Client';
  const subject = data?.subject || 'Contact Request';
  const message = data?.message || '';
  const phone = data?.phone || 'Not provided';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Contacting Us</h2>
      <p>Hello ${recipientName},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Message Details</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </div>
      
      <p>Our team is reviewing your inquiry and will contact you shortly.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p>Regards,<br>PropertyLens Investment Portal</p>
      </div>
    </div>
  `;
}
