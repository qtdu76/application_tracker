-- New users should get access immediately.
-- Admins can still revoke access by setting user_profiles.approved = false.

ALTER TABLE public.user_profiles
  ALTER COLUMN approved SET DEFAULT true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, approved, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, true, 'user', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

  RETURN NEW;
END;
$$;
