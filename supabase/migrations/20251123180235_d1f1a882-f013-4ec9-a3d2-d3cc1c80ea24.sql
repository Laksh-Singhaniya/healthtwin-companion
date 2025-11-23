-- Create chat_messages table for AI chatbot
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name VARCHAR NOT NULL,
  specialization VARCHAR,
  license_number VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctors
CREATE POLICY "Doctors can view their own profile"
  ON public.doctors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own profile"
  ON public.doctors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile"
  ON public.doctors
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create patient_doctor_access table
CREATE TABLE public.patient_doctor_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  UNIQUE(patient_id, doctor_id)
);

-- Enable RLS
ALTER TABLE public.patient_doctor_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_doctor_access
CREATE POLICY "Patients can view their own access grants"
  ON public.patient_doctor_access
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view access granted to them"
  ON public.patient_doctor_access
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.doctors WHERE id = doctor_id));

CREATE POLICY "Patients can grant access to doctors"
  ON public.patient_doctor_access
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can revoke access"
  ON public.patient_doctor_access
  FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete access"
  ON public.patient_doctor_access
  FOR DELETE
  USING (auth.uid() = patient_id);