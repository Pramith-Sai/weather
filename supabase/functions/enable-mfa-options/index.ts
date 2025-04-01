
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client using service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Verify environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request to get user ID
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('Missing user_id in request body');
    }
    
    console.log(`Enabling MFA options for user: ${user_id}`);
    
    // Call Supabase Admin API to enable MFA for the user
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { app_metadata: { mfa_enabled: true } }
    );
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'MFA options enabled for user',
        user: data.user
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error enabling MFA options:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to enable MFA options'
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
