import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const dailyApiKey = Deno.env.get('DAILY_API_KEY')!;

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { appointment_id } = await req.json();
    console.log('Creating video room for appointment:', appointment_id);

    if (!appointment_id) {
      return new Response(
        JSON.stringify({ error: 'appointment_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to this appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If room already exists, return it
    if (appointment.video_room_url) {
      console.log('Room already exists:', appointment.video_room_url);
      return new Response(
        JSON.stringify({ 
          room_url: appointment.video_room_url,
          room_name: appointment.video_room_name 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Daily.co room
    const roomName = `appointment-${appointment_id}-${Date.now()}`;
    const expiryTime = Math.floor(Date.now() / 1000) + (60 * 60 * 2); // 2 hours from now

    const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: expiryTime,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: 'cloud',
          max_participants: 2,
        },
      }),
    });

    if (!dailyResponse.ok) {
      const errorText = await dailyResponse.text();
      console.error('Daily.co API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create video room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const room = await dailyResponse.json();
    console.log('Created Daily.co room:', room);

    // Update appointment with room URL using service role
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: updateError } = await supabaseService
      .from('appointments')
      .update({
        video_room_url: room.url,
        video_room_name: room.name,
      })
      .eq('id', appointment_id);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        room_url: room.url,
        room_name: room.name 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create video room error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
