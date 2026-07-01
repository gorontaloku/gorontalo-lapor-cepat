import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { generateHasilKegiatan } from "@/lib/ai.functions";
import { buildLaporanText, buildWhatsAppUrl } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus, Trash2, Sparkles, Eye, Copy, Send, Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/laporan/baru")({
  component: () => (
    <RequireAuth>
      <LaporanBaru />
    </RequireAuth>
  ),
  validateSearch: searchSchema,
});

interface Pegawai {
  id: string; nama: string; nip: string | null; pangkat: string | null;
  jabatan: string | null; seksi: string | null; urutan_hierarki: number; aktif: boolean;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function LaporanBaru() {
  const navigate = useNavigate();
  const { id: editId } = useSearch({ from: "/laporan/baru" });
  const qc = useQueryClient();
  const { user } = useAuth();
  const genAi = useServerFn(generateHasilKegiatan);

  const [nama_kegiatan, setNamaKegiatan] = useState("");
  const [tanggal, setTanggal] = useState(todayStr());
  const [jam, setJam] = useState("");
  const [tempat, setTempat] = useState<string[]>([""]);
  const [selectedPegawai, setSelectedPegawai] = useState<string[]>([]);
  const [hasil, setHasil] = useState("");
  const [sumberDana, setSumberDana] = useState<"DIPA" | "NON DIPA" | "">("");
  const [seksi, setSeksi] = useState("");
  const [aiPoin, setAiPoin] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: pegawaiList = [] } = useQuery({
    queryKey: ["pegawai", "aktif"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pegawai")
        .select("*")
        .eq("aktif", true)
        .order("urutan_hierarki", { ascending: true });
      if (error) throw error;
      return data as Pegawai[];
    },
  });

  const { data: pengaturan } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => {
      const { data } = await supabase.from("pengaturan").select("*").eq("id", 1).maybeSingle();
      return data as { nama_kepala: string; wa_tujuan: string; nama_instansi: string } | null;
    },
  });

  // Load draft/existing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data, error } = await supabase.from("laporan").select("*").eq("id", editId).maybeSingle();
      if (error || !data) return;
      setNamaKegiatan(data.nama_kegiatan);
      setTanggal(data.tanggal);
      setJam(data.jam ?? "");
      setTempat((data.tempat as string[])?.length ? (data.tempat as string[]) : [""]);
      setSelectedPegawai(((data.pelaksana as { id: string }[]) ?? []).map((p) => p.id));
      setHasil(data.hasil_kegiatan ?? "");
      setSumberDana((data.sumber_dana as "DIPA" | "NON DIPA") ?? "");
      setSeksi(data.seksi ?? "");
    })();
  }, [editId]);

  const pelaksanaList = useMemo(() => {
    const map = new Map(pegawaiList.map((p) => [p.id, p]));
    return selectedPegawai
      .map((id) => map.get(id))
      .filter((p): p is Pegawai => !!p)
      .sort((a, b) => a.urutan_hierarki - b.urutan_hierarki);
  }, [selectedPegawai, pegawaiList]);

  const laporanData = {
    nama_kegiatan,
    tanggal,
    jam: jam || null,
    tempat: tempat.map((t) => t.trim()).filter(Boolean),
    pelaksana: pelaksanaList.map((p) => ({ nama: p.nama, pangkat: p.pangkat, nip: p.nip })),
    seksi: seksi || pelaksanaList[0]?.seksi || null,
    hasil_kegiatan: hasil,
    sumber_dana: sumberDana || null,
  };

  const preview = buildLaporanText(laporanData, { namaKepala: pengaturan?.nama_kepala });

  const save = useMutation({
    mutationFn: async (status: "draft" | "terkirim") => {
      if (!nama_kegiatan.trim()) throw new Error("Nama kegiatan wajib diisi");
      if (!tanggal) throw new Error("Tanggal wajib diisi");
      const payload = {
        user_id: user?.id ?? null,
        pembuat_nama: user?.user_metadata?.nama ?? user?.email ?? null,
        nama_kegiatan,
        tanggal,
        jam: jam || null,
        tempat: laporanData.tempat,
        pelaksana: pelaksanaList.map((p) => ({
          id: p.id, nama: p.nama, pangkat: p.pangkat, nip: p.nip, urutan: p.urutan_hierarki,
        })),
        seksi: laporanData.seksi,
        hasil_kegiatan: hasil,
        sumber_dana: sumberDana || null,
        status,
      };
      if (editId) {
        const { error } = await supabase.from("laporan").update(payload).eq("id", editId);
        if (error) throw error;
        return editId;
      }
      const { data, error } = await supabase.from("laporan").insert(payload).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const handleSaveDraft = async () => {
    try { await save.mutateAsync("draft"); toast.success("Draft tersimpan"); }
    catch (e) { toast.error("Gagal menyimpan", { description: (e as Error).message }); }
  };
  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    toast.success("Laporan disalin ke clipboard");
  };
  const handleWhatsApp = async () => {
    try {
      await save.mutateAsync("terkirim");
      const url = buildWhatsAppUrl(preview, pengaturan?.wa_tujuan);
      window.open(url, "_blank");
      toast.success("Membuka WhatsApp...");
    } catch (e) {
      toast.error("Gagal", { description: (e as Error).message });
    }
  };

  const runAi = async () => {
    if (!aiPoin.trim()) return toast.error("Masukkan poin-poin terlebih dahulu");
    setAiBusy(true);
    try {
      const res = await genAi({
        data: {
          poin: aiPoin,
          namaKegiatan: nama_kegiatan || undefined,
          tempat: laporanData.tempat.length ? laporanData.tempat : undefined,
        },
      });
      setHasil(res.text);
      setAiOpen(false);
      setAiPoin("");
      toast.success("Hasil kegiatan berhasil dibuat AI");
    } catch (e) {
      toast.error("Gagal generate AI", { description: (e as Error).message });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <AppShell title={editId ? "Edit Laporan" : "Buat Laporan"}>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <SectionCard title="A. Kegiatan">
            <div>
              <Label>Nama Kegiatan *</Label>
              <Input value={nama_kegiatan} onChange={(e) => setNamaKegiatan(e.target.value)}
                placeholder="Contoh: Koordinasi Pendistribusian Proposal" />
            </div>
          </SectionCard>

          <SectionCard title="B. Waktu">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tanggal *</Label>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
              <div>
                <Label>Jam</Label>
                <Input type="time" value={jam} onChange={(e) => setJam(e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="C. Tempat" desc="Tambahkan satu atau lebih lokasi kegiatan.">
            <div className="space-y-2">
              {tempat.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={t}
                    onChange={(e) => {
                      const next = [...tempat]; next[i] = e.target.value; setTempat(next);
                    }}
                    placeholder={`Lokasi ${i + 1}`}
                  />
                  {tempat.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setTempat(tempat.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setTempat([...tempat, ""])}>
                <Plus className="h-4 w-4" /> Tambah Tempat
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="D. Pelaksana" desc="Pilih hingga 50 pegawai. Otomatis diurutkan berdasarkan hierarki.">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedPegawai.length ? `${selectedPegawai.length} pegawai dipilih` : "Pilih pelaksana..."}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                <Command>
                  <CommandInput placeholder="Cari pegawai..." />
                  <CommandList>
                    <CommandEmpty>Tidak ada pegawai. Tambah di menu Data Pegawai.</CommandEmpty>
                    <CommandGroup>
                      {pegawaiList.map((p) => {
                        const checked = selectedPegawai.includes(p.id);
                        return (
                          <CommandItem
                            key={p.id}
                            onSelect={() => {
                              if (checked) setSelectedPegawai(selectedPegawai.filter((id) => id !== p.id));
                              else {
                                if (selectedPegawai.length >= 50) return toast.error("Maksimal 50 pegawai");
                                setSelectedPegawai([...selectedPegawai, p.id]);
                              }
                            }}
                          >
                            <Check className={cn("h-4 w-4", checked ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col">
                              <span className="font-medium">{p.nama}</span>
                              <span className="text-xs text-muted-foreground">
                                {[p.pangkat, p.jabatan].filter(Boolean).join(" • ") || "-"}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {pelaksanaList.length > 0 && (
              <ol className="mt-3 space-y-1.5">
                {pelaksanaList.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm bg-muted/40 rounded-md px-3 py-2">
                    <span className="text-muted-foreground w-6">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-xs text-muted-foreground">
                        {[p.pangkat, p.jabatan].filter(Boolean).join(" • ") || "-"}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost"
                      onClick={() => setSelectedPegawai(selectedPegawai.filter((id) => id !== p.id))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-4">
              <Label>Seksi (opsional, kosongkan untuk auto)</Label>
              <Input value={seksi} onChange={(e) => setSeksi(e.target.value)}
                placeholder={pelaksanaList[0]?.seksi ?? "Contoh: Seksi P2M"} />
            </div>
          </SectionCard>

          <SectionCard
            title="E. Hasil Kegiatan"
            desc="Isi manual, atau gunakan Generate AI untuk mengubah poin singkat menjadi laporan resmi."
          >
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
                <Sparkles className="h-4 w-4" /> Generate AI
              </Button>
            </div>
            <Textarea
              rows={8}
              value={hasil}
              onChange={(e) => setHasil(e.target.value)}
              placeholder="Uraian hasil kegiatan dalam bahasa formal..."
            />
          </SectionCard>

          <SectionCard title="F. Sumber Dana">
            <Select value={sumberDana} onValueChange={(v) => setSumberDana(v as "DIPA" | "NON DIPA")}>
              <SelectTrigger><SelectValue placeholder="Pilih sumber dana" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DIPA">DIPA</SelectItem>
                <SelectItem value="NON DIPA">NON DIPA</SelectItem>
              </SelectContent>
            </Select>
          </SectionCard>

          <div className="flex flex-wrap gap-2 lg:hidden">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4" /> Copy</Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={save.isPending}>
              <Save className="h-4 w-4" /> Simpan Draft
            </Button>
            <Button onClick={handleWhatsApp} disabled={save.isPending} className="ml-auto">
              <Send className="h-4 w-4" /> Kirim WhatsApp
            </Button>
          </div>
        </div>

        {/* Preview sidebar (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <PreviewBox text={preview} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCopy}><Copy className="h-4 w-4" /> Copy</Button>
              <Button variant="outline" onClick={handleSaveDraft} disabled={save.isPending}>
                <Save className="h-4 w-4" /> Simpan Draft
              </Button>
            </div>
            <Button onClick={handleWhatsApp} disabled={save.isPending} className="w-full" size="lg">
              <Send className="h-4 w-4" /> Kirim ke WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* AI dialog */}
      <MobilePreview open={showPreview} onOpenChange={setShowPreview} text={preview}
        onCopy={handleCopy} onSend={handleWhatsApp} />
      <AiDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        poin={aiPoin}
        setPoin={setAiPoin}
        onRun={runAi}
        busy={aiBusy}
      />
    </AppShell>
  );
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function PreviewBox({ text }: { text: string }) {
  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-primary flex items-center gap-2">
          <Eye className="h-4 w-4" /> Preview Laporan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans bg-muted/40 rounded-md p-3 max-h-[60vh] overflow-auto">
{text}
        </pre>
      </CardContent>
    </Card>
  );
}


function AiDialog({
  open, onOpenChange, poin, setPoin, onRun, busy,
}: { open: boolean; onOpenChange: (v: boolean) => void; poin: string; setPoin: (v: string) => void; onRun: () => void; busy: boolean; }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Generate Hasil Kegiatan</DialogTitle>
          <DialogDescription>
            Masukkan poin-poin singkat. AI akan menyusunnya menjadi laporan resmi 2–3 paragraf.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={7}
          value={poin}
          onChange={(e) => setPoin(e.target.value)}
          placeholder={"Contoh:\nKoordinasi pendistribusian proposal\nBertemu Manager Telkomsel\nProposal diterima\nMenunggu konfirmasi"}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onRun} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MobilePreview({
  open, onOpenChange, text, onCopy, onSend,
}: { open: boolean; onOpenChange: (v: boolean) => void; text: string; onCopy: () => void; onSend: () => void; }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Preview Laporan</DialogTitle></DialogHeader>
        <pre className="whitespace-pre-wrap text-xs font-sans bg-muted/40 rounded-md p-3 max-h-[60vh] overflow-auto">
{text}
        </pre>
        <DialogFooter>
          <Button variant="outline" onClick={onCopy}><Copy className="h-4 w-4" /> Copy</Button>
          <Button onClick={onSend}><Send className="h-4 w-4" /> Kirim WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
