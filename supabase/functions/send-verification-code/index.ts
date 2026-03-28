import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMTP_USER = "yobest.bytr47@gmail.com";
const SMTP_PASS = "rwnjbedwmqqrysrj"; 

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, userId } = await req.json();
    console.log(`[send-verification-code] Request for: ${email}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // UUID Fix
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUserId = (userId && uuidRegex.test(userId)) ? userId : null;

    const { error: insertError } = await supabaseAdmin.from('auth_codes').insert({
      user_id: validUserId,
      email: email,
      code: code,
      expires_at: expiresAt,
    });

    if (insertError) throw insertError;

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: SMTP_USER,
      password: SMTP_PASS,
    });

    await client.send({
      from: SMTP_USER,
      to: email,
      subject: 'Yobest Studio - Verification Code',
      content: `Your code is: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 15px; max-width: 400px; margin: auto;">
          <h2 style="color: #8b5cf6; text-align: center;">Neural Identity Verification</h2>
          <p style="text-align: center; color: #666;">Enter the following code to initialize your account:</p>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #06b6d4; text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px; margin: 20px 0;">${code}</div>
          <p style="color: #999; font-size: 11px; text-align: center;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    await client.close();
    console.log(`[send-verification-code] Success for ${email}`);
    return new Response(JSON.stringify({ message: 'Code sent.' }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[send-verification-code] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});