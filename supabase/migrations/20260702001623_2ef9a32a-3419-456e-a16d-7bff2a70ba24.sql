
-- ============ ROLES SYSTEM ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'pegawai', 'pimpinan');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'pimpinan' THEN 3
    WHEN 'pegawai' THEN 4
  END
  LIMIT 1
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES policy update ============
-- Allow admins to see all profiles for user management
DROP POLICY IF EXISTS "profiles select own or any authenticated" ON public.profiles;
CREATE POLICY "profiles select" ON public.profiles FOR SELECT TO authenticated USING (true);

-- ============ Auto-assign first user as super_admin ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, nama) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email));

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'pegawai');
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PEGAWAI: add gelar ============
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS gelar TEXT DEFAULT '';

-- Restrict pegawai writes
DROP POLICY IF EXISTS "pegawai all authenticated" ON public.pegawai;
CREATE POLICY "pegawai select all" ON public.pegawai FOR SELECT TO authenticated USING (true);
CREATE POLICY "pegawai insert admin" ON public.pegawai FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pegawai update admin" ON public.pegawai FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pegawai delete superadmin" ON public.pegawai FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============ LAPORAN: new columns ============
ALTER TABLE public.laporan
  ADD COLUMN IF NOT EXISTS jenis_kegiatan TEXT,
  ADD COLUMN IF NOT EXISTS data_dinamis JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS no_sp TEXT,
  ADD COLUMN IF NOT EXISTS tanggal_sp DATE,
  ADD COLUMN IF NOT EXISTS perihal_sp TEXT,
  ADD COLUMN IF NOT EXISTS dokumentasi JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status_wa TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS status_spj TEXT NOT NULL DEFAULT 'belum';

-- Restrict laporan by role
DROP POLICY IF EXISTS "laporan all authenticated" ON public.laporan;
CREATE POLICY "laporan select role" ON public.laporan FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'pimpinan')
  );
CREATE POLICY "laporan insert own" ON public.laporan FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'pegawai'))
  );
CREATE POLICY "laporan update role" ON public.laporan FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid() AND public.has_role(auth.uid(), 'pegawai'))
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "laporan delete superadmin" ON public.laporan FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============ PENGATURAN: super_admin only writes ============
DROP POLICY IF EXISTS "pengaturan all authenticated" ON public.pengaturan;
CREATE POLICY "pengaturan select all" ON public.pengaturan FOR SELECT TO authenticated USING (true);
CREATE POLICY "pengaturan update superadmin" ON public.pengaturan FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "pengaturan insert superadmin" ON public.pengaturan FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
