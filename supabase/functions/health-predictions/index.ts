import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's health data
    const [profileData, vitalsData, medicationsData, allergiesData, menstrualData] = await Promise.all([
      supabaseClient.from("health_profiles").select("*").eq("user_id", user.id).single(),
      supabaseClient.from("vital_signs").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(30),
      supabaseClient.from("medications").select("*").eq("user_id", user.id),
      supabaseClient.from("allergies").select("*").eq("user_id", user.id),
      supabaseClient.from("menstrual_cycles").select("*").eq("user_id", user.id).order("cycle_start_date", { ascending: false }).limit(6),
    ]);

    const healthContext = `
User Health Profile:
- Age: ${profileData.data?.date_of_birth ? new Date().getFullYear() - new Date(profileData.data.date_of_birth).getFullYear() : "N/A"} years
- Gender: ${profileData.data?.gender || "N/A"}
- Blood Type: ${profileData.data?.blood_type || "N/A"}
- Height: ${profileData.data?.height || "N/A"} cm
- Weight: ${profileData.data?.weight || "N/A"} kg

Recent Vital Signs (last 30 readings):
${vitalsData.data?.map(v => `- ${new Date(v.recorded_at).toLocaleDateString()}: BP ${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}, HR ${v.heart_rate}, Temp ${v.temperature}°C, O2 ${v.oxygen_saturation}%, Glucose ${v.blood_glucose}`).join("\n") || "No vital signs recorded"}

Current Medications:
${medicationsData.data?.map(m => `- ${m.name} (${m.dosage}, ${m.frequency})`).join("\n") || "No medications"}

Allergies:
${allergiesData.data?.map(a => `- ${a.allergen} (${a.severity})`).join("\n") || "No allergies"}

Menstrual Cycle History:
${menstrualData.data?.map(m => `- Cycle started ${m.cycle_start_date}, period ${m.period_length} days, cycle ${m.cycle_length} days`).join("\n") || "No cycle data"}
`;

    const systemPrompt = `You are a health analytics AI assistant specializing in predictive health insights. Analyze the user's health data and provide:

1. Health Trend Analysis: Identify patterns in vital signs over time
2. Risk Assessments: Flag any concerning trends or potential health risks
3. Personalized Recommendations: Suggest lifestyle improvements based on data
4. Predictive Insights: Forecast potential health outcomes based on current trends
5. Menstrual Cycle Predictions: If applicable, predict next period dates and fertility windows

Be professional, evidence-based, and always include disclaimers that this is informational and not a substitute for professional medical advice. Format your response in clear sections with bullet points.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this health data and provide comprehensive predictions and insights:\n\n${healthContext}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const predictions = data.choices?.[0]?.message?.content || "No predictions available";

    return new Response(JSON.stringify({ predictions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating predictions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
