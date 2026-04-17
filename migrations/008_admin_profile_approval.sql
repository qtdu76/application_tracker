-- Allow admins to manage user profile access approvals.
-- The API only exposes the approved flag, but the database policy permits admin profile updates.

DROP POLICY IF EXISTS "Admins can update profiles" ON public.user_profiles;
CREATE POLICY "Admins can update profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
