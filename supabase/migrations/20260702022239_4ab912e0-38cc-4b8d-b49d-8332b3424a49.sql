-- Complete backend initialization for E-Laporan BNN

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'pegawai', 'pimpinan');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  nama text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_key UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pegawai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  gelar text,
  nip text,
  pangkat text,
  jabatan text,
  seksi text,
  urutan_hierarki integer NOT NULL DEFAULT 999,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pegawai TO authenticated;
GRANT ALL ON public.pegawai TO service_role;
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pengaturan (
  id integer PRIMARY KEY DEFAULT 1,
  nama_instansi text NOT NULL DEFAULT 'BNN Kabupaten Gorontalo',
  nama_kepala text NOT NULL DEFAULT 'Kepala BNN Kabupaten Gorontalo',
  wa_tujuan text,
  logo_url text,
  template_laporan text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pengaturan_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO authenticated;
GRANT ALL ON public.pengaturan TO service_role;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.laporan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  pembuat_nama text,
  nama_kegiatan text NOT NULL,
  jenis_kegiatan text,
  tanggal date NOT NULL,
  jam text,
  tempat jsonb NOT NULL DEFAULT '[]'::jsonb,
  pelaksana jsonb NOT NULL DEFAULT '[]'::jsonb,
  seksi text,
  sumber_dana text,
  no_sp text,
  tanggal_sp date,
  perihal_sp text,
  data_dinamis jsonb NOT NULL DEFAULT '{}'::jsonb,
  hasil_kegiatan text,
  dokumentasi jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  status_wa text NOT NULL DEFAULT 'draft',
  status_spj text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT laporan_user_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT laporan_status_check CHECK (status IN ('draft', 'dikirim')),
  CONSTRAINT laporan_status_wa_check CHECK (status_wa IN ('draft', 'dikirim')),
  CONSTRAINT laporan_status_spj_check CHECK (status_spj IN ('draft', 'dibuat', 'final'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laporan TO authenticated;
GRANT ALL ON public.laporan TO service_role;
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dokumentasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laporan_id uuid NOT NULL REFERENCES public.laporan(id) ON DELETE CASCADE,
  user_id uuid,
  file_path text NOT NULL,
  file_name text,
  mime_type text,
  ukuran integer,
  urutan integer NOT NULL DEFAULT 1,
  dipilih_wa boolean NOT NULL DEFAULT false,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dokumentasi_user_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT dokumentasi_mime_check CHECK (mime_type IS NULL OR mime_type IN ('image/jpeg', 'image/png', 'image/jpg')),
  CONSTRAINT dokumentasi_urutan_check CHECK (urutan BETWEEN 1 AND 10)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dokumentasi TO authenticated;
GRANT ALL ON public.dokumentasi TO service_role;
ALTER TABLE public.dokumentasi ENABLE ROW LEVEL SECURITY;

-- Add missing columns if tables already existed in a partial state
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nama text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS gelar text;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS nip text;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS pangkat text;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS jabatan text;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS seksi text;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS urutan_hierarki integer NOT NULL DEFAULT 999;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS aktif boolean NOT NULL DEFAULT true;
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.pegawai ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.pengaturan ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.pengaturan ADD COLUMN IF NOT EXISTS template_laporan text;
ALTER TABLE public.pengaturan ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS pembuat_nama text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS jenis_kegiatan text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS jam text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS tempat jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS pelaksana jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS seksi text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS sumber_dana text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS no_sp text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS tanggal_sp date;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS perihal_sp text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS data_dinamis jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS hasil_kegiatan text;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS dokumentasi jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS status_wa text NOT NULL DEFAULT 'draft';
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS status_spj text NOT NULL DEFAULT 'draft';
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.laporan ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'laporan_user_profile_fk'
  ) THEN
    ALTER TABLE public.laporan
      ADD CONSTRAINT laporan_user_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'pimpinan' THEN 3
    WHEN 'pegawai' THEN 4
  END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.current_user_can_view_all_reports()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'pimpinan');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, nama)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email))
  ON CONFLICT (id) DO UPDATE SET
    nama = COALESCE(EXCLUDED.nama, public.profiles.nama),
    updated_at = now();

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    assigned_role := 'super_admin';
  ELSE
    assigned_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'pegawai');
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_pegawai_updated_at ON public.pegawai;
CREATE TRIGGER set_pegawai_updated_at
BEFORE UPDATE ON public.pegawai
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_pengaturan_updated_at ON public.pengaturan;
CREATE TRIGGER set_pengaturan_updated_at
BEFORE UPDATE ON public.pengaturan
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_laporan_updated_at ON public.laporan;
CREATE TRIGGER set_laporan_updated_at
BEFORE UPDATE ON public.laporan
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_dokumentasi_updated_at ON public.dokumentasi;
CREATE TRIGGER set_dokumentasi_updated_at
BEFORE UPDATE ON public.dokumentasi
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auth user provisioning trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies
DROP POLICY IF EXISTS "Users can view own profile and admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile and admins view all"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can update own profile and admins update all" ON public.profiles;
CREATE POLICY "Users can update own profile and admins update all"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;
CREATE POLICY "Super admins can delete profiles"
ON public.profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view own role and admins view all" ON public.user_roles;
CREATE POLICY "Users can view own role and admins view all"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can create roles" ON public.user_roles;
CREATE POLICY "Admins can create roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Authenticated users can view pegawai" ON public.pegawai;
CREATE POLICY "Authenticated users can view pegawai"
ON public.pegawai FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can create pegawai" ON public.pegawai;
CREATE POLICY "Admins can create pegawai"
ON public.pegawai FOR INSERT TO authenticated
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update pegawai" ON public.pegawai;
CREATE POLICY "Admins can update pegawai"
ON public.pegawai FOR UPDATE TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete pegawai" ON public.pegawai;
CREATE POLICY "Super admins can delete pegawai"
ON public.pegawai FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Authenticated users can view pengaturan" ON public.pengaturan;
CREATE POLICY "Authenticated users can view pengaturan"
ON public.pengaturan FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admins can insert pengaturan" ON public.pengaturan;
CREATE POLICY "Super admins can insert pengaturan"
ON public.pengaturan FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can update pengaturan" ON public.pengaturan;
CREATE POLICY "Super admins can update pengaturan"
ON public.pengaturan FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view own laporan and leaders view all" ON public.laporan;
CREATE POLICY "Users can view own laporan and leaders view all"
ON public.laporan FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_can_view_all_reports());

DROP POLICY IF EXISTS "Users can create own laporan" ON public.laporan;
CREATE POLICY "Users can create own laporan"
ON public.laporan FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can update own laporan and admins update all" ON public.laporan;
CREATE POLICY "Users can update own laporan and admins update all"
ON public.laporan FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete laporan" ON public.laporan;
CREATE POLICY "Super admins can delete laporan"
ON public.laporan FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view dokumentasi for accessible laporan" ON public.dokumentasi;
CREATE POLICY "Users can view dokumentasi for accessible laporan"
ON public.dokumentasi FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.current_user_can_view_all_reports()
  OR EXISTS (
    SELECT 1 FROM public.laporan l
    WHERE l.id = dokumentasi.laporan_id
      AND (l.user_id = auth.uid() OR public.current_user_can_view_all_reports())
  )
);

DROP POLICY IF EXISTS "Users can create own dokumentasi" ON public.dokumentasi;
CREATE POLICY "Users can create own dokumentasi"
ON public.dokumentasi FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can update own dokumentasi and admins update all" ON public.dokumentasi;
CREATE POLICY "Users can update own dokumentasi and admins update all"
ON public.dokumentasi FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Users can delete own dokumentasi and admins delete all" ON public.dokumentasi;
CREATE POLICY "Users can delete own dokumentasi and admins delete all"
ON public.dokumentasi FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

-- Storage object policies for private dokumentasi bucket
DROP POLICY IF EXISTS "Authenticated users can read dokumentasi storage" ON storage.objects;
CREATE POLICY "Authenticated users can read dokumentasi storage"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dokumentasi');

DROP POLICY IF EXISTS "Authenticated users can upload dokumentasi storage" ON storage.objects;
CREATE POLICY "Authenticated users can upload dokumentasi storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dokumentasi' AND owner = auth.uid());

DROP POLICY IF EXISTS "Owners and admins can update dokumentasi storage" ON storage.objects;
CREATE POLICY "Owners and admins can update dokumentasi storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dokumentasi' AND (owner = auth.uid() OR public.current_user_is_admin()))
WITH CHECK (bucket_id = 'dokumentasi' AND (owner = auth.uid() OR public.current_user_is_admin()));

DROP POLICY IF EXISTS "Owners and admins can delete dokumentasi storage" ON storage.objects;
CREATE POLICY "Owners and admins can delete dokumentasi storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dokumentasi' AND (owner = auth.uid() OR public.current_user_is_admin()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_pegawai_urutan_hierarki ON public.pegawai(urutan_hierarki);
CREATE INDEX IF NOT EXISTS idx_pegawai_aktif ON public.pegawai(aktif);
CREATE INDEX IF NOT EXISTS idx_laporan_user_id ON public.laporan(user_id);
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal ON public.laporan(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_status_wa ON public.laporan(status_wa);
CREATE INDEX IF NOT EXISTS idx_laporan_status_spj ON public.laporan(status_spj);
CREATE INDEX IF NOT EXISTS idx_dokumentasi_laporan_id ON public.dokumentasi(laporan_id);
CREATE INDEX IF NOT EXISTS idx_dokumentasi_user_id ON public.dokumentasi(user_id);
CREATE INDEX IF NOT EXISTS idx_dokumentasi_urutan ON public.dokumentasi(laporan_id, urutan);

-- Required default singleton row for app settings
INSERT INTO public.pengaturan (id, nama_instansi, nama_kepala, wa_tujuan, template_laporan)
VALUES (1, 'BNN Kabupaten Gorontalo', 'Kepala BNN Kabupaten Gorontalo', NULL, NULL)
ON CONFLICT (id) DO NOTHING;