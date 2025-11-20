import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VitalSign {
  id: string;
  recorded_at: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  blood_glucose: number | null;
  weight: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
}

interface HealthChartsProps {
  vitalSigns: VitalSign[];
  dateRange: number;
}

export const HealthCharts = ({ vitalSigns, dateRange }: HealthChartsProps) => {
  const filteredData = useMemo(() => {
    const cutoffDate = subDays(new Date(), dateRange);
    return vitalSigns
      .filter((vs) => new Date(vs.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((vs) => ({
        date: format(new Date(vs.recorded_at), "MMM dd"),
        systolic: vs.blood_pressure_systolic,
        diastolic: vs.blood_pressure_diastolic,
        heartRate: vs.heart_rate,
        glucose: vs.blood_glucose,
        weight: vs.weight,
        temperature: vs.temperature,
        oxygen: vs.oxygen_saturation,
      }));
  }, [vitalSigns, dateRange]);

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>No data available for the selected period</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="blood-pressure" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="blood-pressure">BP</TabsTrigger>
        <TabsTrigger value="heart-rate">Heart</TabsTrigger>
        <TabsTrigger value="glucose">Glucose</TabsTrigger>
        <TabsTrigger value="weight">Weight</TabsTrigger>
        <TabsTrigger value="temperature">Temp</TabsTrigger>
        <TabsTrigger value="oxygen">O₂</TabsTrigger>
      </TabsList>

      <TabsContent value="blood-pressure">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trends</CardTitle>
            <CardDescription>Systolic and Diastolic readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Systolic"
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Diastolic"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="heart-rate">
        <Card>
          <CardHeader>
            <CardTitle>Heart Rate Trends</CardTitle>
            <CardDescription>Beats per minute over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Heart Rate (bpm)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="glucose">
        <Card>
          <CardHeader>
            <CardTitle>Blood Glucose Trends</CardTitle>
            <CardDescription>Blood sugar levels (mg/dL)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Glucose (mg/dL)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="weight">
        <Card>
          <CardHeader>
            <CardTitle>Weight Trends</CardTitle>
            <CardDescription>Body weight in kilograms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Weight (kg)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="temperature">
        <Card>
          <CardHeader>
            <CardTitle>Temperature Trends</CardTitle>
            <CardDescription>Body temperature in Fahrenheit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[95, 104]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Temperature (°F)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="oxygen">
        <Card>
          <CardHeader>
            <CardTitle>Oxygen Saturation Trends</CardTitle>
            <CardDescription>Blood oxygen levels (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[90, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="oxygen" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  name="SpO₂ (%)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
