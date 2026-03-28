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
    console.log(`[verify-code] Starting verification for ${email}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Validate the code
    const { data: authCode, error: fetchError } = await supabaseAdmin
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    if (fetchError || !authCode) {
      console.error(`[verify-code] Invalid code attempt for ${email}`);
      return new Response(JSON.stringify({ error: 'Invalid or expired code.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Resolve User ID
    let targetUserId = authCode.user_id;
    
    if (!targetUserId) {
      console.log(`[verify-code] No user_id in auth_codes, looking up in profiles for ${email}`);
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (profile) {
        targetUserId = profile.id;
        console.log(`[verify-code] Found user_id in profiles: ${targetUserId}`);
      }
    }

    // 3. Confirm Email in Auth
    if (!targetUserId) {
      console.error(`[verify-code] CRITICAL: No user ID found for ${email}. Cannot confirm email.`);
      return new Response(JSON.stringify({ error: 'User record not found. Please contact support.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[verify-code] Confirming email for user: ${targetUserId}`);
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { 
      email_confirm: true 
    });

    if (confirmError) {
      console.error("[verify-code] Auth Confirmation Error:", confirmError.message);
      throw confirmError;
    }

    console.log("[verify-code] Email confirmed successfully.");

    // 4. Cleanup
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