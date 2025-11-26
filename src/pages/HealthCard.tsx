import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HealthCard as HealthCardComponent } from "@/components/HealthCard";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HealthCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthCardData();
    }
  }, [user]);

  const fetchHealthCardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [profileRes, emergencyRes, allergiesRes, medicationsRes] = await Promise.all([
        supabase.from("health_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("emergency_contacts").select("*").eq("user_id", user.id).eq("is_primary", true).single(),
        supabase.from("allergies").select("*").eq("user_id", user.id),
        supabase.from("medications").select("*").eq("user_id", user.id),
      ]);

      if (profileRes.data) setHealthProfile(profileRes.data);
      if (emergencyRes.data) setEmergencyContact(emergencyRes.data);
      if (allergiesRes.data) setAllergies(allergiesRes.data);
      if (medicationsRes.data) setMedications(medicationsRes.data);
    } catch (error) {
      console.error("Error fetching health card data:", error);
      toast({
        title: "Error",
        description: "Failed to load health card data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/health-card/${healthProfile?.health_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Digital Health Card",
          text: "View my digital health card",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Health card link copied to clipboard",
      });
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Digital Health Card</h1>
            <p className="text-muted-foreground">Your comprehensive medical identity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-8">
            <Skeleton className="h-64 w-full" />
          </Card>
        ) : healthProfile ? (
          <HealthCardComponent
            healthProfile={healthProfile}
            emergencyContact={emergencyContact}
            allergies={allergies}
            medications={medications}
            userName={user?.email || "User"}
          />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No health profile found. Please complete your profile first.
            </p>
          </Card>
        )}

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">About Your Digital Health Card</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Your health card is secured with encryption and only accessible to you</li>
            <li>• The QR code provides quick access to your critical medical information</li>
            <li>• You can share this card with healthcare providers during emergencies</li>
            <li>• All data is stored securely and complies with healthcare privacy standards</li>
          </ul>
        </div>
      </div>
    </PatientLayout>
  );
};

export default HealthCard;
