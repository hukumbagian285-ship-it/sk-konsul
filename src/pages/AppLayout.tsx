import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Search, Building2, Users, FileText, LogOut, Menu, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "pimpinan", "staf_hukum"] },
  { to: "/tracking", label: "Lacak", icon: Search, roles: ["pemohon"] },
  { to: "/kategori", label: "Kategori", icon: FileText, roles: ["super_admin"] },
  { to: "/instansi", label: "Instansi", icon: Building2, roles: ["super_admin"] },
  { to: "/pengguna", label: "Pengguna", icon: Users, roles: ["super_admin"] },
];

const bottomNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "pimpinan", "staf_hukum"] },
  { to: "/tracking", label: "Lacak", icon: Search, roles: ["pemohon"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role ?? "pemohon";
  const userNav = navItems.filter((item) => item.roles.includes(role));
  const userBottomNav = bottomNavItems.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-background">
      {/* sidebar desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <FileText size={18} className="text-primary" />
          <span className="font-display text-sm font-semibold">SK Konsultasi</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {userNav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate text-xs text-muted-foreground">{user?.nama_lengkap}</p>
          <p className="mb-2 text-[10px] text-muted-foreground/60">{user?.role}</p>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut size={12} /> Keluar
          </button>
        </div>
      </aside>

      {/* mobile header + bottom nav */}
      <div className="flex flex-1 flex-col lg:ml-0">
        {/* top bar mobile */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <span className="font-display text-sm font-semibold">SK Konsultasi</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-50 w-56 bg-card p-4 shadow-lg">
              <nav className="space-y-1">
                {userNav.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                <p className="truncate text-xs text-muted-foreground">{user?.nama_lengkap}</p>
                <p className="mb-2 text-[10px] text-muted-foreground/60">{user?.role}</p>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut size={12} /> Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>

        {/* bottom nav mobile */}
        <nav className="flex items-center justify-around border-t border-border bg-card py-2 lg:hidden">
          {userBottomNav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}