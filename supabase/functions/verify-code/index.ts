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
    console.log(`[verify-code] Attempting verification for: ${email}`);

    if (!email || !code) {
      console.error("[verify-code] Error: Missing email or code in request.");
      return new Response(JSON.stringify({ error: 'Email and code are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Validate the code exists in our table for this email
    console.log(`[verify-code] Checking database for ${email} with code ${code}...`);
    const { data: authCode, error: fetchError } = await supabaseAdmin
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    if (fetchError || !authCode) {
      console.error("[verify-code] Verification Failed: Invalid or expired code for", email);
      return new Response(JSON.stringify({ error: 'Invalid or expired code.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Cleanup the used code
    console.log(`[verify-code] Code validated. Deleting record ID: ${authCode.id}`);
    const { error: deleteError } = await supabaseAdmin
      .from('auth_codes')
      .delete()
      .eq('id', authCode.id);

    if (deleteError) {
      console.warn("[verify-code] Warning: Failed to delete used code record:", deleteError.message);
    }

    console.log(`[verify-code] Success: Identity confirmed for ${email}`);
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