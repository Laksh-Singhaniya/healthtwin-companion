import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle2, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Target,
  Brain,
  Info
} from "lucide-react";

interface TreatmentOption {
  id: string;
  name: string;
  description: string;
  expectedOutcome: number;
  riskReduction: number;
  adherenceRequired: number;
  sideEffectRisk: number;
  qValue: number;
  recommended: boolean;
}

interface TreatmentOptimizerProps {
  treatments: TreatmentOption[];
  policyExplanation: string;
}

export const TreatmentOptimizer = ({
  treatments,
  policyExplanation,
}: TreatmentOptimizerProps) => {
  const recommendedTreatments = treatments.filter(t => t.recommended);
  const otherTreatments = treatments.filter(t => !t.recommended);

  const getQValueColor = (qValue: number) => {
    if (qValue >= 25) return "text-green-500";
    if (qValue >= 15) return "text-yellow-500";
    return "text-orange-500";
  };

  const TreatmentCard = ({ treatment, isRecommended }: { treatment: TreatmentOption; isRecommended: boolean }) => (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        isRecommended 
          ? 'border-primary/50 bg-primary/5 shadow-sm' 
          : 'border-border bg-card hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2">
          {isRecommended && (
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-semibold text-sm leading-tight">{treatment.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">{treatment.description}</p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={`${getQValueColor(treatment.qValue)} font-mono text-xs`}
            >
              Q={treatment.qValue}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Q-value: Expected cumulative reward from this treatment policy</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <TrendingDown className="h-3 w-3" />
            <span>Risk Reduction</span>
          </div>
          <div className="font-semibold text-green-600">-{treatment.riskReduction}%</div>
        </div>
        
        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Target className="h-3 w-3" />
            <span>Expected Outcome</span>
          </div>
          <div className="font-semibold">{treatment.expectedOutcome}% risk</div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Zap className="h-3 w-3" />
            <span>Adherence Difficulty</span>
          </div>
          <Progress value={treatment.adherenceRequired} className="h-1.5 mt-1" />
          <span className="text-[10px] text-muted-foreground">{treatment.adherenceRequired}%</span>
        </div>

        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Side Effect Risk</span>
          </div>
          <div className={`font-semibold ${treatment.sideEffectRisk > 10 ? 'text-orange-500' : 'text-green-600'}`}>
            {treatment.sideEffectRisk}%
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>RL-Optimized Treatment Policy</CardTitle>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">{policyExplanation}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          Treatments ranked by reinforcement learning Q-values for optimal long-term outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Recommended Interventions
          </h3>
          <div className="space-y-3">
            {recommendedTreatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} isRecommended={true} />
            ))}
          </div>
        </div>

        {otherTreatments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Other Options</h3>
            <div className="space-y-2">
              {otherTreatments.slice(0, 3).map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} isRecommended={false} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
