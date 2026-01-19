import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LSTMAnalysis {
  trend: number;
  volatility: number;
  seasonality: number;
}

interface UncertaintyMetrics {
  epistemic: string;
  aleatoric: string;
  confidenceLevel: number;
  simulationRuns: number;
}

interface UncertaintyVisualizationProps {
  lstmAnalysis: {
    systolic: LSTMAnalysis;
    heartRate: LSTMAnalysis;
    bloodGlucose: LSTMAnalysis;
  };
  uncertaintyMetrics: UncertaintyMetrics;
}

export const UncertaintyVisualization = ({
  lstmAnalysis,
  uncertaintyMetrics,
}: UncertaintyVisualizationProps) => {
  const getTrendIcon = (trend: number) => {
    if (trend > 0.02) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (trend < -0.02) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getVolatilityColor = (volatility: number) => {
    if (volatility > 0.15) return "text-red-500";
    if (volatility > 0.08) return "text-orange-500";
    return "text-green-500";
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const MetricRow = ({ 
    label, 
    analysis, 
    description 
  }: { 
    label: string; 
    analysis: LSTMAnalysis;
    description: string;
  }) => (
    <div className="p-3 rounded-lg bg-muted/30 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{label}</span>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground mb-1">Trend</div>
          <div className="flex items-center gap-1">
            {getTrendIcon(analysis.trend)}
            <span className={analysis.trend > 0 ? 'text-orange-500' : analysis.trend < 0 ? 'text-green-500' : ''}>
              {formatPercent(analysis.trend)}
            </span>
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Volatility</div>
          <span className={getVolatilityColor(analysis.volatility)}>
            {formatPercent(analysis.volatility)}
          </span>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Seasonality</div>
          <span>{formatPercent(analysis.seasonality)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">LSTM Temporal Analysis</CardTitle>
          </div>
          <CardDescription>
            Long Short-Term Memory network-inspired pattern detection in vital signs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow 
            label="Blood Pressure (Systolic)" 
            analysis={lstmAnalysis.systolic}
            description="Analyzes BP patterns using memory cell concepts to detect long-term trends and short-term fluctuations"
          />
          <MetricRow 
            label="Heart Rate" 
            analysis={lstmAnalysis.heartRate}
            description="Heart rate variability analysis for cardiovascular health assessment"
          />
          <MetricRow 
            label="Blood Glucose" 
            analysis={lstmAnalysis.bloodGlucose}
            description="Glucose pattern analysis for metabolic health and diabetes risk prediction"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Uncertainty Quantification</CardTitle>
          </div>
          <CardDescription>
            Confidence bounds and uncertainty decomposition for predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">Epistemic Uncertainty</span>
              </div>
              <p className="text-xs text-muted-foreground">{uncertaintyMetrics.epistemic}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Model Confidence</span>
                  <span>{Math.round(uncertaintyMetrics.confidenceLevel * 100)}%</span>
                </div>
                <Progress value={uncertaintyMetrics.confidenceLevel * 100} className="h-2" />
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-sm">Aleatoric Uncertainty</span>
              </div>
              <p className="text-xs text-muted-foreground">{uncertaintyMetrics.aleatoric}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {uncertaintyMetrics.simulationRuns.toLocaleString()} Monte Carlo runs
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30">
            <h4 className="font-semibold text-sm mb-2">Prediction Interval Interpretation</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Shaded regions represent 90% confidence intervals (5th-95th percentile)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Wider bands indicate higher uncertainty in future predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Confidence decreases as prediction horizon extends</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
