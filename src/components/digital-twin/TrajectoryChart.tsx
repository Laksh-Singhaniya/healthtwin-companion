import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

interface TrajectoryPoint {
  month: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

interface TrajectoryChartProps {
  title: string;
  description: string;
  data: TrajectoryPoint[];
  color: string;
  unit: string;
  healthyRange?: { min: number; max: number };
}

export const TrajectoryChart = ({
  title,
  description,
  data,
  color,
  unit,
  healthyRange,
}: TrajectoryChartProps) => {
  const latestConfidence = data[data.length - 1]?.confidence || 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const predicted = payload.find((p: any) => p.dataKey === "predicted");
      const lower = payload.find((p: any) => p.dataKey === "lowerBound");
      const upper = payload.find((p: any) => p.dataKey === "upperBound");
      const confidence = payload.find((p: any) => p.dataKey === "confidence");

      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Predicted:</span>
              <span className="font-medium">{predicted?.value} {unit}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">90% CI:</span>
              <span className="font-medium">{lower?.value} - {upper?.value} {unit}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium">{Math.round((confidence?.value || 0) * 100)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {Math.round(latestConfidence * 100)}% confidence at end
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id={`gradient-ci-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Confidence interval band */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill={`url(#gradient-ci-${title})`}
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="var(--background)"
                fillOpacity={1}
              />
              
              {/* Main prediction line */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                fillOpacity={0.8}
              />
              
              {/* Hidden for tooltip */}
              <Area type="monotone" dataKey="confidence" stroke="none" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {healthyRange && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Healthy range: {healthyRange.min} - {healthyRange.max} {unit}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
