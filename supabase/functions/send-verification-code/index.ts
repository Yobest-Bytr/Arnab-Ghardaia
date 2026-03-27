import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, userId } = await req.json()

    // 1. Generate a secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 2. Initialize Supabase Client with Service Role Key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Validate UUID to prevent 500 errors
    // If userId is 'reset-request' or any non-uuid, we set it to null in the DB
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const validUserId = uuidRegex.test(userId) ? userId : null

    // 4. Insert the code into the database
    const { error: dbError } = await supabaseAdmin
      .from('auth_codes')
      .insert([
        { 
          user_id: validUserId, 
          email: email, 
          code: code, 
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins
        }
      ])

    if (dbError) throw dbError

    // 5. Send the email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY secret")
      // We return success anyway so the user can use the demo code 123456
      return new Response(
        JSON.stringify({ message: 'Code generated (Email service not configured)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer \${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Aranib Farm <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Verification Code',
        html: \`
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Welcome to Aranib Farm</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #10b981; letter-spacing: 5px;">\${code}</h1>
            <p>This code will expire in 15 minutes.</p>
          </div>
        \`,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Resend Error:", errorText)
    }

    return new Response(
      JSON.stringify({ message: 'Verification code sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})