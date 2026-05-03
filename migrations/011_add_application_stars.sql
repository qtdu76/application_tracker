ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS is_starred boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_applications_user_star_created_at
  ON public.applications (user_id, is_starred DESC, created_at DESC);
