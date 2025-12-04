import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Heart,
  Pill,
  AlertTriangle,
  Activity,
  Calendar,
} from "lucide-react";

interface HealthProfile {
  health_id: string;
  blood_type: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
}

interface VitalSign {
  id: string;
  recorded_at: string;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  blood_glucose: number | null;
}

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
}

interface Allergy {
  id: string;
  allergen: string;
  severity: string | null;
  reaction: string | null;
}

const PatientRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  useEffect(() => {
    if (user && patientId) {
      checkAccessAndFetchData();
    }
  }, [user, patientId]);

  const checkAccessAndFetchData = async () => {
    if (!user || !patientId) return;

    // Get doctor's ID
    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!doctorData) {
      setLoading(false);
      return;
    }

    // Check if doctor has access to this patient
    const { data: accessData } = await supabase
      .from("patient_doctor_access")
      .select("*")
      .eq("doctor_id", doctorData.id)
      .eq("patient_id", patientId)
      .eq("status", "active")
      .single();

    if (!accessData) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    setHasAccess(true);

    // Fetch all patient data in parallel
    const [profileRes, vitalsRes, medsRes, allergiesRes] = await Promise.all([
      supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", patientId)
        .single(),
      supabase
        .from("vital_signs")
        .select("*")
        .eq("user_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(10),
      supabase
        .from("medications")
        .select("*")
        .eq("user_id", patientId),
      supabase
        .from("allergies")
        .select("*")
        .eq("user_id", patientId),
    ]);

    if (profileRes.data) setHealthProfile(profileRes.data);
    if (vitalsRes.data) setVitalSigns(vitalsRes.data);
    if (medsRes.data) setMedications(medsRes.data);
    if (allergiesRes.data) setAllergies(allergiesRes.data);

    setLoading(false);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DoctorLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DoctorLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have access to this patient's records.
              </p>
              <Button onClick={() => navigate("/doctor/patients")}>
                Back to Patients
              </Button>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/doctor/patients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Patient Records</h1>
            <p className="text-muted-foreground">
              Health ID: {healthProfile?.health_id || "N/A"}
            </p>
          </div>
        </div>

        {/* Patient Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-semibold capitalize">
                  {healthProfile?.gender || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">
                  {healthProfile?.date_of_birth
                    ? `${calculateAge(healthProfile.date_of_birth)} years`
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-semibold">
                  {healthProfile?.blood_type || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <p className="font-semibold">
                  {healthProfile?.height && healthProfile?.weight
                    ? (
                        healthProfile.weight /
                        Math.pow(healthProfile.height / 100, 2)
                      ).toFixed(1)
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vitals">
          <TabsList>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vitalSigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No vital signs recorded
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Heart Rate</th>
                          <th className="text-left p-2">Blood Pressure</th>
                          <th className="text-left p-2">Temperature</th>
                          <th className="text-left p-2">O2 Sat</th>
                          <th className="text-left p-2">Glucose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vitalSigns.map((vital) => (
                          <tr key={vital.id} className="border-b">
                            <td className="p-2 text-sm">
                              {new Date(vital.recorded_at).toLocaleDateString()}
                            </td>
                            <td className="p-2 text-sm">
                              {vital.heart_rate ? `${vital.heart_rate} bpm` : "-"}
                            </td>
                            <td className="p-2 text-sm">
                              {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                                ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                                : "-"}
                            </td>
                            <td className="p-2 text-sm">
                              {vital.temperature ? `${vital.temperature}°C` : "-"}
                            </td>
                            <td className="p-2 text-sm">
                              {vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : "-"}
                            </td>
                            <td className="p-2 text-sm">
                              {vital.blood_glucose ? `${vital.blood_glucose} mg/dL` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No medications recorded
                  </p>
                ) : (
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} • {med.frequency}
                          </p>
                        </div>
                        {med.start_date && (
                          <Badge variant="secondary">
                            Since {new Date(med.start_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allergies" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allergies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No allergies recorded
                  </p>
                ) : (
                  <div className="space-y-3">
                    {allergies.map((allergy) => (
                      <div
                        key={allergy.id}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{allergy.allergen}</p>
                          {allergy.reaction && (
                            <p className="text-sm text-muted-foreground">
                              Reaction: {allergy.reaction}
                            </p>
                          )}
                        </div>
                        {allergy.severity && (
                          <Badge
                            variant={
                              allergy.severity === "severe"
                                ? "destructive"
                                : allergy.severity === "moderate"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {allergy.severity}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
};

export default PatientRecords;
