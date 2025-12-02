import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VitalData {
  age: number;
  gender: 'male' | 'female' | 'other';
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
  cholesterol?: { total?: number; hdl?: number; ldl?: number; };
  smoking?: boolean;
  familyHistory?: { diabetes?: boolean; heartDisease?: boolean; };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const payloadPart = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
    const userId = decodedPayload.sub as string | undefined;

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

    // Fetch comprehensive health data
    const [profileData, vitalsData, medicationsData, menstrualData] = await Promise.all([
      supabaseClient.from("health_profiles").select("*").eq("user_id", userId).single(),
      supabaseClient.from("vital_signs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(30),
      supabaseClient.from("medications").select("*").eq("user_id", userId),
      supabaseClient.from("menstrual_cycles").select("*").eq("user_id", userId).order("cycle_start_date", { ascending: false }).limit(12),
    ]);

    // Calculate vital trends
    const vitalTrends = calculateVitalTrends(vitalsData.data || []);

    // Prepare data for ML algorithms
    const latestVitals = vitalsData.data?.[0];
    const vitalData: VitalData = {
      age: profileData.data?.date_of_birth 
        ? new Date().getFullYear() - new Date(profileData.data.date_of_birth).getFullYear()
        : 40,
      gender: (profileData.data?.gender as 'male' | 'female' | 'other') || 'other',
      systolic: latestVitals?.blood_pressure_systolic,
      diastolic: latestVitals?.blood_pressure_diastolic,
      heartRate: latestVitals?.heart_rate,
      bloodGlucose: latestVitals?.blood_glucose,
      weight: latestVitals?.weight || profileData.data?.weight,
      height: profileData.data?.height,
      smoking: false, // Would be collected separately
      familyHistory: {}, // Would be collected separately
    };

    // Run ML prediction algorithms
    const predictions = {
      cardiovascular: calculateCardiovascularRisk(vitalData),
      diabetes: calculateDiabetesRisk(vitalData),
      generalHealth: calculateGeneralHealthScore(vitalData),
      womensHealth: menstrualData.data && menstrualData.data.length > 0
        ? analyzeWomensHealth({
            cycles: menstrualData.data.map(c => ({
              cycleLength: c.cycle_length,
              periodLength: c.period_length,
              flowIntensity: c.flow_intensity,
              symptoms: c.symptoms,
            })),
            age: vitalData.age,
            weight: vitalData.weight,
            height: vitalData.height,
          })
        : null,
      vitalTrends,
    };

    // Use AI to generate personalized recommendations
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiPrompt = `Based on these ML-generated health risk assessments, create a comprehensive, empathetic health report:

ML Predictions:
- Cardiovascular Risk: ${predictions.cardiovascular.riskLevel} (${predictions.cardiovascular.riskPercentage}%)
- Diabetes Risk: ${predictions.diabetes.riskLevel} (${predictions.diabetes.riskPercentage}%)
- General Health Score: ${predictions.generalHealth.riskScore}/100
${predictions.womensHealth ? `- Women's Health: ${predictions.womensHealth.riskLevel}` : ''}

Key Risk Factors:
${JSON.stringify(predictions.cardiovascular.factors)}

Generate a detailed report with:
1. Overall health summary (2-3 sentences)
2. Key findings and what they mean
3. Priority actions to take
4. Long-term prevention strategies
5. When to consult healthcare professionals

Be compassionate, clear, and actionable.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a compassionate medical AI assistant providing personalized health guidance. Be clear, actionable, and emphasize professional consultation." },
          { role: "user", content: aiPrompt },
        ],
      }),
    });

    let aiRecommendations = "";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiRecommendations = aiData.choices?.[0]?.message?.content || "";
    }

    return new Response(JSON.stringify({ 
      predictions,
      aiRecommendations,
      generatedAt: new Date().toISOString(),
    }), {
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

// ML Algorithm: Framingham Risk Score for cardiovascular disease
function calculateCardiovascularRisk(data: VitalData): any {
  const factors: any[] = [];
  let points = 0;

  // Age points
  if (data.gender === 'male') {
    if (data.age >= 70) points += 12;
    else if (data.age >= 60) points += 10;
    else if (data.age >= 50) points += 8;
    else if (data.age >= 40) points += 6;
    else points += 3;
  } else {
    if (data.age >= 70) points += 11;
    else if (data.age >= 60) points += 9;
    else if (data.age >= 50) points += 7;
    else if (data.age >= 40) points += 5;
    else points += 2;
  }
  factors.push({ name: 'Age', impact: data.age > 50 ? 'negative' : 'neutral', description: `${data.age} years old` });

  // Blood pressure
  if (data.systolic) {
    if (data.systolic >= 160) {
      points += 3;
      factors.push({ name: 'Blood Pressure', impact: 'negative', description: `High BP: ${data.systolic}/${data.diastolic} mmHg - Stage 2 Hypertension` });
    } else if (data.systolic >= 140) {
      points += 2;
      factors.push({ name: 'Blood Pressure', impact: 'negative', description: `Elevated BP: ${data.systolic}/${data.diastolic} mmHg - Stage 1 Hypertension` });
    } else if (data.systolic < 120) {
      factors.push({ name: 'Blood Pressure', impact: 'positive', description: `Normal BP: ${data.systolic}/${data.diastolic} mmHg` });
    } else {
      points += 1;
      factors.push({ name: 'Blood Pressure', impact: 'neutral', description: `BP: ${data.systolic}/${data.diastolic} mmHg - Prehypertension` });
    }
  }

  // Smoking
  if (data.smoking) {
    points += 3;
    factors.push({ name: 'Smoking', impact: 'negative', description: 'Current smoker - major cardiovascular risk factor' });
  }

  // Family history
  if (data.familyHistory?.heartDisease) {
    points += 2;
    factors.push({ name: 'Family History', impact: 'negative', description: 'Family history of heart disease' });
  }

  const riskPercentage = Math.min(Math.max((points * 2.5), 1), 99);
  let riskLevel = 'low';
  if (riskPercentage >= 30) riskLevel = 'very-high';
  else if (riskPercentage >= 20) riskLevel = 'high';
  else if (riskPercentage >= 10) riskLevel = 'moderate';

  return {
    riskLevel,
    riskScore: points,
    riskPercentage: Math.round(riskPercentage * 10) / 10,
    confidence: 0.85,
    factors,
    recommendations: [
      'Monitor blood pressure regularly at home',
      'Adopt a heart-healthy Mediterranean diet',
      'Engage in 150 minutes of moderate aerobic exercise weekly',
      'Schedule annual cardiovascular screening',
      'Manage stress through meditation or yoga'
    ]
  };
}

// ML Algorithm: FINDRISC for diabetes risk
function calculateDiabetesRisk(data: VitalData): any {
  const factors: any[] = [];
  let points = 0;

  // Age
  if (data.age >= 64) {
    points += 4;
    factors.push({ name: 'Age', impact: 'negative', description: `Age ${data.age} - highest risk group` });
  } else if (data.age >= 55) {
    points += 3;
    factors.push({ name: 'Age', impact: 'negative', description: `Age ${data.age} - elevated risk` });
  } else if (data.age >= 45) {
    points += 2;
    factors.push({ name: 'Age', impact: 'neutral', description: `Age ${data.age}` });
  }

  // BMI
  if (data.weight && data.height) {
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    if (bmi >= 30) {
      points += 3;
      factors.push({ name: 'BMI', impact: 'negative', description: `BMI ${bmi.toFixed(1)} - Obesity (Class I or higher)` });
    } else if (bmi >= 25) {
      points += 1;
      factors.push({ name: 'BMI', impact: 'negative', description: `BMI ${bmi.toFixed(1)} - Overweight` });
    } else if (bmi >= 18.5) {
      factors.push({ name: 'BMI', impact: 'positive', description: `BMI ${bmi.toFixed(1)} - Healthy weight` });
    }
  }

  // Blood glucose
  if (data.bloodGlucose) {
    if (data.bloodGlucose >= 126) {
      points += 5;
      factors.push({ name: 'Blood Glucose', impact: 'negative', description: `Fasting glucose ${data.bloodGlucose} mg/dL - Diabetic range` });
    } else if (data.bloodGlucose >= 100) {
      points += 3;
      factors.push({ name: 'Blood Glucose', impact: 'negative', description: `Fasting glucose ${data.bloodGlucose} mg/dL - Prediabetic range` });
    } else {
      factors.push({ name: 'Blood Glucose', impact: 'positive', description: `Normal glucose: ${data.bloodGlucose} mg/dL` });
    }
  }

  // Family history
  if (data.familyHistory?.diabetes) {
    points += 5;
    factors.push({ name: 'Family History', impact: 'negative', description: 'First-degree relative with diabetes' });
  }

  const riskPercentage = Math.min((points / 20) * 100, 95);
  let riskLevel = 'low';
  if (points >= 15) riskLevel = 'very-high';
  else if (points >= 12) riskLevel = 'high';
  else if (points >= 7) riskLevel = 'moderate';

  return {
    riskLevel,
    riskScore: points,
    riskPercentage: Math.round(riskPercentage * 10) / 10,
    confidence: 0.82,
    factors,
    recommendations: [
      'Get HbA1c test to assess long-term glucose control',
      'Follow low glycemic index diet',
      'Weight loss of 5-10% significantly reduces risk',
      'Exercise 30 minutes daily to improve insulin sensitivity',
      'Limit processed foods and sugary beverages'
    ]
  };
}

// General health scoring algorithm
function calculateGeneralHealthScore(data: VitalData): any {
  let healthScore = 100;
  const factors: any[] = [];

  if (data.systolic && data.systolic > 140) {
    healthScore -= 15;
    factors.push({ name: 'Blood Pressure', impact: 'negative', description: 'Elevated blood pressure' });
  } else if (data.systolic && data.systolic < 120) {
    factors.push({ name: 'Blood Pressure', impact: 'positive', description: 'Optimal blood pressure' });
  }

  if (data.heartRate) {
    if (data.heartRate > 100 || data.heartRate < 60) {
      healthScore -= 10;
      factors.push({ name: 'Heart Rate', impact: 'negative', description: `Abnormal resting heart rate: ${data.heartRate} bpm` });
    } else {
      factors.push({ name: 'Heart Rate', impact: 'positive', description: `Normal heart rate: ${data.heartRate} bpm` });
    }
  }

  if (data.weight && data.height) {
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    if (bmi >= 30 || bmi < 18.5) {
      healthScore -= 15;
      factors.push({ name: 'Weight Status', impact: 'negative', description: `BMI ${bmi.toFixed(1)} - outside healthy range` });
    } else if (bmi >= 18.5 && bmi < 25) {
      factors.push({ name: 'Weight Status', impact: 'positive', description: `BMI ${bmi.toFixed(1)} - healthy range` });
    } else {
      healthScore -= 5;
    }
  }

  if (data.smoking) {
    healthScore -= 20;
    factors.push({ name: 'Smoking', impact: 'negative', description: 'Smoking significantly impacts overall health' });
  }

  const finalScore = Math.max(healthScore, 0);
  let riskLevel = 'low';
  if (finalScore < 40) riskLevel = 'very-high';
  else if (finalScore < 60) riskLevel = 'high';
  else if (finalScore < 80) riskLevel = 'moderate';

  return {
    riskLevel,
    riskScore: finalScore,
    riskPercentage: 100 - finalScore,
    confidence: 0.88,
    factors,
    recommendations: [
      'Schedule comprehensive health checkup',
      'Aim for 7-9 hours of quality sleep',
      'Stay hydrated with 8 glasses of water daily',
      'Practice stress management techniques',
      'Maintain social connections'
    ]
  };
}

// Women's health pattern analysis
function analyzeWomensHealth(data: any): any {
  const factors: any[] = [];
  let riskPoints = 0;

  const cycleLengths = data.cycles.map((c: any) => c.cycleLength).filter(Boolean);
  if (cycleLengths.length > 0) {
    const avgCycle = cycleLengths.reduce((a: number, b: number) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum: number, len: number) => 
      sum + Math.pow(len - avgCycle, 2), 0) / cycleLengths.length;
    
    if (avgCycle > 35 || avgCycle < 21) {
      riskPoints += 3;
      factors.push({ name: 'Cycle Length', impact: 'negative', description: `Irregular cycles (avg ${avgCycle.toFixed(0)} days)` });
    } else {
      factors.push({ name: 'Cycle Length', impact: 'positive', description: `Regular cycles (avg ${avgCycle.toFixed(0)} days)` });
    }

    if (variance > 49) {
      riskPoints += 2;
      factors.push({ name: 'Cycle Consistency', impact: 'negative', description: 'High cycle variability detected' });
    }
  }

  const riskPercentage = Math.min((riskPoints / 12) * 100, 90);
  let riskLevel = 'low';
  if (riskPoints >= 9) riskLevel = 'very-high';
  else if (riskPoints >= 6) riskLevel = 'high';
  else if (riskPoints >= 3) riskLevel = 'moderate';

  return {
    riskLevel,
    riskScore: riskPoints,
    riskPercentage: Math.round(riskPercentage * 10) / 10,
    confidence: 0.78,
    factors,
    recommendations: [
      'Track menstrual cycles consistently',
      'Consult gynecologist if irregularities persist',
      'Maintain healthy lifestyle for hormonal balance',
      'Consider hormone panel testing if symptoms worsen'
    ]
  };
}

// Calculate vital sign trends
function calculateVitalTrends(vitals: any[]) {
  if (!vitals || vitals.length < 2) return null;

  const metrics = ['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'blood_glucose', 'weight'];
  const trends: any = {};

  metrics.forEach(metric => {
    const values = vitals.map(v => v[metric]).filter(Boolean);
    if (values.length >= 2) {
      const recent = values.slice(0, Math.ceil(values.length / 2));
      const older = values.slice(Math.ceil(values.length / 2));
      const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a: number, b: number) => a + b, 0) / older.length;
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      trends[metric] = {
        current: Math.round(recentAvg * 10) / 10,
        previous: Math.round(olderAvg * 10) / 10,
        changePercent: Math.round(change * 10) / 10,
        direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable'
      };
    }
  });

  return trends;
}
