import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingDown, Lightbulb } from "lucide-react";

interface Counterfactual {
  scenario: string;
  currentValue: string;
  targetValue: string;
  currentRisk: number;
  newRisk: number;
  riskReduction: number;
}

interface CounterfactualCardProps {
  counterfactuals: Counterfactual[];
  riskType: string;
}

export const CounterfactualCard = ({ counterfactuals, riskType }: CounterfactualCardProps) => {
  if (!counterfactuals || counterfactuals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {riskType} Improvement Scenarios
          </CardTitle>
          <CardDescription>
            No significant improvements identified based on current data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your current health metrics are within optimal ranges. Keep maintaining your healthy lifestyle!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {riskType} Improvement Scenarios
        </CardTitle>
        <CardDescription>
          See how specific changes could reduce your risk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {counterfactuals.slice(0, 4).map((cf, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground">{cf.scenario}</h4>
                <p className="text-sm text-muted-foreground">
                  If you changed this metric...
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              >
                <TrendingDown className="h-3 w-3 mr-1" />
                -{cf.riskReduction.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 p-2 bg-background rounded border">
                <p className="text-xs text-muted-foreground mb-1">Current</p>
                <p className="font-medium text-destructive">{cf.currentValue}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 p-2 bg-background rounded border">
                <p className="text-xs text-muted-foreground mb-1">Target</p>
                <p className="font-medium text-green-600">{cf.targetValue}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Risk would change from</span>
              <span className="font-semibold text-destructive">{cf.currentRisk}%</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold text-green-600">{cf.newRisk}%</span>
            </div>
          </div>
        ))}

        {counterfactuals.length > 4 && (
          <p className="text-sm text-center text-muted-foreground">
            +{counterfactuals.length - 4} more scenarios available
          </p>
        )}
      </CardContent>
    </Card>
  );
};
