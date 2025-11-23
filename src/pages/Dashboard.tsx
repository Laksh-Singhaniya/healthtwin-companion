import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthCard } from "@/components/HealthCard";
import { HealthProfileForm } from "@/components/HealthProfileForm";
import { NavLink } from "@/components/NavLink";
import { Loader2, LogOut, Plus, Heart, Activity, Calendar, FileText, TrendingUp, MessageSquare, Stethoscope, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchHealthData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch health profile
      const { data: profile, error: profileError } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") throw profileError;
      setHealthProfile(profile);

      // Fetch emergency contact
      const { data: contacts } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true)
        .single();

      setEmergencyContact(contacts);

      // Fetch allergies
      const { data: allergyData } = await supabase
        .from("allergies")
        .select("*")
        .eq("user_id", user.id);

      setAllergies(allergyData || []);

      // Fetch medications
      const { data: medData } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .is("end_date", null);

      setMedications(medData || []);
    } catch (error: any) {
      toast({
        title: "Error loading health data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [user]);

  const isProfileComplete = () => {
    return healthProfile?.blood_type && healthProfile?.date_of_birth && emergencyContact;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary-light rounded-xl">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Health Twin</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto">
            <NavLink to="/" icon={<Activity className="h-4 w-4" />}>
              Dashboard
            </NavLink>
            <NavLink to="/health-monitoring" icon={<TrendingUp className="h-4 w-4" />}>
              Vitals
            </NavLink>
            <NavLink to="/womens-health" icon={<Heart className="h-4 w-4" />}>
              Women's Health
            </NavLink>
            <NavLink to="/medications-allergies" icon={<FileText className="h-4 w-4" />}>
              Medications
            </NavLink>
            <NavLink to="/emergency-contacts" icon={<Calendar className="h-4 w-4" />}>
              Emergency
            </NavLink>
            <NavLink to="/health-chat" icon={<MessageSquare className="h-4 w-4" />}>
              AI Assistant
            </NavLink>
            <NavLink to="/doctor-dashboard" icon={<Stethoscope className="h-4 w-4" />}>
              Doctor
            </NavLink>
            <NavLink to="/health-predictions" icon={<Brain className="h-4 w-4" />}>
              Predictions
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isProfileComplete() && !showForm && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Complete Your Health Profile</CardTitle>
              <CardDescription>
                Add your health information to unlock all features and create your digital health card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <div className="mb-8">
            <HealthProfileForm
              userId={user!.id}
              onComplete={() => {
                setShowForm(false);
                fetchHealthData();
              }}
            />
          </div>
        )}

        {isProfileComplete() && !showForm && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Health ID</p>
                      <p className="text-2xl font-bold text-foreground">{healthProfile?.health_id?.slice(0, 4)}...</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="text-2xl font-bold text-foreground">{healthProfile?.blood_type || "N/A"}</p>
                    </div>
                    <Activity className="w-8 h-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Allergies</p>
                      <p className="text-2xl font-bold text-foreground">{allergies.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Medications</p>
                      <p className="text-2xl font-bold text-foreground">{medications.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Card */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Your Digital Health Card</h2>
                <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Update Info
                </Button>
              </div>
              <HealthCard
                healthProfile={healthProfile}
                emergencyContact={emergencyContact}
                allergies={allergies}
                medications={medications}
                userName={user?.email?.split("@")[0]}
              />
            </div>

            {/* Active Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Monitoring</CardTitle>
                  <CardDescription>Track vitals and health metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <NavLink to="/health-monitoring">
                    <Button variant="outline" className="w-full">
                      Open Vitals Tracking
                    </Button>
                  </NavLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Women's Health</CardTitle>
                  <CardDescription>Cycle tracking and pregnancy monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <NavLink to="/womens-health">
                    <Button variant="outline" className="w-full">
                      Manage Women's Health
                    </Button>
                  </NavLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medications & Allergies</CardTitle>
                  <CardDescription>Track medications and manage allergies</CardDescription>
                </CardHeader>
                <CardContent>
                  <NavLink to="/medications-allergies">
                    <Button variant="outline" className="w-full">
                      Manage Medications
                    </Button>
                  </NavLink>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
