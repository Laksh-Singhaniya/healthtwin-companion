 // ============================================================================
 // HEALTH PREDICTIONS EDGE FUNCTION
 // Uses unified risk calculation engine for consistent predictions
 // ============================================================================
 
 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
 import {
   calculateCardiovascularRisk,
   calculateDiabetesRisk,
   calculateGeneralHealthScore,
   analyzeWomensHealth,
   calculateVitalTrends,
   buildPatientFeatures,
 } from "../_shared/riskEngine.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   const startTime = Date.now();
   console.log("[health-predictions] Starting prediction generation");
 
   try {
     const authHeader = req.headers.get("Authorization");
     if (!authHeader?.startsWith("Bearer ")) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const token = authHeader.replace("Bearer ", "");
     const payloadPart = token.split(".")[1];
     const decodedPayload = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
     const userId = decodedPayload.sub as string;
 
     if (!userId) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const supabaseClient = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
     );
 
     // Optimized parallel data fetching
     console.log("[health-predictions] Fetching patient data");
     const [profileData, vitalsData, menstrualData] = await Promise.all([
       supabaseClient.from("health_profiles").select("*").eq("user_id", userId).maybeSingle(),
       supabaseClient.from("vital_signs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(30),
       supabaseClient.from("menstrual_cycles").select("*").eq("user_id", userId).order("cycle_start_date", { ascending: false }).limit(12),
     ]);
 
     const fetchTime = Date.now() - startTime;
     console.log(`[health-predictions] Data fetched in ${fetchTime}ms`);
 
     // Build patient features from data
     const latestVitals = vitalsData.data?.[0];
     const features = buildPatientFeatures(profileData.data, latestVitals);
 
     // Calculate predictions using unified engine
     const calcStartTime = Date.now();
     const predictions = {
       cardiovascular: calculateCardiovascularRisk(features),
       diabetes: calculateDiabetesRisk(features),
       generalHealth: calculateGeneralHealthScore(features),
       womensHealth: menstrualData.data && menstrualData.data.length > 0
         ? analyzeWomensHealth({
             cycles: menstrualData.data.map(c => ({
               cycleLength: c.cycle_length,
               periodLength: c.period_length,
               flowIntensity: c.flow_intensity,
               symptoms: c.symptoms,
             })),
             age: features.age,
             weight: features.weight,
             height: features.height,
           })
         : null,
       vitalTrends: calculateVitalTrends(vitalsData.data || []),
     };
 
     const calcTime = Date.now() - calcStartTime;
     console.log(`[health-predictions] Predictions calculated in ${calcTime}ms`);
 
     // Generate AI recommendations
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     let aiRecommendations = "";
 
     if (LOVABLE_API_KEY) {
       const aiStartTime = Date.now();
       const aiPrompt = `Based on these health risk assessments, create a concise, empathetic health report:
 
 Risk Summary:
 - Cardiovascular Risk: ${predictions.cardiovascular.riskLevel} (${predictions.cardiovascular.riskPercentage}%)
 - Diabetes Risk: ${predictions.diabetes.riskLevel} (${predictions.diabetes.riskPercentage}%)
 - General Health Score: ${predictions.generalHealth.riskScore}/100
 ${predictions.womensHealth ? `- Women's Health: ${predictions.womensHealth.riskLevel}` : ''}
 
 Top Risk Factors:
 ${predictions.cardiovascular.factors.filter(f => f.impact === 'negative').slice(0, 3).map(f => `- ${f.name}: ${f.description}`).join('\n')}
 
 Generate a brief report (under 300 words) with:
 1. Overall health summary (2 sentences)
 2. Top 3 priority actions
 3. Brief reminder to consult healthcare professionals
 
 Be compassionate and actionable.`;
 
       try {
         const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
           method: "POST",
           headers: {
             Authorization: `Bearer ${LOVABLE_API_KEY}`,
             "Content-Type": "application/json",
           },
           body: JSON.stringify({
             model: "google/gemini-2.5-flash",
             messages: [
               { role: "system", content: "You are a compassionate medical AI assistant. Be concise and actionable." },
               { role: "user", content: aiPrompt },
             ],
             max_tokens: 400,
           }),
         });
 
         if (aiResponse.ok) {
           const aiData = await aiResponse.json();
           aiRecommendations = aiData.choices?.[0]?.message?.content || "";
         }
       } catch (e) {
         console.error("[health-predictions] AI error:", e);
       }
 
       const aiTime = Date.now() - aiStartTime;
       console.log(`[health-predictions] AI response in ${aiTime}ms`);
     }
 
     const totalTime = Date.now() - startTime;
     console.log(`[health-predictions] Total time: ${totalTime}ms`);
 
     return new Response(JSON.stringify({
       predictions,
       aiRecommendations,
       generatedAt: new Date().toISOString(),
       _debug: { fetchTime, calcTime, totalTime },
     }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
 
   } catch (error) {
     console.error("[health-predictions] Error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });
