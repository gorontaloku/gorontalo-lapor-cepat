import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Masuk — E-Laporan BNN Kabupaten Gorontalo" },
      { name: "description", content: "Masuk atau daftar untuk membuat laporan kegiatan BNNK Gorontalo." },
    ],
  }),
});

function AuthPage() {
  const { session, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nama: "" });

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [session, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "login") {
        const { error } = await signIn(form.email, form.password);
        if (error) toast.error("Gagal masuk", { description: error });
        else {
          toast.success("Berhasil masuk");
          navigate({ to: "/dashboard", replace: true });
        }
      } else {
        if (!form.nama.trim()) return toast.error("Nama wajib diisi");
        const { error } = await signUp(form.email, form.password, form.nama);
        if (error) toast.error("Gagal daftar", { description: error });
        else {
          toast.success("Pendaftaran berhasil", { description: "Anda akan diarahkan ke dashboard." });
          navigate({ to: "/dashboard", replace: true });
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-brand text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-lg">E-Laporan</div>
            <div className="text-sm text-primary-foreground/80">BNN Kabupaten Gorontalo</div>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Laporan kegiatan harian, selesai dalam 2 menit.
          </h2>
          <p className="mt-4 text-primary-foreground/85">
            Aplikasi resmi pembuatan laporan kegiatan untuk pegawai BNN Kabupaten Gorontalo.
            Cepat, profesional, dan langsung terkirim ke WhatsApp.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">#IndonesiaBersinar</div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md shadow-elegant border-border/60">
          <CardContent className="p-6 md:p-8">
            <div className="md:hidden flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">E-Laporan</div>
                <div className="text-xs text-muted-foreground">BNNK Gorontalo</div>
              </div>
            </div>

            <h1 className="text-2xl font-bold">Selamat Datang</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "login" ? "Masuk untuk melanjutkan." : "Daftar akun baru."}
            </p>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="mt-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
              </TabsList>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Nama lengkap Anda"
                      autoComplete="name"
                    />
                  </div>
                </TabsContent>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nama@bnn.go.id"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {tab === "login" ? "Masuk" : "Daftar"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
