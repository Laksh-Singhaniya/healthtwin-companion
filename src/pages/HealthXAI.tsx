import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Brain, Sliders, GitBranch, FileText, AlertTriangle, RefreshCw } from "lucide-react";
import { FeatureImportanceChart } from "@/components/xai/FeatureImportanceChart";
import { WhatIfSliders } from "@/components/xai/WhatIfSliders";
import { RiskWaterfallChart } from "@/components/xai/RiskWaterfallChart";
import { CounterfactualCard } from "@/components/xai/CounterfactualCard";
import { GlobalImportanceChart } from "@/components/xai/GlobalImportanceChart";
import { toast } from "sonner";

interface XAIPredictionResult {
  currentFeatures: Record<string, number>;
  analysisFeatures: Record<string, number>;
  risks: {
    cardiovascular: number;
    diabetes: number;
    overall: number;
  };
  featureImportance: {
    cardiovascular: Array<{ feature: string; importance: number; direction: string; currentValue: number; optimalValue: number }>;
    diabetes: Array<{ feature: string; importance: number; direction: string; currentValue: number; optimalValue: number }>;
  };
  sensitivityCurves: Record<string, Record<string, Array<{ value: number; risk: number }>>>;
  counterfactuals: {
    cardiovascular: Array<{ scenario: string; currentValue: string; targetValue: string; currentRisk: number; newRisk: number; riskReduction: number }>;
    diabetes: Array<{ scenario: string; currentValue: string; targetValue: string; currentRisk: number; newRisk: number; riskReduction: number }>;
  };
  waterfall: {
    cardiovascular: Array<{ name: string; contribution: number; cumulative: number }>;
    diabetes: Array<{ name: string; contribution: number; cumulative: number }>;
  };
  globalImportance: Array<{ feature: string; weight: number; category: string }>;
  explanation: string;
  timestamp: string;
}

const HealthXAI = () => {
  const [whatIfValues, setWhatIfValues] = useState<Record<string, number> | null>(null);

  const { data: analysisData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["xai-predictions"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/xai-predictions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ analysisType: "full" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch XAI predictions");
      }

      return response.json() as Promise<XAIPredictionResult>;
    },
  });

  const whatIfMutation = useMutation({
    mutationFn: async (newValues: Record<string, number>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/xai-predictions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ analysisType: "whatif", whatIfValues: newValues }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate what-if scenario");
      }

      return response.json() as Promise<XAIPredictionResult>;
    },
    onError: (error) => {
      toast.error("Failed to calculate what-if scenario");
      console.error(error);
    },
  });

  const handleWhatIfChange = useCallback((values: Record<string, number>) => {
    setWhatIfValues(values);
    whatIfMutation.mutate(values);
  }, [whatIfMutation]);

  const getRiskLevel = (risk: number) => {
    if (risk < 10) return { label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" };
    if (risk < 20) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" };
    return { label: "Elevated", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" };
  };

  if (error) {
    return (
      <PatientLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load XAI analysis"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Explainable Health Risk Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Understand your health risks with transparent, AI-powered insights
            </p>
          </div>
          <Button onClick={() => refetch()} disabled={isLoading || isRefetching}>
            {(isLoading || isRefetching) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Running XAI analysis on your health data...</p>
          </div>
        ) : analysisData ? (
          <>
            {/* Risk Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cardiovascular Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{analysisData.risks.cardiovascular}%</span>
                    <Badge className={getRiskLevel(analysisData.risks.cardiovascular).color}>
                      {getRiskLevel(analysisData.risks.cardiovascular).label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Diabetes Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{analysisData.risks.diabetes}%</span>
                    <Badge className={getRiskLevel(analysisData.risks.diabetes).color}>
                      {getRiskLevel(analysisData.risks.diabetes).label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{(100 - analysisData.risks.overall).toFixed(0)}</span>
                    <Badge className={getRiskLevel(analysisData.risks.overall).color}>
                      /100
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="feature-impact" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feature-impact" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Feature Impact</span>
                </TabsTrigger>
                <TabsTrigger value="what-if" className="flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  <span className="hidden sm:inline">What-If</span>
                </TabsTrigger>
                <TabsTrigger value="counterfactuals" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="hidden sm:inline">Scenarios</span>
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Explanation</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feature-impact" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <FeatureImportanceChart
                    data={analysisData.featureImportance.cardiovascular}
                    title="Cardiovascular Risk Factors"
                    description="How each factor contributes to your heart health risk"
                  />
                  <FeatureImportanceChart
                    data={analysisData.featureImportance.diabetes}
                    title="Diabetes Risk Factors"
                    description="How each factor contributes to your diabetes risk"
                  />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <RiskWaterfallChart
                    data={analysisData.waterfall.cardiovascular}
                    title="Cardiovascular Risk Breakdown"
                    description="Step-by-step accumulation of risk factors"
                  />
                  <GlobalImportanceChart data={analysisData.globalImportance} />
                </div>
              </TabsContent>

              <TabsContent value="what-if" className="space-y-6">
                <WhatIfSliders
                  currentFeatures={analysisData.currentFeatures}
                  onValuesChange={handleWhatIfChange}
                  isLoading={whatIfMutation.isPending}
                  currentRisk={{
                    cardiovascular: analysisData.risks.cardiovascular,
                    diabetes: analysisData.risks.diabetes,
                  }}
                  whatIfRisk={whatIfMutation.data?.risks}
                />
              </TabsContent>

              <TabsContent value="counterfactuals" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <CounterfactualCard
                    counterfactuals={analysisData.counterfactuals.cardiovascular}
                    riskType="Cardiovascular"
                  />
                  <CounterfactualCard
                    counterfactuals={analysisData.counterfactuals.diabetes}
                    riskType="Diabetes"
                  />
                </div>
              </TabsContent>

              <TabsContent value="explanation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI-Powered Health Summary
                    </CardTitle>
                    <CardDescription>
                      A personalized explanation of your health risk analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {analysisData.explanation.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-6">
                      Analysis generated: {new Date(analysisData.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Medical Disclaimer */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Medical Disclaimer</AlertTitle>
              <AlertDescription>
                This analysis is for educational purposes only and does not constitute medical advice.
                The predictions are based on statistical models and may not reflect your actual health status.
                Always consult with qualified healthcare professionals before making any health-related decisions.
              </AlertDescription>
            </Alert>
          </>
        ) : null}
      </div>
    </PatientLayout>
  );
};

export default HealthXAI;
