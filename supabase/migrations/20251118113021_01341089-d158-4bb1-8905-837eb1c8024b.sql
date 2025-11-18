-- Fix search_path for generate_health_id function
CREATE OR REPLACE FUNCTION generate_health_id()
RETURNS VARCHAR(14) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id VARCHAR(14);
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 14-digit random number
    new_id := LPAD(FLOOR(RANDOM() * 100000000000000)::TEXT, 14, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.health_profiles WHERE health_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;