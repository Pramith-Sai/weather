
import { supabase } from "@/integrations/supabase/client";

export const enableMfaOptions = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('enable-mfa-options', {
      body: { user_id: userId },
    });

    if (error) {
      console.error('Error enabling MFA options:', error);
      throw new Error(error.message || 'Failed to enable MFA options');
    }

    return data;
  } catch (err) {
    console.error('Error calling enable-mfa-options function:', err);
    throw err;
  }
};
