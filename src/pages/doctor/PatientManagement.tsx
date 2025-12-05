import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PatientManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setDoctorId(data.id);
    }
  };

  const fetchPatients = async () => {
    if (!doctorId) return;

    // First fetch access records
    const { data: accessData, error: accessError } = await supabase
      .from("patient_doctor_access")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "active");

    if (accessError || !accessData || accessData.length === 0) {
      setPatients([]);
      return;
    }

    // Then fetch health profiles for those patients
    const patientIds = accessData.map((a) => a.patient_id);
    const { data: profilesData } = await supabase
      .from("health_profiles")
      .select("*")
      .in("user_id", patientIds);

    // Combine the data
    const combined = accessData.map((access) => ({
      ...access,
      health_profiles: profilesData?.find((p) => p.user_id === access.patient_id) || null,
    }));

    setPatients(combined);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.health_profiles?.health_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.health_profiles?.blood_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Patient Management</h1>
            <p className="text-muted-foreground">View and manage your patients</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by ID or blood type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No patients yet</h3>
              <p className="text-muted-foreground">Patients who grant you access will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Health ID</th>
                      <th className="text-left p-4 font-medium">Blood Type</th>
                      <th className="text-left p-4 font-medium">Gender</th>
                      <th className="text-left p-4 font-medium">Access Granted</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-t hover:bg-muted/30">
                        <td className="p-4 font-mono text-sm">{patient.health_profiles?.health_id || "N/A"}</td>
                        <td className="p-4">{patient.health_profiles?.blood_type || "N/A"}</td>
                        <td className="p-4 capitalize">{patient.health_profiles?.gender || "N/A"}</td>
                        <td className="p-4">{new Date(patient.granted_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/doctor/patients/${patient.patient_id}/records`)}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            View Records
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
};

export default PatientManagement;
