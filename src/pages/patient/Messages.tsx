import { useState, useEffect } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ChatWindow } from "@/components/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Loader2, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  specialization: string;
}

const PatientMessages = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDoctors = async () => {
      // Get doctors that patient has granted access to
      const { data: accessData, error: accessError } = await supabase
        .from('patient_doctor_access')
        .select('doctor_id')
        .eq('patient_id', user.id)
        .eq('status', 'active');

      if (accessError || !accessData?.length) {
        setLoading(false);
        return;
      }

      const doctorIds = accessData.map(a => a.doctor_id);

      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, user_id, full_name, specialization')
        .in('id', doctorIds);

      if (doctorsError) {
        console.error('Error fetching doctors:', doctorsError);
      } else {
        setDoctors(doctorsData || []);
      }
      setLoading(false);
    };

    fetchDoctors();
  }, [user]);

  if (loading) {
    return (
      <PatientLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your doctors</p>
        </div>

        {doctors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No doctors to message</h3>
              <p className="text-muted-foreground">
                Grant access to a doctor to start messaging them
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Doctor List */}
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Doctors</h3>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedDoctor?.id === doctor.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          selectedDoctor?.id === doctor.id
                            ? 'bg-primary-foreground/20'
                            : 'bg-primary/10'
                        }`}>
                          <User className={`h-5 w-5 ${
                            selectedDoctor?.id === doctor.id
                              ? 'text-primary-foreground'
                              : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">Dr. {doctor.full_name}</p>
                          <p className={`text-xs ${
                            selectedDoctor?.id === doctor.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {doctor.specialization}
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
              {selectedDoctor ? (
                <ChatWindow
                  recipientId={selectedDoctor.user_id}
                  recipientName={`Dr. ${selectedDoctor.full_name}`}
                />
              ) : (
                <Card className="h-[500px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Select a doctor to start chatting
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientMessages;
