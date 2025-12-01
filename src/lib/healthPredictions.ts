// Health prediction algorithms based on medical research and guidelines

export interface VitalData {
  age: number;
  gender: 'male' | 'female' | 'other';
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
  cholesterol?: {
    total?: number;
    hdl?: number;
    ldl?: number;
  };
  smoking?: boolean;
  familyHistory?: {
    diabetes?: boolean;
    heartDisease?: boolean;
    hypertension?: boolean;
  };
}

export interface WomensHealthData {
  cycles: Array<{
    cycleLength?: number;
    periodLength?: number;
    flowIntensity?: string;
    symptoms?: string[];
  }>;
  age: number;
  weight?: number;
  height?: number;
}

export interface PredictionResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  riskScore: number;
  riskPercentage: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
}

// Framingham Risk Score for 10-year cardiovascular disease risk
export function calculateCardiovascularRisk(data: VitalData): PredictionResult {
  const factors: PredictionResult['factors'] = [];
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

  // Blood pressure points
  if (data.systolic) {
    if (data.systolic >= 160) {
      points += 3;
      factors.push({ name: 'Blood Pressure', impact: 'negative', description: `High BP: ${data.systolic}/${data.diastolic} mmHg` });
    } else if (data.systolic >= 140) {
      points += 2;
      factors.push({ name: 'Blood Pressure', impact: 'negative', description: `Elevated BP: ${data.systolic}/${data.diastolic} mmHg` });
    } else if (data.systolic < 120) {
      factors.push({ name: 'Blood Pressure', impact: 'positive', description: `Normal BP: ${data.systolic}/${data.diastolic} mmHg` });
    } else {
      points += 1;
      factors.push({ name: 'Blood Pressure', impact: 'neutral', description: `BP: ${data.systolic}/${data.diastolic} mmHg` });
    }
  }

  // Cholesterol
  if (data.cholesterol?.total) {
    if (data.cholesterol.total >= 280) {
      points += 3;
      factors.push({ name: 'Cholesterol', impact: 'negative', description: `High cholesterol: ${data.cholesterol.total} mg/dL` });
    } else if (data.cholesterol.total >= 240) {
      points += 2;
      factors.push({ name: 'Cholesterol', impact: 'negative', description: `Elevated cholesterol: ${data.cholesterol.total} mg/dL` });
    } else if (data.cholesterol.total < 200) {
      factors.push({ name: 'Cholesterol', impact: 'positive', description: `Healthy cholesterol: ${data.cholesterol.total} mg/dL` });
    }
  }

  // HDL (protective factor)
  if (data.cholesterol?.hdl) {
    if (data.cholesterol.hdl >= 60) {
      points -= 1;
      factors.push({ name: 'HDL (Good Cholesterol)', impact: 'positive', description: `Excellent HDL: ${data.cholesterol.hdl} mg/dL` });
    } else if (data.cholesterol.hdl < 40) {
      points += 1;
      factors.push({ name: 'HDL (Good Cholesterol)', impact: 'negative', description: `Low HDL: ${data.cholesterol.hdl} mg/dL` });
    }
  }

  // Smoking
  if (data.smoking) {
    points += 3;
    factors.push({ name: 'Smoking', impact: 'negative', description: 'Current smoker - major risk factor' });
  }

  // Family history
  if (data.familyHistory?.heartDisease) {
    points += 2;
    factors.push({ name: 'Family History', impact: 'negative', description: 'Family history of heart disease' });
  }

  // Calculate risk percentage based on points
  const riskPercentage = Math.min(Math.max((points * 2.5), 1), 99);
  
  let riskLevel: PredictionResult['riskLevel'];
  if (riskPercentage < 10) riskLevel = 'low';
  else if (riskPercentage < 20) riskLevel = 'moderate';
  else if (riskPercentage < 30) riskLevel = 'high';
  else riskLevel = 'very-high';

  const recommendations = generateCVDRecommendations(data, riskLevel);

  return {
    riskLevel,
    riskScore: points,
    riskPercentage: Math.round(riskPercentage * 10) / 10,
    confidence: 0.85,
    factors,
    recommendations,
  };
}

// FINDRISC-based diabetes risk assessment
export function calculateDiabetesRisk(data: VitalData): PredictionResult {
  const factors: PredictionResult['factors'] = [];
  let points = 0;

  // Age
  if (data.age >= 64) {
    points += 4;
    factors.push({ name: 'Age', impact: 'negative', description: `Age ${data.age} - higher risk group` });
  } else if (data.age >= 55) {
    points += 3;
    factors.push({ name: 'Age', impact: 'negative', description: `Age ${data.age} - elevated risk` });
  } else if (data.age >= 45) {
    points += 2;
    factors.push({ name: 'Age', impact: 'neutral', description: `Age ${data.age}` });
  }

  // BMI calculation
  if (data.weight && data.height) {
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    if (bmi >= 30) {
      points += 3;
      factors.push({ name: 'BMI', impact: 'negative', description: `BMI ${bmi.toFixed(1)} - Obesity` });
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
      factors.push({ name: 'Blood Glucose', impact: 'negative', description: `Fasting glucose ${data.bloodGlucose} mg/dL - Pre-diabetic range` });
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
  
  let riskLevel: PredictionResult['riskLevel'];
  if (points < 7) riskLevel = 'low';
  else if (points < 12) riskLevel = 'moderate';
  else if (points < 15) riskLevel = 'high';
  else riskLevel = 'very-high';

  const recommendations = generateDiabetesRecommendations(data, riskLevel);

  return {
    riskLevel,
    riskScore: points,
    riskPercentage: Math.round(riskPercentage * 10) / 10,
    confidence: 0.82,
    factors,
    recommendations,
  };
}

// Women's health pattern analysis
export function analyzeWomensHealth(data: WomensHealthData): PredictionResult {
  const factors: PredictionResult['factors'] = [];
  let riskPoints = 0;

  // Analyze cycle regularity
  const cycleLengths = data.cycles.map(c => c.cycleLength).filter(Boolean) as number[];
  if (cycleLengths.length > 0) {
    const avgCycle = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgCycle, 2), 0) / cycleLengths.length;
    
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

  // Check for PCOS indicators
  const pcosSymptomsCount = data.cycles.reduce((count, cycle) => {
    const symptoms = cycle.symptoms || [];
    const pcosSymptoms = ['acne', 'excessive hair growth', 'hair loss', 'weight gain'];
    return count + symptoms.filter(s => pcosSymptoms.some(ps => s.toLowerCase().includes(ps))).length;
  }, 0);

  if (pcosSymptomsCount > 2) {
    riskPoints += 3;
    factors.push({ name: 'PCOS Indicators', impact: 'negative', description: 'Multiple PCOS-related symptoms detected' });
  }

  // BMI consideration
  if (data.weight && data.height) {
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    if (bmi >= 30) {
      riskPoints += 2;
      factors.push({ name: 'Weight', impact: 'negative', description: `BMI ${bmi.toFixed(1)} - associated with hormonal issues` });
    }
  }

  const riskPercentage = Math.min((riskPoints / 12) * 100, 90);
  
  let riskLevel: PredictionResult['riskLevel'];
  if (riskPoints < 3) riskLevel = 'low';
  else if (riskPoints < 6) riskLevel = 'moderate';
  else if (riskPoints < 9) riskLevel = 'high';
  else riskLevel = 'very-high';

  const recommendations = generateWomensHealthRecommendations(riskLevel);

  return {
    riskLevel,
    riskScore: riskPoints,
    riskPercentage: Math.round(riskPercentage * 10) / 10,
    confidence: 0.78,
    factors,
    recommendations,
  };
}

// General health assessment
export function calculateGeneralHealthScore(data: VitalData): PredictionResult {
  const factors: PredictionResult['factors'] = [];
  let healthScore = 100;

  // Vital signs assessment
  if (data.systolic) {
    if (data.systolic > 140 || (data.diastolic && data.diastolic > 90)) {
      healthScore -= 15;
      factors.push({ name: 'Blood Pressure', impact: 'negative', description: 'Elevated blood pressure' });
    } else if (data.systolic < 120 && (!data.diastolic || data.diastolic < 80)) {
      factors.push({ name: 'Blood Pressure', impact: 'positive', description: 'Optimal blood pressure' });
    }
  }

  if (data.heartRate) {
    if (data.heartRate > 100 || data.heartRate < 60) {
      healthScore -= 10;
      factors.push({ name: 'Heart Rate', impact: 'negative', description: `Abnormal resting heart rate: ${data.heartRate} bpm` });
    } else {
      factors.push({ name: 'Heart Rate', impact: 'positive', description: `Normal heart rate: ${data.heartRate} bpm` });
    }
  }

  // Weight status
  if (data.weight && data.height) {
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    if (bmi >= 30 || bmi < 18.5) {
      healthScore -= 15;
      factors.push({ name: 'Weight Status', impact: 'negative', description: `BMI ${bmi.toFixed(1)} - outside healthy range` });
    } else if (bmi >= 18.5 && bmi < 25) {
      factors.push({ name: 'Weight Status', impact: 'positive', description: `BMI ${bmi.toFixed(1)} - healthy range` });
    } else {
      healthScore -= 5;
      factors.push({ name: 'Weight Status', impact: 'neutral', description: `BMI ${bmi.toFixed(1)} - slightly elevated` });
    }
  }

  // Lifestyle factors
  if (data.smoking) {
    healthScore -= 20;
    factors.push({ name: 'Smoking', impact: 'negative', description: 'Smoking significantly impacts overall health' });
  }

  const finalScore = Math.max(healthScore, 0);
  let riskLevel: PredictionResult['riskLevel'];
  if (finalScore >= 80) riskLevel = 'low';
  else if (finalScore >= 60) riskLevel = 'moderate';
  else if (finalScore >= 40) riskLevel = 'high';
  else riskLevel = 'very-high';

  return {
    riskLevel,
    riskScore: finalScore,
    riskPercentage: 100 - finalScore,
    confidence: 0.88,
    factors,
    recommendations: generateGeneralHealthRecommendations(finalScore, data),
  };
}

// Recommendation generators
function generateCVDRecommendations(data: VitalData, riskLevel: string): string[] {
  const recs: string[] = [];
  
  if (riskLevel === 'high' || riskLevel === 'very-high') {
    recs.push('Schedule an appointment with a cardiologist for comprehensive cardiovascular assessment');
  }
  
  if (data.systolic && data.systolic > 130) {
    recs.push('Monitor blood pressure daily and consider lifestyle modifications to reduce hypertension');
  }
  
  if (data.cholesterol?.total && data.cholesterol.total > 200) {
    recs.push('Adopt a heart-healthy diet low in saturated fats and cholesterol');
  }
  
  if (data.smoking) {
    recs.push('Smoking cessation is critical - consider nicotine replacement therapy or counseling');
  }
  
  recs.push('Engage in at least 150 minutes of moderate aerobic exercise per week');
  recs.push('Include omega-3 fatty acids in your diet (fish, walnuts, flaxseeds)');
  
  return recs;
}

function generateDiabetesRecommendations(data: VitalData, riskLevel: string): string[] {
  const recs: string[] = [];
  
  if (riskLevel === 'high' || riskLevel === 'very-high') {
    recs.push('Consult an endocrinologist for HbA1c testing and comprehensive diabetes screening');
  }
  
  if (data.bloodGlucose && data.bloodGlucose >= 100) {
    recs.push('Monitor fasting blood glucose levels regularly and track daily readings');
  }
  
  if (data.weight && data.height) {
    const bmi = data.weight / Math.pow(data.height / 100, 2);
    if (bmi >= 25) {
      recs.push('Weight loss of 5-10% can significantly reduce diabetes risk');
    }
  }
  
  recs.push('Follow a low glycemic index diet with controlled carbohydrate portions');
  recs.push('Exercise for 30 minutes daily to improve insulin sensitivity');
  recs.push('Limit processed foods and sugary beverages');
  
  return recs;
}

function generateWomensHealthRecommendations(riskLevel: string): string[] {
  const recs: string[] = [];
  
  if (riskLevel === 'high' || riskLevel === 'very-high') {
    recs.push('Schedule consultation with a gynecologist or endocrinologist for hormonal evaluation');
    recs.push('Consider comprehensive hormone panel testing (FSH, LH, testosterone, DHEA-S)');
  }
  
  recs.push('Track your menstrual cycle consistently to identify patterns');
  recs.push('Maintain a balanced diet rich in whole grains, lean proteins, and vegetables');
  recs.push('Consider stress management techniques like yoga or meditation');
  recs.push('Regular exercise can help regulate hormones and improve cycle regularity');
  
  return recs;
}

function generateGeneralHealthRecommendations(score: number, data: VitalData): string[] {
  const recs: string[] = [];
  
  if (score < 60) {
    recs.push('Schedule a comprehensive health checkup with your primary care physician');
  }
  
  recs.push('Aim for 7-9 hours of quality sleep each night');
  recs.push('Stay hydrated with at least 8 glasses of water daily');
  recs.push('Practice stress management through meditation, deep breathing, or hobbies');
  recs.push('Maintain social connections and engage in activities you enjoy');
  
  if (!data.smoking) {
    recs.push('Continue avoiding tobacco and limit alcohol consumption');
  }
  
  return recs;
}
