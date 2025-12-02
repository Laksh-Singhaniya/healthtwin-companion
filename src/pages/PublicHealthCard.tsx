import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HealthCard as HealthCardComponent } from "@/components/HealthCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const PublicHealthCard = () => {
  const { healthId } = useParams();
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (healthId) {
      fetchPublicHealthCardData();
    }
  }, [healthId]);

  const fetchPublicHealthCardData = async () => {
    if (!healthId) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch health profile by health_id
      const { data: profile, error: profileError } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("health_id", healthId)
        .single();

      if (profileError) throw profileError;
      if (!profile) {
        setError("Health card not found");
        setLoading(false);
        return;
      }

      setHealthProfile(profile);

      // Fetch related data
      const [emergencyRes, allergiesRes, medicationsRes] = await Promise.all([
        supabase
          .from("emergency_contacts")
          .select("*")
          .eq("user_id", profile.user_id)
          .eq("is_primary", true)
          .maybeSingle(),
        supabase.from("allergies").select("*").eq("user_id", profile.user_id),
        supabase.from("medications").select("*").eq("user_id", profile.user_id),
      ]);

      if (emergencyRes.data) setEmergencyContact(emergencyRes.data);
      if (allergiesRes.data) setAllergies(allergiesRes.data);
      if (medicationsRes.data) setMedications(medicationsRes.data);
    } catch (err: any) {
      console.error("Error fetching public health card data:", err);
      setError("Unable to load health card data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
        <Card className="p-8 w-full max-w-2xl">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !healthProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || "Health card not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <HealthCardComponent
          healthProfile={healthProfile}
          emergencyContact={emergencyContact}
          allergies={allergies}
          medications={medications}
          userName="Patient"
        />
      </div>
    </div>
  );
};

export default PublicHealthCard;
