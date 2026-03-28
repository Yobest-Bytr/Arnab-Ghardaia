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
    console.log(`[send-verification-code] Request for ${email}`);

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required.' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the real user ID if the one provided is a placeholder
    let targetUserId = userId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!userId || !uuidRegex.test(userId)) {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.find(u => u.email === email);
      targetUserId = user?.id || null;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin.from('auth_codes').insert({
      user_id: targetUserId,
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
      subject: 'Aranib Farm - Verification Code',
      content: `Your code is: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: #f8fafc; text-align: center;">
          <div style="background: white; padding: 40px; border-radius: 24px; max-width: 400px; margin: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <h2 style="color: #059669; margin-bottom: 8px;">Confirm Your Identity</h2>
            <p style="color: #64748b; font-size: 14px;">Enter this code to access your farm dashboard:</p>
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #0f172a; padding: 30px; background: #ecfdf5; border-radius: 16px; margin: 24px 0;">${code}</div>
            <p style="color: #94a3b8; font-size: 12px;">This code expires in 10 minutes.</p>
          </div>
        </div>
      `,
    });

    await client.close();
    return new Response(JSON.stringify({ message: 'Code sent.' }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});