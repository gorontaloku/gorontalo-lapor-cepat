DROP TRIGGER IF EXISTS laporan_updated_at ON public.laporan;
DROP TRIGGER IF EXISTS pegawai_updated_at ON public.pegawai;
DROP TRIGGER IF EXISTS pengaturan_updated_at ON public.pengaturan;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_profile_fk'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_profile_fk
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;