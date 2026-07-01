import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Eye, Pencil, Send, Trash2, Loader2 } from "lucide-react";
import { buildLaporanText, buildWhatsAppUrl, formatTanggalIndo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/riwayat")({
  component: () => (
    <RequireAuth>
      <RiwayatPage />
    </RequireAuth>
  ),
});

function RiwayatPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["laporan-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("laporan").select("*")
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: pengaturan } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => (await supabase.from("pengaturan").select("*").eq("id", 1).maybeSingle()).data,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("laporan").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Laporan dihapus");
      qc.invalidateQueries({ queryKey: ["laporan-list"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error("Gagal menghapus", { description: e.message }),
  });

  const filtered = data.filter((l) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [l.nama_kegiatan, l.pembuat_nama, l.status].some((v: string) => v?.toLowerCase().includes(s));
  });

  const kirimUlang = (l: any) => {
    const text = buildLaporanText(
      {
        nama_kegiatan: l.nama_kegiatan, tanggal: l.tanggal, jam: l.jam,
        tempat: l.tempat, pelaksana: l.pelaksana, seksi: l.seksi,
        hasil_kegiatan: l.hasil_kegiatan, sumber_dana: l.sumber_dana,
      },
      { namaKepala: pengaturan?.nama_kepala },
    );
    window.open(buildWhatsAppUrl(text, pengaturan?.wa_tujuan ?? undefined), "_blank");
  };

  const previewLaporan = data.find((l) => l.id === previewId);
  const previewText = previewLaporan
    ? buildLaporanText(
        {
          nama_kegiatan: previewLaporan.nama_kegiatan,
          tanggal: previewLaporan.tanggal,
          jam: previewLaporan.jam,
          tempat: previewLaporan.tempat,
          pelaksana: previewLaporan.pelaksana,
          seksi: previewLaporan.seksi,
          hasil_kegiatan: previewLaporan.hasil_kegiatan,
          sumber_dana: previewLaporan.sumber_dana,
        },
        { namaKepala: pengaturan?.nama_kepala },
      )
    : "";

  return (
    <AppShell title="Riwayat Laporan">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Riwayat Laporan</h2>
          <p className="text-sm text-muted-foreground">Semua laporan yang pernah dibuat.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari kegiatan, pembuat, status..." value={q}
            onChange={(e) => setQ(e.target.value)} />
        </div>

        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                    <th className="text-left px-4 py-3 font-medium">Nama Kegiatan</th>
                    <th className="text-left px-4 py-3 font-medium">Pembuat</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline" />
                    </td></tr>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      {q ? "Tidak ada hasil." : "Belum ada laporan."}
                    </td></tr>
                  )}
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">{formatTanggalIndo(l.tanggal)}</td>
                      <td className="px-4 py-3 font-medium">{l.nama_kegiatan}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.pembuat_nama || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={
                          l.status === "terkirim"
                            ? "inline-flex items-center rounded-full bg-success/15 text-success px-2 py-0.5 text-xs font-medium"
                            : "inline-flex items-center rounded-full bg-warning/20 text-warning-foreground px-2 py-0.5 text-xs font-medium"
                        }>
                          {l.status === "terkirim" ? "Terkirim" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setPreviewId(l.id)}><Eye className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost"
                            onClick={() => navigate({ to: "/laporan/baru", search: { id: l.id } })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => kirimUlang(l)}><Send className="h-4 w-4 text-primary" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus laporan?</AlertDialogTitle>
            <AlertDialogDescription>Laporan akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewLaporan && (
        <AlertDialog open onOpenChange={(v) => !v && setPreviewId(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>{previewLaporan.nama_kegiatan}</AlertDialogTitle>
            </AlertDialogHeader>
            <pre className="whitespace-pre-wrap text-xs font-sans bg-muted/40 rounded-md p-3 max-h-[60vh] overflow-auto">
{previewText}
            </pre>
            <AlertDialogFooter>
              <AlertDialogCancel>Tutup</AlertDialogCancel>
              <AlertDialogAction onClick={() => kirimUlang(previewLaporan)}>
                <Send className="h-4 w-4" /> Kirim WhatsApp
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppShell>
  );
}
