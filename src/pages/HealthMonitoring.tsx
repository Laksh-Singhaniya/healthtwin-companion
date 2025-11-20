import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VitalSignsForm } from "@/components/VitalSignsForm";
import { HealthCharts } from "@/components/HealthCharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, TrendingUp } from "lucide-react";

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

export default function HealthMonitoring() {
  const { user } = useAuth();
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [dateRange, setDateRange] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVitalSigns = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("vital_signs")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching vital signs:", error);
    } else {
      setVitalSigns(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVitalSigns();

    // Set up realtime subscription
    const channel = supabase
      .channel("vital_signs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vital_signs",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchVitalSigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const latestVitals = vitalSigns[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Health Monitoring
          </h1>
          <p className="text-muted-foreground">
            Track your vital signs and visualize health trends over time
          </p>
        </div>

        {/* Latest Vitals Overview */}
        {latestVitals && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Latest Reading
              </CardTitle>
              <CardDescription>
                Recorded on {new Date(latestVitals.recorded_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-2xl font-bold">
                      {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                    </p>
                    <p className="text-xs text-muted-foreground">mmHg</p>
                  </div>
                )}
                {latestVitals.heart_rate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-2xl font-bold">{latestVitals.heart_rate}</p>
                    <p className="text-xs text-muted-foreground">bpm</p>
                  </div>
                )}
                {latestVitals.blood_glucose && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Glucose</p>
                    <p className="text-2xl font-bold">{latestVitals.blood_glucose}</p>
                    <p className="text-xs text-muted-foreground">mg/dL</p>
                  </div>
                )}
                {latestVitals.weight && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-2xl font-bold">{latestVitals.weight}</p>
                    <p className="text-xs text-muted-foreground">kg</p>
                  </div>
                )}
                {latestVitals.temperature && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="text-2xl font-bold">{latestVitals.temperature}</p>
                    <p className="text-xs text-muted-foreground">°F</p>
                  </div>
                )}
                {latestVitals.oxygen_saturation && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">SpO₂</p>
                    <p className="text-2xl font-bold">{latestVitals.oxygen_saturation}</p>
                    <p className="text-xs text-muted-foreground">%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">Record Vitals</TabsTrigger>
            <TabsTrigger value="trends">View Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-4">
            <VitalSignsForm onSuccess={fetchVitalSigns} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {/* Date Range Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Time Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={dateRange === 7 ? "default" : "outline"}
                    onClick={() => setDateRange(7)}
                  >
                    7 Days
                  </Button>
                  <Button
                    variant={dateRange === 30 ? "default" : "outline"}
                    onClick={() => setDateRange(30)}
                  >
                    30 Days
                  </Button>
                  <Button
                    variant={dateRange === 90 ? "default" : "outline"}
                    onClick={() => setDateRange(90)}
                  >
                    90 Days
                  </Button>
                  <Button
                    variant={dateRange === 365 ? "default" : "outline"}
                    onClick={() => setDateRange(365)}
                  >
                    1 Year
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading health data...</p>
                </CardContent>
              </Card>
            ) : (
              <HealthCharts vitalSigns={vitalSigns} dateRange={dateRange} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
