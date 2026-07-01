
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nama TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles select own or any authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nama) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PEGAWAI
CREATE TABLE public.pegawai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nip TEXT,
  pangkat TEXT,
  jabatan TEXT,
  seksi TEXT,
  urutan_hierarki INT NOT NULL DEFAULT 999,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pegawai TO authenticated;
GRANT ALL ON public.pegawai TO service_role;
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pegawai all authenticated" ON public.pegawai FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER pegawai_updated_at BEFORE UPDATE ON public.pegawai FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LAPORAN
CREATE TABLE public.laporan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  pembuat_nama TEXT,
  nama_kegiatan TEXT NOT NULL,
  tanggal DATE NOT NULL,
  jam TIME,
  tempat JSONB NOT NULL DEFAULT '[]'::jsonb,
  pelaksana JSONB NOT NULL DEFAULT '[]'::jsonb,
  seksi TEXT,
  hasil_kegiatan TEXT,
  sumber_dana TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laporan TO authenticated;
GRANT ALL ON public.laporan TO service_role;
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "laporan all authenticated" ON public.laporan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER laporan_updated_at BEFORE UPDATE ON public.laporan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX laporan_tanggal_idx ON public.laporan (tanggal DESC);

-- PENGATURAN (single-row settings)
CREATE TABLE public.pengaturan (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nama_instansi TEXT NOT NULL DEFAULT 'BNN Kabupaten Gorontalo',
  nama_kepala TEXT NOT NULL DEFAULT 'Kepala BNNK Gorontalo',
  wa_tujuan TEXT DEFAULT '',
  template_laporan TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO authenticated;
GRANT ALL ON public.pengaturan TO service_role;
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pengaturan all authenticated" ON public.pengaturan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER pengaturan_updated_at BEFORE UPDATE ON public.pengaturan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.pengaturan (id) VALUES (1) ON CONFLICT DO NOTHING;
