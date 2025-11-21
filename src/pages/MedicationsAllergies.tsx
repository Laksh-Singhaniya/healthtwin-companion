import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pill, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { NavLink } from "@/components/NavLink";

type Medication = {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  prescribing_doctor: string | null;
  notes: string | null;
};

type Allergy = {
  id: string;
  allergen: string;
  severity: string | null;
  reaction: string | null;
  diagnosed_date: string | null;
};

export default function MedicationsAllergies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showAllergyForm, setShowAllergyForm] = useState(false);

  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
    prescribing_doctor: "",
    notes: "",
  });

  const [allergyForm, setAllergyForm] = useState({
    allergen: "",
    severity: "",
    reaction: "",
    diagnosed_date: "",
  });

  useEffect(() => {
    if (user) {
      fetchMedications();
      fetchAllergies();
    }
  }, [user]);

  const fetchMedications = async () => {
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching medications", description: error.message, variant: "destructive" });
    } else {
      setMedications(data || []);
    }
  };

  const fetchAllergies = async () => {
    const { data, error } = await supabase
      .from("allergies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching allergies", description: error.message, variant: "destructive" });
    } else {
      setAllergies(data || []);
    }
  };

  const handleAddMedication = async () => {
    if (!medicationForm.name) {
      toast({ title: "Medication name required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("medications").insert({
      user_id: user!.id,
      name: medicationForm.name,
      dosage: medicationForm.dosage || null,
      frequency: medicationForm.frequency || null,
      start_date: medicationForm.start_date || null,
      end_date: medicationForm.end_date || null,
      prescribing_doctor: medicationForm.prescribing_doctor || null,
      notes: medicationForm.notes || null,
    });

    if (error) {
      toast({ title: "Error adding medication", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Medication added successfully" });
      setMedicationForm({ name: "", dosage: "", frequency: "", start_date: "", end_date: "", prescribing_doctor: "", notes: "" });
      setShowMedicationForm(false);
      fetchMedications();
    }
  };

  const handleAddAllergy = async () => {
    if (!allergyForm.allergen) {
      toast({ title: "Allergen name required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("allergies").insert({
      user_id: user!.id,
      allergen: allergyForm.allergen,
      severity: allergyForm.severity || null,
      reaction: allergyForm.reaction || null,
      diagnosed_date: allergyForm.diagnosed_date || null,
    });

    if (error) {
      toast({ title: "Error adding allergy", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Allergy added successfully" });
      setAllergyForm({ allergen: "", severity: "", reaction: "", diagnosed_date: "" });
      setShowAllergyForm(false);
      fetchAllergies();
    }
  };

  const handleDeleteMedication = async (id: string) => {
    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting medication", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Medication deleted" });
      fetchMedications();
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    const { error } = await supabase.from("allergies").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting allergy", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Allergy deleted" });
      fetchAllergies();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Medications & Allergies</h1>
            <div className="flex gap-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/health-monitoring">Vitals</NavLink>
              <NavLink to="/womens-health">Women's Health</NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Medications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medications
                </CardTitle>
                <CardDescription>Track your current medications</CardDescription>
              </div>
              <Button onClick={() => setShowMedicationForm(!showMedicationForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showMedicationForm && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="med_name">Medication Name *</Label>
                    <Input
                      id="med_name"
                      placeholder="e.g., Aspirin"
                      value={medicationForm.name}
                      onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 100mg"
                      value={medicationForm.dosage}
                      onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      placeholder="e.g., Once daily"
                      value={medicationForm.frequency}
                      onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctor">Prescribing Doctor</Label>
                    <Input
                      id="doctor"
                      placeholder="Doctor name"
                      value={medicationForm.prescribing_doctor}
                      onChange={(e) => setMedicationForm({ ...medicationForm, prescribing_doctor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={medicationForm.start_date}
                      onChange={(e) => setMedicationForm({ ...medicationForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={medicationForm.end_date}
                      onChange={(e) => setMedicationForm({ ...medicationForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="med_notes">Notes</Label>
                  <Textarea
                    id="med_notes"
                    placeholder="Additional information..."
                    value={medicationForm.notes}
                    onChange={(e) => setMedicationForm({ ...medicationForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddMedication}>Save Medication</Button>
                  <Button variant="outline" onClick={() => setShowMedicationForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="font-semibold">{med.name}</p>
                      {med.dosage && <p className="text-sm">Dosage: {med.dosage}</p>}
                      {med.frequency && <p className="text-sm">Frequency: {med.frequency}</p>}
                      {med.prescribing_doctor && <p className="text-sm">Doctor: {med.prescribing_doctor}</p>}
                      {med.start_date && (
                        <p className="text-sm text-muted-foreground">
                          Started: {format(new Date(med.start_date), "MMM dd, yyyy")}
                        </p>
                      )}
                      {med.notes && <p className="text-sm text-muted-foreground mt-2">{med.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(med.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {medications.length === 0 && !showMedicationForm && (
                <p className="text-center text-muted-foreground py-8">No medications recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Allergies
                </CardTitle>
                <CardDescription>Record your allergies and reactions</CardDescription>
              </div>
              <Button onClick={() => setShowAllergyForm(!showAllergyForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Allergy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showAllergyForm && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="allergen">Allergen *</Label>
                    <Input
                      id="allergen"
                      placeholder="e.g., Peanuts"
                      value={allergyForm.allergen}
                      onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={allergyForm.severity} onValueChange={(value) => setAllergyForm({ ...allergyForm, severity: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reaction">Reaction</Label>
                    <Input
                      id="reaction"
                      placeholder="e.g., Hives, swelling"
                      value={allergyForm.reaction}
                      onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diagnosed_date">Diagnosed Date</Label>
                    <Input
                      id="diagnosed_date"
                      type="date"
                      value={allergyForm.diagnosed_date}
                      onChange={(e) => setAllergyForm({ ...allergyForm, diagnosed_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddAllergy}>Save Allergy</Button>
                  <Button variant="outline" onClick={() => setShowAllergyForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="font-semibold">{allergy.allergen}</p>
                      {allergy.severity && (
                        <p className="text-sm">
                          Severity: <span className="capitalize">{allergy.severity}</span>
                        </p>
                      )}
                      {allergy.reaction && <p className="text-sm">Reaction: {allergy.reaction}</p>}
                      {allergy.diagnosed_date && (
                        <p className="text-sm text-muted-foreground">
                          Diagnosed: {format(new Date(allergy.diagnosed_date), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAllergy(allergy.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {allergies.length === 0 && !showAllergyForm && (
                <p className="text-center text-muted-foreground py-8">No allergies recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
