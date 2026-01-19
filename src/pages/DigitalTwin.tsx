import { useState } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrajectoryChart } from "@/components/digital-twin/TrajectoryChart";
import { TreatmentOptimizer } from "@/components/digital-twin/TreatmentOptimizer";
import { UncertaintyVisualization } from "@/components/digital-twin/UncertaintyVisualization";
import { DiseaseProgressionChart } from "@/components/digital-twin/DiseaseProgressionChart";
import {
  Brain,
  Dna,
  TrendingUp,
  Layers,
  FlaskConical,
  AlertTriangle,
  Heart,
  Droplet,
  Activity,
  Sparkles,
} from "lucide-react";

interface SimulationData {
  lstmAnalysis: {
    systolic: { trend: number; volatility: number; seasonality: number };
    heartRate: { trend: number; volatility: number; seasonality: number };
    bloodGlucose: { trend: number; volatility: number; seasonality: number };
  };
  vitalTrajectories: {
    bloodPressure: Array<{ month: string; predicted: number; lowerBound: number; upperBound: number; confidence: number }>;
    heartRate: Array<{ month: string; predicted: number; lowerBound: number; upperBound: number; confidence: number }>;
    bloodGlucose: Array<{ month: string; predicted: number; lowerBound: number; upperBound: number; confidence: number }>;
  };
  currentRisks: {
    cardiovascular: number;
    diabetes: number;
    general: number;
  };
  treatmentOptimization: {
    treatments: Array<{
      id: string;
      name: string;
      description: string;
      expectedOutcome: number;
      riskReduction: number;
      adherenceRequired: number;
      sideEffectRisk: number;
      qValue: number;
      recommended: boolean;
    }>;
    policyExplanation: string;
  };
  diseaseTrajectories: {
    cardiovascular: Array<{ timestamp: string; predicted: number; lowerBound: number; upperBound: number; confidence: number }>;
    diabetes: Array<{ timestamp: string; predicted: number; lowerBound: number; upperBound: number; confidence: number }>;
  };
  uncertaintyMetrics: {
    epistemic: string;
    aleatoric: string;
    confidenceLevel: number;
    simulationRuns: number;
  };
  aiInterpretation: string;
}

const DigitalTwin = () => {
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("digital-twin-simulation");

      if (error) throw error;

      setSimulation(data);
      toast({
        title: "Digital Twin Simulation Complete",
        description: "Advanced health trajectory modeling and treatment optimization generated.",
      });
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Error",
        description: "Failed to run digital twin simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 50) return "text-red-500";
    if (risk >= 30) return "text-orange-500";
    if (risk >= 15) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <PatientLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dna className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Digital Health Twin</h1>
            <Badge variant="outline" className="ml-2">Research Preview</Badge>
          </div>
          <p className="text-muted-foreground">
            Advanced patient-specific disease progression modeling with LSTM temporal analysis, 
            reinforcement learning treatment optimization, and uncertainty quantification
          </p>
        </div>

        {/* Simulation Trigger */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" />
              Run Digital Twin Simulation
            </CardTitle>
            <CardDescription>
              Combines LSTM-inspired temporal pattern analysis, Monte Carlo uncertainty quantification, 
              and Q-learning treatment optimization algorithms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                <Brain className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-semibold">LSTM Temporal Modeling</div>
                  <div className="text-xs text-muted-foreground">Long-term pattern detection</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-semibold">RL Treatment Optimization</div>
                  <div className="text-xs text-muted-foreground">Q-learning policy selection</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                <Layers className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">Uncertainty Quantification</div>
                  <div className="text-xs text-muted-foreground">Monte Carlo confidence bounds</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={runSimulation} 
              disabled={isLoading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Dna className="mr-2 h-4 w-4" />
                  Run Digital Twin Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simulation Results */}
        {simulation && !isLoading && (
          <>
            {/* Current Risk Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Cardiovascular Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getRiskColor(simulation.currentRisks.cardiovascular)}`}>
                    {simulation.currentRisks.cardiovascular.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Current risk level</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    Diabetes Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getRiskColor(simulation.currentRisks.diabetes)}`}>
                    {simulation.currentRisks.diabetes.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Current risk level</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    General Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${simulation.currentRisks.general >= 60 ? 'text-green-500' : 'text-orange-500'}`}>
                    {simulation.currentRisks.general.toFixed(1)}/100
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Overall health score</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="trajectories" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="trajectories" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Trajectories</span>
                </TabsTrigger>
                <TabsTrigger value="treatment" className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Treatment</span>
                </TabsTrigger>
                <TabsTrigger value="uncertainty" className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">Uncertainty</span>
                </TabsTrigger>
                <TabsTrigger value="progression" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Progression</span>
                </TabsTrigger>
                <TabsTrigger value="interpretation" className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Insights</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trajectories" className="space-y-4 mt-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Vital Signs Trajectory Predictions
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    12-month Monte Carlo simulation with 90% confidence intervals
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  <TrajectoryChart
                    title="Blood Pressure (Systolic)"
                    description="Predicted systolic BP trajectory"
                    data={simulation.vitalTrajectories.bloodPressure}
                    color="hsl(0, 85%, 60%)"
                    unit="mmHg"
                    healthyRange={{ min: 90, max: 120 }}
                  />
                  <TrajectoryChart
                    title="Heart Rate"
                    description="Predicted resting heart rate"
                    data={simulation.vitalTrajectories.heartRate}
                    color="hsl(280, 60%, 55%)"
                    unit="bpm"
                    healthyRange={{ min: 60, max: 100 }}
                  />
                  <TrajectoryChart
                    title="Blood Glucose"
                    description="Predicted fasting glucose"
                    data={simulation.vitalTrajectories.bloodGlucose}
                    color="hsl(200, 95%, 45%)"
                    unit="mg/dL"
                    healthyRange={{ min: 70, max: 100 }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="treatment" className="mt-4">
                <TreatmentOptimizer
                  treatments={simulation.treatmentOptimization.treatments}
                  policyExplanation={simulation.treatmentOptimization.policyExplanation}
                />
              </TabsContent>

              <TabsContent value="uncertainty" className="mt-4">
                <UncertaintyVisualization
                  lstmAnalysis={simulation.lstmAnalysis}
                  uncertaintyMetrics={simulation.uncertaintyMetrics}
                />
              </TabsContent>

              <TabsContent value="progression" className="mt-4">
                <DiseaseProgressionChart
                  cardiovascularTrajectory={simulation.diseaseTrajectories.cardiovascular}
                  diabetesTrajectory={simulation.diseaseTrajectories.diabetes}
                />
              </TabsContent>

              <TabsContent value="interpretation" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI-Generated Clinical Interpretation
                    </CardTitle>
                    <CardDescription>
                      Research-quality analysis of simulation results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {simulation.aiInterpretation ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {simulation.aiInterpretation.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 text-sm leading-relaxed">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        AI interpretation not available for this simulation.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Research Disclaimer */}
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Research Preview Disclaimer</p>
                    <p className="text-sm text-muted-foreground">
                      This digital twin simulation uses LSTM-inspired temporal analysis, reinforcement learning concepts, 
                      and Monte Carlo methods for research and educational purposes. Results are based on simplified models 
                      and should not be used for clinical decision-making. Always consult qualified healthcare professionals 
                      for medical decisions. This technology has significant potential for publication in medical AI research venues.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PatientLayout>
  );
};

export default DigitalTwin;
