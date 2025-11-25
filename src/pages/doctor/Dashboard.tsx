import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Users, Calendar, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDoctorStats();
    }
  }, [user]);

  const fetchDoctorStats = async () => {
    if (!user) return;

    // Get doctor profile
    const { data: doctorProfile } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!doctorProfile) return;

    // Count total patients with access
    const { count: patientsCount } = await supabase
      .from("patient_doctor_access")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", doctorProfile.id)
      .eq("status", "active");

    // Count today's appointments
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", doctorProfile.id)
      .gte("scheduled_time", `${today}T00:00:00`)
      .lte("scheduled_time", `${today}T23:59:59`);

    // Count pending appointments
    const { count: pendingCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("doctor_id", doctorProfile.id)
      .eq("status", "pending");

    setStats({
      totalPatients: patientsCount || 0,
      todayAppointments: todayCount || 0,
      pendingAppointments: pendingCount || 0,
    });
  };

  const quickStats = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingAppointments.toString(),
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Consultations",
      value: "12",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <DoctorLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard 👨‍⚕️</h1>
          <p className="text-white/90">Manage your patients and appointments efficiently</p>
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

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Schedule</CardTitle>
            <Button onClick={() => navigate("/doctor/appointments")}>View All</Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have {stats.todayAppointments} appointments today</p>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Patients</CardTitle>
            <Button onClick={() => navigate("/doctor/patients")}>View All Patients</Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Managing {stats.totalPatients} patients</p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            size="lg"
            onClick={() => navigate("/doctor/appointments")}
            className="h-24 bg-gradient-to-r from-primary to-blue-600"
          >
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2" />
              <span>Manage Appointments</span>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/doctor/patients")}
            className="h-24"
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <span>View Patients</span>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/doctor/messages")}
            className="h-24"
          >
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <span>Messages</span>
            </div>
          </Button>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
