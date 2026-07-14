import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { buildLaporanText, buildWhatsAppUrl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Send, Pencil, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatJam } from "@/lib/format";

const searchSchema = z.object({ id: z.string() });

export const Route = createFileRoute("/laporan/preview")({
  component: () => (
    <RequireAuth>
      <PreviewPage />
    </RequireAuth>
  ),
  validateSearch: searchSchema,
});

function PreviewPage() {
  const { id } = useSearch({ from: "/laporan/preview" });
  const navigate = useNavigate();
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmSent, setConfirmSent] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const { data: laporan, isLoading } = useQuery({
    queryKey: ["laporan", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("laporan").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: pengaturan } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => (await supabase.from("pengaturan").select("*").eq("id", 1).maybeSingle()).data,
  });

  const generatedText = useMemo(() => {
    if (!laporan) return "";
    return buildLaporanText({
      nama_kegiatan: laporan.nama_kegiatan,
      jenis_kegiatan: laporan.jenis_kegiatan,
      tanggal: laporan.tanggal,
      jam: formatJam(laporan.jam),
      tempat: laporan.tempat,
      pelaksana: laporan.pelaksana,
      seksi: laporan.seksi,
      hasil_kegiatan: laporan.hasil_kegiatan,
      sumber_dana: laporan.sumber_dana,
    }, { namaKepala: pengaturan?.nama_kepala });
  }, [laporan, pengaturan]);

  const text = edited ?? generatedText;

  useEffect(() => {
  if (!laporan?.dokumentasi) return;

  const urls = laporan.dokumentasi.map((d: { path: string }) =>
    supabase.storage
      .from("dokumentasi")
      .getPublicUrl(d.path)
      .data.publicUrl
  );

  setPhotoUrls(urls);
  setSelected(new Set(urls.map((_, i) => i).slice(0, 4)));
  }, [laporan]);

  const toggleAll = () => {
    if (selected.size === Math.min(photoUrls.length, 4)) setSelected(new Set());
    else setSelected(new Set(photoUrls.map((_, i) => i).slice(0, 4)));
  };
  const togglePhoto = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else {
      if (next.size >= 4) { toast.error("Maksimal 4 foto dapat dipilih"); return; }
      next.add(i);
    }
    setSelected(next);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Laporan disalin");
  };

  const handleRegenerate = () => {
    setEdited(null);
    setEditing(false);
    toast.success("Preview di-generate ulang");
  };

  const handleWhatsApp = async () => {
    // download selected photos so user can attach easily
    const chosen = Array.from(selected).map((i) => photoUrls[i]).filter(Boolean);
    for (let i = 0; i < chosen.length; i++) {
      try {
        const res = await fetch(chosen[i]);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${laporan?.nama_kegiatan ?? "dokumentasi"}-${i + 1}.jpg`;
        document.body.appendChild(a); a.click(); a.remove();
      } catch {}
    }
    const url = buildWhatsAppUrl(text, pengaturan?.wa_tujuan ?? undefined);
    window.open(url, "_blank");
    setTimeout(() => setConfirmSent(true), 2000);
  };

  const markSent = async (sent: boolean) => {
    if (sent && laporan) {
      await supabase.from("laporan").update({ status_wa: "sudah_dikirim" }).eq("id", id);
      toast.success("Status: Sudah Dikirim");
    }
    setConfirmSent(false);
    navigate({ to: "/riwayat" });
  };

  if (isLoading || !laporan) {
    return <AppShell title="Preview Laporan"><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div></AppShell>;
  }

  return (
    <AppShell title="Preview Laporan WA">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/laporan/baru", search: { id } })}>
          <ArrowLeft className="h-4 w-4" /> Kembali ke Form
        </Button>

        <Card className="shadow-card border-primary/20">
          <CardContent className="p-4">
            {editing ? (
              <Textarea rows={20} value={text} onChange={(e) => setEdited(e.target.value)} className="font-mono text-sm" />
            ) : (
              <div className="rounded-lg bg-muted/30 border p-4 max-h-[60vh] overflow-auto">
                <WhatsAppText text={text} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4" /> Copy</Button>
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            <Pencil className="h-4 w-4" /> {editing ? "Selesai Edit" : "Edit"}
          </Button>
          <Button variant="outline" onClick={handleRegenerate}>
            <Sparkles className="h-4 w-4" /> Generate Ulang
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Dokumentasi <span className="text-sm text-muted-foreground font-normal">(pilih max 4)</span></h3>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {selected.size === Math.min(photoUrls.length, 4) ? "Hapus Pilihan" : "Pilih Semua"}
            </Button>
          </div>
          {photoUrls.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-md">Tidak ada foto</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {photoUrls.map((url, i) => {
                const isSel = selected.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => togglePhoto(i)}
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                      isSel ? "border-primary ring-2 ring-primary/30" : "border-transparent",
                    )}
                  >
                    <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                    <div className={cn(
                      "absolute top-1 right-1 h-5 w-5 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold",
                      isSel ? "bg-primary border-primary" : "bg-white/70 border-white",
                    )}>
                      {isSel ? "✓" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button size="lg" className="w-full h-14 text-base" onClick={handleWhatsApp}>
          <Send className="h-5 w-5" /> Kirim ke WhatsApp
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Foto yang dipilih akan diunduh otomatis ke perangkat Anda, lalu WhatsApp terbuka dengan teks laporan sudah terisi. Lampirkan foto secara manual di WhatsApp lalu tekan Kirim.
        </p>
      </div>

      <AlertDialog open={confirmSent} onOpenChange={setConfirmSent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah laporan berhasil dikirim?</AlertDialogTitle>
            <AlertDialogDescription>
              Konfirmasikan pengiriman laporan WA untuk memperbarui status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => markSent(false)}>Belum</AlertDialogCancel>
            <AlertDialogAction onClick={() => markSent(true)}>Ya, Sudah Dikirim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function WhatsAppText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="whitespace-pre-wrap break-words text-[13px] sm:text-sm leading-relaxed text-foreground font-sans">
      {lines.map((line, i) => {
        const parts = line.split(/(\*[^*\n]+\*)/g);
        return (
          <div key={i} className={line === "" ? "h-2" : undefined}>
            {parts.map((part, j) =>
              part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
                <strong key={j} className="font-semibold text-foreground">{part.slice(1, -1)}</strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
