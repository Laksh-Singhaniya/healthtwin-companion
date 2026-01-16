import { useState, useEffect } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCall } from "@/components/VideoCall";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Video, Calendar, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  scheduled_time: string;
  status: string;
  type: string;
  reason: string;
  video_room_url: string | null;
  doctor_id: string;
}

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
}

const PatientVideoConsultation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<(Appointment & { doctor?: Doctor })[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ url: string; appointmentId: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      // Fetch video appointments
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .eq('type', 'video')
        .in('status', ['confirmed', 'pending'])
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

      // Fetch doctors
      const doctorIds = [...new Set(appointmentsData.map(a => a.doctor_id))];
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, full_name, specialization')
        .in('id', doctorIds);

      const appointmentsWithDoctors = appointmentsData.map(apt => ({
        ...apt,
        doctor: doctorsData?.find(d => d.id === apt.doctor_id)
      }));

      setAppointments(appointmentsWithDoctors);
      setLoading(false);
    };

    fetchAppointments();
  }, [user]);

  const joinVideoCall = async (appointmentId: string) => {
    setJoiningRoom(appointmentId);

    try {
      const { data, error } = await supabase.functions.invoke('create-video-room', {
        body: { appointment_id: appointmentId }
      });

      if (error) throw error;

      if (data.room_url) {
        setActiveCall({ url: data.room_url, appointmentId });
        toast({
          title: "Joining video call",
          description: "Connecting you to the consultation room...",
        });
      }
    } catch (error) {
      console.error('Error joining video call:', error);
      toast({
        title: "Error",
        description: "Failed to join video call. Please try again.",
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
      description: "You have left the video consultation.",
    });
  };

  if (activeCall) {
    return (
      <PatientLayout>
        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Video Consultation</h1>
          </div>
          <VideoCall roomUrl={activeCall.url} onLeave={leaveCall} />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Video Consultations</h1>
          <p className="text-muted-foreground">Join video calls with your doctors</p>
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
                Book a video consultation with your doctor to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {appointment.doctor?.full_name || 'Unknown'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor?.specialization}
                      </p>
                    </div>
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
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
                    onClick={() => joinVideoCall(appointment.id)}
                    disabled={joiningRoom === appointment.id || appointment.status !== 'confirmed'}
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
                        Join Video Call
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientVideoConsultation;
