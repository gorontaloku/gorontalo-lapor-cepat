DROP POLICY IF EXISTS "laporan delete superadmin" ON public.laporan;
DROP POLICY IF EXISTS "laporan insert own" ON public.laporan;
DROP POLICY IF EXISTS "laporan select role" ON public.laporan;
DROP POLICY IF EXISTS "laporan update role" ON public.laporan;

DROP POLICY IF EXISTS "pegawai delete superadmin" ON public.pegawai;
DROP POLICY IF EXISTS "pegawai insert admin" ON public.pegawai;
DROP POLICY IF EXISTS "pegawai select all" ON public.pegawai;
DROP POLICY IF EXISTS "pegawai update admin" ON public.pegawai;

DROP POLICY IF EXISTS "pengaturan insert superadmin" ON public.pengaturan;
DROP POLICY IF EXISTS "pengaturan select all" ON public.pengaturan;
DROP POLICY IF EXISTS "pengaturan update superadmin" ON public.pengaturan;

DROP POLICY IF EXISTS "profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "profiles select" ON public.profiles;
DROP POLICY IF EXISTS "profiles update own" ON public.profiles;

DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles delete superadmin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles insert admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles update admin" ON public.user_roles;