import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WaterfallData {
  name: string;
  contribution: number;
  cumulative: number;
}

interface RiskWaterfallChartProps {
  data: WaterfallData[];
  title: string;
  description?: string;
}

export const RiskWaterfallChart = ({ data, title, description }: RiskWaterfallChartProps) => {
  // Transform data for waterfall visualization
  const transformedData = data.map((item, index) => {
    const isFirst = index === 0;
    const isLast = index === data.length - 1;
    
    return {
      name: item.name,
      contribution: item.contribution,
      cumulative: item.cumulative,
      start: isFirst ? 0 : data[index - 1].cumulative,
      end: item.cumulative,
      isPositive: item.contribution > 0,
      isFirst,
      isLast,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.name}</p>
          {!item.isFirst && (
            <p className="text-sm text-muted-foreground">
              Contribution: <span className={item.contribution > 0 ? "text-destructive" : "text-green-600"}>
                {item.contribution > 0 ? "+" : ""}{item.contribution.toFixed(1)}%
              </span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Cumulative Risk: {item.cumulative.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape to create waterfall effect
  const WaterfallBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    
    if (payload.isFirst) {
      // First bar starts from 0
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="hsl(var(--primary))"
          radius={4}
        />
      );
    }
    
    const barHeight = Math.abs(payload.contribution) * (height / Math.abs(payload.cumulative - payload.start || 1));
    const barY = payload.contribution > 0 ? y : y + height - barHeight;
    
    return (
      <rect
        x={x}
        y={barY}
        width={width}
        height={Math.max(barHeight, 2)}
        fill={payload.contribution > 0 ? "hsl(var(--destructive))" : "hsl(142, 76%, 36%)"}
        rx={4}
        ry={4}
      />
    );
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
            <ComposedChart
              data={transformedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                className="text-muted-foreground"
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cumulative" barSize={40}>
                {transformedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={
                      entry.isFirst 
                        ? "hsl(var(--primary))" 
                        : entry.contribution > 0 
                          ? "hsl(var(--destructive))" 
                          : "hsl(142, 76%, 36%)"
                    }
                  />
                ))}
              </Bar>
              <Line 
                type="stepAfter" 
                dataKey="cumulative" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">Baseline Risk</span>
          </div>
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
