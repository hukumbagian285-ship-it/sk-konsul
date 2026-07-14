import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FilePlus2, Scale, LogOut, Menu, X,
  FolderTree, Building2, Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Beranda", icon: LayoutDashboard, roles: ["super_admin", "pimpinan", "staf_hukum", "pemohon"] },
  { to: "/submissions/new", label: "Ajukan SK", icon: FilePlus2, roles: ["super_admin", "pemohon"] },
];

const adminItems = [
  { to: "/admin/kategori", label: "Kategori", icon: FolderTree },
  { to: "/admin/instansi", label: "Instansi", icon: Building2 },
  { to: "/admin/akun", label: "Akun", icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const visibleNav = navItems.filter((i) => i.roles.includes(user?.role ?? ""));

  function NavList({ className, onClick }: { className?: string; onClick?: () => void }) {
    return (
      <nav className={cn("flex flex-col gap-1", className)}>
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        {user?.role === "super_admin" && (
          <>
            <div className="mt-2 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Admin
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* sidebar desktop */}
      <aside className="hidden border-r border-border bg-card md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Scale size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">Konsultasi SK</p>
            <p className="text-[11px] text-muted-foreground">Bagian Hukum — Setda</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList />
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-lg px-3 py-2">
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-foreground">{user?.nama_lengkap}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {user?.role?.replace("_", " ") ?? "—"}
              </p>
            </div>
            <button
              onClick={logout}
              className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* mobile header */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Scale size={16} />
          </span>
          <p className="font-display text-sm font-semibold">Konsultasi SK</p>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <p className="font-display text-sm font-semibold">Menu</p>
              <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <NavList onClick={() => setSidebarOpen(false)} />
            </div>
            <div className="absolute bottom-0 inset-x-0 border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-medium">{user?.nama_lengkap}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  title="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1 px-4 pb-20 pt-16 md:px-8 md:pb-8 md:pt-8">
          {children}
        </main>

        {/* bottom nav mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-border bg-card md:hidden safe-bottom">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
