import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type AppRole = "super_admin" | "admin" | "pegawai" | "pimpinan";

export function useMyRole() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-role", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_role");
      if (error) throw error;
      return (data as AppRole | null) ?? null;
    },
  });
}

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  pegawai: "Pegawai",
  pimpinan: "Pimpinan",
};

export function canAccess(role: AppRole | null | undefined, allowed: AppRole[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export function RequireRole({
  allowed,
  children,
}: {
  allowed: AppRole[];
  children: ReactNode;
}) {
  const { data: role, isLoading } = useMyRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && role && !canAccess(role, allowed)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [role, isLoading, allowed, navigate]);

  if (isLoading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!canAccess(role, allowed)) return null;
  return <>{children}</>;
}
