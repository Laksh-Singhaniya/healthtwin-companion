-- Phase 3: Women's Health Tables

-- Menstrual cycle tracking
CREATE TABLE public.menstrual_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE,
  period_start_date DATE NOT NULL,
  period_end_date DATE,
  cycle_length INTEGER,
  period_length INTEGER,
  flow_intensity VARCHAR(20),
  symptoms TEXT[],
  mood VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menstrual_cycles
CREATE POLICY "Users can view their own menstrual cycles"
  ON public.menstrual_cycles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menstrual cycles"
  ON public.menstrual_cycles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menstrual cycles"
  ON public.menstrual_cycles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menstrual cycles"
  ON public.menstrual_cycles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_menstrual_cycles_updated_at
  BEFORE UPDATE ON public.menstrual_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_menstrual_cycles_user_id_start_date ON public.menstrual_cycles(user_id, cycle_start_date DESC);

-- Pregnancy tracking
CREATE TABLE public.pregnancy_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conception_date DATE,
  due_date DATE NOT NULL,
  current_week INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  weight_gain NUMERIC(5,2),
  symptoms TEXT[],
  appointments_dates DATE[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pregnancy_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pregnancy_tracking
CREATE POLICY "Users can view their own pregnancy tracking"
  ON public.pregnancy_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pregnancy tracking"
  ON public.pregnancy_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pregnancy tracking"
  ON public.pregnancy_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pregnancy tracking"
  ON public.pregnancy_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_pregnancy_tracking_updated_at
  BEFORE UPDATE ON public.pregnancy_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_pregnancy_tracking_user_id ON public.pregnancy_tracking(user_id, created_at DESC);