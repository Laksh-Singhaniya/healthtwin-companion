import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Users, Heart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface DoctorProfile {
  id: string;
  full_name: string;
  specialization: string;
  license_number: string;
  phone: string;
  email: string;
}

interface PatientAccess {
  id: string;
  patient_id: string;
  status: string;
  granted_at: string;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    specialization: "",
    license_number: "",
    phone: "",
    email: "",
  });
  const [patientAccess, setPatientAccess] = useState<PatientAccess[]>([]);

  useEffect(() => {
    loadDoctorProfile();
    loadPatientAccess();
  }, [user]);

  const loadDoctorProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading doctor profile:", error);
      return;
    }

    if (data) {
      setDoctorProfile(data);
      setIsDoctor(true);
      setFormData({
        full_name: data.full_name,
        specialization: data.specialization || "",
        license_number: data.license_number || "",
        phone: data.phone || "",
        email: data.email || "",
      });
    }
  };

  const loadPatientAccess = async () => {
    if (!user) return;

    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!doctorData) return;

    const { data, error } = await supabase
      .from("patient_doctor_access")
      .select("*")
      .eq("doctor_id", doctorData.id)
      .eq("status", "active");

    if (error) {
      console.error("Error loading patient access:", error);
      return;
    }

    setPatientAccess(data || []);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const profileData = {
      user_id: user.id,
      ...formData,
    };

    if (isDoctor && doctorProfile) {
      const { error } = await supabase
        .from("doctors")
        .update(profileData)
        .eq("id", doctorProfile.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase.from("doctors").insert([profileData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create profile",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: "Doctor profile saved successfully",
    });

    loadDoctorProfile();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <UserPlus className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            {isDoctor && (
              <TabsTrigger value="patients">
                <Users className="w-4 h-4 mr-2" />
                My Patients ({patientAccess.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({ ...formData, specialization: e.target.value })
                      }
                      placeholder="Cardiology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) =>
                        setFormData({ ...formData, license_number: e.target.value })
                      }
                      placeholder="MD123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="doctor@example.com"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  {isDoctor ? "Update Profile" : "Create Doctor Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isDoctor && (
            <TabsContent value="patients">
              <Card>
                <CardHeader>
                  <CardTitle>Patients with Access</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientAccess.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Heart className="w-12 h-12 mx-auto mb-4" />
                      <p>No patients have granted you access yet</p>
                      <p className="text-sm mt-2">
                        Patients can share their health information with you from their dashboard
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patientAccess.map((access) => (
                        <Card key={access.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Patient ID: {access.patient_id.slice(0, 8)}...</p>
                                <p className="text-sm text-muted-foreground">
                                  Granted: {new Date(access.granted_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="default">Active</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Information Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    As a doctor, you can view health information of patients who have granted you access.
                    This includes their health profiles, vital signs, medications, and allergies.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;