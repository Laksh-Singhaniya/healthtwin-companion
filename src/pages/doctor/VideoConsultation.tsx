import { useState, useEffect } from "react";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCall } from "@/components/VideoCall";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Video, Calendar, Clock, Loader2, User } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  patient_id: string;
  scheduled_time: string;
  status: string;
  type: string;
  reason: string;
  video_room_url: string | null;
}

interface Patient {
  user_id: string;
  health_id: string;
}

const DoctorVideoConsultation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<(Appointment & { patient?: Patient })[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ url: string; appointmentId: string } | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDoctorAndAppointments = async () => {
      // Get doctor ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError || !doctorData) {
        console.error('Error fetching doctor:', doctorError);
        setLoading(false);
        return;
      }

      setDoctorId(doctorData.id);

      // Fetch video appointments
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .eq('type', 'video')
        .in('status', ['confirmed'])
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
        return;
      }

      if (!appointmentsData || appointmentsData.length === 0) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Fetch patient profiles
      const patientIds = [...new Set(appointmentsData.map(a => a.patient_id))];
      const { data: patientsData } = await supabase
        .from('health_profiles')
        .select('user_id, health_id')
        .in('user_id', patientIds);

      const appointmentsWithPatients = appointmentsData.map(apt => ({
        ...apt,
        patient: patientsData?.find(p => p.user_id === apt.patient_id)
      }));

      setAppointments(appointmentsWithPatients);
      setLoading(false);
    };

    fetchDoctorAndAppointments();
  }, [user]);

  const startVideoCall = async (appointmentId: string) => {
    setJoiningRoom(appointmentId);

    try {
      const { data, error } = await supabase.functions.invoke('create-video-room', {
        body: { appointment_id: appointmentId }
      });

      if (error) throw error;

      if (data.room_url) {
        setActiveCall({ url: data.room_url, appointmentId });
        toast({
          title: "Starting video call",
          description: "Connecting you to the consultation room...",
        });
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      toast({
        title: "Error",
        description: "Failed to start video call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningRoom(null);
    }
  };

  const leaveCall = () => {
    setActiveCall(null);
    toast({
      title: "Call ended",
      description: "You have ended the video consultation.",
    });
  };

  if (activeCall) {
    return (
      <DoctorLayout>
        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Video Consultation</h1>
          </div>
          <VideoCall roomUrl={activeCall.url} onLeave={leaveCall} />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Video Consultations</h1>
          <p className="text-muted-foreground">Start video calls with your patients</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No upcoming video consultations</h3>
              <p className="text-muted-foreground">
                Confirmed video appointments will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Patient #{appointment.patient?.health_id?.slice(-6) || 'Unknown'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Video Consultation
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">{appointment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(appointment.scheduled_time), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(appointment.scheduled_time), 'p')}
                    </div>
                  </div>
                  {appointment.reason && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Reason: {appointment.reason}
                    </p>
                  )}
                  <Button
                    onClick={() => startVideoCall(appointment.id)}
                    disabled={joiningRoom === appointment.id}
                    className="w-full sm:w-auto"
                  >
                    {joiningRoom === appointment.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Start Video Call
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorVideoConsultation;
