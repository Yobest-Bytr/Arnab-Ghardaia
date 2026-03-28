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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Check the code in our custom table
    const { data: authCode, error: fetchError } = await supabaseAdmin
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', 'email_verification')
      .single();

    if (fetchError || !authCode) {
      return new Response(JSON.stringify({ error: 'Invalid or expired verification code.' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Confirm the user in Supabase Auth internal system
    // This is what fixes the "Email not confirmed" error during login
    if (userId && userId !== 'reset-request') {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
      );
      if (confirmError) throw confirmError;
    }

    // 3. Clean up: Delete the code so it can't be used again
    await supabaseAdmin.from('auth_codes').delete().eq('id', authCode.id);

    return new Response(JSON.stringify({ message: 'Neural identity confirmed.' }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[verify-code] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});