import { useState, useEffect } from "react";
import { DoctorLayout } from "@/components/layouts/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Loader2 } from "lucide-react";

interface DoctorProfile {
  id: string;
  full_name: string;
  specialization: string | null;
  license_number: string | null;
  phone: string | null;
  email: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  bio: string | null;
  years_experience: number | null;
  consultation_fee: number | null;
}

const DoctorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    specialization: "",
    license_number: "",
    phone: "",
    email: "",
    clinic_name: "",
    clinic_address: "",
    bio: "",
    years_experience: "",
    consultation_fee: "",
  });

  useEffect(() => {
    if (user) {
      loadDoctorProfile();
    }
  }, [user]);

  const loadDoctorProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading doctor profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }

    if (data) {
      setDoctorProfile(data);
      setFormData({
        full_name: data.full_name || "",
        specialization: data.specialization || "",
        license_number: data.license_number || "",
        phone: data.phone || "",
        email: data.email || "",
        clinic_name: data.clinic_name || "",
        clinic_address: data.clinic_address || "",
        bio: data.bio || "",
        years_experience: data.years_experience?.toString() || "",
        consultation_fee: data.consultation_fee?.toString() || "",
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!formData.full_name.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const profileData = {
      user_id: user.id,
      full_name: formData.full_name,
      specialization: formData.specialization || null,
      license_number: formData.license_number || null,
      phone: formData.phone || null,
      email: formData.email || null,
      clinic_name: formData.clinic_name || null,
      clinic_address: formData.clinic_address || null,
      bio: formData.bio || null,
      years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
      consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
    };

    let error;

    if (doctorProfile) {
      // Update existing profile
      const result = await supabase
        .from("doctors")
        .update(profileData)
        .eq("id", doctorProfile.id);
      error = result.error;
    } else {
      // Create new profile
      const result = await supabase
        .from("doctors")
        .insert([profileData]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: doctorProfile ? "Profile updated successfully" : "Profile created successfully",
    });

    loadDoctorProfile();
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your professional information</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Cardiology"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="MD123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How patients can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>Details about your practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input
                    id="clinic_name"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                    placeholder="City Health Clinic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Input
                  id="clinic_address"
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                  placeholder="123 Medical Center Dr, City, State"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Bio</CardTitle>
              <CardDescription>Tell patients about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a brief description about your experience, qualifications, and areas of expertise..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {doctorProfile ? "Update Profile" : "Create Profile"}
              </>
            )}
          </Button>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
