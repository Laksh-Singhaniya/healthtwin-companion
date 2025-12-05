import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MapPin, Check, X, FileText, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
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

  const fetchAppointments = async () => {
    if (!doctorId) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("scheduled_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Appointment ${status}`,
      });
      fetchAppointments();
    }
  };

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  const confirmedAppointments = appointments.filter((apt) => apt.status === "confirmed");

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}/records`);
  };

  const handleOpenNotes = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    const { error } = await supabase
      .from("appointments")
      .update({ notes })
      .eq("id", selectedAppointment.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
      setNotesDialogOpen(false);
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DoctorLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient consultations</p>
        </div>

        {/* Pending Requests */}
        {pendingAppointments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
            <div className="grid gap-4">
              {pendingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">Patient ID: {appointment.patient_id.slice(0, 8)}...</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(appointment.scheduled_time).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(appointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointment.type === "video" ? (
                              <>
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span>Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>In-Person</span>
                              </>
                            )}
                          </div>
                        </div>

                        {appointment.reason && (
                          <p className="text-sm"><span className="font-medium">Reason:</span> {appointment.reason}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleUpdateStatus(appointment.id, "cancelled")}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Appointments */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {confirmedAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No confirmed appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {confirmedAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">Patient ID: {appointment.patient_id.slice(0, 8)}...</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(appointment.scheduled_time).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(appointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointment.type === "video" ? (
                              <>
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span>Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>In-Person</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleViewPatient(appointment.patient_id)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Patient
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenNotes(appointment)}
                          className="gap-2"
                        >
                          <StickyNote className="h-4 w-4" />
                          {appointment.notes ? "Edit Notes" : "Add Notes"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Add consultation notes, observations, or prescriptions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointments;
