import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Calendar, Pill, Activity, TrendingUp, Heart, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<number>(0);
  const [activeMedications, setActiveMedications] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch health profile
    const { data: profile } = await supabase
      .from("health_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setHealthProfile(profile);

    // Count upcoming appointments
    const { count: appointmentsCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "confirmed")
      .gte("scheduled_time", new Date().toISOString());
    setUpcomingAppointments(appointmentsCount || 0);

    // Count active medications
    const { count: medicationsCount } = await supabase
      .from("medications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setActiveMedications(medicationsCount || 0);
  };

  const quickStats = [
    {
      title: "Next Appointment",
      value: upcomingAppointments > 0 ? "Today, 2:30 PM" : "None scheduled",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Medications",
      value: activeMedications.toString(),
      icon: Pill,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Health Score",
      value: "85/100",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Risk Level",
      value: "Low",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule a consultation with a doctor",
      icon: Calendar,
      action: () => navigate("/patient/appointments"),
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Log Vital Signs",
      description: "Record your health measurements",
      icon: Activity,
      action: () => navigate("/health-monitoring"),
      color: "from-primary to-blue-600",
    },
    {
      title: "AI Health Assistant",
      description: "Chat with our AI for health insights",
      icon: MessageSquare,
      action: () => navigate("/health-chat"),
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Women's Health",
      description: "Track menstrual cycles and pregnancy",
      icon: Heart,
      action: () => navigate("/womens-health"),
      color: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <PatientLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-white/90">Here's your health overview for today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Health Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Health ID</p>
                <p className="font-semibold">{healthProfile?.health_id || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Blood Type</p>
                <p className="font-semibold">{healthProfile?.blood_type || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="font-semibold">
                  {healthProfile?.date_of_birth
                    ? new Date().getFullYear() - new Date(healthProfile.date_of_birth).getFullYear()
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="font-semibold">{healthProfile?.gender || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
