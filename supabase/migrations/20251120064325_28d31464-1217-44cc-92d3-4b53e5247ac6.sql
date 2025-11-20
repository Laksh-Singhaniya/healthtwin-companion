-- Create vital_signs table for health monitoring
CREATE TABLE public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  blood_glucose DECIMAL,
  weight DECIMAL,
  temperature DECIMAL,
  oxygen_saturation INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own vital signs" 
ON public.vital_signs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vital signs" 
ON public.vital_signs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vital signs" 
ON public.vital_signs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vital signs" 
ON public.vital_signs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_vital_signs_user_recorded ON public.vital_signs(user_id, recorded_at DESC);