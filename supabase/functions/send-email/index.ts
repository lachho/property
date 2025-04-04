
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EmailRequest = await req.json();
    console.log(`Preparing to send email to: ${data.to}`);
    
    // This is a placeholder for actual email sending logic
    // In a real implementation, you would integrate with an email service like Resend, SendGrid, etc.
    
    // For now, we'll just log the email content and return a success response
    console.log("Email subject:", data.subject);
    console.log("Email content length:", data.html.length);
    
    // NOTE: In production, uncomment and properly configure this section with a real email provider
    /*
    // Example using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { data: emailResponse, error } = await resend.emails.send({
      from: data.from || "Your Company <noreply@yourcompany.com>",
      to: [data.to],
      subject: data.subject,
      html: data.html,
    });
    
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    */
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully (placeholder)" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    
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
