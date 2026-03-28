import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, code } = await req.json();
    console.log(`[verify-code] Verifying code for ${email}`);

    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Validate code
    const { data: authCode, error: fetchError } = await supabaseAdmin
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    if (fetchError || !authCode) {
      console.error("[verify-code] Invalid code for", email);
      return new Response(JSON.stringify({ error: 'Invalid or expired code.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Confirm Email (Safe Try-Catch)
    if (authCode.user_id) {
      try {
        console.log(`[verify-code] Attempting to confirm email for user: ${authCode.user_id}`);
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authCode.user_id, { 
          email_confirm: true 
        });
        if (confirmError) console.error("[verify-code] Auth Confirmation Error:", confirmError.message);
        else console.log("[verify-code] Email confirmed successfully.");
      } catch (e: any) {
        console.error("[verify-code] Auth Admin Call Failed:", e.message);
      }
    }

    // 3. Cleanup used code
    await supabaseAdmin.from('auth_codes').delete().eq('id', authCode.id);

    return new Response(JSON.stringify({ message: 'Identity confirmed.' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("[verify-code] Critical Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});