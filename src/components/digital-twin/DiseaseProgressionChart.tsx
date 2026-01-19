import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface TrajectoryPoint {
  timestamp: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

interface DiseaseProgressionChartProps {
  cardiovascularTrajectory: TrajectoryPoint[];
  diabetesTrajectory: TrajectoryPoint[];
}

export const DiseaseProgressionChart = ({
  cardiovascularTrajectory,
  diabetesTrajectory,
}: DiseaseProgressionChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.filter((p: any) => p.dataKey === "predicted").map((p: any) => (
              <p key={p.name} className="flex justify-between gap-4">
                <span className="text-muted-foreground">Risk:</span>
                <span className="font-medium">{p.value}%</span>
              </p>
            ))}
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">90% CI:</span>
              <span className="font-medium">
                {payload.find((p: any) => p.dataKey === "lowerBound")?.value}% - {payload.find((p: any) => p.dataKey === "upperBound")?.value}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = (
    data: TrajectoryPoint[], 
    title: string, 
    color: string,
    riskThreshold: number
  ) => {
    const finalRisk = data[data.length - 1]?.predicted || 0;
    const initialRisk = data[0]?.predicted || 0;
    const riskChange = finalRisk - initialRisk;

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color }} />
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={finalRisk > riskThreshold ? "destructive" : "secondary"}
                className="text-xs"
              >
                {riskChange >= 0 ? '+' : ''}{riskChange.toFixed(1)}% projected
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            24-month disease progression simulation with treatment effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-disease-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickFormatter={(value) => value.slice(5, 7)}
                  interval={3}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Risk threshold line */}
                <ReferenceLine 
                  y={riskThreshold} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: 'High Risk', 
                    fill: 'hsl(var(--destructive))', 
                    fontSize: 10,
                    position: 'right'
                  }}
                />

                {/* Upper bound (faded) */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill={color}
                  fillOpacity={0.1}
                />
                
                {/* Lower bound creates hole */}
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="var(--background)"
                />
                
                {/* Main prediction */}
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-disease-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-4 rounded" style={{ backgroundColor: color }} />
              <span>Predicted trajectory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-4 rounded opacity-30" style={{ backgroundColor: color }} />
              <span>90% CI</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 border-t-2 border-dashed border-destructive" />
              <span>High risk threshold</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h2 className="text-lg font-semibold">Disease Progression Simulation</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Compartmental model simulation showing projected disease progression with current treatment policy effects
      </p>
      
      <div className="grid gap-4 lg:grid-cols-2">
        {renderChart(cardiovascularTrajectory, "Cardiovascular Disease Risk", "hsl(0, 85%, 60%)", 30)}
        {renderChart(diabetesTrajectory, "Diabetes Progression Risk", "hsl(200, 95%, 45%)", 25)}
      </div>
    </div>
  );
};
