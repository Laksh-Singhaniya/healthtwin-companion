import { useState, useEffect } from "react";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Shield, ShieldOff, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  specialization: string | null;
  clinic_name: string | null;
  email: string | null;
  phone: string | null;
}

interface DoctorAccess {
  id: string;
  doctor_id: string;
  patient_id: string;
  status: string;
  granted_at: string;
  expires_at: string | null;
  doctors: Doctor;
}

const MyDoctors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [grantedDoctors, setGrantedDoctors] = useState<DoctorAccess[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGrantedDoctors();
      fetchAllDoctors();
    }
  }, [user]);

  const fetchGrantedDoctors = async () => {
    if (!user) return;

    // First fetch access records
    const { data: accessData, error: accessError } = await supabase
      .from("patient_doctor_access")
      .select("*")
      .eq("patient_id", user.id)
      .eq("status", "active");

    if (accessError) {
      console.error("Error fetching access records:", accessError);
      setLoading(false);
      return;
    }

    if (!accessData || accessData.length === 0) {
      setGrantedDoctors([]);
      setLoading(false);
      return;
    }

    // Then fetch doctors for those access records
    const doctorIds = accessData.map((a) => a.doctor_id);
    const { data: doctorsData, error: doctorsError } = await supabase
      .from("doctors")
      .select("*")
      .in("id", doctorIds);

    if (doctorsError) {
      console.error("Error fetching doctors:", doctorsError);
      setLoading(false);
      return;
    }

    // Combine the data
    const combined = accessData.map((access) => ({
      ...access,
      doctors: doctorsData?.find((d) => d.id === access.doctor_id) || null,
    })) as unknown as DoctorAccess[];

    setGrantedDoctors(combined);
    setLoading(false);
  };

  const fetchAllDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("full_name");

    if (!error && data) {
      setAllDoctors(data);
    }
  };

  const grantAccess = async (doctorId: string) => {
    if (!user) return;

    // Check if access already exists
    const existing = grantedDoctors.find((g) => g.doctor_id === doctorId);
    if (existing) {
      toast({
        title: "Already Granted",
        description: "This doctor already has access to your records",
      });
      return;
    }

    const { error } = await supabase.from("patient_doctor_access").insert({
      patient_id: user.id,
      doctor_id: doctorId,
      status: "active",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to grant access",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Access Granted",
        description: "Doctor can now view your health records",
      });
      fetchGrantedDoctors();
      setDialogOpen(false);
    }
  };

  const revokeAccess = async (accessId: string) => {
    const { error } = await supabase
      .from("patient_doctor_access")
      .update({ status: "revoked" })
      .eq("id", accessId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Access Revoked",
        description: "Doctor can no longer view your health records",
      });
      fetchGrantedDoctors();
    }
  };

  const filteredDoctors = allDoctors.filter(
    (doctor) =>
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grantedDoctorIds = grantedDoctors.map((g) => g.doctor_id);

  return (
    <PatientLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Doctors</h1>
            <p className="text-muted-foreground">
              Manage which doctors can access your health records
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Grant Access to Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Grant Doctor Access</DialogTitle>
                <DialogDescription>
                  Search and select a doctor to grant them access to your health
                  records
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2">
                  {filteredDoctors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No doctors found
                    </p>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <Card key={doctor.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{doctor.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doctor.specialization || "General Practice"}
                              </p>
                            </div>
                          </div>
                          {grantedDoctorIds.includes(doctor.id) ? (
                            <Badge variant="secondary">Already Granted</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => grantAccess(doctor.id)}
                            >
                              Grant Access
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Granted Doctors List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Doctors with Access
          </h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : grantedDoctors.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No doctors have access yet</h3>
                <p className="text-muted-foreground mb-4">
                  Grant access to doctors so they can view your health records
                  and provide better care
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Grant Access to Doctor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {grantedDoctors.map((access) => (
                <Card key={access.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {access.doctors?.full_name?.charAt(0) || "D"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {access.doctors?.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {access.doctors?.specialization || "General Practice"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Granted{" "}
                              {new Date(access.granted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {access.doctors?.full_name} will no longer be able
                              to view your health records. You can grant access
                              again at any time.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => revokeAccess(access.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Revoke Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {access.doctors?.clinic_name && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {access.doctors.clinic_name}
                      </p>
                    )}
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

export default MyDoctors;
