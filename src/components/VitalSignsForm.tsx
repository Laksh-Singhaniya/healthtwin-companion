import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Activity, Heart, Droplet, Weight, Thermometer, Wind } from "lucide-react";

const vitalSignsSchema = z.object({
  blood_pressure_systolic: z.number().min(70).max(200).optional().or(z.literal("")),
  blood_pressure_diastolic: z.number().min(40).max(130).optional().or(z.literal("")),
  heart_rate: z.number().min(40).max(200).optional().or(z.literal("")),
  blood_glucose: z.number().min(20).max(600).optional().or(z.literal("")),
  weight: z.number().min(20).max(300).optional().or(z.literal("")),
  temperature: z.number().min(95).max(106).optional().or(z.literal("")),
  oxygen_saturation: z.number().min(70).max(100).optional().or(z.literal("")),
  notes: z.string().optional(),
});

type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;

export const VitalSignsForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsSchema),
  });

  const onSubmit = async (data: VitalSignsFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    const vitalData = {
      user_id: user.id,
      blood_pressure_systolic: data.blood_pressure_systolic || null,
      blood_pressure_diastolic: data.blood_pressure_diastolic || null,
      heart_rate: data.heart_rate || null,
      blood_glucose: data.blood_glucose || null,
      weight: data.weight || null,
      temperature: data.temperature || null,
      oxygen_saturation: data.oxygen_saturation || null,
      notes: data.notes || null,
    };

    const { error } = await supabase.from("vital_signs").insert([vitalData]);

    if (error) {
      toast.error("Failed to record vital signs");
      console.error(error);
    } else {
      toast.success("Vital signs recorded successfully");
      reset();
      onSuccess?.();
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Record Vital Signs
        </CardTitle>
        <CardDescription>
          Track your health metrics. Enter at least one measurement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blood Pressure */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-destructive" />
                Blood Pressure (mmHg)
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Systolic"
                    {...register("blood_pressure_systolic", { valueAsNumber: true })}
                  />
                  {errors.blood_pressure_systolic && (
                    <p className="text-xs text-destructive mt-1">70-200 range</p>
                  )}
                </div>
                <span className="self-center">/</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Diastolic"
                    {...register("blood_pressure_diastolic", { valueAsNumber: true })}
                  />
                  {errors.blood_pressure_diastolic && (
                    <p className="text-xs text-destructive mt-1">40-130 range</p>
                  )}
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Heart Rate (bpm)
              </Label>
              <Input
                type="number"
                placeholder="e.g., 72"
                {...register("heart_rate", { valueAsNumber: true })}
              />
              {errors.heart_rate && (
                <p className="text-xs text-destructive">40-200 range</p>
              )}
            </div>

            {/* Blood Glucose */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-500" />
                Blood Glucose (mg/dL)
              </Label>
              <Input
                type="number"
                placeholder="e.g., 105"
                {...register("blood_glucose", { valueAsNumber: true })}
              />
              {errors.blood_glucose && (
                <p className="text-xs text-destructive">20-600 range</p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-amber-500" />
                Weight (kg)
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 65.5"
                {...register("weight", { valueAsNumber: true })}
              />
              {errors.weight && (
                <p className="text-xs text-destructive">20-300 range</p>
              )}
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                Temperature (°F)
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 98.6"
                {...register("temperature", { valueAsNumber: true })}
              />
              {errors.temperature && (
                <p className="text-xs text-destructive">95-106 range</p>
              )}
            </div>

            {/* Oxygen Saturation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-cyan-500" />
                Oxygen Saturation (%)
              </Label>
              <Input
                type="number"
                placeholder="e.g., 98"
                {...register("oxygen_saturation", { valueAsNumber: true })}
              />
              {errors.oxygen_saturation && (
                <p className="text-xs text-destructive">70-100 range</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Any additional information about your health today..."
              {...register("notes")}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Recording..." : "Record Vital Signs"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
