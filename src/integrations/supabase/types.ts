export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      allergies: {
        Row: {
          allergen: string
          created_at: string | null
          diagnosed_date: string | null
          id: string
          reaction: string | null
          severity: string | null
          user_id: string
        }
        Insert: {
          allergen: string
          created_at?: string | null
          diagnosed_date?: string | null
          id?: string
          reaction?: string | null
          severity?: string | null
          user_id: string
        }
        Update: {
          allergen?: string
          created_at?: string | null
          diagnosed_date?: string | null
          id?: string
          reaction?: string | null
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string | null
          doctor_id: string
          duration: number | null
          id: string
          notes: string | null
          patient_id: string
          prescription: string | null
          reason: string | null
          scheduled_time: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          duration?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription?: string | null
          reason?: string | null
          scheduled_time: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          duration?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription?: string | null
          reason?: string | null
          scheduled_time?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          clinic_address: string | null
          clinic_name: string | null
          consultation_fee: number | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          rating: number | null
          specialization: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_fee?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_fee?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          blood_type: string | null
          created_at: string | null
          date_of_birth: string | null
          gender: string | null
          health_id: string
          height: number | null
          id: string
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          health_id: string
          height?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          health_id?: string
          height?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          prescribing_doctor: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          prescribing_doctor?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          prescribing_doctor?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      menstrual_cycles: {
        Row: {
          created_at: string
          cycle_end_date: string | null
          cycle_length: number | null
          cycle_start_date: string
          flow_intensity: string | null
          id: string
          mood: string | null
          notes: string | null
          period_end_date: string | null
          period_length: number | null
          period_start_date: string
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_end_date?: string | null
          cycle_length?: number | null
          cycle_start_date: string
          flow_intensity?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          period_end_date?: string | null
          period_length?: number | null
          period_start_date: string
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_end_date?: string | null
          cycle_length?: number | null
          cycle_start_date?: string
          flow_intensity?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          period_end_date?: string | null
          period_length?: number | null
          period_start_date?: string
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      patient_doctor_access: {
        Row: {
          doctor_id: string
          expires_at: string | null
          granted_at: string
          id: string
          patient_id: string
          status: string
        }
        Insert: {
          doctor_id: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          patient_id: string
          status?: string
        }
        Update: {
          doctor_id?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          patient_id?: string
          status?: string
        }
        Relationships: []
      }
      pregnancy_tracking: {
        Row: {
          appointments_dates: string[] | null
          conception_date: string | null
          created_at: string
          current_week: number | null
          due_date: string
          id: string
          notes: string | null
          status: string | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
          weight_gain: number | null
        }
        Insert: {
          appointments_dates?: string[] | null
          conception_date?: string | null
          created_at?: string
          current_week?: number | null
          due_date: string
          id?: string
          notes?: string | null
          status?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
          weight_gain?: number | null
        }
        Update: {
          appointments_dates?: string[] | null
          conception_date?: string | null
          created_at?: string
          current_week?: number | null
          due_date?: string
          id?: string
          notes?: string | null
          status?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
          weight_gain?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          blood_glucose: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          heart_rate: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          recorded_at: string
          temperature: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          recorded_at?: string
          temperature?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          recorded_at?: string
          temperature?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_health_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "doctor", "admin"],
    },
  },
} as const
