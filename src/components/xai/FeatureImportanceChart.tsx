import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureImportance {
  feature: string;
  importance: number;
  direction: string;
  currentValue: number;
  optimalValue: number;
}

interface FeatureImportanceChartProps {
  data: FeatureImportance[];
  title: string;
  description?: string;
}

export const FeatureImportanceChart = ({ data, title, description }: FeatureImportanceChartProps) => {
  // Sort by absolute importance and take top 8
  const sortedData = [...data]
    .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
    .slice(0, 8);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.feature}</p>
          <p className="text-sm text-muted-foreground">
            Impact: <span className={item.importance > 0 ? "text-destructive" : "text-green-600"}>
              {item.importance > 0 ? "+" : ""}{item.importance.toFixed(2)}%
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Current: {item.currentValue}
          </p>
          <p className="text-sm text-muted-foreground">
            Optimal: {item.optimalValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
                className="text-muted-foreground"
              />
              <YAxis 
                dataKey="feature" 
                type="category" 
                width={90}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.importance > 0 ? "hsl(var(--destructive))" : "hsl(142, 76%, 36%)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span className="text-muted-foreground">Increases Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
            <span className="text-muted-foreground">Decreases Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
