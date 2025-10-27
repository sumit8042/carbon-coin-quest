-- Fix search_path for update_profile_emissions function
CREATE OR REPLACE FUNCTION public.update_profile_emissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Determine which user_id to update based on operation
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;

  -- Update the profile's total emissions
  UPDATE public.profiles
  SET total_emissions = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.emissions
    WHERE user_id = target_user_id
  ),
  updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;