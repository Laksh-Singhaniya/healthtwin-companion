import { useState, useEffect } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PatientAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctor_id: "",
    scheduled_time: "",
    type: "in-person",
    reason: "",
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [user]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("full_name");

    if (!error && data) {
      setDoctors(data);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctors (
          full_name,
          specialization,
          clinic_name
        )
      `)
      .eq("patient_id", user.id)
      .order("scheduled_time", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
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

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_time) >= new Date() && apt.status !== "cancelled"
  );

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_time) < new Date() || apt.status === "completed"
  );

  const handleBookAppointment = async () => {
    if (!user || !bookingForm.doctor_id || !bookingForm.scheduled_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_id: bookingForm.doctor_id,
      scheduled_time: bookingForm.scheduled_time,
      type: bookingForm.type,
      reason: bookingForm.reason,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });
      setBookingOpen(false);
      setBookingForm({
        doctor_id: "",
        scheduled_time: "",
        type: "in-person",
        reason: "",
      });
      fetchAppointments();
    }
  };

  return (
    <PatientLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your doctor consultations</p>
          </div>
          <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Book New Appointment
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Book New Appointment</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Doctor *</Label>
                  <Select value={bookingForm.doctor_id} onValueChange={(value) => setBookingForm({ ...bookingForm, doctor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={bookingForm.scheduled_time}
                    onChange={(e) => setBookingForm({ ...bookingForm, scheduled_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Appointment Type</Label>
                  <Select value={bookingForm.type} onValueChange={(value) => setBookingForm({ ...bookingForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="video">Video Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Textarea
                    placeholder="Describe your symptoms or reason for consultation"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleBookAppointment}>
                  Confirm Booking
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button>Schedule Your First Appointment</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-primary">
                              {appointment.doctors?.full_name?.charAt(0) || "D"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{appointment.doctors?.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.doctors?.specialization}</p>
                            <Badge className={`mt-2 ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </Badge>
                          </div>
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
                                <span>{appointment.doctors?.clinic_name || "In-Person"}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {appointment.reason && (
                          <p className="text-sm"><span className="font-medium">Reason:</span> {appointment.reason}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="ghost" className="text-red-600">Cancel</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{appointment.doctors?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduled_time).toLocaleDateString()} at{" "}
                          {new Date(appointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientAppointments;
