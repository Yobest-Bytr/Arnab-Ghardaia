import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Polyfill for SmtpClient compatibility in Deno Deploy
// @ts-ignore
if (typeof Deno.writeAll !== 'function') {
  // @ts-ignore
  Deno.writeAll = async function (w: Deno.Writer, arr: Uint8Array) {
    let nwritten = 0;
    while (nwritten < arr.length) {
      nwritten += await w.write(arr.subarray(nwritten));
    }
  };
}

const SMTP_USER = "yobest.bytr47@gmail.com";
const SMTP_PASS = "rwnjbedwmqqrysrj"; 

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, userId } = await req.json();
    console.log(`[send-verification-code] Processing request for ${email}`);

    if (!email || !userId) {
      return new Response(JSON.stringify({ error: 'Email and User ID are required.' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // FIX: Validate UUID to prevent 500 errors when userId is "reset-request"
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUserId = uuidRegex.test(userId) ? userId : null;

    // Store code using service role to bypass RLS
    const { error: insertError } = await supabaseAdmin.from('auth_codes').insert({
      user_id: validUserId,
      email: email,
      code: code,
      purpose: 'email_verification',
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
          <p style="color: #999; font-size: 11px; text-align: center;">This code expires in 10 minutes. If you did not request this, please ignore this transmission.</p>
        </div>
      `,
    });

    await client.close();
    return new Response(JSON.stringify({ message: 'Verification code transmitted.' }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[send-verification-code] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});