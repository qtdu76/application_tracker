-- Ensure user profiles exist for all auth users and enforce per-user tracker data isolation.
-- This migration:
-- 1) Creates/normalizes public.user_profiles and auto-populates it from auth.users
-- 2) Adds admin SELECT visibility on user_profiles
-- 3) Adds user_id ownership to applications/contacts and applies strict per-user RLS policies

-- -------------------------------------------------------------------
-- user_profiles baseline
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS approved BOOLEAN,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE public.user_profiles
SET
  approved = COALESCE(approved, false),
  role = COALESCE(role, 'user'),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.user_profiles
  ALTER COLUMN approved SET DEFAULT false,
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_role_check'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_role_check
      CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Helper used by policies (including existing admin policies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = user_id
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;

-- Auto-create/sync profile rows when auth users are created/updated.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, approved, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, false, 'user', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET email = NEW.email,
      updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_update();

-- Backfill missing profiles for already-existing auth users.
INSERT INTO public.user_profiles (id, email, approved, role, created_at, updated_at)
SELECT
  au.id,
  au.email,
  false,
  'user',
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE up.id IS NULL;

-- Ensure admins can see all profiles in admin pages/API.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Keep own-profile access policy.
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- -------------------------------------------------------------------
-- applications + contacts ownership and RLS isolation
-- -------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'applications'
  ) THEN
    ALTER TABLE public.applications
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'contacts'
  ) THEN
    ALTER TABLE public.contacts
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Assign existing shared rows to the first admin (fallback: first auth user)
DO $$
DECLARE
  owner_id UUID;
BEGIN
  SELECT id INTO owner_id
  FROM public.user_profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;

  IF owner_id IS NULL THEN
    SELECT id INTO owner_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF owner_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'applications'
    ) THEN
      UPDATE public.applications
      SET user_id = owner_id
      WHERE user_id IS NULL;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'contacts'
    ) THEN
      UPDATE public.contacts
      SET user_id = owner_id
      WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

DO $$
DECLARE
  r RECORD;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'applications'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM public.applications WHERE user_id IS NULL) THEN
      ALTER TABLE public.applications ALTER COLUMN user_id SET NOT NULL;
    END IF;

    ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

    -- Replace all existing policies on applications with strict ownership policies.
    FOR r IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'applications'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.applications', r.policyname);
    END LOOP;

    CREATE POLICY "Users can view own applications"
      ON public.applications FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own applications"
      ON public.applications FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own applications"
      ON public.applications FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own applications"
      ON public.applications FOR DELETE
      USING (auth.uid() = user_id);

    CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
  END IF;
END $$;

DO $$
DECLARE
  r RECORD;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'contacts'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM public.contacts WHERE user_id IS NULL) THEN
      ALTER TABLE public.contacts ALTER COLUMN user_id SET NOT NULL;
    END IF;

    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

    -- Replace all existing policies on contacts with strict ownership policies.
    FOR r IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'contacts'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname);
    END LOOP;

    CREATE POLICY "Users can view own contacts"
      ON public.contacts FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own contacts"
      ON public.contacts FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own contacts"
      ON public.contacts FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own contacts"
      ON public.contacts FOR DELETE
      USING (auth.uid() = user_id);

    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
  END IF;
END $$;
