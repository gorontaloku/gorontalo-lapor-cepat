import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pegawai")({
  component: () => (
    <RequireAuth>
      <PegawaiPage />
    </RequireAuth>
  ),
});

interface Pegawai {
  id: string;
  nama: string;
  gelar: string | null;
  nip: string | null;
  pangkat: string | null;
  jabatan: string | null;
  seksi: string | null;
  urutan_hierarki: number;
  aktif: boolean;
}

const EMPTY: Omit<Pegawai, "id"> = {
  nama: "", gelar: "", nip: "", pangkat: "", jabatan: "", seksi: "", urutan_hierarki: 999, aktif: true,
};

function PegawaiPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Pegawai | null>(null);
  const [form, setForm] = useState<Omit<Pegawai, "id">>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pegawai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pegawai")
        .select("*")
        .order("urutan_hierarki", { ascending: true })
        .order("nama", { ascending: true });
      if (error) throw error;
      return data as Pegawai[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: Omit<Pegawai, "id"> & { id?: string }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("pegawai").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pegawai").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Data pegawai tersimpan");
      qc.invalidateQueries({ queryKey: ["pegawai"] });
      setEditOpen(false);
    },
    onError: (e: Error) => toast.error("Gagal menyimpan", { description: e.message }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pegawai").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pegawai dihapus");
      qc.invalidateQueries({ queryKey: ["pegawai"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error("Gagal menghapus", { description: e.message }),
  });

  const filtered = (data ?? []).filter((p) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [p.nama, p.nip, p.pangkat, p.jabatan, p.seksi].some((v) => v?.toLowerCase().includes(s));
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setEditOpen(true);
  };
  const openEdit = (p: Pegawai) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setEditOpen(true);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) return toast.error("Nama wajib diisi");
    upsert.mutate(editing ? { ...form, id: editing.id } : form);
  };

  return (
    <AppShell title="Data Pegawai">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Data Pegawai</h2>
            <p className="text-sm text-muted-foreground">Kelola daftar pegawai BNN Kabupaten Gorontalo.</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Tambah Pegawai
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari nama, NIP, jabatan, seksi..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium w-12">#</th>
                    <th className="text-left px-4 py-3 font-medium">Nama</th>
                    <th className="text-left px-4 py-3 font-medium">NIP</th>
                    <th className="text-left px-4 py-3 font-medium">Pangkat</th>
                    <th className="text-left px-4 py-3 font-medium">Jabatan</th>
                    <th className="text-left px-4 py-3 font-medium">Seksi</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin inline" />
                    </td></tr>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      {q ? "Tidak ada hasil." : "Belum ada data pegawai. Klik “Tambah Pegawai” untuk mulai."}
                    </td></tr>
                  )}
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">{p.urutan_hierarki}</td>
                      <td className="px-4 py-3 font-medium">{p.nama}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.nip || "-"}</td>
                      <td className="px-4 py-3">{p.pangkat || "-"}</td>
                      <td className="px-4 py-3">{p.jabatan || "-"}</td>
                      <td className="px-4 py-3">{p.seksi || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={
                          p.aktif
                            ? "inline-flex items-center rounded-full bg-success/15 text-success px-2 py-0.5 text-xs font-medium"
                            : "inline-flex items-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium"
                        }>
                          {p.aktif ? "Aktif" : "Non-aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Pegawai" : "Tambah Pegawai"}</DialogTitle>
            <DialogDescription>Data pegawai untuk pemilihan pelaksana laporan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Nama Lengkap *</Label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
            </div>
            <div>
              <Label>NIP</Label>
              <Input value={form.nip ?? ""} onChange={(e) => setForm({ ...form, nip: e.target.value })} />
            </div>
            <div>
              <Label>Pangkat</Label>
              <Input value={form.pangkat ?? ""} onChange={(e) => setForm({ ...form, pangkat: e.target.value })} />
            </div>
            <div>
              <Label>Jabatan</Label>
              <Input value={form.jabatan ?? ""} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />
            </div>
            <div>
              <Label>Seksi</Label>
              <Input value={form.seksi ?? ""} onChange={(e) => setForm({ ...form, seksi: e.target.value })} />
            </div>
            <div>
              <Label>Urutan Hierarki</Label>
              <Input
                type="number"
                value={form.urutan_hierarki}
                onChange={(e) => setForm({ ...form, urutan_hierarki: Number(e.target.value) || 999 })}
              />
              <p className="text-xs text-muted-foreground mt-1">Nomor lebih kecil = lebih atas</p>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.aktif} onCheckedChange={(v) => setForm({ ...form, aktif: v })} />
              <Label className="!m-0">Aktif</Label>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={upsert.isPending}>
                {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pegawai?</AlertDialogTitle>
            <AlertDialogDescription>Data pegawai akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && del.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
