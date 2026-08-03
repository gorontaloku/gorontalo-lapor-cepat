import logoBNN from "@/assets/bnn.png";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Masuk — E-Lapor BNN" },
      { name: "description", content: "Portal resmi pegawai BNNK Gorontalo untuk pembuatan laporan kegiatan." },
    ],
  }),
});

function AuthPage() {
  const { session, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [session, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await signIn(form.email, form.password);
      if (error) toast.error("Gagal masuk", { description: error });
      else {
        toast.success("Berhasil masuk");
        navigate({ to: "/dashboard", replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-brand text-primary-foreground">
        <div className="flex items-center gap-3">
          <img
            src={logoBNN}
            alt="Logo BNN"
            className="h-16 w-16 object-contain"
           />
          <div>
            <div className="font-semibold text-lg">E-Laporan V.0.1</div>
            <div className="text-sm text-primary-foreground/80">BNN Kabupaten Gorontalo</div>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Sistem E-Laporan resmi pegawai BNNK Gorontalo.
          </h2>
          <p className="mt-4 text-primary-foreground/85">
            Akses hanya diberikan kepada pegawai yang telah didaftarkan oleh Administrator.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">#IndonesiaBersinar</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md shadow-elegant border-border/60">
          <CardContent className="p-6 md:p-8">
            <div className="md:hidden flex items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={logoBNN}
                  alt="Logo BNN"
                  className="h-13 w-13 object-contain"
                />
              </div>
              <div>
                <div className="font-semibold">E-Lapor</div>
                <div className="text-xs text-muted-foreground">BNN</div>
              </div>
            </div>

            <h1 className="text-2xl font-bold">Masuk</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Silakan masuk menggunakan akun yang telah diberikan Administrator.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Masuk
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-2">
                Belum punya akun? Hubungi Super Admin / Admin BNNK Gorontalo.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
