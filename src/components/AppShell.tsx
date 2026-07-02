import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  History,
  Users,
  Settings,
  UserCog,
  UserCircle,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyRole, type AppRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "pegawai", "pimpinan"] },
  { to: "/laporan/baru", label: "Buat Laporan", icon: FilePlus2, roles: ["super_admin", "admin", "pegawai"] },
  { to: "/riwayat", label: "Riwayat Laporan", icon: History, roles: ["super_admin", "admin", "pegawai", "pimpinan"] },
  { to: "/pegawai", label: "Data Pegawai", icon: Users, roles: ["super_admin", "admin"] },
  { to: "/kelola-user", label: "Kelola User", icon: UserCog, roles: ["super_admin"] },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings, roles: ["super_admin"] },
  { to: "/profil", label: "Profil", icon: UserCircle, roles: ["pegawai", "admin", "super_admin", "pimpinan"] },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const { data: role } = useMyRole();
  const navigate = useNavigate();

  const items = NAV.filter((n) => (role ? n.roles.includes(role) : false));

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 bg-sidebar text-sidebar-foreground flex-col">
        <div className="px-6 py-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-elegant">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm">E-Laporan</div>
            <div className="text-xs text-sidebar-foreground/70">BNNK Gorontalo</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">
            {user?.email}
            {role && <div className="mt-0.5 text-sidebar-foreground/50">{roleLabel(role)}</div>}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-base md:text-lg">{title ?? "E-Laporan BNN"}</h1>
          </div>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>

        <nav className="md:hidden sticky bottom-0 bg-sidebar text-sidebar-foreground border-t border-sidebar-border grid grid-flow-col auto-cols-fr overflow-x-auto">
          {items.slice(0, 5).map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[10px]",
                  active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate max-w-[70px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function roleLabel(r: AppRole) {
  return { super_admin: "Super Admin", admin: "Admin", pegawai: "Pegawai", pimpinan: "Pimpinan" }[r];
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!session) {
    if (pathname !== "/auth") {
      navigate({ to: "/auth", replace: true });
    }
    return null;
  }
  return <>{children}</>;
}
