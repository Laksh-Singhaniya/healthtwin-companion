import { useState, useEffect } from "react";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ChatWindow } from "@/components/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Loader2, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Patient {
  user_id: string;
  health_id: string;
}

const DoctorMessages = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPatients = async () => {
      // Get doctor ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError || !doctorData) {
        setLoading(false);
        return;
      }

      // Get patients who have granted access
      const { data: accessData, error: accessError } = await supabase
        .from('patient_doctor_access')
        .select('patient_id')
        .eq('doctor_id', doctorData.id)
        .eq('status', 'active');

      if (accessError || !accessData?.length) {
        setLoading(false);
        return;
      }

      const patientIds = accessData.map(a => a.patient_id);

      const { data: patientsData, error: patientsError } = await supabase
        .from('health_profiles')
        .select('user_id, health_id')
        .in('user_id', patientIds);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
      } else {
        setPatients(patientsData || []);
      }
      setLoading(false);
    };

    fetchPatients();
  }, [user]);

  if (loading) {
    return (
      <DoctorLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with your patients</p>
        </div>

        {patients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No patients to message</h3>
              <p className="text-muted-foreground">
                Patients who grant you access will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Patient List */}
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Patients</h3>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2">
                    {patients.map((patient) => (
                      <button
                        key={patient.user_id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedPatient?.user_id === patient.user_id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          selectedPatient?.user_id === patient.user_id
                            ? 'bg-primary-foreground/20'
                            : 'bg-primary/10'
                        }`}>
                          <User className={`h-5 w-5 ${
                            selectedPatient?.user_id === patient.user_id
                              ? 'text-primary-foreground'
                              : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">Patient</p>
                          <p className={`text-xs ${
                            selectedPatient?.user_id === patient.user_id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            ID: {patient.health_id?.slice(-6)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <div className="md:col-span-2">
              {selectedPatient ? (
                <ChatWindow
                  recipientId={selectedPatient.user_id}
                  recipientName={`Patient #${selectedPatient.health_id?.slice(-6)}`}
                />
              ) : (
                <Card className="h-[500px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Select a patient to start chatting
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorMessages;
