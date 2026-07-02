import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  History,
  Users,
  Settings,
  ShieldCheck,
  UserCircle,
  LogOut,
  Shield,
  Menu,
  MoreVertical,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyRole, type AppRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  { to: "/kelola-user", label: "Kelola User", icon: ShieldCheck, roles: ["super_admin"] },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings, roles: ["super_admin", "admin"] },
];

const ROUTE_LABEL: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/laporan/baru": "Buat Laporan",
  "/laporan/preview": "Preview Laporan",
  "/laporan/spj": "Generate SPJ",
  "/riwayat": "Riwayat Laporan",
  "/pegawai": "Data Pegawai",
  "/kelola-user": "Kelola User",
  "/pengaturan": "Pengaturan",
  "/profil": "Profil",
};

function roleLabel(r: AppRole) {
  return { super_admin: "Super Admin", admin: "Admin", pegawai: "Pegawai", pimpinan: "Pimpinan" }[r];
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const { data: role } = useMyRole();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [expanded, setExpanded] = useState(false); // desktop expanded state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const items = NAV.filter((n) => (role ? n.roles.includes(role) : false));

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const currentLabel = title ?? ROUTE_LABEL[pathname] ?? "E-Laporan BNN";
  const isDashboard = pathname === "/dashboard";

  const SidebarNav = ({ collapsed }: { collapsed: boolean }) => (
    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
              collapsed && "justify-center px-2",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const desktopCollapsed = !expanded;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 h-14 bg-card border-b z-30 flex items-center px-3 md:px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isMobile ? setMobileOpen(true) : setExpanded((v) => !v))}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-semibold text-sm truncate">E-Laporan BNN</div>
            <div className="text-[10px] text-muted-foreground truncate">BNN Kabupaten Gorontalo</div>
          </div>
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu akun">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                <div className="truncate font-medium text-foreground">{user?.email}</div>
                {role && <div className="mt-0.5">{roleLabel(role)}</div>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profil" })}>
                <UserCircle className="h-4 w-4" /> Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/profil" })}>
                <KeyRound className="h-4 w-4" /> Ganti Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed top-14 bottom-0 left-0 z-20 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col transition-[width] duration-200",
          desktopCollapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarNav collapsed={desktopCollapsed} />
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar text-sidebar-foreground border-sidebar-border">
          <div className="h-14 px-4 flex items-center gap-2 border-b border-sidebar-border">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm">E-Laporan BNN</div>
              <div className="text-[10px] text-sidebar-foreground/70">BNN Kabupaten Gorontalo</div>
            </div>
          </div>
          <div className="flex flex-col h-[calc(100%-3.5rem)]">
            <SidebarNav collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Content wrapper */}
      <div
        className={cn(
          "pt-14 transition-[padding] duration-200",
          desktopCollapsed ? "md:pl-16" : "md:pl-60",
        )}
      >
        {/* Breadcrumb */}
        <div className="px-4 md:px-8 py-3 border-b bg-card/50 flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground overflow-x-auto">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          {!isDashboard && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium truncate">{currentLabel}</span>
            </>
          )}
        </div>

        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
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
