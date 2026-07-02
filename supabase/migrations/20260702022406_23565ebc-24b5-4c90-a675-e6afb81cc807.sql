CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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

CREATE OR REPLACE FUNCTION private.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION private.current_user_can_view_all_reports()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT private.has_role(auth.uid(), 'super_admin')
      OR private.has_role(auth.uid(), 'admin')
      OR private.has_role(auth.uid(), 'pimpinan');
$$;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_user_is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_user_can_view_all_reports() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY INVOKER
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

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_can_view_all_reports() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Recreate table policies to use private helpers
DROP POLICY IF EXISTS "Users can view own profile and admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile and admins view all"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Users can update own profile and admins update all" ON public.profiles;
CREATE POLICY "Users can update own profile and admins update all"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR private.current_user_is_admin())
WITH CHECK (id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;
CREATE POLICY "Super admins can delete profiles"
ON public.profiles FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view own role and admins view all" ON public.user_roles;
CREATE POLICY "Users can view own role and admins view all"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can create roles" ON public.user_roles;
CREATE POLICY "Admins can create roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (private.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (private.current_user_is_admin())
WITH CHECK (private.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins can create pegawai" ON public.pegawai;
CREATE POLICY "Admins can create pegawai"
ON public.pegawai FOR INSERT TO authenticated
WITH CHECK (private.current_user_is_admin());

DROP POLICY IF EXISTS "Admins can update pegawai" ON public.pegawai;
CREATE POLICY "Admins can update pegawai"
ON public.pegawai FOR UPDATE TO authenticated
USING (private.current_user_is_admin())
WITH CHECK (private.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete pegawai" ON public.pegawai;
CREATE POLICY "Super admins can delete pegawai"
ON public.pegawai FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can insert pengaturan" ON public.pengaturan;
CREATE POLICY "Super admins can insert pengaturan"
ON public.pengaturan FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can update pengaturan" ON public.pengaturan;
CREATE POLICY "Super admins can update pengaturan"
ON public.pengaturan FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'))
WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view own laporan and leaders view all" ON public.laporan;
CREATE POLICY "Users can view own laporan and leaders view all"
ON public.laporan FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.current_user_can_view_all_reports());

DROP POLICY IF EXISTS "Users can create own laporan" ON public.laporan;
CREATE POLICY "Users can create own laporan"
ON public.laporan FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Users can update own laporan and admins update all" ON public.laporan;
CREATE POLICY "Users can update own laporan and admins update all"
ON public.laporan FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR private.current_user_is_admin())
WITH CHECK (user_id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Super admins can delete laporan" ON public.laporan;
CREATE POLICY "Super admins can delete laporan"
ON public.laporan FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view dokumentasi for accessible laporan" ON public.dokumentasi;
CREATE POLICY "Users can view dokumentasi for accessible laporan"
ON public.dokumentasi FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR private.current_user_can_view_all_reports()
  OR EXISTS (
    SELECT 1 FROM public.laporan l
    WHERE l.id = dokumentasi.laporan_id
      AND (l.user_id = auth.uid() OR private.current_user_can_view_all_reports())
  )
);

DROP POLICY IF EXISTS "Users can create own dokumentasi" ON public.dokumentasi;
CREATE POLICY "Users can create own dokumentasi"
ON public.dokumentasi FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Users can update own dokumentasi and admins update all" ON public.dokumentasi;
CREATE POLICY "Users can update own dokumentasi and admins update all"
ON public.dokumentasi FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR private.current_user_is_admin())
WITH CHECK (user_id = auth.uid() OR private.current_user_is_admin());

DROP POLICY IF EXISTS "Users can delete own dokumentasi and admins delete all" ON public.dokumentasi;
CREATE POLICY "Users can delete own dokumentasi and admins delete all"
ON public.dokumentasi FOR DELETE TO authenticated
USING (user_id = auth.uid() OR private.current_user_is_admin());

-- Recreate storage policies to use private helpers
DROP POLICY IF EXISTS "Owners and admins can update dokumentasi storage" ON storage.objects;
CREATE POLICY "Owners and admins can update dokumentasi storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dokumentasi' AND (owner = auth.uid() OR private.current_user_is_admin()))
WITH CHECK (bucket_id = 'dokumentasi' AND (owner = auth.uid() OR private.current_user_is_admin()));

DROP POLICY IF EXISTS "Owners and admins can delete dokumentasi storage" ON storage.objects;
CREATE POLICY "Owners and admins can delete dokumentasi storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dokumentasi' AND (owner = auth.uid() OR private.current_user_is_admin()));