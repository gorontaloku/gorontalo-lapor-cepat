
-- Grants for Data API access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pegawai TO authenticated;
GRANT ALL ON public.pegawai TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.laporan TO authenticated;
GRANT ALL ON public.laporan TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pengaturan TO authenticated;
GRANT ALL ON public.pengaturan TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Admin management policies for user_roles (needed by Kelola User page)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles insert admin') THEN
    CREATE POLICY "user_roles insert admin" ON public.user_roles FOR INSERT TO authenticated
      WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles update admin') THEN
    CREATE POLICY "user_roles update admin" ON public.user_roles FOR UPDATE TO authenticated
      USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='user_roles delete superadmin') THEN
    CREATE POLICY "user_roles delete superadmin" ON public.user_roles FOR DELETE TO authenticated
      USING (public.has_role(auth.uid(),'super_admin'));
  END IF;
END $$;

-- Ensure a default pengaturan row exists (singleton id=1)
INSERT INTO public.pengaturan (id, nama_instansi, nama_kepala)
VALUES (1, 'BNN Kabupaten Gorontalo', 'Kepala BNNK Gorontalo')
ON CONFLICT (id) DO NOTHING;

-- Trigger to auto-create profile + role on new auth user (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_laporan_user_id ON public.laporan(user_id);
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal ON public.laporan(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_pegawai_urutan ON public.pegawai(urutan_hierarki);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
