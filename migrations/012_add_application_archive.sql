ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_applications_user_archive_star_created_at
  ON public.applications (user_id, is_archived, is_starred DESC, created_at DESC);
