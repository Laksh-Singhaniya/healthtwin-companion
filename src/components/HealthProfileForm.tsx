import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Phone, AlertTriangle, Pill } from "lucide-react";

const profileSchema = z.object({
  blood_type: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
});

const allergySchema = z.object({
  allergen: z.string().min(1, "Allergen name is required"),
  severity: z.string().optional(),
  reaction: z.string().optional(),
});

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
});

export const HealthProfileForm = ({ userId, onComplete }: { userId: string; onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const emergencyForm = useForm<z.infer<typeof emergencyContactSchema>>({
    resolver: zodResolver(emergencyContactSchema),
  });

  const allergyForm = useForm<z.infer<typeof allergySchema>>({
    resolver: zodResolver(allergySchema),
  });

  const medicationForm = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
  });

  const onSubmitProfile = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("health_profiles")
        .update({
          blood_type: data.blood_type,
          height: data.height ? parseFloat(data.height) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your health profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEmergencyContact = async (data: z.infer<typeof emergencyContactSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: userId,
        name: data.name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email,
        is_primary: true,
      });

      if (error) throw error;

      toast({
        title: "Contact added",
        description: "Emergency contact has been added successfully.",
      });
      emergencyForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAllergy = async (data: z.infer<typeof allergySchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("allergies").insert({
        user_id: userId,
        allergen: data.allergen,
        severity: data.severity,
        reaction: data.reaction,
      });

      if (error) throw error;

      toast({
        title: "Allergy added",
        description: "Allergy has been recorded successfully.",
      });
      allergyForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMedication = async (data: z.infer<typeof medicationSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("medications").insert({
        user_id: userId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
      });

      if (error) throw error;

      toast({
        title: "Medication added",
        description: "Medication has been recorded successfully.",
      });
      medicationForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Health Profile</CardTitle>
        <CardDescription>Add your health information to create your digital health card</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="emergency">
              <Phone className="w-4 h-4 mr-2" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="allergies">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Allergies
            </TabsTrigger>
            <TabsTrigger value="medications">
              <Pill className="w-4 h-4 mr-2" />
              Medications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Blood Type</Label>
                  <Select onValueChange={(value) => profileForm.setValue("blood_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => profileForm.setValue("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...profileForm.register("date_of_birth")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="170"
                    {...profileForm.register("height")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    {...profileForm.register("weight")}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <form onSubmit={emergencyForm.handleSubmit(onSubmitEmergencyContact)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ec_name">Name *</Label>
                <Input id="ec_name" {...emergencyForm.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input id="relationship" placeholder="e.g., Spouse, Parent, Sibling" {...emergencyForm.register("relationship")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec_phone">Phone *</Label>
                <Input id="ec_phone" type="tel" {...emergencyForm.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec_email">Email</Label>
                <Input id="ec_email" type="email" {...emergencyForm.register("email")} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Emergency Contact
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="allergies" className="space-y-4">
            <form onSubmit={allergyForm.handleSubmit(onSubmitAllergy)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergen">Allergen *</Label>
                <Input id="allergen" placeholder="e.g., Peanuts, Penicillin" {...allergyForm.register("allergen")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select onValueChange={(value) => allergyForm.setValue("severity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="life-threatening">Life-threatening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reaction">Reaction</Label>
                <Input id="reaction" placeholder="e.g., Rash, Swelling, Difficulty breathing" {...allergyForm.register("reaction")} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Allergy
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <form onSubmit={medicationForm.handleSubmit(onSubmitMedication)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="med_name">Medication Name *</Label>
                <Input id="med_name" placeholder="e.g., Aspirin" {...medicationForm.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" placeholder="e.g., 100mg" {...medicationForm.register("dosage")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input id="frequency" placeholder="e.g., Once daily, Twice daily" {...medicationForm.register("frequency")} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Medication
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Button onClick={onComplete} variant="outline" className="w-full mt-6">
          Complete Setup
        </Button>
      </CardContent>
    </Card>
  );
};
