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
    console.log(`[verify-code] Verifying ${email}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Check code
    const { data: authCode, error: fetchError } = await supabaseAdmin
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    if (fetchError || !authCode) {
      return new Response(JSON.stringify({ error: 'Invalid or expired code.' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Find User ID from profiles table (Stable SQL lookup)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    // 3. Confirm Email in Auth (Direct ID update is stable)
    if (profile?.id) {
      console.log(`[verify-code] Confirming email for ${profile.id}`);
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, { 
        email_confirm: true 
      });
      if (confirmError) console.error("[verify-code] Auth Update Error:", confirmError.message);
    } else {
      console.warn("[verify-code] No profile found for email, skipping auth confirmation.");
    }

    // 4. Cleanup
    await supabaseAdmin.from('auth_codes').delete().eq('id', authCode.id);

    return new Response(JSON.stringify({ message: 'Identity confirmed.' }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[verify-code] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});