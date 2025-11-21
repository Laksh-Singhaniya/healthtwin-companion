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
import { Calendar, Heart, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { NavLink } from "@/components/NavLink";

type MenstrualCycle = {
  id: string;
  cycle_start_date: string;
  cycle_end_date: string | null;
  period_start_date: string;
  period_end_date: string | null;
  cycle_length: number | null;
  period_length: number | null;
  flow_intensity: string | null;
  symptoms: string[] | null;
  mood: string | null;
  notes: string | null;
};

type PregnancyTracking = {
  id: string;
  conception_date: string | null;
  due_date: string;
  current_week: number | null;
  status: string;
  weight_gain: number | null;
  symptoms: string[] | null;
  notes: string | null;
};

export default function WomensHealth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cycles, setCycles] = useState<MenstrualCycle[]>([]);
  const [pregnancy, setPregnancy] = useState<PregnancyTracking | null>(null);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showPregnancyForm, setShowPregnancyForm] = useState(false);

  // Form states
  const [cycleForm, setCycleForm] = useState({
    cycle_start_date: "",
    period_start_date: "",
    period_end_date: "",
    flow_intensity: "",
    mood: "",
    notes: "",
  });

  const [pregnancyForm, setPregnancyForm] = useState({
    due_date: "",
    conception_date: "",
    current_week: "",
    weight_gain: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchCycles();
      fetchPregnancy();
    }
  }, [user]);

  const fetchCycles = async () => {
    const { data, error } = await supabase
      .from("menstrual_cycles")
      .select("*")
      .order("cycle_start_date", { ascending: false })
      .limit(10);

    if (error) {
      toast({ title: "Error fetching cycles", description: error.message, variant: "destructive" });
    } else {
      setCycles(data || []);
    }
  };

  const fetchPregnancy = async () => {
    const { data, error } = await supabase
      .from("pregnancy_tracking")
      .select("*")
      .eq("status", "active")
      .single();

    if (error && error.code !== "PGRST116") {
      toast({ title: "Error fetching pregnancy data", description: error.message, variant: "destructive" });
    } else {
      setPregnancy(data);
    }
  };

  const handleAddCycle = async () => {
    if (!cycleForm.cycle_start_date || !cycleForm.period_start_date) {
      toast({ title: "Required fields missing", description: "Please fill in the required dates", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("menstrual_cycles").insert({
      user_id: user!.id,
      cycle_start_date: cycleForm.cycle_start_date,
      period_start_date: cycleForm.period_start_date,
      period_end_date: cycleForm.period_end_date || null,
      flow_intensity: cycleForm.flow_intensity || null,
      mood: cycleForm.mood || null,
      notes: cycleForm.notes || null,
    });

    if (error) {
      toast({ title: "Error adding cycle", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cycle added successfully" });
      setCycleForm({ cycle_start_date: "", period_start_date: "", period_end_date: "", flow_intensity: "", mood: "", notes: "" });
      setShowCycleForm(false);
      fetchCycles();
    }
  };

  const handleAddPregnancy = async () => {
    if (!pregnancyForm.due_date) {
      toast({ title: "Required field missing", description: "Please enter due date", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("pregnancy_tracking").insert({
      user_id: user!.id,
      due_date: pregnancyForm.due_date,
      conception_date: pregnancyForm.conception_date || null,
      current_week: pregnancyForm.current_week ? parseInt(pregnancyForm.current_week) : null,
      weight_gain: pregnancyForm.weight_gain ? parseFloat(pregnancyForm.weight_gain) : null,
      notes: pregnancyForm.notes || null,
      status: "active",
    });

    if (error) {
      toast({ title: "Error adding pregnancy tracking", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pregnancy tracking started" });
      setPregnancyForm({ due_date: "", conception_date: "", current_week: "", weight_gain: "", notes: "" });
      setShowPregnancyForm(false);
      fetchPregnancy();
    }
  };

  const handleDeleteCycle = async (id: string) => {
    const { error } = await supabase.from("menstrual_cycles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting cycle", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cycle deleted" });
      fetchCycles();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Women's Health</h1>
            <div className="flex gap-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/health-monitoring">Vitals</NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Menstrual Cycle Tracking */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Menstrual Cycle Tracking
                </CardTitle>
                <CardDescription>Track your cycles and symptoms</CardDescription>
              </div>
              <Button onClick={() => setShowCycleForm(!showCycleForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Cycle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showCycleForm && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cycle_start">Cycle Start Date *</Label>
                    <Input
                      id="cycle_start"
                      type="date"
                      value={cycleForm.cycle_start_date}
                      onChange={(e) => setCycleForm({ ...cycleForm, cycle_start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="period_start">Period Start Date *</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={cycleForm.period_start_date}
                      onChange={(e) => setCycleForm({ ...cycleForm, period_start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="period_end">Period End Date</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={cycleForm.period_end_date}
                      onChange={(e) => setCycleForm({ ...cycleForm, period_end_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flow">Flow Intensity</Label>
                    <Select value={cycleForm.flow_intensity} onValueChange={(value) => setCycleForm({ ...cycleForm, flow_intensity: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Input
                      id="mood"
                      placeholder="e.g., Happy, Tired, Irritable"
                      value={cycleForm.mood}
                      onChange={(e) => setCycleForm({ ...cycleForm, mood: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any symptoms or observations..."
                    value={cycleForm.notes}
                    onChange={(e) => setCycleForm({ ...cycleForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCycle}>Save Cycle</Button>
                  <Button variant="outline" onClick={() => setShowCycleForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="font-semibold">
                        Cycle: {format(new Date(cycle.cycle_start_date), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Period: {format(new Date(cycle.period_start_date), "MMM dd")}
                        {cycle.period_end_date && ` - ${format(new Date(cycle.period_end_date), "MMM dd")}`}
                      </p>
                      {cycle.flow_intensity && (
                        <p className="text-sm">Flow: <span className="capitalize">{cycle.flow_intensity}</span></p>
                      )}
                      {cycle.mood && <p className="text-sm">Mood: {cycle.mood}</p>}
                      {cycle.notes && <p className="text-sm text-muted-foreground mt-2">{cycle.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCycle(cycle.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {cycles.length === 0 && !showCycleForm && (
                <p className="text-center text-muted-foreground py-8">No cycles recorded yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pregnancy Tracking */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Pregnancy Tracking
                </CardTitle>
                <CardDescription>Track your pregnancy journey</CardDescription>
              </div>
              {!pregnancy && (
                <Button onClick={() => setShowPregnancyForm(!showPregnancyForm)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Tracking
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showPregnancyForm && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={pregnancyForm.due_date}
                      onChange={(e) => setPregnancyForm({ ...pregnancyForm, due_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conception_date">Conception Date</Label>
                    <Input
                      id="conception_date"
                      type="date"
                      value={pregnancyForm.conception_date}
                      onChange={(e) => setPregnancyForm({ ...pregnancyForm, conception_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_week">Current Week</Label>
                    <Input
                      id="current_week"
                      type="number"
                      placeholder="e.g., 12"
                      value={pregnancyForm.current_week}
                      onChange={(e) => setPregnancyForm({ ...pregnancyForm, current_week: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight_gain">Weight Gain (kg)</Label>
                    <Input
                      id="weight_gain"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.5"
                      value={pregnancyForm.weight_gain}
                      onChange={(e) => setPregnancyForm({ ...pregnancyForm, weight_gain: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="preg_notes">Notes</Label>
                  <Textarea
                    id="preg_notes"
                    placeholder="Symptoms, appointments, observations..."
                    value={pregnancyForm.notes}
                    onChange={(e) => setPregnancyForm({ ...pregnancyForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPregnancy}>Start Tracking</Button>
                  <Button variant="outline" onClick={() => setShowPregnancyForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {pregnancy && (
              <div className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Active Pregnancy</h3>
                  <span className="text-sm text-muted-foreground">Week {pregnancy.current_week || "N/A"}</span>
                </div>
                <p className="text-sm">Due Date: {format(new Date(pregnancy.due_date), "MMMM dd, yyyy")}</p>
                {pregnancy.conception_date && (
                  <p className="text-sm">Conception: {format(new Date(pregnancy.conception_date), "MMM dd, yyyy")}</p>
                )}
                {pregnancy.weight_gain && <p className="text-sm">Weight Gain: {pregnancy.weight_gain} kg</p>}
                {pregnancy.notes && <p className="text-sm text-muted-foreground mt-2">{pregnancy.notes}</p>}
              </div>
            )}

            {!pregnancy && !showPregnancyForm && (
              <p className="text-center text-muted-foreground py-8">No active pregnancy tracking</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
