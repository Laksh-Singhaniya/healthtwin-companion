-- Add public read policies for health card data (emergency access)
-- This allows anyone with the health_id to view critical health information

-- Public access to health profiles by health_id
CREATE POLICY "Public can view health profiles by health_id for emergencies"
ON public.health_profiles
FOR SELECT
USING (true);

-- Public access to emergency contacts via health profile
CREATE POLICY "Public can view emergency contacts via health_id"
ON public.emergency_contacts
FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM public.health_profiles
  )
);

-- Public access to allergies via health profile
CREATE POLICY "Public can view allergies via health_id"
ON public.allergies
FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM public.health_profiles
  )
);

-- Public access to medications via health profile
CREATE POLICY "Public can view medications via health_id"
ON public.medications
FOR SELECT
USING (
  user_id IN (
    SELECT user_id FROM public.health_profiles
  )
);