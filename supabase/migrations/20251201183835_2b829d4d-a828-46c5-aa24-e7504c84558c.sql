-- Allow patients and guests to view all doctors (public directory)
CREATE POLICY "Anyone can view doctor profiles"
ON public.doctors
FOR SELECT
TO authenticated, anon
USING (true);

-- Allow doctors to view patient health data when access is granted
CREATE POLICY "Doctors can view patient health profiles when access granted"
ON public.health_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_doctor_access pda
    JOIN public.doctors d ON d.id = pda.doctor_id
    WHERE pda.patient_id = health_profiles.user_id
      AND d.user_id = auth.uid()
      AND pda.status = 'active'
      AND (pda.expires_at IS NULL OR pda.expires_at > NOW())
  )
);

CREATE POLICY "Doctors can view patient allergies when access granted"
ON public.allergies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_doctor_access pda
    JOIN public.doctors d ON d.id = pda.doctor_id
    WHERE pda.patient_id = allergies.user_id
      AND d.user_id = auth.uid()
      AND pda.status = 'active'
      AND (pda.expires_at IS NULL OR pda.expires_at > NOW())
  )
);

CREATE POLICY "Doctors can view patient medications when access granted"
ON public.medications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_doctor_access pda
    JOIN public.doctors d ON d.id = pda.doctor_id
    WHERE pda.patient_id = medications.user_id
      AND d.user_id = auth.uid()
      AND pda.status = 'active'
      AND (pda.expires_at IS NULL OR pda.expires_at > NOW())
  )
);

CREATE POLICY "Doctors can view patient vital signs when access granted"
ON public.vital_signs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_doctor_access pda
    JOIN public.doctors d ON d.id = pda.doctor_id
    WHERE pda.patient_id = vital_signs.user_id
      AND d.user_id = auth.uid()
      AND pda.status = 'active'
      AND (pda.expires_at IS NULL OR pda.expires_at > NOW())
  )
);

CREATE POLICY "Doctors can view patient menstrual cycles when access granted"
ON public.menstrual_cycles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_doctor_access pda
    JOIN public.doctors d ON d.id = pda.doctor_id
    WHERE pda.patient_id = menstrual_cycles.user_id
      AND d.user_id = auth.uid()
      AND pda.status = 'active'
      AND (pda.expires_at IS NULL OR pda.expires_at > NOW())
  )
);

CREATE POLICY "Doctors can view patient pregnancy tracking when access granted"
ON public.pregnancy_tracking
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_doctor_access pda
    JOIN public.doctors d ON d.id = pda.doctor_id
    WHERE pda.patient_id = pregnancy_tracking.user_id
      AND d.user_id = auth.uid()
      AND pda.status = 'active'
      AND (pda.expires_at IS NULL OR pda.expires_at > NOW())
  )
);