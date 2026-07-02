import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { RequireRole } from "@/lib/roles";

export const Route = createFileRoute("/pengaturan")({
  component: () => (
    <RequireAuth>
      <RequireRole allowed={["super_admin"]}>
        <PengaturanPage />
      </RequireRole>
    </RequireAuth>
  ),
});

interface Pengaturan {
  nama_instansi: string;
  nama_kepala: string;
  wa_tujuan: string;
  template_laporan: string;
  logo_url: string;
}

function PengaturanPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Pengaturan>({
    nama_instansi: "", nama_kepala: "", wa_tujuan: "", template_laporan: "", logo_url: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => {
      const { data } = await supabase.from("pengaturan").select("*").eq("id", 1).maybeSingle();
      return data as Pengaturan | null;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        nama_instansi: data.nama_instansi ?? "",
        nama_kepala: data.nama_kepala ?? "",
        wa_tujuan: data.wa_tujuan ?? "",
        template_laporan: data.template_laporan ?? "",
        logo_url: data.logo_url ?? "",
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pengaturan").upsert({ id: 1, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengaturan tersimpan");
      qc.invalidateQueries({ queryKey: ["pengaturan"] });
    },
    onError: (e: Error) => toast.error("Gagal menyimpan", { description: e.message }),
  });

  return (
    <AppShell title="Pengaturan">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Pengaturan</h2>
          <p className="text-sm text-muted-foreground">Data instansi dan template default laporan.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Data Instansi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
            ) : (
              <>
                <div>
                  <Label>Nama Instansi</Label>
                  <Input value={form.nama_instansi} onChange={(e) => setForm({ ...form, nama_instansi: e.target.value })} />
                </div>
                <div>
                  <Label>Nama Kepala</Label>
                  <Input value={form.nama_kepala} onChange={(e) => setForm({ ...form, nama_kepala: e.target.value })}
                    placeholder="Kepala BNNK Gorontalo" />
                </div>
                <div>
                  <Label>Nomor WhatsApp Tujuan</Label>
                  <Input value={form.wa_tujuan} onChange={(e) => setForm({ ...form, wa_tujuan: e.target.value })}
                    placeholder="Contoh: 6281234567890" />
                  <p className="text-xs text-muted-foreground mt-1">Gunakan kode negara tanpa tanda +. Kosongkan untuk memilih penerima manual di WhatsApp.</p>
                </div>
                <div>
                  <Label>URL Logo Instansi</Label>
                  <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://..." />
                </div>
                <div>
                  <Label>Template Catatan Laporan (opsional)</Label>
                  <Textarea rows={4} value={form.template_laporan}
                    onChange={(e) => setForm({ ...form, template_laporan: e.target.value })}
                    placeholder="Catatan default yang muncul saat membuat laporan baru." />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
