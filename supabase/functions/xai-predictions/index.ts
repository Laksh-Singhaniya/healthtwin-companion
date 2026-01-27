import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Population means for feature importance calculation (based on medical literature)
const POPULATION_MEANS = {
  age: 45,
  bmi: 25.5,
  systolic_bp: 120,
  diastolic_bp: 80,
  heart_rate: 72,
  blood_glucose: 100,
  weight: 70,
  smoking: 0,
  oxygen_saturation: 98,
};

// Feature weights for risk models (simplified SHAP-inspired coefficients)
const CARDIOVASCULAR_WEIGHTS = {
  age: 0.025,
  bmi: 0.018,
  systolic_bp: 0.012,
  diastolic_bp: 0.008,
  heart_rate: 0.005,
  blood_glucose: 0.008,
  smoking: 0.15,
  oxygen_saturation: -0.02,
};

const DIABETES_WEIGHTS = {
  age: 0.015,
  bmi: 0.025,
  blood_glucose: 0.02,
  systolic_bp: 0.005,
  weight: 0.008,
  smoking: 0.08,
};

// Calculate BMI from weight and height
function calculateBMI(weight: number, height: number): number {
  if (!weight || !height || height === 0) return POPULATION_MEANS.bmi;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

// Calculate risk using weighted sum with sigmoid normalization
function calculateRisk(features: Record<string, number>, weights: Record<string, number>): number {
  let logOdds = -2.5; // Base log-odds (baseline risk ~7.5%)
  
  for (const [feature, weight] of Object.entries(weights)) {
    const value = features[feature] ?? POPULATION_MEANS[feature as keyof typeof POPULATION_MEANS] ?? 0;
    const mean = POPULATION_MEANS[feature as keyof typeof POPULATION_MEANS] ?? 0;
    const deviation = value - mean;
    logOdds += weight * deviation;
  }
  
  // Sigmoid function to convert log-odds to probability
  const probability = 1 / (1 + Math.exp(-logOdds));
  return Math.min(Math.max(probability * 100, 1), 95); // Clamp between 1-95%
}

// Calculate feature importance using permutation method
function calculateFeatureImportance(
  features: Record<string, number>,
  weights: Record<string, number>,
  riskType: string
): Array<{ feature: string; importance: number; direction: string; currentValue: number; optimalValue: number }> {
  const baseRisk = calculateRisk(features, weights);
  const importances: Array<{ feature: string; importance: number; direction: string; currentValue: number; optimalValue: number }> = [];
  
  for (const [feature, weight] of Object.entries(weights)) {
    const currentValue = features[feature] ?? POPULATION_MEANS[feature as keyof typeof POPULATION_MEANS] ?? 0;
    const mean = POPULATION_MEANS[feature as keyof typeof POPULATION_MEANS] ?? 0;
    
    // Calculate risk with feature set to population mean
    const maskedFeatures = { ...features, [feature]: mean };
    const maskedRisk = calculateRisk(maskedFeatures, weights);
    
    const importance = baseRisk - maskedRisk;
    const direction = importance > 0 ? "increases_risk" : "decreases_risk";
    
    // Determine optimal value (direction that reduces risk)
    const optimalValue = weight > 0 ? Math.min(currentValue, mean * 0.9) : Math.max(currentValue, mean * 1.1);
    
    importances.push({
      feature: formatFeatureName(feature),
      importance: Math.round(importance * 100) / 100,
      direction,
      currentValue: Math.round(currentValue * 10) / 10,
      optimalValue: Math.round(optimalValue * 10) / 10,
    });
  }
  
  return importances.sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
}

// Calculate sensitivity curves for what-if analysis
function calculateSensitivityCurves(
  features: Record<string, number>,
  weights: Record<string, number>
): Record<string, Array<{ value: number; risk: number }>> {
  const curves: Record<string, Array<{ value: number; risk: number }>> = {};
  
  const ranges: Record<string, { min: number; max: number; step: number }> = {
    bmi: { min: 18, max: 40, step: 1 },
    systolic_bp: { min: 90, max: 180, step: 5 },
    blood_glucose: { min: 70, max: 200, step: 10 },
    heart_rate: { min: 50, max: 120, step: 5 },
    weight: { min: 40, max: 120, step: 5 },
  };
  
  for (const [feature, range] of Object.entries(ranges)) {
    if (!(feature in weights)) continue;
    
    curves[feature] = [];
    for (let value = range.min; value <= range.max; value += range.step) {
      const modifiedFeatures = { ...features, [feature]: value };
      const risk = calculateRisk(modifiedFeatures, weights);
      curves[feature].push({ value, risk: Math.round(risk * 10) / 10 });
    }
  }
  
  return curves;
}

// Generate counterfactual scenarios
function generateCounterfactuals(
  features: Record<string, number>,
  weights: Record<string, number>,
  baseRisk: number
): Array<{ scenario: string; currentValue: string; targetValue: string; currentRisk: number; newRisk: number; riskReduction: number }> {
  const counterfactuals: Array<{ scenario: string; currentValue: string; targetValue: string; currentRisk: number; newRisk: number; riskReduction: number }> = [];
  
  const scenarios = [
    { feature: "systolic_bp", target: 120, unit: "mmHg", name: "Blood Pressure" },
    { feature: "bmi", target: 24, unit: "", name: "BMI" },
    { feature: "blood_glucose", target: 95, unit: "mg/dL", name: "Blood Glucose" },
    { feature: "heart_rate", target: 70, unit: "bpm", name: "Heart Rate" },
    { feature: "smoking", target: 0, unit: "", name: "Smoking Status" },
  ];
  
  for (const scenario of scenarios) {
    const currentValue = features[scenario.feature];
    if (currentValue === undefined || currentValue === scenario.target) continue;
    
    const modifiedFeatures = { ...features, [scenario.feature]: scenario.target };
    const newRisk = calculateRisk(modifiedFeatures, weights);
    const riskReduction = baseRisk - newRisk;
    
    if (Math.abs(riskReduction) > 0.5) {
      counterfactuals.push({
        scenario: scenario.name,
        currentValue: scenario.feature === "smoking" 
          ? (currentValue ? "Yes" : "No")
          : `${Math.round(currentValue)}${scenario.unit ? " " + scenario.unit : ""}`,
        targetValue: scenario.feature === "smoking"
          ? "No"
          : `${scenario.target}${scenario.unit ? " " + scenario.unit : ""}`,
        currentRisk: Math.round(baseRisk * 10) / 10,
        newRisk: Math.round(newRisk * 10) / 10,
        riskReduction: Math.round(riskReduction * 10) / 10,
      });
    }
  }
  
  return counterfactuals.sort((a, b) => b.riskReduction - a.riskReduction);
}

// Format feature names for display
function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    age: "Age",
    bmi: "BMI",
    systolic_bp: "Systolic Blood Pressure",
    diastolic_bp: "Diastolic Blood Pressure",
    heart_rate: "Heart Rate",
    blood_glucose: "Blood Glucose",
    weight: "Weight",
    smoking: "Smoking Status",
    oxygen_saturation: "Oxygen Saturation",
  };
  return names[feature] || feature;
}

// Calculate waterfall data for visualization
function calculateWaterfallData(
  features: Record<string, number>,
  weights: Record<string, number>,
  baselineRisk: number
): Array<{ name: string; contribution: number; cumulative: number }> {
  const waterfall: Array<{ name: string; contribution: number; cumulative: number }> = [];
  let cumulative = baselineRisk;
  
  waterfall.push({ name: "Baseline Risk", contribution: baselineRisk, cumulative: baselineRisk });
  
  const importances = calculateFeatureImportance(features, weights, "");
  
  for (const item of importances.slice(0, 6)) {
    cumulative += item.importance;
    waterfall.push({
      name: item.feature,
      contribution: item.importance,
      cumulative: Math.round(cumulative * 10) / 10,
    });
  }
  
  return waterfall;
}

// Generate AI explanation using Lovable AI
async function generateAIExplanation(
  features: Record<string, number>,
  cardiovascularRisk: number,
  diabetesRisk: number,
  topFactors: Array<{ feature: string; importance: number; direction: string }>,
  counterfactuals: Array<{ scenario: string; riskReduction: number }>
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    return generateFallbackExplanation(features, cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
  }
  
  const prompt = `You are a healthcare AI assistant providing personalized health risk explanations. Generate a clear, empathetic explanation of a patient's health risks.

Patient Data:
- Cardiovascular Risk: ${cardiovascularRisk.toFixed(1)}%
- Diabetes Risk: ${diabetesRisk.toFixed(1)}%
- Age: ${features.age || "Unknown"}
- BMI: ${features.bmi?.toFixed(1) || "Unknown"}
- Blood Pressure: ${features.systolic_bp || "Unknown"}/${features.diastolic_bp || "Unknown"} mmHg
- Blood Glucose: ${features.blood_glucose || "Unknown"} mg/dL
- Heart Rate: ${features.heart_rate || "Unknown"} bpm

Top Contributing Factors:
${topFactors.slice(0, 3).map(f => `- ${f.feature}: ${f.direction === "increases_risk" ? "increases" : "decreases"} risk by ${Math.abs(f.importance).toFixed(1)}%`).join("\n")}

Potential Improvements:
${counterfactuals.slice(0, 2).map(c => `- ${c.scenario}: Could reduce risk by ${c.riskReduction.toFixed(1)}%`).join("\n")}

Write a 2-3 paragraph personalized explanation that:
1. Summarizes the overall risk level in accessible language
2. Explains the top contributing factors without being alarming
3. Provides actionable, encouraging suggestions for improvement
4. Ends with a reminder to consult healthcare professionals

Keep the tone supportive and empowering, not scary.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a compassionate healthcare AI that explains medical risks clearly and supportively." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateFallbackExplanation(features, cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateFallbackExplanation(features, cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
  } catch (error) {
    console.error("AI explanation error:", error);
    return generateFallbackExplanation(features, cardiovascularRisk, diabetesRisk, topFactors, counterfactuals);
  }
}

function generateFallbackExplanation(
  features: Record<string, number>,
  cardiovascularRisk: number,
  diabetesRisk: number,
  topFactors: Array<{ feature: string; importance: number; direction: string }>,
  counterfactuals: Array<{ scenario: string; riskReduction: number }>
): string {
  const cvRiskLevel = cardiovascularRisk < 10 ? "low" : cardiovascularRisk < 20 ? "moderate" : "elevated";
  const diabetesRiskLevel = diabetesRisk < 10 ? "low" : diabetesRisk < 20 ? "moderate" : "elevated";
  
  let explanation = `Based on your health data, your cardiovascular risk is currently ${cvRiskLevel} at ${cardiovascularRisk.toFixed(1)}%, and your diabetes risk is ${diabetesRiskLevel} at ${diabetesRisk.toFixed(1)}%. `;
  
  if (topFactors.length > 0) {
    const increasingFactors = topFactors.filter(f => f.direction === "increases_risk");
    const decreasingFactors = topFactors.filter(f => f.direction === "decreases_risk");
    
    if (increasingFactors.length > 0) {
      explanation += `The factors contributing most to your risk include ${increasingFactors.slice(0, 2).map(f => f.feature.toLowerCase()).join(" and ")}. `;
    }
    if (decreasingFactors.length > 0) {
      explanation += `Positively, your ${decreasingFactors[0].feature.toLowerCase()} is helping reduce your overall risk. `;
    }
  }
  
  if (counterfactuals.length > 0) {
    const topChange = counterfactuals[0];
    explanation += `\n\nGood news: our analysis suggests that improving your ${topChange.scenario.toLowerCase()} could reduce your risk by approximately ${topChange.riskReduction.toFixed(1)}%. Small, consistent changes can make a meaningful difference over time.`;
  }
  
  explanation += `\n\nRemember, this analysis is for educational purposes only. Please consult with your healthcare provider for personalized medical advice and before making any changes to your health routine.`;
  
  return explanation;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { analysisType, whatIfValues } = await req.json();

    // Fetch patient data
    const [profileResult, vitalsResult] = await Promise.all([
      adminClient.from("health_profiles").select("*").eq("user_id", userId).maybeSingle(),
      adminClient.from("vital_signs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(10),
    ]);

    const profile = profileResult.data;
    const vitals = vitalsResult.data || [];

    // Calculate age from date of birth
    let age = POPULATION_MEANS.age;
    if (profile?.date_of_birth) {
      const dob = new Date(profile.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
    }

    // Get latest vitals or use defaults
    const latestVitals = vitals[0] || {};
    
    // Build feature set
    const features: Record<string, number> = {
      age,
      bmi: calculateBMI(profile?.weight || latestVitals.weight, profile?.height),
      systolic_bp: latestVitals.blood_pressure_systolic || POPULATION_MEANS.systolic_bp,
      diastolic_bp: latestVitals.blood_pressure_diastolic || POPULATION_MEANS.diastolic_bp,
      heart_rate: latestVitals.heart_rate || POPULATION_MEANS.heart_rate,
      blood_glucose: latestVitals.blood_glucose || POPULATION_MEANS.blood_glucose,
      weight: profile?.weight || latestVitals.weight || POPULATION_MEANS.weight,
      smoking: 0, // Would need to be tracked separately
      oxygen_saturation: latestVitals.oxygen_saturation || POPULATION_MEANS.oxygen_saturation,
    };

    // Apply what-if values if provided
    const analysisFeatures = whatIfValues ? { ...features, ...whatIfValues } : features;

    // Calculate risks
    const cardiovascularRisk = calculateRisk(analysisFeatures, CARDIOVASCULAR_WEIGHTS);
    const diabetesRisk = calculateRisk(analysisFeatures, DIABETES_WEIGHTS);

    // Calculate feature importance
    const cardiovascularImportance = calculateFeatureImportance(analysisFeatures, CARDIOVASCULAR_WEIGHTS, "cardiovascular");
    const diabetesImportance = calculateFeatureImportance(analysisFeatures, DIABETES_WEIGHTS, "diabetes");

    // Calculate sensitivity curves
    const cardiovascularSensitivity = calculateSensitivityCurves(analysisFeatures, CARDIOVASCULAR_WEIGHTS);
    const diabetesSensitivity = calculateSensitivityCurves(analysisFeatures, DIABETES_WEIGHTS);

    // Generate counterfactuals
    const cardiovascularCounterfactuals = generateCounterfactuals(analysisFeatures, CARDIOVASCULAR_WEIGHTS, cardiovascularRisk);
    const diabetesCounterfactuals = generateCounterfactuals(analysisFeatures, DIABETES_WEIGHTS, diabetesRisk);

    // Calculate waterfall data
    const cardiovascularWaterfall = calculateWaterfallData(analysisFeatures, CARDIOVASCULAR_WEIGHTS, 7.5);
    const diabetesWaterfall = calculateWaterfallData(analysisFeatures, DIABETES_WEIGHTS, 8.0);

    // Global feature importance (population-level aggregation simulation)
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

    const response = {
      currentFeatures: features,
      analysisFeatures,
      risks: {
        cardiovascular: Math.round(cardiovascularRisk * 10) / 10,
        diabetes: Math.round(diabetesRisk * 10) / 10,
        overall: Math.round((cardiovascularRisk + diabetesRisk) / 2 * 10) / 10,
      },
      featureImportance: {
        cardiovascular: cardiovascularImportance,
        diabetes: diabetesImportance,
      },
      sensitivityCurves: {
        cardiovascular: cardiovascularSensitivity,
        diabetes: diabetesSensitivity,
      },
      counterfactuals: {
        cardiovascular: cardiovascularCounterfactuals,
        diabetes: diabetesCounterfactuals,
      },
      waterfall: {
        cardiovascular: cardiovascularWaterfall,
        diabetes: diabetesWaterfall,
      },
      globalImportance,
      explanation,
      timestamp: new Date().toISOString(),
    };

    console.log("XAI analysis completed for user:", userId);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("XAI predictions error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
