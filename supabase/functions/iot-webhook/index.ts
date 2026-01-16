import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id, x-device-type',
};

interface IoTVitalSignsPayload {
  user_id?: string;
  health_id?: string;
  device_id: string;
  device_type: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  blood_glucose?: number;
  weight?: number;
  temperature?: number;
  oxygen_saturation?: number;
  recorded_at?: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: IoTVitalSignsPayload = await req.json();
    console.log('Received IoT data:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.device_id || !payload.device_type) {
      return new Response(
        JSON.stringify({ error: 'device_id and device_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user_id from health_id if provided
    let userId = payload.user_id;
    if (!userId && payload.health_id) {
      const { data: profile, error: profileError } = await supabase
        .from('health_profiles')
        .select('user_id')
        .eq('health_id', payload.health_id)
        .single();

      if (profileError || !profile) {
        console.error('Error finding user by health_id:', profileError);
        return new Response(
          JSON.stringify({ error: 'Invalid health_id or user not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = profile.user_id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Either user_id or health_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert vital signs data
    const { data, error } = await supabase
      .from('vital_signs')
      .insert({
        user_id: userId,
        device_id: payload.device_id,
        device_type: payload.device_type,
        source: 'iot',
        blood_pressure_systolic: payload.blood_pressure_systolic,
        blood_pressure_diastolic: payload.blood_pressure_diastolic,
        heart_rate: payload.heart_rate,
        blood_glucose: payload.blood_glucose,
        weight: payload.weight,
        temperature: payload.temperature,
        oxygen_saturation: payload.oxygen_saturation,
        recorded_at: payload.recorded_at || new Date().toISOString(),
        notes: payload.notes || `Auto-recorded from ${payload.device_type} (${payload.device_id})`,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting vital signs:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store vital signs', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully stored vital signs:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vital signs recorded successfully',
        data 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('IoT webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
