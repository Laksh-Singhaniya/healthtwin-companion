import { useState } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {   Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Heart,
  Activity,
  Droplet,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

interface PredictionResult {
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

interface PredictionsData {
  cardiovascular: PredictionResult;
  diabetes: PredictionResult;
  generalHealth: PredictionResult;
  womensHealth?: PredictionResult;
  vitalTrends: any;
}

const HealthPredictions = () => {
  const [predictions, setPredictions] = useState<PredictionsData | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePredictions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-predictions");

      if (error) {
        throw error;
      }

      setPredictions(data.predictions);
      setAiRecommendations(data.aiRecommendations);
      toast({
        title: "ML Predictions Complete",
        description: "Comprehensive health risk assessment generated.",
      });
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast({
        title: "Error",
        description: "Failed to generate predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'very-high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle2 className="h-5 w-5" />;
      case 'moderate': return <AlertCircle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'very-high': return <XCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const renderPredictionCard = (
    title: string,
    icon: React.ReactNode,
    prediction: PredictionResult,
    color: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          <Badge className={getRiskColor(prediction.riskLevel)}>
            {getRiskIcon(prediction.riskLevel)}
            <span className="ml-1">{prediction.riskLevel.toUpperCase()}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Risk Score: {prediction.riskPercentage}% • Confidence: {(prediction.confidence * 100).toFixed(0)}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Risk Assessment</span>
            <span className="font-semibold">{prediction.riskPercentage}%</span>
          </div>
          <Progress value={prediction.riskPercentage} className="h-3" />
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Key Risk Factors</h4>
          <div className="space-y-2">
            {prediction.factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                {factor.impact === 'positive' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : factor.impact === 'negative' ? (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium">{factor.name}:</span> {factor.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">ML-Based Recommendations</h4>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderTrends = () => {
    if (!predictions?.vitalTrends) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vital Sign Trends
          </CardTitle>
          <CardDescription>Changes in your health metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(predictions.vitalTrends).map(([metric, trend]: [string, any]) => {
              const getTrendIcon = () => {
                if (trend.direction === 'increasing') return <TrendingUp className="h-4 w-4 text-orange-500" />;
                if (trend.direction === 'decreasing') return <TrendingDown className="h-4 w-4 text-blue-500" />;
                return <Minus className="h-4 w-4 text-gray-500" />;
              };

              return (
                <div key={metric} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTrendIcon()}
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {metric.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trend.previous.toFixed(1)} → {trend.current.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PatientLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ML-Based Health Predictions</h1>
          <p className="text-muted-foreground">
            Advanced machine learning algorithms analyze your health data to predict risks and provide personalized recommendations
          </p>
        </div>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Generate Comprehensive Health Assessment
            </CardTitle>
            <CardDescription>
              Uses Framingham Risk Score, FINDRISC, and advanced pattern analysis algorithms
              combined with AI-powered personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generatePredictions} 
              disabled={isLoading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Running ML Algorithms...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Run ML Predictions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {predictions && !isLoading && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cardiovascular">Cardiovascular</TabsTrigger>
              <TabsTrigger value="diabetes">Diabetes</TabsTrigger>
              <TabsTrigger value="general">General Health</TabsTrigger>
              {predictions.womensHealth && (
                <TabsTrigger value="womens">Women's Health</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className={`border ${getRiskColor(predictions.cardiovascular.riskLevel)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Cardiovascular
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{predictions.cardiovascular.riskPercentage}%</div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {predictions.cardiovascular.riskLevel} Risk
                    </p>
                  </CardContent>
                </Card>

                <Card className={`border ${getRiskColor(predictions.diabetes.riskLevel)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Droplet className="h-4 w-4" />
                      Diabetes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{predictions.diabetes.riskPercentage}%</div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {predictions.diabetes.riskLevel} Risk
                    </p>
                  </CardContent>
                </Card>

                <Card className={`border ${getRiskColor(predictions.generalHealth.riskLevel)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      General Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{predictions.generalHealth.riskScore}/100</div>
                    <p className="text-xs text-muted-foreground uppercase">Health Score</p>
                  </CardContent>
                </Card>
              </div>

              {renderTrends()}

              {aiRecommendations && (
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI-Generated Personalized Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {aiRecommendations.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cardiovascular" className="space-y-4">
              {renderPredictionCard(
                "Cardiovascular Disease Risk",
                <Heart className="h-5 w-5 text-red-500" />,
                predictions.cardiovascular,
                "text-red-500"
              )}
            </TabsContent>

            <TabsContent value="diabetes" className="space-y-4">
              {renderPredictionCard(
                "Type 2 Diabetes Risk",
                <Droplet className="h-5 w-5 text-blue-500" />,
                predictions.diabetes,
                "text-blue-500"
              )}
            </TabsContent>

            <TabsContent value="general" className="space-y-4">
              {renderPredictionCard(
                "General Health Assessment",
                <Activity className="h-5 w-5 text-green-500" />,
                predictions.generalHealth,
                "text-green-500"
              )}
            </TabsContent>

            {predictions.womensHealth && (
              <TabsContent value="womens" className="space-y-4">
                {renderPredictionCard(
                  "Women's Health Analysis",
                  <Heart className="h-5 w-5 text-pink-500" />,
                  predictions.womensHealth,
                  "text-pink-500"
                )}
              </TabsContent>
            )}
          </Tabs>
        )}

        {predictions && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">Medical Disclaimer</p>
                  <p className="text-sm text-muted-foreground">
                    These predictions use validated medical algorithms (Framingham Risk Score, FINDRISC) but are for
                    informational purposes only. They should not replace professional medical advice, diagnosis, or treatment.
                    Always consult qualified healthcare professionals for medical decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  );
};

export default HealthPredictions;
