import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, TrendingDown, TrendingUp } from "lucide-react";

interface WhatIfSlidersProps {
  currentFeatures: Record<string, number>;
  onValuesChange: (values: Record<string, number>) => void;
  isLoading?: boolean;
  currentRisk: { cardiovascular: number; diabetes: number };
  whatIfRisk?: { cardiovascular: number; diabetes: number };
}

interface SliderConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

const sliderConfigs: SliderConfig[] = [
  { key: "bmi", label: "BMI", min: 18, max: 40, step: 0.5, unit: "", description: "Body Mass Index" },
  { key: "systolic_bp", label: "Systolic BP", min: 90, max: 180, step: 5, unit: "mmHg", description: "Blood Pressure" },
  { key: "blood_glucose", label: "Blood Glucose", min: 70, max: 200, step: 5, unit: "mg/dL", description: "Fasting glucose level" },
  { key: "heart_rate", label: "Heart Rate", min: 50, max: 120, step: 5, unit: "bpm", description: "Resting heart rate" },
  { key: "weight", label: "Weight", min: 40, max: 150, step: 1, unit: "kg", description: "Body weight" },
];

export const WhatIfSliders = ({
  currentFeatures,
  onValuesChange,
  isLoading,
  currentRisk,
  whatIfRisk,
}: WhatIfSlidersProps) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [smoking, setSmoking] = useState(false);

  useEffect(() => {
    const initialValues: Record<string, number> = {};
    sliderConfigs.forEach((config) => {
      initialValues[config.key] = currentFeatures[config.key] || config.min;
    });
    setValues(initialValues);
    setSmoking(currentFeatures.smoking === 1);
  }, [currentFeatures]);

  const handleSliderChange = useCallback((key: string, newValue: number[]) => {
    const updatedValues = { ...values, [key]: newValue[0] };
    setValues(updatedValues);
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      onValuesChange({ ...updatedValues, smoking: smoking ? 1 : 0 });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [values, smoking, onValuesChange]);

  const handleSmokingChange = useCallback((checked: boolean) => {
    setSmoking(checked);
    onValuesChange({ ...values, smoking: checked ? 1 : 0 });
  }, [values, onValuesChange]);

  const handleReset = useCallback(() => {
    const resetValues: Record<string, number> = {};
    sliderConfigs.forEach((config) => {
      resetValues[config.key] = currentFeatures[config.key] || config.min;
    });
    setValues(resetValues);
    setSmoking(currentFeatures.smoking === 1);
    onValuesChange(currentFeatures);
  }, [currentFeatures, onValuesChange]);

  const getRiskChangeIndicator = (current: number, whatIf: number | undefined) => {
    if (whatIf === undefined) return null;
    const diff = whatIf - current;
    if (Math.abs(diff) < 0.5) return null;
    
    return diff < 0 ? (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingDown className="h-4 w-4" />
        <span className="text-sm font-medium">-{Math.abs(diff).toFixed(1)}%</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-destructive">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium">+{diff.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">What-If Analysis</CardTitle>
            <CardDescription>
              Adjust the sliders to see how changes would affect your risk
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Comparison */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Cardiovascular Risk</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {whatIfRisk?.cardiovascular?.toFixed(1) ?? currentRisk.cardiovascular.toFixed(1)}%
              </span>
              {getRiskChangeIndicator(currentRisk.cardiovascular, whatIfRisk?.cardiovascular)}
            </div>
            <p className="text-xs text-muted-foreground">Current: {currentRisk.cardiovascular.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Diabetes Risk</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {whatIfRisk?.diabetes?.toFixed(1) ?? currentRisk.diabetes.toFixed(1)}%
              </span>
              {getRiskChangeIndicator(currentRisk.diabetes, whatIfRisk?.diabetes)}
            </div>
            <p className="text-xs text-muted-foreground">Current: {currentRisk.diabetes.toFixed(1)}%</p>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          {sliderConfigs.map((config) => {
            const currentValue = currentFeatures[config.key] || config.min;
            const whatIfValue = values[config.key] || config.min;
            const hasChanged = Math.abs(whatIfValue - currentValue) > 0.1;
            
            return (
              <div key={config.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">{config.label}</Label>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasChanged && (
                      <Badge variant="outline" className="text-xs">
                        was {currentValue.toFixed(1)}
                      </Badge>
                    )}
                    <span className="text-sm font-semibold min-w-[60px] text-right">
                      {whatIfValue.toFixed(1)} {config.unit}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[whatIfValue]}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  onValueChange={(value) => handleSliderChange(config.key, value)}
                  disabled={isLoading}
                  className={hasChanged ? "opacity-100" : "opacity-80"}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{config.min} {config.unit}</span>
                  <span>{config.max} {config.unit}</span>
                </div>
              </div>
            );
          })}

          {/* Smoking Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">Smoking Status</Label>
              <p className="text-xs text-muted-foreground">Current smoking behavior</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">No</span>
              <Switch
                checked={smoking}
                onCheckedChange={handleSmokingChange}
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">Yes</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Recalculating predictions...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
