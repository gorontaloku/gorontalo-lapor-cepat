
CREATE POLICY "dok read auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'dokumentasi');

CREATE POLICY "dok insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dokumentasi' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "dok delete own or admin" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'dokumentasi'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'admin')
    )
  );
