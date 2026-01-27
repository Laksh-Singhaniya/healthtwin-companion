
# XAI Dashboard for Healthcare Risk Prediction

## Overview

This plan implements an Explainable AI (XAI) dashboard that provides transparent, interpretable risk predictions for patient health records. The system will feature SHAP-inspired feature importance calculations, interactive "what-if" counterfactual sliders, and global/local explanation visualizations - all designed for patients to understand their health risks and how lifestyle changes could impact outcomes.

## Architecture

```text
+---------------------------+     +---------------------------+
|     XAI Dashboard Page    |     |    Edge Function          |
|   /health-xai             |<--->|  xai-predictions          |
+---------------------------+     +---------------------------+
           |                                 |
           v                                 v
+---------------------------+     +---------------------------+
|  What-If Sliders          |     |  SHAP-style Feature       |
|  (Counterfactual Analysis)|     |  Importance Calculator    |
+---------------------------+     +---------------------------+
           |                                 |
           v                                 v
+---------------------------+     +---------------------------+
|  Feature Importance       |     |  Counterfactual Engine    |
|  Visualizations           |     |  (Sensitivity Analysis)   |
+---------------------------+     +---------------------------+
           |
           v
+---------------------------+
|  AI-Powered Natural       |
|  Language Explanations    |
+---------------------------+
```

## Implementation Details

### 1. New Edge Function: `xai-predictions`

**Location**: `supabase/functions/xai-predictions/index.ts`

This edge function implements the core XAI algorithms:

**a) SHAP-Inspired Feature Importance:**
- Calculate marginal contribution of each feature to the prediction
- Uses permutation importance methodology (compute prediction with/without each feature)
- Returns signed importance values (positive = increases risk, negative = decreases risk)

**b) Counterfactual Analysis Engine:**
- For each modifiable feature (BMI, blood pressure, glucose, etc.), calculates how the prediction changes if the feature value changes
- Returns sensitivity curves showing risk at different feature values
- Identifies "actionable thresholds" (e.g., "If BMI drops from 32 to 28, cardiovascular risk drops 12%")

**c) Global Feature Importance:**
- Aggregate importance across all patients (population-level insights)
- Shows which features matter most for each disease prediction

**d) AI-Generated Explanations:**
- Uses Lovable AI to generate natural language explanations of predictions
- Provides personalized "story" of why the patient has this risk level

### 2. New UI Components

**a) `src/components/xai/FeatureImportanceChart.tsx`**
- Horizontal bar chart showing SHAP-style feature contributions
- Color-coded: red bars push toward higher risk, green bars push toward lower risk
- Sorted by absolute magnitude
- Uses Recharts BarChart component

**b) `src/components/xai/WhatIfSliders.tsx`**
- Interactive sliders for modifiable health factors:
  - BMI (weight adjustment)
  - Blood Pressure (systolic)
  - Blood Glucose
  - Exercise frequency (categorical)
  - Smoking status (toggle)
- Real-time recalculation of risk as sliders move
- Visual comparison: "Current" vs "What-If" risk levels
- Actionable insights: "Reducing BMI by 2 points would lower your risk by 8%"

**c) `src/components/xai/RiskWaterfallChart.tsx`**
- Waterfall visualization showing how each factor contributes to final risk
- Starts from baseline population risk
- Each bar shows how the patient's specific values shift the risk up or down
- Final bar shows the patient's predicted risk

**d) `src/components/xai/CounterfactualCard.tsx`**
- Shows specific counterfactual scenarios
- "If your blood pressure was 120 instead of 145, your cardiovascular risk would be 18% instead of 32%"
- Highlights the most impactful changes

**e) `src/components/xai/GlobalImportanceChart.tsx`**
- Pie or bar chart showing global feature importance
- "Across all predictions, BMI accounts for 28% of risk variance"

### 3. New Page: `src/pages/HealthXAI.tsx`

**Location**: Patient portal accessible via navigation

**Layout:**
1. **Header Section**
   - Title: "Explainable Health Risk Analysis"
   - Subtitle explaining the XAI approach
   - "Run Analysis" button

2. **Risk Summary Cards**
   - Current cardiovascular risk (%)
   - Current diabetes risk (%)
   - Current general health score

3. **Tabbed Interface:**
   - **"Feature Impact" Tab**: Feature importance chart + waterfall
   - **"What-If Analysis" Tab**: Interactive sliders with real-time predictions
   - **"Counterfactuals" Tab**: Specific scenario cards
   - **"Explanation" Tab**: AI-generated natural language report

4. **Medical Disclaimer**
   - Standard healthcare disclaimer

### 4. Feature Importance Calculation Algorithm

```text
For each feature F in [age, BMI, systolic_bp, glucose, heart_rate, smoking, ...]:
  1. Calculate base_prediction = model(all_features)
  2. Calculate masked_prediction = model(all_features except F, using population mean for F)
  3. importance[F] = base_prediction - masked_prediction
  4. direction[F] = "increases_risk" if importance > 0 else "decreases_risk"

Sort features by |importance| descending
Return top 10 features with importance values and directions
```

### 5. What-If Sensitivity Analysis

```text
For each modifiable feature F with current value V:
  sensitivity_curve = []
  For each test_value in reasonable_range(F):
    modified_features = copy(patient_features)
    modified_features[F] = test_value
    predicted_risk = model(modified_features)
    sensitivity_curve.append({value: test_value, risk: predicted_risk})
  
  Return sensitivity_curve with highlighted "current" and "optimal" points
```

### 6. Database Considerations

No new database tables required. The system uses existing tables:
- `health_profiles` for patient demographics
- `vital_signs` for vital measurements
- `medications` for medication history
- `menstrual_cycles` for women's health data

### 7. Route and Navigation Updates

**`src/App.tsx`:**
- Add route: `/health-xai` -> `<HealthXAI />`

**`src/components/layouts/PatientLayout.tsx`:**
- Add navigation item: "XAI Insights" with `Sparkles` icon

### 8. Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/xai-predictions/index.ts` | Edge function with XAI algorithms |
| `src/pages/HealthXAI.tsx` | Main XAI dashboard page |
| `src/components/xai/FeatureImportanceChart.tsx` | SHAP-style bar chart |
| `src/components/xai/WhatIfSliders.tsx` | Interactive counterfactual sliders |
| `src/components/xai/RiskWaterfallChart.tsx` | Waterfall contribution chart |
| `src/components/xai/CounterfactualCard.tsx` | Scenario explanation cards |
| `src/components/xai/GlobalImportanceChart.tsx` | Population-level importance |

### 9. Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add /health-xai route |
| `src/components/layouts/PatientLayout.tsx` | Add XAI Insights nav item |
| `supabase/config.toml` | Add xai-predictions function config |

## Technical Details

### Edge Function Security
- JWT validation with `verify_jwt = false` in config
- Manual token verification using `getClaims()` pattern
- Service role key for database access

### Visualization Libraries
- Recharts (already installed) for all charts
- BarChart for feature importance
- ComposedChart for waterfall
- Tooltips for interactive explanations

### AI Integration
- Uses Lovable AI (`google/gemini-2.5-flash`) for natural language explanations
- Prompt engineering for healthcare-appropriate explanations
- Emphasizes actionable insights and professional consultation

### What-If Slider Ranges

| Feature | Range | Step | Unit |
|---------|-------|------|------|
| Weight | Current ± 30 kg | 1 | kg |
| Systolic BP | 90-180 | 5 | mmHg |
| Blood Glucose | 70-200 | 5 | mg/dL |
| Heart Rate | 50-120 | 5 | bpm |
| Smoking | Yes/No | - | toggle |

### Performance Considerations
- Debounce slider changes (300ms) before recalculating predictions
- Cache baseline predictions on initial load
- Lazy load counterfactual scenarios

## Research Value

This implementation provides:
1. **Transparency**: Patients understand WHY they have a certain risk level
2. **Actionability**: Clear guidance on WHAT changes would reduce risk
3. **Trust**: Explainable predictions build confidence in AI recommendations
4. **Publication Potential**: Novel application of XAI techniques to patient-facing health interfaces

## Summary

This XAI dashboard transforms the existing health prediction system into a transparent, interactive tool that empowers patients to understand and act on their health risks. By implementing SHAP-inspired feature importance, counterfactual "what-if" analysis, and AI-powered explanations, patients gain actionable insights while maintaining trust in the underlying AI system.
