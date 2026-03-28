import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, userId, code } = await req.json();
    console.log(`[verify-code] Verifying code for ${email}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Validate the code exists in our table
    const { data: authCode, error: fetchError } = await supabaseAdmin
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    if (fetchError || !authCode) {
      console.error("[verify-code] Invalid code attempt:", email, code);
      return new Response(JSON.stringify({ error: 'Invalid or expired code.' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Resolve the real User ID to confirm the email in Supabase Auth
    let targetId = userId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!targetId || !uuidRegex.test(targetId)) {
      // Use direct lookup instead of listUsers to avoid 500 timeouts
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (!userError && userData?.user) {
        targetId = userData.user.id;
      }
    }

    // 3. Confirm the user in Supabase Auth (prevents the 400 token error on login)
    if (targetId && uuidRegex.test(targetId)) {
      console.log(`[verify-code] Confirming email for user: ${targetId}`);
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(targetId, { 
        email_confirm: true 
      });
      if (confirmError) console.error("[verify-code] Confirmation error:", confirmError.message);
    }

    // 4. Cleanup the code
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