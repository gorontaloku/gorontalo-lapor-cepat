import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus2, History, Users, Settings, FileText, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

const MENU = [
  { to: "/laporan/baru", label: "Buat Laporan", desc: "Buat laporan kegiatan baru", icon: FilePlus2, tone: "primary" },
  { to: "/riwayat", label: "Riwayat Laporan", desc: "Lihat & kelola laporan sebelumnya", icon: History, tone: "accent" },
  { to: "/pegawai", label: "Data Pegawai", desc: "Kelola daftar pegawai BNNK", icon: Users, tone: "accent" },
  { to: "/pengaturan", label: "Pengaturan", desc: "Data instansi & template", icon: Settings, tone: "accent" },
] as const;

function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const todayStr = `${y}-${m}-${d}`;
      const firstOfMonth = `${y}-${m}-01`;

      const [{ count: today_count }, { count: month_count }] = await Promise.all([
        supabase.from("laporan").select("*", { count: "exact", head: true }).eq("tanggal", todayStr),
        supabase.from("laporan").select("*", { count: "exact", head: true }).gte("tanggal", firstOfMonth),
      ]);
      return { today: today_count ?? 0, month: month_count ?? 0 };
    },
  });

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Selamat datang 👋</h2>
          <p className="text-muted-foreground mt-1">
            Ringkasan aktivitas laporan Anda di BNN Kabupaten Gorontalo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Laporan Hari Ini"
            value={stats.data?.today ?? "-"}
            icon={CalendarDays}
            loading={stats.isLoading}
          />
          <StatCard
            label="Laporan Bulan Ini"
            value={stats.data?.month ?? "-"}
            icon={FileText}
            loading={stats.isLoading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MENU.map((m) => {
            const Icon = m.icon;
            const primary = m.tone === "primary";
            return (
              <Link key={m.to} to={m.to} className="group">
                <Card
                  className={
                    primary
                      ? "border-0 bg-gradient-brand text-primary-foreground shadow-elegant hover:shadow-elegant/80 transition-shadow"
                      : "hover:border-primary/40 hover:shadow-card transition-all"
                  }
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div
                      className={
                        primary
                          ? "h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0"
                          : "h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      }
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">{m.label}</div>
                      <div
                        className={
                          primary ? "text-sm text-primary-foreground/85 mt-0.5" : "text-sm text-muted-foreground mt-0.5"
                        }
                      >
                        {m.desc}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon: typeof FileText;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-0.5">
            {loading ? <span className="opacity-40">…</span> : value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
