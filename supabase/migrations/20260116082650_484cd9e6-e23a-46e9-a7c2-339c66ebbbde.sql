-- Add video_room_url to appointments table for Daily.co rooms
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS video_room_url TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS video_room_name TEXT;

-- Add device_type and device_id columns to vital_signs for IoT tracking
ALTER TABLE public.vital_signs ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE public.vital_signs ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.vital_signs ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Create RLS policy for IoT webhook to insert vital signs
CREATE POLICY "Service role can insert vital signs" 
ON public.vital_signs 
FOR INSERT 
WITH CHECK (true);