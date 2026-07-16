import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  FileSearch,
  FileText,
  FolderKanban,
  Building2,
  Users,
  LogOut,
  ChevronLeft,
} from "lucide-react";

function NavLink({ to, icon: Icon, label, active, collapsed }: { to: string; icon: any; label: string; active: boolean; collapsed: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return localStorage.getItem("sk_sidebar_collapsed") === "true"; }
    catch { return false; }
  });
  const [showMobileAdmin, setShowMobileAdmin] = React.useState(false);

  function toggleSidebar() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sk_sidebar_collapsed", String(next));
      return next;
    });
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className={`hidden h-dvh shrink-0 border-r border-border bg-card transition-[width] duration-200 md:sticky md:top-0 md:flex md:flex-col ${collapsed ? "w-16" : "w-56"}`}>
        <div className="flex h-14 items-center border-b border-border px-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">SK</div>
          {!collapsed && (
            <>
              <div className="mx-2 leading-tight">
                <p className="text-sm font-semibold">Konsultasi SK</p>
                <p className="text-[10px] text-muted-foreground">Bagian Hukum — Setda</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft size={14} className="transition-transform duration-200" />
                <span>Ciutkan</span>
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={toggleSidebar}
              className="ml-auto flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft size={14} className="rotate-180 transition-transform duration-200" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          <NavLink to="/" icon={LayoutDashboard} label="Beranda" active={location.pathname === "/"} collapsed={collapsed} />
          <NavLink to="/submissions/new" icon={FilePlus} label="Ajukan SK" active={location.pathname === "/submissions/new"} collapsed={collapsed} />
          <NavLink to="/tracking" icon={FileSearch} label="Tracking" active={location.pathname === "/tracking"} collapsed={collapsed} />
          <NavLink to="/templates" icon={FileText} label="Template" active={location.pathname === "/templates"} collapsed={collapsed} />
          {user?.role === "super_admin" && (
            <>
              {!collapsed && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
              )}
              <NavLink to="/admin/kategori" icon={FolderKanban} label="Kategori" active={location.pathname === "/admin/kategori"} collapsed={collapsed} />
              <NavLink to="/admin/instansi" icon={Building2} label="Instansi" active={location.pathname === "/admin/instansi"} collapsed={collapsed} />
              <NavLink to="/admin/akun" icon={Users} label="Akun" active={location.pathname === "/admin/akun"} collapsed={collapsed} />
            </>
          )}
        </nav>

        <div className="border-t border-border px-3 py-3">
          {!collapsed ? (
            <>
              <p className="text-xs font-medium text-foreground">{user?.nama_lengkap}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{user?.role}</p>
            </>
          ) : (
            <p className="text-center text-xs font-bold text-foreground">{user?.nama_lengkap?.charAt(0)}</p>
          )}
        </div>

        <button onClick={logout} className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <LogOut size={16} />
          {!collapsed && <span>Keluar</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center gap-2 border-t border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span>Ciutkan</span>}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col px-4 pt-4 pb-24 md:pb-6">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card py-2 md:hidden">
        <Link to="/" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Beranda</span>
        </Link>
        <Link to="/submissions/new" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/submissions/new" ? "text-primary" : "text-muted-foreground"}`}>
          <FilePlus size={20} />
          <span className="text-[10px]">Ajukan</span>
        </Link>
        <Link to="/tracking" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/tracking" ? "text-primary" : "text-muted-foreground"}`}>
          <FileSearch size={20} />
          <span className="text-[10px]">Tracking</span>
        </Link>
        <Link to="/templates" className={`flex flex-col items-center gap-0.5 ${location.pathname === "/templates" ? "text-primary" : "text-muted-foreground"}`}>
          <FileText size={20} />
          <span className="text-[10px]">Template</span>
        </Link>
        {user?.role === "super_admin" && (
          <div className="relative">
            <button
              onClick={() => setShowMobileAdmin((p) => !p)}
              className={`flex flex-col items-center gap-0.5 ${showMobileAdmin || location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"}`}
            >
              <FolderKanban size={20} />
              <span className="text-[10px]">Admin</span>
            </button>
            {showMobileAdmin && (
              <div className="absolute bottom-full left-1/2 z-50 mb-2 flex w-40 -translate-x-1/2 flex-col gap-1 rounded-lg border border-border bg-card p-2 shadow-lg">
                {["kategori", "instansi", "akun", "template"].map((m) => (
                  <Link
                    key={m}
                    to={`/admin/${m}`}
                    onClick={() => setShowMobileAdmin(false)}
                    className={`rounded-md px-3 py-2 text-sm capitalize ${location.pathname === `/admin/${m}` ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                  >
                    {m}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Safe bottom spacing on mobile */}
      <div className="safe-bottom md:hidden" />
    </div>
  );
}
