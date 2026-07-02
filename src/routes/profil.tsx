import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useMyRole, ROLE_LABEL } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/profil")({
  component: () => (
    <RequireAuth>
      <ProfilPage />
    </RequireAuth>
  ),
});

function ProfilPage() {
  const { user } = useAuth();
  const { data: role } = useMyRole();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password minimal 6 karakter");
    if (pw !== pw2) return toast.error("Konfirmasi password tidak cocok");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error("Gagal", { description: error.message });
    else { toast.success("Password berhasil diubah"); setPw(""); setPw2(""); }
  };

  return (
    <AppShell title="Profil">
      <div className="max-w-xl space-y-6">
        <Card className="shadow-card">
          <CardHeader><CardTitle>Profil Saya</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Nama:</span> {user?.user_metadata?.nama ?? "-"}</div>
            <div><span className="text-muted-foreground">Email:</span> {user?.email}</div>
            <div><span className="text-muted-foreground">Peran:</span> {role ? ROLE_LABEL[role] : "-"}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Ubah Password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-3">
              <div><Label>Password Baru</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required /></div>
              <div><Label>Konfirmasi Password</Label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={6} required /></div>
              <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
