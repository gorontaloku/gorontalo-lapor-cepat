import { createFileRoute } from "@tanstack/react-router";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { RequireRole } from "@/lib/roles";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export const Route = createFileRoute("/kelola-user")({
  component: () => (
    <RequireAuth>
      <RequireRole allowed={["super_admin"]}>
        <AppShell title="Kelola User">
          <div className="max-w-3xl space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Kelola User</h2>
              <p className="text-sm text-muted-foreground">Kelola akun & peran pengguna aplikasi.</p>
            </div>
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <UserCog className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Fitur pembuatan user oleh Admin akan segera aktif.</p>
                <p className="text-xs mt-2">
                  Sementara: user pertama otomatis menjadi Super Admin. Pengguna baru dapat ditambahkan langsung
                  dari panel Backend (Users → Add user), lalu peran diatur di tabel user_roles.
                </p>
              </CardContent>
            </Card>
          </div>
        </AppShell>
      </RequireRole>
    </RequireAuth>
  ),
});
