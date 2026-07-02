import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { RequireRole, useMyRole } from "@/lib/roles";
import { generateHasilKegiatan } from "@/lib/ai.functions";
import { JENIS_KEGIATAN, type JenisKegiatan, namaWithGelar } from "@/lib/format";
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
import { Check, ChevronsUpDown, Plus, Trash2, Sparkles, Save, Loader2, X, Upload, Image as ImageIcon, MessageCircle, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/laporan/baru")({
  component: () => (
    <RequireAuth>
      <RequireRole allowed={["super_admin", "admin", "pegawai"]}>
        <LaporanBaru />
      </RequireRole>
    </RequireAuth>
  ),
  validateSearch: searchSchema,
});

interface Pegawai {
  id: string; nama: string; gelar: string | null; nip: string | null; pangkat: string | null;
  jabatan: string | null; seksi: string | null; urutan_hierarki: number; aktif: boolean;
}

interface DokumentasiFoto {
  path: string;
  url: string;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

async function signPhoto(path: string): Promise<string> {
  const { data } = await supabase.storage.from("dokumentasi").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? "";
}

function LaporanBaru() {
  const navigate = useNavigate();
  const { id: editId } = useSearch({ from: "/laporan/baru" });
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: role } = useMyRole();
  const genAi = useServerFn(generateHasilKegiatan);

  const [jenis, setJenis] = useState<JenisKegiatan | "">("");
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

  // Field dinamis
  const [sasaran, setSasaran] = useState("");
  const [jumlahPeserta, setJumlahPeserta] = useState("");
  const [narasumber, setNarasumber] = useState("");
  const [materi, setMateri] = useState("");
  const [instansi, setInstansi] = useState("");
  const [hasilTes, setHasilTes] = useState("");

  // Administrasi
  const [noSp, setNoSp] = useState("");
  const [tglSp, setTglSp] = useState("");
  const [perihalSp, setPerihalSp] = useState("");

  // Dokumentasi
  const [foto, setFoto] = useState<DokumentasiFoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: pegawaiList = [] } = useQuery({
    queryKey: ["pegawai", "aktif"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pegawai").select("*").eq("aktif", true)
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

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data, error } = await supabase.from("laporan").select("*").eq("id", editId).maybeSingle();
      if (error || !data) return;
      setNamaKegiatan(data.nama_kegiatan);
      setJenis(((data as any).jenis_kegiatan ?? "") as JenisKegiatan | "");
      setTanggal(data.tanggal);
      setJam(data.jam ?? "");
      setTempat((data.tempat as string[])?.length ? (data.tempat as string[]) : [""]);
      setSelectedPegawai(((data.pelaksana as { id: string }[]) ?? []).map((p) => p.id));
      setHasil(data.hasil_kegiatan ?? "");
      setSumberDana((data.sumber_dana as "DIPA" | "NON DIPA") ?? "");
      setSeksi(data.seksi ?? "");
      const dd = (data as any).data_dinamis ?? {};
      setSasaran(dd.sasaran ?? "");
      setJumlahPeserta(dd.jumlah_peserta ?? "");
      setNarasumber(dd.narasumber ?? "");
      setMateri(dd.materi ?? "");
      setInstansi(dd.instansi ?? "");
      setHasilTes(dd.hasil_tes ?? "");
      setNoSp((data as any).no_sp ?? "");
      setTglSp((data as any).tanggal_sp ?? "");
      setPerihalSp((data as any).perihal_sp ?? "");
      const dok = ((data as any).dokumentasi as { path: string }[]) ?? [];
      if (dok.length) {
        const signed = await Promise.all(dok.map(async (d) => ({ path: d.path, url: await signPhoto(d.path) })));
        setFoto(signed);
      }
    })();
  }, [editId]);

  const pelaksanaList = useMemo(() => {
    const map = new Map(pegawaiList.map((p) => [p.id, p]));
    return selectedPegawai
      .map((id) => map.get(id))
      .filter((p): p is Pegawai => !!p)
      .sort((a, b) => a.urutan_hierarki - b.urutan_hierarki);
  }, [selectedPegawai, pegawaiList]);

  const dataDinamis = useMemo(() => {
    const out: Record<string, string> = {};
    if (jenis === "Sosialisasi") {
      if (sasaran) out.sasaran = sasaran;
      if (jumlahPeserta) out.jumlah_peserta = jumlahPeserta;
      if (narasumber) out.narasumber = narasumber;
      if (materi) out.materi = materi;
    }
    if (jenis === "Koordinasi") {
      if (instansi) out.instansi = instansi;
    }
    if (jenis === "Tes Urine") {
      if (jumlahPeserta) out.jumlah_peserta = jumlahPeserta;
      if (hasilTes) out.hasil_tes = hasilTes;
    }
    return out;
  }, [jenis, sasaran, jumlahPeserta, narasumber, materi, instansi, hasilTes]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    if (foto.length + files.length > 10) {
      toast.error("Maksimal 10 foto");
      return;
    }
    setUploading(true);
    try {
      const uploaded: DokumentasiFoto[] = [];
      for (const file of Array.from(files)) {
        if (!/\.(jpe?g|png)$/i.test(file.name)) {
          toast.error(`${file.name}: hanya JPG/JPEG/PNG`);
          continue;
        }
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("dokumentasi").upload(path, file);
        if (error) { toast.error("Gagal upload", { description: error.message }); continue; }
        uploaded.push({ path, url: await signPhoto(path) });
      }
      setFoto((prev) => [...prev, ...uploaded]);
      if (uploaded.length) toast.success(`${uploaded.length} foto diupload`);
    } finally {
      setUploading(false);
    }
  };

  const removeFoto = async (idx: number) => {
    const item = foto[idx];
    await supabase.storage.from("dokumentasi").remove([item.path]);
    setFoto(foto.filter((_, i) => i !== idx));
  };
  const moveFoto = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= foto.length) return;
    const next = [...foto];
    [next[idx], next[target]] = [next[target], next[idx]];
    setFoto(next);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!nama_kegiatan.trim()) throw new Error("Nama kegiatan wajib diisi");
      if (!jenis) throw new Error("Jenis kegiatan wajib dipilih");
      if (!tanggal) throw new Error("Tanggal wajib diisi");
      if (foto.length < 1) throw new Error("Minimal 1 foto dokumentasi");
      const payload: any = {
        user_id: user?.id ?? null,
        pembuat_nama: user?.user_metadata?.nama ?? user?.email ?? null,
        nama_kegiatan,
        jenis_kegiatan: jenis,
        tanggal,
        jam: jam || null,
        tempat: tempat.map((t) => t.trim()).filter(Boolean),
        pelaksana: pelaksanaList.map((p) => ({
          id: p.id, nama: p.nama, gelar: p.gelar, pangkat: p.pangkat, jabatan: p.jabatan, nip: p.nip, urutan: p.urutan_hierarki,
        })),
        seksi: seksi || pelaksanaList[0]?.seksi || null,
        hasil_kegiatan: hasil,
        sumber_dana: sumberDana || null,
        data_dinamis: dataDinamis,
        no_sp: noSp || null,
        tanggal_sp: tglSp || null,
        perihal_sp: perihalSp || null,
        dokumentasi: foto.map((f) => ({ path: f.path })),
        status_wa: "sudah_dibuat",
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
    try {
      const id = await save.mutateAsync();
      toast.success("Laporan tersimpan");
      navigate({ to: "/laporan/preview", search: { id } });
    } catch (e) { toast.error("Gagal menyimpan", { description: (e as Error).message }); }
  };

  const handleGenerateWA = async () => {
    try {
      const id = await save.mutateAsync();
      navigate({ to: "/laporan/preview", search: { id } });
    } catch (e) { toast.error("Gagal", { description: (e as Error).message }); }
  };

  const handleGenerateSPJ = async () => {
    try {
      const id = await save.mutateAsync();
      await supabase.from("laporan").update({ status_spj: "sudah_dibuat" }).eq("id", id);
      window.open(`/laporan/spj?id=${id}`, "_blank");
    } catch (e) { toast.error("Gagal", { description: (e as Error).message }); }
  };

  const runAi = async () => {
    if (!aiPoin.trim()) return toast.error("Masukkan poin-poin terlebih dahulu");
    setAiBusy(true);
    try {
      const res = await genAi({
        data: {
          poin: aiPoin,
          namaKegiatan: nama_kegiatan || undefined,
          jenisKegiatan: jenis || undefined,
          hariTanggal: tanggal ? new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : undefined,
          jam: jam || undefined,
          tempat: tempat.map((t) => t.trim()).filter(Boolean),
          pelaksana: pelaksanaList.length ? pelaksanaList.map((p) => `${namaWithGelar(p)}${p.jabatan ? ` (${p.jabatan})` : ""}`) : undefined,
          seksi: seksi || pelaksanaList[0]?.seksi || undefined,
          sumberDana: sumberDana || undefined,
          dataDinamis: dataDinamis,
        },
      });
      setHasil(res.text);
      setAiOpen(false); setAiPoin("");
      toast.success("Hasil kegiatan berhasil dibuat AI");
    } catch (e) {
      toast.error("Gagal generate AI", { description: (e as Error).message });
    } finally { setAiBusy(false); }
  };

  return (
    <AppShell title={editId ? "Edit Laporan" : "Buat Laporan"}>
      <div className="max-w-4xl mx-auto space-y-6">
        <SectionCard title="A. Informasi Kegiatan">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Jenis Kegiatan *</Label>
              <Select value={jenis} onValueChange={(v) => setJenis(v as JenisKegiatan)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis kegiatan" /></SelectTrigger>
                <SelectContent>
                  {JENIS_KEGIATAN.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nama Kegiatan *</Label>
              <Input value={nama_kegiatan} onChange={(e) => setNamaKegiatan(e.target.value)}
                placeholder="Contoh: Sosialisasi P4GN" />
            </div>
            <div>
              <Label>Hari / Tanggal *</Label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div>
              <Label>Waktu</Label>
              <Input type="time" value={jam} onChange={(e) => setJam(e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <Label>Tempat (dapat lebih dari satu)</Label>
            <div className="space-y-2 mt-1">
              {tempat.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={t}
                    onChange={(e) => { const n = [...tempat]; n[i] = e.target.value; setTempat(n); }}
                    placeholder={`Lokasi ${i + 1}`} />
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
          </div>
        </SectionCard>

        {(jenis === "Sosialisasi" || jenis === "Koordinasi" || jenis === "Tes Urine") && (
          <SectionCard title={`Detail ${jenis}`}>
            <div className="grid sm:grid-cols-2 gap-4">
              {jenis === "Sosialisasi" && (
                <>
                  <div><Label>Sasaran</Label>
                    <Input value={sasaran} onChange={(e) => setSasaran(e.target.value)} placeholder="Contoh: Pelajar SMA" />
                  </div>
                  <div><Label>Jumlah Peserta</Label>
                    <Input value={jumlahPeserta} onChange={(e) => setJumlahPeserta(e.target.value)} placeholder="Contoh: 80 orang" />
                  </div>
                  <div><Label>Narasumber</Label>
                    <Input value={narasumber} onChange={(e) => setNarasumber(e.target.value)} />
                  </div>
                  <div><Label>Materi</Label>
                    <Input value={materi} onChange={(e) => setMateri(e.target.value)} />
                  </div>
                </>
              )}
              {jenis === "Koordinasi" && (
                <div className="sm:col-span-2"><Label>Instansi yang Dikunjungi</Label>
                  <Input value={instansi} onChange={(e) => setInstansi(e.target.value)} />
                </div>
              )}
              {jenis === "Tes Urine" && (
                <>
                  <div><Label>Jumlah Peserta</Label>
                    <Input value={jumlahPeserta} onChange={(e) => setJumlahPeserta(e.target.value)} />
                  </div>
                  <div><Label>Hasil Tes</Label>
                    <Input value={hasilTes} onChange={(e) => setHasilTes(e.target.value)} placeholder="Contoh: Negatif" />
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        )}

        <SectionCard title="B. Pelaksana" desc="Maksimal 50 pegawai. Otomatis diurutkan berdasarkan hierarki.">
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
                        <CommandItem key={p.id}
                          onSelect={() => {
                            if (checked) setSelectedPegawai(selectedPegawai.filter((id) => id !== p.id));
                            else {
                              if (selectedPegawai.length >= 50) return toast.error("Maksimal 50 pegawai");
                              setSelectedPegawai([...selectedPegawai, p.id]);
                            }
                          }}>
                          <Check className={cn("h-4 w-4", checked ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-medium">{namaWithGelar(p)}</span>
                            <span className="text-xs text-muted-foreground">{p.jabatan || "-"}</span>
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
                    <div className="font-medium">{namaWithGelar(p)}</div>
                    <div className="text-xs text-muted-foreground">{p.jabatan || "-"}</div>
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
            <Label>Seksi (opsional)</Label>
            <Input value={seksi} onChange={(e) => setSeksi(e.target.value)}
              placeholder={pelaksanaList[0]?.seksi ?? "Contoh: Seksi P2M"} />
          </div>
        </SectionCard>

        <SectionCard title="C. Administrasi (opsional)" desc="Jika kosong, bagian Surat Perintah tidak muncul di Laporan SPJ.">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nomor Surat Perintah</Label>
              <Input value={noSp} onChange={(e) => setNoSp(e.target.value)} />
            </div>
            <div><Label>Tanggal Surat Perintah</Label>
              <Input type="date" value={tglSp} onChange={(e) => setTglSp(e.target.value)} />
            </div>
            <div className="sm:col-span-2"><Label>Perihal Surat Perintah</Label>
              <Input value={perihalSp} onChange={(e) => setPerihalSp(e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="D. Hasil Kegiatan"
          desc="Isi poin-poin singkat, klik Generate AI untuk mengubah menjadi narasi resmi.">
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="h-4 w-4" /> Generate AI
            </Button>
          </div>
          <Textarea rows={8} value={hasil} onChange={(e) => setHasil(e.target.value)}
            placeholder="Uraian hasil kegiatan..." />
        </SectionCard>

        <SectionCard title="E. Sumber Dana">
          <Select value={sumberDana} onValueChange={(v) => setSumberDana(v as "DIPA" | "NON DIPA")}>
            <SelectTrigger><SelectValue placeholder="Pilih sumber dana" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DIPA">DIPA</SelectItem>
              <SelectItem value="NON DIPA">NON DIPA</SelectItem>
            </SelectContent>
          </Select>
        </SectionCard>

        <SectionCard title="F. Dokumentasi Kegiatan" desc="Minimal 1, maksimal 10 foto (JPG/JPEG/PNG).">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/jpg" multiple hidden
                  onChange={(e) => handleUpload(e.target.files)} />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Pilih Foto
                </span>
              </label>
              <span className="text-sm text-muted-foreground">{foto.length}/10 foto</span>
            </div>
            {foto.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {foto.map((f, i) => (
                  <div key={f.path} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                    <img src={f.url} alt={`Dokumentasi ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => moveFoto(i, -1)} disabled={i === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => moveFoto(i, 1)} disabled={i === foto.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => removeFoto(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
            {foto.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground border-2 border-dashed rounded-md">
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Belum ada foto</span>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <Button variant="outline" size="lg" onClick={handleSaveDraft} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Draft
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Button size="lg" className="h-16 text-base" onClick={handleGenerateWA} disabled={save.isPending}>
            <MessageCircle className="h-5 w-5" /> Generate Laporan WA
          </Button>
          <Button size="lg" variant="secondary" className="h-16 text-base" onClick={handleGenerateSPJ} disabled={save.isPending}>
            <FileText className="h-5 w-5" /> Generate Laporan SPJ
          </Button>
        </div>
      </div>

      <AiDialog open={aiOpen} onOpenChange={setAiOpen} poin={aiPoin} setPoin={setAiPoin} onRun={runAi} busy={aiBusy} />
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

function AiDialog({
  open, onOpenChange, poin, setPoin, onRun, busy,
}: { open: boolean; onOpenChange: (v: boolean) => void; poin: string; setPoin: (v: string) => void; onRun: () => void; busy: boolean; }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Generate Hasil Kegiatan</DialogTitle>
          <DialogDescription>Masukkan poin-poin singkat. AI menyusunnya menjadi laporan resmi.</DialogDescription>
        </DialogHeader>
        <Textarea rows={7} value={poin} onChange={(e) => setPoin(e.target.value)}
          placeholder={"Contoh:\nSosialisasi P4GN\nPeserta antusias\nKesepakatan tindak lanjut"} />
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
