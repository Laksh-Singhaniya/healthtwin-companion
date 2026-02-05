 // ============================================================================
 // XAI PREDICTIONS EDGE FUNCTION
 // Explainable AI for healthcare risk predictions
 // Uses unified risk calculation engine for consistency
 // ============================================================================
 
 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 import {
   calculateCardiovascularRisk,
   calculateDiabetesRisk,
   calculateFeatureImportance,
   calculateSensitivityCurves,
   generateCounterfactuals,
   calculateWaterfallData,
   buildPatientFeatures,
   CARDIOVASCULAR_WEIGHTS,
   DIABETES_WEIGHTS,
   type PatientFeatures,
 } from "../_shared/riskEngine.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 // Generate AI explanation using Lovable AI
 async function generateAIExplanation(
   features: PatientFeatures,
   cardiovascularRisk: number,
   diabetesRisk: number,
   topFactors: Array<{ feature: string; importance: number; direction: string }>,
   counterfactuals: Array<{ scenario: string; riskReduction: number }>
 ): Promise<string> {
   const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
   
   if (!LOVABLE_API_KEY) {
     return generateFallbackExplanation(cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
   }
   
   const prompt = `You are a healthcare AI providing personalized health risk explanations. Generate a clear, empathetic explanation.
 
 Patient Data:
 - Cardiovascular Risk: ${cardiovascularRisk.toFixed(1)}%
 - Diabetes Risk: ${diabetesRisk.toFixed(1)}%
 - Age: ${features.age}
 - BMI: ${features.bmi.toFixed(1)}
 - Blood Pressure: ${features.systolic_bp}/${features.diastolic_bp} mmHg
 - Blood Glucose: ${features.blood_glucose} mg/dL
 
 Top Contributing Factors:
 ${topFactors.slice(0, 3).map(f => `- ${f.feature}: ${f.direction === "increases_risk" ? "increases" : "decreases"} risk by ${Math.abs(f.importance).toFixed(1)}%`).join("\n")}
 
 Potential Improvements:
 ${counterfactuals.slice(0, 2).map(c => `- ${c.scenario}: Could reduce risk by ${c.riskReduction.toFixed(1)}%`).join("\n")}
 
 Write a 2-paragraph personalized explanation that:
 1. Summarizes risk level accessibly
 2. Provides actionable suggestions
 3. Reminds to consult healthcare professionals
 
 Keep it supportive and under 200 words.`;
 
   try {
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash",
         messages: [
           { role: "system", content: "You are a compassionate healthcare AI. Be concise and supportive." },
           { role: "user", content: prompt }
         ],
         max_tokens: 300,
       }),
     });
 
     if (!response.ok) {
       console.error("[xai-predictions] AI API error:", response.status);
       return generateFallbackExplanation(cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
     }
 
     const data = await response.json();
     return data.choices?.[0]?.message?.content || generateFallbackExplanation(cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
   } catch (error) {
     console.error("[xai-predictions] AI error:", error);
     return generateFallbackExplanation(cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
   }
 }
 
 function generateFallbackExplanation(
   cardiovascularRisk: number,
   diabetesRisk: number,
   topFactors: Array<{ feature: string; importance: number; direction: string }>,
   counterfactuals: Array<{ scenario: string; riskReduction: number }>
 ): string {
   const cvRiskLevel = cardiovascularRisk < 10 ? "low" : cardiovascularRisk < 20 ? "moderate" : "elevated";
   const diabetesRiskLevel = diabetesRisk < 10 ? "low" : diabetesRisk < 20 ? "moderate" : "elevated";
   
   let explanation = `Your cardiovascular risk is ${cvRiskLevel} at ${cardiovascularRisk.toFixed(1)}%, and diabetes risk is ${diabetesRiskLevel} at ${diabetesRisk.toFixed(1)}%. `;
   
   const increasingFactors = topFactors.filter(f => f.direction === "increases_risk");
   if (increasingFactors.length > 0) {
     explanation += `Main contributing factors: ${increasingFactors.slice(0, 2).map(f => f.feature.toLowerCase()).join(" and ")}. `;
   }
   
   if (counterfactuals.length > 0) {
     explanation += `\n\nImproving your ${counterfactuals[0].scenario.toLowerCase()} could reduce risk by ~${counterfactuals[0].riskReduction.toFixed(1)}%.`;
   }
   
   explanation += `\n\nThis analysis is educational only. Consult your healthcare provider for personalized advice.`;
   
   return explanation;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   const startTime = Date.now();
   console.log("[xai-predictions] Starting XAI analysis");
 
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
 
     const { whatIfValues } = await req.json().catch(() => ({}));
 
     // Optimized parallel data fetching
     console.log("[xai-predictions] Fetching patient data");
     const [profileResult, vitalsResult] = await Promise.all([
       supabaseClient.from("health_profiles").select("*").eq("user_id", userId).maybeSingle(),
       supabaseClient.from("vital_signs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(5),
     ]);
 
     const fetchTime = Date.now() - startTime;
     console.log(`[xai-predictions] Data fetched in ${fetchTime}ms`);
 
     // Build features using shared engine
     const latestVitals = vitalsResult.data?.[0];
     const features = buildPatientFeatures(profileResult.data, latestVitals);
 
     // Apply what-if values if provided
     const analysisFeatures: PatientFeatures = whatIfValues 
       ? { ...features, ...whatIfValues } 
       : features;
 
     // Calculate using unified engine
     const calcStartTime = Date.now();
     const cvResult = calculateCardiovascularRisk(analysisFeatures);
     const diabetesResult = calculateDiabetesRisk(analysisFeatures);
 
     const cardiovascularRisk = cvResult.riskPercentage;
     const diabetesRisk = diabetesResult.riskPercentage;
 
     // Calculate XAI components using shared functions
     const cardiovascularImportance = calculateFeatureImportance(analysisFeatures, CARDIOVASCULAR_WEIGHTS, "cardiovascular");
     const diabetesImportance = calculateFeatureImportance(analysisFeatures, DIABETES_WEIGHTS, "diabetes");
     const cardiovascularSensitivity = calculateSensitivityCurves(analysisFeatures, CARDIOVASCULAR_WEIGHTS);
     const diabetesSensitivity = calculateSensitivityCurves(analysisFeatures, DIABETES_WEIGHTS);
     const cardiovascularCounterfactuals = generateCounterfactuals(analysisFeatures, CARDIOVASCULAR_WEIGHTS, cardiovascularRisk);
     const diabetesCounterfactuals = generateCounterfactuals(analysisFeatures, DIABETES_WEIGHTS, diabetesRisk);
     const cardiovascularWaterfall = calculateWaterfallData(analysisFeatures, CARDIOVASCULAR_WEIGHTS, 7.5, "cardiovascular");
     const diabetesWaterfall = calculateWaterfallData(analysisFeatures, DIABETES_WEIGHTS, 8.0, "diabetes");
 
     const calcTime = Date.now() - calcStartTime;
     console.log(`[xai-predictions] XAI calculations in ${calcTime}ms`);
 
     // Global feature importance
     const globalImportance = [
       { feature: "BMI", weight: 0.24, category: "Lifestyle" },
       { feature: "Blood Glucose", weight: 0.20, category: "Metabolic" },
       { feature: "Blood Pressure", weight: 0.18, category: "Cardiovascular" },
       { feature: "Age", weight: 0.15, category: "Demographic" },
       { feature: "Smoking", weight: 0.12, category: "Lifestyle" },
       { feature: "Heart Rate", weight: 0.06, category: "Cardiovascular" },
       { feature: "Oxygen Saturation", weight: 0.05, category: "Respiratory" },
     ];
 
     // Generate AI explanation
     const explanation = await generateAIExplanation(
       analysisFeatures,
       cardiovascularRisk,
       diabetesRisk,
       cardiovascularImportance,
       cardiovascularCounterfactuals
     );
 
     const totalTime = Date.now() - startTime;
     console.log(`[xai-predictions] Total time: ${totalTime}ms`);
 
     const response = {
       currentFeatures: features,
       analysisFeatures,
       cardiovascular: {
         risk: cardiovascularRisk,
         riskLevel: cvResult.riskLevel,
         featureImportance: cardiovascularImportance,
         sensitivityCurves: cardiovascularSensitivity,
         counterfactuals: cardiovascularCounterfactuals,
         waterfall: cardiovascularWaterfall,
       },
       diabetes: {
         risk: diabetesRisk,
         riskLevel: diabetesResult.riskLevel,
         featureImportance: diabetesImportance,
         sensitivityCurves: diabetesSensitivity,
         counterfactuals: diabetesCounterfactuals,
         waterfall: diabetesWaterfall,
       },
       globalImportance,
       explanation,
       generatedAt: new Date().toISOString(),
       _debug: { fetchTime, calcTime, totalTime },
     };
 
     return new Response(JSON.stringify(response), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
 
   } catch (error) {
     console.error("[xai-predictions] Error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });